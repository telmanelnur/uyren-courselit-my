import { Log } from "@/lib/logger";
import { addMailJob } from "@/server/lib/queue";
import { generateEmailFrom } from "@/lib/utils";
import { Constants } from "@workspace/common-models";
import CourseModel from "@/models/Course";
import InvoiceModel from "@/models/Invoice";
import MembershipModel from "@/models/Membership";
import UserModel from "@/models/User";
import pug from "pug";
import invoiceMembershipTemplate from "./templates/invoice-membership";

interface SendInvoiceMembershipEmailParams {
  membershipId: string;
  invoiceId?: string;
  domain: {
    name: string;
    email: string;
    settings?: {
      hideCourseLitBranding?: boolean;
    };
  };
  headers: {
    host: string;
  };
  eventType?: string; // Add event type to determine email content
}

interface EmailData {
  emailTitle: string;
  emailMessage: string;
  courseTitle: string;
  courseType: string;
  creatorName: string;
  membershipId: string;
  membershipStatus: string;
  membershipRole: string;
  membershipDate: string;
  invoiceInfo?: boolean;
  invoiceId?: string;
  amount?: number;
  invoiceStatus?: string;
  paymentProcessor?: string;
  invoiceDate?: string;
  currencySymbol: string;
  loginLink: string;
  userName: string;
  userEmail: string;
  currentDate: string;
  hideCourseLitBranding: boolean;
  eventType?: string;
}

export async function sendInvoiceMembershipEmail({
  membershipId,
  invoiceId,
  domain,
  headers,
  eventType,
}: SendInvoiceMembershipEmailParams) {
  try {
    // Get membership details
    const membership = await MembershipModel.findOne({ membershipId }).lean();
    if (!membership) {
      throw new Error(`Membership not found: ${membershipId}`);
    }

    // Get user details
    const user = await UserModel.findOne({ userId: membership.userId }).lean();
    if (!user) {
      throw new Error(`User not found: ${membership.userId}`);
    }

    // Get course details
    const course = await CourseModel.findOne({
      courseId: membership.entityId,
    }).lean();
    if (!course) {
      throw new Error(`Course not found: ${membership.entityId}`);
    }

    // Get invoice details if provided
    let invoice = null;
    if (invoiceId) {
      invoice = await InvoiceModel.findOne({ invoiceId }).lean();
      if (!invoice) {
        Log.info(`Invoice not found: ${invoiceId}`);
      }
    }

    // Determine email content based on event type and membership status
    let emailTitle = "";
    let emailMessage = "";

    // Check if this is a checkout session expired event
    if (eventType && eventType === "checkout.session.expired") {
      emailTitle = "Payment Session Expired";
      emailMessage = `Your payment session for "${course.title}" has expired. To complete your enrollment, please initiate a new payment session.`;
    } else {
      // Handle based on membership status
      switch (membership.status) {
        case Constants.MembershipStatus.ACTIVE:
          emailTitle = "Welcome to Your Course!";
          emailMessage = `Congratulations! Your enrollment in "${course.title}" has been approved and you now have full access to the course content.`;
          break;
        case Constants.MembershipStatus.PENDING:
          emailTitle = "Course Enrollment Pending";
          emailMessage = `Your enrollment request for "${course.title}" has been received and is currently under review. We'll notify you once it's approved.`;
          break;
        case Constants.MembershipStatus.REJECTED:
          emailTitle = "Course Enrollment Update";
          emailMessage = `Your enrollment request for "${course.title}" could not be approved at this time. Please contact support for more information.`;
          break;
        case Constants.MembershipStatus.EXPIRED:
          emailTitle = "Course Access Expired";
          emailMessage = `Your access to "${course.title}" has expired. Please renew your membership to continue learning.`;
          break;
        default:
          emailTitle = "Course Enrollment Update";
          emailMessage = `There has been an update to your enrollment in "${course.title}".`;
      }
    }

    // Prepare email data
    const emailData: EmailData = {
      emailTitle,
      emailMessage,
      courseTitle: course.title,
      courseType: course.type,
      creatorName: course.creatorName || "Unknown",
      membershipId: membership.membershipId,
      membershipStatus: membership.status,
      membershipRole: membership.role || "Student",
      membershipDate: new Date(
        membership.createdAt || Date.now(),
      ).toLocaleDateString(),
      currencySymbol: "$", // Default currency symbol
      loginLink:
        eventType === "checkout.session.expired"
          ? `${headers.host}/checkout?type=course&id=${membership.entityId}`
          : `${headers.host}/login`,
      userName: user.name || user.email,
      userEmail: user.email,
      currentDate: new Date().toLocaleDateString(),
      hideCourseLitBranding: domain.settings?.hideCourseLitBranding || false,
      eventType,
    };

    // Add invoice information if available
    if (invoice) {
      emailData.invoiceInfo = true;
      emailData.invoiceId = invoice.invoiceId;
      emailData.amount = invoice.amount;
      emailData.invoiceStatus = invoice.status;
      emailData.paymentProcessor = invoice.paymentProcessor;
      emailData.invoiceDate = new Date(
        invoice.createdAt || Date.now(),
      ).toLocaleDateString();

      // Update currency symbol based on invoice
      emailData.currencySymbol = getCurrencySymbol(invoice.currencyISOCode);
    }

    // Render email template
    const emailBody = pug.render(invoiceMembershipTemplate, emailData);

    // Send email
    await addMailJob({
      to: [user.email],
      subject: emailTitle,
      body: emailBody,
      from: generateEmailFrom({
        name: domain.name,
        email: process.env.EMAIL_FROM || domain.email,
      }),
    });

    Log.info(`Invoice/Membership email sent successfully`, {
      membershipId,
      invoiceId,
      userEmail: user.email,
      courseTitle: course.title,
    });

    return true;
  } catch (error) {
    Log.error("Error sending invoice/membership email", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      membershipId,
      invoiceId: invoiceId || undefined,
    } as any);
    throw error;
  }
}

