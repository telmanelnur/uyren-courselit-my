import constants from "@/config/constants";
import { responses } from "@/config/strings";
import { authOptions } from "@/lib/auth/options";
import { getDomainData } from "@/lib/domain";
import { Log } from "@/lib/logger";
import CommunityModel from "@/models/Community";
import CourseModel from "@/models/Course";
import DomainModel from "@/models/Domain";
import InvoiceModel from "@/models/Invoice";
import PaymentPlanModel from "@/models/PaymentPlan";
import User from "@/models/User";
import { getMembership } from "@/server/api/routers/user/user";
import { getPaymentMethodFromSettings } from "@/server/services/payment";
import {
    Community,
    Constants,
    Course,
    MembershipEntityType,
    PaymentPlan,
} from "@workspace/common-models";
import { generateUniqueId } from "@workspace/utils";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { activateMembership } from "../helpers";

const { transactionSuccess, transactionFailed, transactionInitiated } =
    constants;

export interface PaymentInitiateRequest {
    id: string;
    type: MembershipEntityType;
    planId: string;
    origin: string;
    joiningReason?: string;
}

export async function POST(req: NextRequest) {
    const body: PaymentInitiateRequest = await req.json();

    try {
        const domainData = await getDomainData()
        if (!domainData.domainObj) {
            return Response.json(
                { message: "Domain not found" },
                { status: 404 },
            );
        }
        const domain = await DomainModel.findById(domainData.domainObj._id);
        if (!domain) {
            return Response.json(
                { message: "Domain not found" },
                { status: 404 },
            );
        }

        const session = await getServerSession(authOptions);
        const user = await getUser(session, domain._id);

        if (!user) {
            return Response.json({}, { status: 401 });
        }

        const { id, type, planId, origin, joiningReason } = body;

        if (!id || !type || !planId) {
            return Response.json({ message: "Bad request" }, { status: 400 });
        }

        const entity = await getEntity(type, id, domain._id);
        if (!entity) {
            return Response.json(
                { message: responses.item_not_found },
                { status: 404 },
            );
        }

        if (!(entity.paymentPlans as unknown as string[]).includes(planId)) {
            return Response.json(
                { message: "Invalid payment plan" },
                { status: 404 },
            );
        }

        const paymentPlan = await getPaymentPlan(domain._id, planId);
        if (!paymentPlan) {
            return Response.json(
                { message: "Invalid payment plan" },
                { status: 400 },
            );
        }

        const siteinfo = domain.settings;
        const paymentMethod = await getPaymentMethodFromSettings(siteinfo);

        if (
            !paymentMethod &&
            paymentPlan.type !== Constants.PaymentPlanType.FREE
        ) {
            return Response.json(
                {
                    status: transactionFailed,
                    error: responses.payment_invalid_settings,
                },
                { status: 500 },
            );
        }

        const membership = await getMembership({
            domainId: domain._id,
            userId: user.userId,
            entityType: type,
            entityId: id,
            planId,
        });

        if (membership.status === Constants.MembershipStatus.REJECTED) {
            return Response.json({ status: transactionFailed });
        }

        if (membership.status === Constants.MembershipStatus.ACTIVE) {
            if (paymentPlan.type === Constants.PaymentPlanType.FREE) {
                return Response.json({ status: transactionSuccess });
            }
            if (
                membership.subscriptionId &&
                (paymentPlan.type === Constants.PaymentPlanType.EMI ||
                    paymentPlan.type === Constants.PaymentPlanType.SUBSCRIPTION)
            ) {
                if (
                    await paymentMethod?.validateSubscription(
                        membership.subscriptionId,
                    )
                ) {
                    return Response.json({ status: transactionSuccess });
                } else {
                    membership.status = Constants.MembershipStatus.EXPIRED;
                    await membership.save();
                }
            } else if (paymentPlan.type === Constants.PaymentPlanType.ONE_TIME) {
                return Response.json({
                    status: transactionFailed,
                    error: "You are already enrolled in this course."
                });
            }
        }

        if (paymentPlan.type === Constants.PaymentPlanType.FREE) {
            if (
                type === Constants.MembershipEntityType.COMMUNITY &&
                !(entity as Community).autoAcceptMembers
            ) {
                if (!joiningReason) {
                    return Response.json(
                        {
                            status: transactionFailed,
                            error: responses.joining_reason_missing,
                        },
                        { status: 400 },
                    );
                } else {
                    membership.joiningReason = joiningReason;
                }
            }

            await activateMembership(domain, membership, paymentPlan);

            return Response.json({
                status: transactionSuccess,
            });
        }

        membership.paymentPlanId = planId;
        membership.status = Constants.MembershipStatus.PENDING;
        membership.sessionId = generateUniqueId();

        const invoiceId = generateUniqueId();
        const currencyISOCode = await paymentMethod?.getCurrencyISOCode();

        const metadata = {
            membershipId: membership.membershipId,
            invoiceId,
            currencyISOCode,
            domainId: domain._id.toString(),
        };

        const paymentTracker = await paymentMethod!.initiate({
            metadata,
            paymentPlan,
            product: {
                id: id,
                title:
                    type === Constants.MembershipEntityType.COMMUNITY
                        ? (entity as Community)!.name
                        : (entity as Course)!.title,
                type,
            },
            origin,
        });

        await InvoiceModel.create({
            domain: domain._id,
            invoiceId,
            membershipId: membership.membershipId,
            membershipSessionId: membership.sessionId,
            amount:
                paymentPlan.oneTimeAmount ||
                paymentPlan.subscriptionMonthlyAmount ||
                paymentPlan.subscriptionYearlyAmount ||
                paymentPlan.emiAmount ||
                0,
            status: Constants.InvoiceStatus.PENDING,
            paymentProcessor: paymentMethod!.name,
            paymentProcessorEntityId: paymentTracker,
            currencyISOCode,
        });

        membership.subscriptionId = undefined;
        membership.subscriptionMethod = undefined;
        await (membership as any).save();

        return Response.json({
            status: transactionInitiated,
            paymentTracker,
            metadata,
        });
    } catch (err: any) {
        Log.error(`Error initiating payment: ${err.message}`, {
            body,
            stack: err.stack,
        });
        return Response.json(
            { status: transactionFailed, error: err.message },
            { status: 500 },
        );
    }
}


export async function getUser(session: any, domainId: mongoose.Types.ObjectId) {
    if (!session) return null;
    return await User.findOne({
        email: session.user!.email,
        domain: domainId,
        active: true,
    });
}

async function getEntity(
    type: string,
    id: string,
    domainId: mongoose.Types.ObjectId,
) {
    if (type === Constants.MembershipEntityType.COMMUNITY) {
        return await CommunityModel.findOne<Community>({
            communityId: id,
            domain: domainId,
            deleted: false,
        });
    } else if (type === Constants.MembershipEntityType.COURSE) {
        return await CourseModel.findOne<Course>({
            courseId: id,
            domain: domainId,
        });
    }
    return null;
}

async function getPaymentPlan(
    domainId: mongoose.Types.ObjectId,
    planId: string,
) {
    return await PaymentPlanModel.findOne<PaymentPlan>({
        domain: domainId,
        planId,
        archived: false,
        internal: false,
    });
}
