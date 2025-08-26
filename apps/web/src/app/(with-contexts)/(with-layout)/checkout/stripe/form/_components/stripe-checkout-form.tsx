"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import {
  Badge,
  CreditCard,
  Lock,
  Shield,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useSiteInfo } from "@/components/contexts/site-info-context";
import { formatCurrency } from "@workspace/utils";
import { Constants } from "@workspace/common-models";
import { useProfile } from "@/components/contexts/profile-context";

interface PaymentFormData {
  email: string;
  name: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export default function StripeCheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId");
  const planId = searchParams.get("planId");
  const { siteInfo } = useSiteInfo();
  const { profile } = useProfile();

  const [formData, setFormData] = useState<PaymentFormData>({
    email: profile?.email || "",
    name: profile?.name || "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingAddress: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});

  // Fetch course and plan data
  const { data: course, isLoading: isCourseLoading } =
    trpc.lmsModule.courseModule.course.publicGetByCourseId.useQuery(
      { courseId: courseId! },
      { enabled: !!courseId },
    );

  const selectedPlan = course?.attachedPaymentPlans?.find(
    (plan) => plan.planId === planId,
  );

  // Redirect if no course or plan
  useEffect(() => {
    if (!courseId || !planId) {
      router.push("/checkout");
    }
  }, [courseId, planId, router]);

  // Auto-fill form with profile data
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        email: profile.email || prev.email,
        name: profile.name || prev.name,
      }));
    }
  }, [profile]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.cardNumber) newErrors.cardNumber = "Card number is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
    if (!formData.cvv) newErrors.cvv = "CVV is required";
    if (!formData.billingAddress.line1)
      newErrors.billingAddress = {
        ...newErrors.billingAddress,
        line1: "Address is required",
      };
    if (!formData.billingAddress.city)
      newErrors.billingAddress = {
        ...newErrors.billingAddress,
        city: "City is required",
      };
    if (!formData.billingAddress.state)
      newErrors.billingAddress = {
        ...newErrors.billingAddress,
        state: "State is required",
      };
    if (!formData.billingAddress.postalCode)
      newErrors.billingAddress = {
        ...newErrors.billingAddress,
        postalCode: "Postal code is required",
      };

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as keyof PaymentFormData]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    if (
      errors.billingAddress?.[field as keyof typeof formData.billingAddress]
    ) {
      setErrors((prev) => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: undefined,
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      // TODO: Implement Stripe payment processing
      console.log("Processing payment:", {
        courseId,
        planId,
        formData,
        selectedPlan,
      });

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to success page
      router.push(`/checkout/success?courseId=${courseId}&planId=${planId}`);
    } catch (error) {
      console.error("Payment error:", error);
      // TODO: Handle payment errors
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanPrice = (
    plan: any,
  ): { amount: number; period: string; isFree: boolean } => {
    if (plan.type === Constants.PaymentPlanType.FREE) {
      return { amount: 0, period: "", isFree: true };
    }

    if (plan.type === Constants.PaymentPlanType.SUBSCRIPTION) {
      if (plan.subscriptionYearlyAmount) {
        return {
          amount: plan.subscriptionYearlyAmount,
          period: "/year",
          isFree: false,
        };
      }
      return {
        amount: plan.subscriptionMonthlyAmount || 0,
        period: "/month",
        isFree: false,
      };
    }

    if (plan.type === Constants.PaymentPlanType.EMI) {
      return {
        amount: plan.emiAmount || 0,
        period: `/month for ${plan.emiTotalInstallments} months`,
        isFree: false,
      };
    }

    return { amount: plan.oneTimeAmount || 0, period: "", isFree: false };
  };

  if (isCourseLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-96 mx-auto mb-2" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course || !selectedPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Checkout
          </h1>
          <p className="text-gray-600">Course or payment plan not found.</p>
          <Button onClick={() => router.push("/checkout")} className="mt-4">
            Return to Checkout
          </Button>
        </div>
      </div>
    );
  }

  const priceInfo = getPlanPrice(selectedPlan);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[rgb(var(--brand-dark))] mb-2">
            Complete Your Payment
          </h1>
          <p className="text-[rgb(var(--brand-gray))]">
            Secure payment powered by Stripe
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Enter your payment details to complete your enrollment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className={errors.email ? "border-red-500" : ""}
                          placeholder="your@email.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className={errors.name ? "border-red-500" : ""}
                          placeholder="John Doe"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Card Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Card Information</h3>
                    <div>
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) =>
                          handleInputChange("cardNumber", e.target.value)
                        }
                        className={errors.cardNumber ? "border-red-500" : ""}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          type="text"
                          value={formData.expiryDate}
                          onChange={(e) =>
                            handleInputChange("expiryDate", e.target.value)
                          }
                          className={errors.expiryDate ? "border-red-500" : ""}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                        {errors.expiryDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.expiryDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          type="text"
                          value={formData.cvv}
                          onChange={(e) =>
                            handleInputChange("cvv", e.target.value)
                          }
                          className={errors.cvv ? "border-red-500" : ""}
                          placeholder="123"
                          maxLength={4}
                        />
                        {errors.cvv && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.cvv}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Billing Address */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Billing Address</h3>
                    <div>
                      <Label htmlFor="address">Address Line 1 *</Label>
                      <Input
                        id="address"
                        type="text"
                        value={formData.billingAddress.line1}
                        onChange={(e) =>
                          handleAddressChange("line1", e.target.value)
                        }
                        className={
                          errors.billingAddress?.line1 ? "border-red-500" : ""
                        }
                        placeholder="123 Main St"
                      />
                      {errors.billingAddress?.line1 && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.billingAddress.line1}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="address2">
                        Address Line 2 (Optional)
                      </Label>
                      <Input
                        id="address2"
                        type="text"
                        value={formData.billingAddress.line2}
                        onChange={(e) =>
                          handleAddressChange("line2", e.target.value)
                        }
                        placeholder="Apt 4B"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          type="text"
                          value={formData.billingAddress.city}
                          onChange={(e) =>
                            handleAddressChange("city", e.target.value)
                          }
                          className={
                            errors.billingAddress?.city ? "border-red-500" : ""
                          }
                          placeholder="New York"
                        />
                        {errors.billingAddress?.city && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.billingAddress.city}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          type="text"
                          value={formData.billingAddress.state}
                          onChange={(e) =>
                            handleAddressChange("state", e.target.value)
                          }
                          className={
                            errors.billingAddress?.state ? "border-red-500" : ""
                          }
                          placeholder="NY"
                        />
                        {errors.billingAddress?.state && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.billingAddress.state}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          type="text"
                          value={formData.billingAddress.postalCode}
                          onChange={(e) =>
                            handleAddressChange("postalCode", e.target.value)
                          }
                          className={
                            errors.billingAddress?.postalCode
                              ? "border-red-500"
                              : ""
                          }
                          placeholder="10001"
                        />
                        {errors.billingAddress?.postalCode && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.billingAddress.postalCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">
                          Your payment is secure
                        </p>
                        <p>
                          We use industry-standard SSL encryption to protect
                          your payment information. Your card details are never
                          stored on our servers.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary-hover))] text-white"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </>
                    ) : (
                      `Pay ${formatCurrency(priceInfo.amount, siteInfo.currencyISOCode)}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Course Info */}
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {course.title}
                    </h4>
                    <p className="text-sm text-gray-500">{selectedPlan.name}</p>
                  </div>
                </div>

                <Separator />

                {/* Plan Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Plan Type</span>
                    <span className="font-medium">{selectedPlan.type}</span>
                  </div>
                  {priceInfo.period && (
                    <div className="flex justify-between text-sm">
                      <span>Billing</span>
                      <span className="font-medium">{priceInfo.period}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span className="text-[rgb(var(--brand-primary))]">
                    {formatCurrency(priceInfo.amount, siteInfo.currencyISOCode)}
                  </span>
                </div>

                {/* Back Button */}
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/checkout?id=${courseId}&type=course`)
                  }
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Checkout
                </Button>

                {/* Security Badges */}
                <div className="flex items-center justify-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>SSL Secure</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span>PCI Compliant</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