// Helper function to get currency symbol
function getCurrencySymbol(currencyISOCode: string): string {
  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "C$",
    AUD: "A$",
    JPY: "¥",
    INR: "₹",
    CNY: "¥",
    BRL: "R$",
    MXN: "$",
    KRW: "₩",
    RUB: "₽",
    ZAR: "R",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    CHF: "CHF",
    PLN: "zł",
    CZK: "Kč",
    HUF: "Ft",
  };

  return currencySymbols[currencyISOCode.toUpperCase()] || currencyISOCode;
}

// Convenience functions for different email types
export async function sendMembershipApprovalEmail(
  membershipId: string,
  domain: any,
  headers: any,
) {
  return sendInvoiceMembershipEmail({
    membershipId,
    domain,
    headers,
  });
}

export async function sendMembershipPendingEmail(
  membershipId: string,
  domain: any,
  headers: any,
) {
  return sendInvoiceMembershipEmail({
    membershipId,
    domain,
    headers,
  });
}

export async function sendMembershipRejectionEmail(
  membershipId: string,
  domain: any,
  headers: any,
) {
  return sendInvoiceMembershipEmail({
    membershipId,
    domain,
    headers,
  });
}

export async function sendInvoicePaidEmail(
  membershipId: string,
  invoiceId: string,
  domain: any,
  headers: any,
) {
  return sendInvoiceMembershipEmail({
    membershipId,
    invoiceId,
    domain,
    headers,
  });
}

export async function sendInvoiceFailedEmail(
  membershipId: string,
  invoiceId: string,
  domain: any,
  headers: any,
) {
  return sendInvoiceMembershipEmail({
    membershipId,
    invoiceId,
    domain,
    headers,
  });
}

// New convenience function for payment expiration
export async function sendPaymentExpirationEmail(
  membershipId: string,
  invoiceId: string,
  domain: any,
  headers: any,
) {
  return sendInvoiceMembershipEmail({
    membershipId,
    invoiceId,
    domain,
    headers,
    eventType: "checkout.session.expired",
  });
}
