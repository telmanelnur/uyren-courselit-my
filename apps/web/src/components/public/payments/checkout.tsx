"use client";

import Image from "next/image";
import { useContext, useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { Check, ChevronUp, ShoppingCart, X } from "lucide-react";
import { LoginForm } from "./login-form";
import {
  PaymentPlan,
  Constants,
  MembershipEntityType,
  UIConstants,
  MembershipStatus,
} from "@workspace/common-models";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { getSymbolFromCurrency, useToast } from "@workspace/components-library";
import { getPlanPrice } from "@/lib/ui/lib/utils";
import Script from "next/script";
import {
  Button,
  Header3,
  Header4,
  PageCard,
  PageCardContent,
  Text1,
} from "@workspace/page-primitives";
import { CHECKOUT_PAGE_ORDER_SUMMARY } from "@/lib/ui/config/strings";
import { useSiteInfo } from "@/components/contexts/site-info-context";
import { useProfile } from "@/components/contexts/profile-context";
import { useAddress } from "@/components/contexts/address-context";
import { trpc } from "@/utils/trpc";
import { useTheme } from "@/components/contexts/theme-context";
const { PaymentPlanType: paymentPlanType } = Constants;

export interface Product {
  id: string;
  name: string;
  type: MembershipEntityType;
  slug?: string;
  featuredImage?: string;
  description?: string;
  autoAcceptMembers?: boolean;
  joiningReasonText?: string;
}

export interface CheckoutScreenProps {
  product: Product;
  paymentPlans: PaymentPlan[];
}

const formSchema = z.object({
  selectedPlan: z.string().min(1, "Please select a plan"),
  joiningReason: z.string().optional(),
});

function getPlanDescription(plan: PaymentPlan, currencySymbol: string): string {
  if (!plan) {
    return "N/A";
  }

  switch (plan.type) {
    case paymentPlanType.FREE:
      return "Free plan";
    case paymentPlanType.ONE_TIME:
      return `One-time payment of ${currencySymbol}${plan.oneTimeAmount?.toFixed(2)}`;
    case paymentPlanType.SUBSCRIPTION:
      if (plan.subscriptionYearlyAmount) {
        return `Billed annually at ${currencySymbol}${plan.subscriptionYearlyAmount.toFixed(2)}`;
      }
      return `${currencySymbol}${plan.subscriptionMonthlyAmount?.toFixed(2)} per month`;
    case paymentPlanType.EMI:
      return `${currencySymbol}${plan.emiAmount?.toFixed(2)} per month for ${plan.emiTotalInstallments} months`;
    default:
      return "N/A";
  }
}

export default function Checkout({
  product,
  paymentPlans,
}: CheckoutScreenProps) {
  const { siteInfo } = useSiteInfo();
  const { theme } = useTheme();
  const { profile } = useProfile();
  const { address } = useAddress();
  const currencySymbol =
    getSymbolFromCurrency(siteInfo.currencyISOCode || "USD") || "$";

  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!profile?.email);
  const [userEmail, setUserEmail] = useState(profile?.email || "");
  const [userName, setUserName] = useState(profile?.name || "");
  const [membershipStatus, setMembershipStatus] = useState<
    MembershipStatus | undefined
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stripePromise = loadStripe(siteInfo.stripeKey as string);
  const router = useRouter();
  const { toast } = useToast();
  // Remove theme usage for now

  // Get membership status using tRPC
  const { data: membershipStatusData } =
    trpc.userModule.user.getMembershipStatus.useQuery(
      {
        entityId: product.id,
        entityType: product.type,
      },
      {
        enabled: !!profile.userId && !!product.id,
      },
    );

  useEffect(() => {
    if (membershipStatusData !== undefined) {
      setMembershipStatus(membershipStatusData);
    }
  }, [membershipStatusData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedPlan: "",
      joiningReason: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const { paymentMethod } = siteInfo;

    let payload: Record<string, unknown> | null = {
      joiningReason: values.joiningReason,
      id: product.id,
      type: product.type,
      planId: selectedPlan!.planId,
      origin: address.frontend,
    };

    try {
      const response = await fetch(`${address.backend}/api/payment/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("responseData", responseData);
      if (responseData.status === "initiated") {
        if (paymentMethod === UIConstants.PAYMENT_METHOD_STRIPE) {
          await redirectToStripeCheckout({
            stripe: await stripePromise,
            sessionId: responseData.paymentTracker,
          });
        }
        if (paymentMethod === UIConstants.PAYMENT_METHOD_RAZORPAY) {
          const razorpayPayload = {
            key: siteInfo.razorpayKey,
            name: product.name,
            image: product.featuredImage || siteInfo.logo?.file,
            prefill: {
              email: profile.email,
            },
            handler: function (response) {
              verifySignature(response);
            },
          };
          if (
            selectedPlan?.type === paymentPlanType.SUBSCRIPTION ||
            selectedPlan?.type === paymentPlanType.EMI
          ) {
            razorpayPayload["subscription_id"] = responseData.paymentTracker;
          } else {
            razorpayPayload["order_id"] = responseData.paymentTracker;
            // razorpayPayload["handler"] = function (response) {
            //     verifySignature(response);
            // }
          }
          // @ts-ignore
          const rzp1 = new Razorpay(razorpayPayload);
          rzp1.open();
        }
        if (paymentMethod === UIConstants.PAYMENT_METHOD_LEMONSQUEEZY) {
          (window as any).LemonSqueezy.Url.Open(response.paymentTracker);
        }
      } else if (response.status === "success") {
        if (product.type === Constants.MembershipEntityType.COMMUNITY) {
          router.replace(`/dashboard/community/${product.id}?success=true`);
        }
        if (product.type === Constants.MembershipEntityType.COURSE) {
          router.replace(`/course/${product.slug}/${product.id}?success=true`);
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const verifySignature = async (response) => {
    const payload = {
      signature: response.razorpay_signature,
      paymentId: response.razorpay_payment_id,
    };
    if (
      selectedPlan?.type === paymentPlanType.SUBSCRIPTION ||
      selectedPlan?.type === paymentPlanType.EMI
    ) {
      payload["subscriptionId"] = response.razorpay_subscription_id;
    } else {
      payload["orderId"] = response.razorpay_order_id;
    }
    const fetch = new FetchBuilder()
      .setUrl(`${address.backend}/api/payment/vendor/razorpay/verify-new`)
      .setHeaders({
        "Content-Type": "application/json",
      })
      .setPayload(JSON.stringify(payload))
      .build();

    try {
      const verifyResponse = await fetch.exec();
      router.replace(`/checkout/verify?id=${verifyResponse.purchaseId}`);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const redirectToStripeCheckout = async ({
    stripe,
    sessionId,
  }: {
    stripe: any;
    sessionId: string;
  }) => {
    const result = await stripe.redirectToCheckout({
      sessionId,
    });
    if (result.error) {
    }
  };

  const handlePlanSelection = (planId: string) => {
    const plan = paymentPlans.find((p) => p.planId === planId);
    setSelectedPlan(plan || null);
    form.setValue("selectedPlan", planId);
  };

  const handleLoginComplete = (email: string, name: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setUserName(name);
  };

  const MobileOrderSummary = () => (
    <div className="md:hidden w-full sticky top-20 z-11 mb-8">
      <PageCard theme={theme.theme}>
        <PageCardContent theme={theme.theme} className="p-0">
          <div className="w-full">
            <div
              className="flex items-center justify-between p-4 border-b w-full"
              style={
                {
                  // borderBottomColor: theme.theme.colors.border,
                }
              }
            >
              <div className="flex items-center gap-1">
                <ShoppingCart className="h-5 w-5" />
                <Text1
                  className="p-0 !m-0 h-auto font-normal hover:bg-transparent flex items-center"
                  onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                  theme={theme.theme}
                >
                  {isOrderSummaryOpen ? "Hide" : "Show"} order summary
                  <ChevronUp
                    className={`h-4 w-4 ml-1 transition-transform duration-200 ${isOrderSummaryOpen ? "" : "rotate-180"}`}
                  />
                </Text1>
              </div>
              <div className="font-medium flex items-center">
                {currencySymbol}
                {getPlanPrice(selectedPlan || paymentPlans[0]).amount.toFixed(
                  2,
                )}
                <span className="text-sm text-muted-foreground ml-1">
                  {getPlanPrice(selectedPlan || paymentPlans[0]).period}
                </span>
              </div>
            </div>
          </div>

          <Collapsible
            open={isOrderSummaryOpen}
            onOpenChange={setIsOrderSummaryOpen}
          >
            <CollapsibleTrigger className="sr-only">
              Toggle order summary
            </CollapsibleTrigger>
            <CollapsibleContent
              style={
                {
                  // borderBottomColor: theme.theme.colors.border,
                }
              }
            >
              <div className="p-4 space-y-4">
                <div className="flex gap-4">
                  <div className="h-16 w-16 relative rounded-lg overflow-hidden">
                    <Image
                      src={
                        product.featuredImage ||
                        "/courselit_backdrop_square.webp"
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Header3 theme={theme.theme}>{product.name}</Header3>
                    {product.description && (
                      <Text1 theme={theme.theme}>{product.description}</Text1>
                    )}
                  </div>
                </div>

                {selectedPlan && (
                  <div className="space-y-4">
                    <div
                      className="flex justify-between pt-4 border-t"
                      style={
                        {
                          // borderTopColor:  theme.theme.colors.border,
                        }
                      }
                    >
                      <Header3 theme={theme.theme}>Total</Header3>
                      <div className="text-right flex items-center">
                        <Header4 className="font-medium">
                          {currencySymbol}
                          {getPlanPrice(selectedPlan).amount.toFixed(2)}
                        </Header4>
                        <Text1 theme={theme.theme}>
                          {getPlanPrice(selectedPlan).period}
                        </Text1>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </PageCardContent>
      </PageCard>
    </div>
  );

  const DesktopOrderSummary = () => (
    <PageCard theme={theme.theme}>
      <PageCardContent theme={theme.theme} className="space-y-4">
        <Header3 theme={theme.theme}>{CHECKOUT_PAGE_ORDER_SUMMARY}</Header3>
        <div className="flex items-start gap-4 pb-4">
          <div className="h-16 w-16 relative rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.featuredImage || "/courselit_backdrop_square.webp"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <Header4 theme={theme.theme}>{product.name}</Header4>
            {product.description && (
              <Text1 theme={theme.theme}>{product.description}</Text1>
            )}
          </div>
        </div>
        {selectedPlan && (
          <div
            className="mt-4 pt-4 border-t"
            style={
              {
                // borderTopColor: theme.theme.colors.border,
              }
            }
          >
            <div className="flex justify-between items-center">
              <Header4 theme={theme.theme}>Total</Header4>
              <Header4 theme={theme.theme}>
                {currencySymbol}
                {getPlanPrice(selectedPlan).amount.toFixed(2)}
                <span className="text-sm text-muted-foreground ml-1">
                  {getPlanPrice(selectedPlan).period}
                </span>
              </Header4>
            </div>
            <Text1 theme={theme.theme}>
              {getPlanDescription(selectedPlan, currencySymbol)}
            </Text1>
          </div>
        )}
      </PageCardContent>
    </PageCard>
  );

  useEffect(() => {
    function setupLemonSqueezy() {
      if (typeof (window as any).createLemonSqueezy !== "undefined") {
        (window as any).createLemonSqueezy();
      }
    }

    if (siteInfo.paymentMethod === UIConstants.PAYMENT_METHOD_LEMONSQUEEZY) {
      setupLemonSqueezy();
    }
  }, [siteInfo, (window as any).createLemonSqueezy]);

  const watchJoiningReason = form.watch("joiningReason");

  const canJoin = useMemo(() => {
    if (
      selectedPlan?.type === paymentPlanType.FREE &&
      product.type === Constants.MembershipEntityType.COMMUNITY
    ) {
      return !!watchJoiningReason;
    }
    return true;
  }, [selectedPlan, product, watchJoiningReason]);

  return (
    <div className="min-h-screen w-full">
      <div className="w-full">
        <MobileOrderSummary />
        <div className="w-full grid md:grid-cols-[1fr,400px] gap-8 items-start">
          <div className="space-y-8">
            {membershipStatus === Constants.MembershipStatus.ACTIVE ||
            membershipStatus === Constants.MembershipStatus.REJECTED ? (
              <div className="space-y-4">
                <Header3 theme={theme.theme}>
                  {membershipStatus === Constants.MembershipStatus.ACTIVE ? (
                    <Check />
                  ) : (
                    <X />
                  )}
                  {membershipStatus === Constants.MembershipStatus.ACTIVE
                    ? "Already owned"
                    : "Access Denied"}
                </Header3>
                <Text1 theme={theme.theme}>
                  {membershipStatus === Constants.MembershipStatus.ACTIVE
                    ? "You already have access to this resource."
                    : "You have been rejected and cannot proceed with the checkout."}
                </Text1>
                {membershipStatus === Constants.MembershipStatus.ACTIVE && (
                  <Button
                    onClick={() => {
                      if (
                        product.type ===
                        Constants.MembershipEntityType.COMMUNITY
                      ) {
                        router.replace(`/dashboard/community/${product.id}`);
                      } else if (
                        product.type === Constants.MembershipEntityType.COURSE
                      ) {
                        router.replace(`/course/${product.slug}/${product.id}`);
                      }
                    }}
                    className="bg-black text-white hover:bg-black/90"
                    theme={theme.theme}
                  >
                    Go to the resource
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <Header3 theme={theme.theme}>Personal Information</Header3>
                  {!isLoggedIn ? (
                    <LoginForm onLoginComplete={handleLoginComplete} />
                  ) : (
                    <div className="text-sm space-y-2">
                      <Text1 theme={theme.theme}>
                        <span className="font-semibold">Email:</span>{" "}
                        {userEmail}
                      </Text1>
                      <Text1 theme={theme.theme}>
                        <span className="font-semibold">Name:</span> {userName}
                      </Text1>
                    </div>
                  )}
                </div>
                <FormProvider {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="mb-6 space-y-4">
                      <Header3 theme={theme.theme}>Select Payment Plan</Header3>
                      <FormField
                        control={form.control}
                        name="selectedPlan"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handlePlanSelection(value);
                                }}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                {paymentPlans.map((plan) => (
                                  <FormItem
                                    key={plan.planId}
                                    className="flex items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <RadioGroupItem
                                        value={plan.planId}
                                        disabled={!isLoggedIn}
                                      />
                                    </FormControl>
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base font-normal">
                                        {plan.name}
                                      </FormLabel>
                                      <Text1 theme={theme.theme}>
                                        {getPlanDescription(
                                          plan,
                                          currencySymbol,
                                        )}
                                      </Text1>
                                    </div>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {selectedPlan?.type === paymentPlanType.FREE &&
                      product.type ===
                        Constants.MembershipEntityType.COMMUNITY && (
                        <FormField
                          control={form.control}
                          name="joiningReason"
                          render={({ field }) => (
                            <FormItem className="mb-6">
                              <FormLabel className="text-sm font-semibold mb-4">
                                {product.joiningReasonText ||
                                  "Reason for joining"}
                              </FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full border rounded p-2"
                                  {...field}
                                  placeholder="Please provide your reason for joining"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !isLoggedIn ||
                        !form.formState.isValid ||
                        !canJoin
                      }
                      theme={theme.theme}
                    >
                      {isSubmitting ? "Working..." : "Complete Purchase"}
                    </Button>
                  </form>
                </FormProvider>
              </>
            )}
          </div>
          <div className="hidden md:block">
            <DesktopOrderSummary />
          </div>
        </div>
      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Script
        src="https://app.lemonsqueezy.com/js/lemon.js"
        id="lemonsqueezy"
      />
    </div>
  );
}
