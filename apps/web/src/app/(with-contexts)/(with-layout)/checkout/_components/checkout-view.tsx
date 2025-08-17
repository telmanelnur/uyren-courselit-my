"use client";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Badge, BookOpen, CheckCircle, Clock, CreditCard, Users, Star, FileText, PlayCircle } from "lucide-react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useSiteInfo } from "@/components/contexts/site-info-context";
import { formatCurrency } from "@workspace/utils";
import { Constants } from "@workspace/common-models";
import { loadStripe } from "@stripe/stripe-js";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@workspace/components-library";

interface PaymentPlan {
    planId: string;
    name: string;
    type: string;
    oneTimeAmount?: number;
    subscriptionMonthlyAmount?: number;
    subscriptionYearlyAmount?: number;
    emiAmount?: number;
    emiTotalInstallments?: number;
    features?: string[];
    popular?: boolean;
}

export default function CheckoutView() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const courseId = searchParams.get('id');
    const courseType = searchParams.get('type');
    const { siteInfo } = useSiteInfo();
    const { toast } = useToast();
    
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [joinReason, setJoinReason] = useState("");

    // Fetch course data
    const { data: course, isLoading: isCourseLoading, error: courseError } = trpc.lmsModule.courseModule.course.publicGetByCourseId.useQuery(
        { courseId: courseId! },
        { enabled: !!courseId && courseType === 'course' }
    );

    // Memoized plan features function
    const getPlanFeatures = useCallback((plan: any): string[] => {
        const features = [];

        if (plan.type === Constants.PaymentPlanType.FREE) {
            features.push("Full course access", "Lifetime access", "Certificate of completion");
        } else if (plan.type === Constants.PaymentPlanType.ONE_TIME) {
            features.push("Full course access", "Lifetime access", "Certificate of completion", "Download materials");
        } else if (plan.type === Constants.PaymentPlanType.SUBSCRIPTION) {
            features.push("Full course access", "Monthly/yearly billing", "Cancel anytime", "Certificate of completion");
        } else if (plan.type === Constants.PaymentPlanType.EMI) {
            features.push("Full course access", `Pay in ${plan.emiTotalInstallments} installments`, "Certificate of completion");
        }

        return features;
    }, []);

    // Memoized processed plans
    const processedPlans = useMemo(() =>
        course?.attachedPaymentPlans?.map((plan: any) => ({
            planId: plan.planId,
            name: plan.name,
            type: plan.type,
            oneTimeAmount: plan.oneTimeAmount,
            subscriptionMonthlyAmount: plan.subscriptionMonthlyAmount,
            subscriptionYearlyAmount: plan.subscriptionYearlyAmount,
            emiAmount: plan.emiAmount,
            emiTotalInstallments: plan.emiTotalInstallments,
            features: getPlanFeatures(plan),
            popular: plan.planId === course?.defaultPaymentPlan,
        })) || [], [course?.attachedPaymentPlans, course?.defaultPaymentPlan, getPlanFeatures]
    );

    const selectedPlanData = useMemo(() =>
        processedPlans.find(plan => plan.planId === selectedPlan),
        [processedPlans, selectedPlan]
    );

    // Auto-select default plan
    useEffect(() => {
        if (course?.defaultPaymentPlan && !selectedPlan) {
            setSelectedPlan(course.defaultPaymentPlan);
        }
    }, [course?.defaultPaymentPlan, selectedPlan]);

    const handlePlanSelect = useCallback((planId: string) => {
        setSelectedPlan(planId);
    }, []);

        // TanStack Query mutations
    const freeEnrollmentMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/payment/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: course!.courseId,
                    type: 'course',
                    planId: selectedPlanData!.planId,
                    origin: window.location.origin,
                    joiningReason: joinReason,
                }),
            });
            
            const data = await response.json();
            
            // Handle different response statuses
            if (response.status === 401) {
                throw new Error('Authentication required');
            }
            
            if (data.status === 'failed') {
                throw new Error(data.error || 'Enrollment failed');
            }
            
            if (data.status === 'success') {
                return data;
            }
            
            // If we reach here, something unexpected happened
            throw new Error('Unexpected response from server');
        },
        onSuccess: (data) => {
            toast({
                title: "Enrollment Successful!",
                description: "You have been successfully enrolled in the course.",
                variant: "info",
            });
            router.push(`/checkout/success?courseId=${course!.courseId}&planId=${selectedPlanData!.planId}`);
        },
        onError: (error: any) => {
            console.error('Free enrollment failed:', error.message);
            
            if (error.message === 'Authentication required') {
                toast({
                    title: "Authentication Required",
                    description: "Please log in to enroll in this course.",
                    variant: "destructive",
                });
                router.push('/auth/login');
                return;
            }
            
            if (error.message?.includes('already enrolled') || error.message?.includes('membership already active')) {
                toast({
                    title: "Already Enrolled",
                    description: "You are already enrolled in this course.",
                    variant: "info",
                });
                router.push(`/courses/${course!.courseId}`);
                return;
            }
            
            toast({
                title: "Enrollment Failed",
                description: error.message || "An error occurred during enrollment. Please try again.",
                variant: "destructive",
            });
        },
    });

    const stripePaymentMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/payment/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: course!.courseId,
                    type: 'course',
                    planId: selectedPlanData!.planId,
                    origin: window.location.origin,
                }),
            });
            
            const data = await response.json();
            
            // Handle different response statuses
            if (response.status === 401) {
                throw new Error('Authentication required');
            }
            
            if (data.status === 'failed') {
                throw new Error(data.error || 'Payment initiation failed');
            }
            
            if (data.status === 'initiated') {
                return data;
            }
            
            // If we reach here, something unexpected happened
            throw new Error('Unexpected response from server');
        },
        onSuccess: async (data) => {
            const stripe = await loadStripe(siteInfo.stripeKey as string);
            if (stripe) {
                const result = await stripe.redirectToCheckout({
                    sessionId: data.paymentTracker,
                });
                
                if (result.error) {
                    console.error('Stripe redirect error:', result.error);
                    toast({
                        title: "Payment Error",
                        description: "Failed to redirect to payment. Please try again.",
                        variant: "destructive",
                    });
                }
            }
        },
        onError: (error: any) => {
            console.error('Payment initiation failed:', error);
            
            if (error.message === 'Authentication required') {
                toast({
                    title: "Authentication Required",
                    description: "Please log in to purchase this course.",
                    variant: "destructive",
                });
                router.push('/auth/login');
                return;
            }
            
            if (error.message?.includes('already enrolled') || error.message?.includes('membership already active')) {
                toast({
                    title: "Already Enrolled",
                    description: "You are already enrolled in this course.",
                    variant: "info",
                });
                router.push(`/courses/${course!.courseId}`);
                return;
            }
            
            toast({
                title: "Payment Failed",
                description: error.message || "An error occurred during payment initiation. Please try again.",
                variant: "destructive",
            });
        },
    });

    const isProcessing = freeEnrollmentMutation.isPending || stripePaymentMutation.isPending;

    // Memoized price calculation function
    const getPlanPrice = useCallback((plan: PaymentPlan): { amount: number; period: string; isFree: boolean } => {
        if (plan.type === Constants.PaymentPlanType.FREE) {
            return { amount: 0, period: "", isFree: true };
        }

        if (plan.type === Constants.PaymentPlanType.SUBSCRIPTION) {
            if (plan.subscriptionYearlyAmount) {
                return { amount: plan.subscriptionYearlyAmount, period: "/year", isFree: false };
            }
            return { amount: plan.subscriptionMonthlyAmount || 0, period: "/month", isFree: false };
        }

        if (plan.type === Constants.PaymentPlanType.EMI) {
            return { amount: plan.emiAmount || 0, period: `/month for ${plan.emiTotalInstallments} months`, isFree: false };
        }

        return { amount: plan.oneTimeAmount || 0, period: "", isFree: false };
    }, []);

        const handleCheckout = useCallback(async () => {
        if (!selectedPlanData || !course) return;
        

        
        if (getPlanPrice(selectedPlanData).isFree) {
            freeEnrollmentMutation.mutate();
        } else {
            stripePaymentMutation.mutate();
        }
    }, [selectedPlanData, course, freeEnrollmentMutation, stripePaymentMutation, getPlanPrice, toast, router]);





    if (courseError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Course Not Found</h1>
                    <p className="text-gray-600">The course you're looking for doesn't exist or is not available.</p>
                </div>
            </div>
        );
    }

    if (isCourseLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <Skeleton className="h-10 w-96 mx-auto mb-2" />
                        <Skeleton className="h-6 w-64 mx-auto" />
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4">
                                <CardContent className="p-6">
                                    <Skeleton className="w-full h-48 rounded-lg mb-4" />
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-64" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-gray-600 mb-4">Course Not Available</h1>
                    <p className="text-gray-600">Please check the course ID and try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Product Info */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardContent className="p-6">
                                <Image
                                    src={course.featuredImage?.url || "/courselit_backdrop.webp"}
                                    alt={course.title}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                    width={300}
                                    height={300}
                                />
                                <h3 className="text-xl font-semibold text-[rgb(var(--brand-dark))] mb-2">{course.title}</h3>
                                {course.description && (
                                    <p className="text-[rgb(var(--brand-gray))] text-sm mb-4 overflow-hidden" style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {typeof course.description === 'string' ? course.description : 'Course description available'}
                                    </p>
                                )}

                                <div className="space-y-2 text-sm">
                                    {course.customers && (
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-[rgb(var(--brand-primary))]" />
                                            <span>{course.customers.toLocaleString()} students</span>
                                        </div>
                                    )}
                                    {course.duration && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-[rgb(var(--brand-primary))]" />
                                            <span>{course.duration} weeks</span>
                                        </div>
                                    )}
                                    {course.level && (
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-[rgb(var(--brand-primary))]" />
                                            <span>{course.level} level</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-[rgb(var(--brand-primary))]" />
                                        <span>By {course.creatorName}</span>
                                    </div>
                                    {course.attachedLessons && (
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-[rgb(var(--brand-primary))]" />
                                            <span>{course.attachedLessons.length} lessons</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Plans */}
                    <div className="lg:col-span-2">
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                            {processedPlans.map((plan) => {
                                const priceInfo = getPlanPrice(plan);
                                return (
                                    <Card
                                        key={plan.planId}
                                        className={`cursor-pointer transition-all duration-200 ${selectedPlan === plan.planId ? "ring-2 ring-[rgb(var(--brand-primary))] shadow-lg" : "hover:shadow-md"
                                            } ${plan.popular ? "border-[rgb(var(--brand-primary))]" : ""}`}
                                        onClick={() => handlePlanSelect(plan.planId)}
                                    >
                                        <CardHeader className="text-center pb-4">
                                            {plan.popular && (
                                                <Badge className="bg-[rgb(var(--brand-primary))] text-white mb-2 w-fit mx-auto">
                                                    Most Popular
                                                </Badge>
                                            )}
                                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-2xl font-bold text-[rgb(var(--brand-primary))]">
                                                    {priceInfo.isFree ? "Free" : formatCurrency(priceInfo.amount, siteInfo.currencyISOCode)}
                                                </span>
                                                {priceInfo.period && (
                                                    <span className="text-sm text-[rgb(var(--brand-gray))]">
                                                        {priceInfo.period}
                                                    </span>
                                                )}
                                            </div>
                                            <CardDescription>{plan.type}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {plan.features?.map((feature, index) => (
                                                    <li key={index} className="flex items-start gap-2 text-sm">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Payment Method Info */}
                        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600">
                                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">💳</span>
                                </div>
                                <p className="text-sm">
                                    <strong>Payment Methods:</strong> We accept all major credit cards, debit cards, and digital wallets through Stripe's secure payment gateway.
                                </p>
                            </div>
                        </div>

                        

                        {/* Free Course Join Reason */}
                        {selectedPlanData && getPlanPrice(selectedPlanData).isFree && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">Tell us about yourself</CardTitle>
                                    <CardDescription>Help us understand why you're interested in this free course</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="joinReason" className="block text-sm font-medium text-gray-700 mb-2">
                                                Why do you want to join this course? *
                                            </label>
                                            <textarea
                                                id="joinReason"
                                                placeholder="Tell us about your learning goals, background, or what you hope to achieve..."
                                                value={joinReason}
                                                onChange={(e) => setJoinReason(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand-primary))] focus:border-transparent"
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}



                        {/* Checkout Summary */}
                        {selectedPlanData && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{selectedPlanData.name}</span>
                                            <span className="font-bold text-[rgb(var(--brand-primary))]">
                                                {getPlanPrice(selectedPlanData).isFree ? "Free" : formatCurrency(getPlanPrice(selectedPlanData).amount, siteInfo.currencyISOCode)}
                                            </span>
                                        </div>

                                        <Separator />

                                        <div className="flex justify-between items-center font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-[rgb(var(--brand-primary))]">
                                                {getPlanPrice(selectedPlanData).isFree ? "Free" : formatCurrency(getPlanPrice(selectedPlanData).amount, siteInfo.currencyISOCode)}
                                            </span>
                                        </div>

                                        <Button
                                            onClick={handleCheckout}
                                            disabled={isProcessing || !selectedPlan || (getPlanPrice(selectedPlanData).isFree && !joinReason.trim())}
                                            className="w-full bg-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary-hover))] text-white"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    {getPlanPrice(selectedPlanData).isFree
                                                        ? "Processing Enrollment..."
                                                        : "Redirecting to Payment..."}
                                                </>
                                            ) : (
                                                getPlanPrice(selectedPlanData).isFree
                                                    ? "Enroll for Free"
                                                    : `Proceed to Payment - ${formatCurrency(getPlanPrice(selectedPlanData).amount, siteInfo.currencyISOCode)}`
                                            )}
                                        </Button>

                                        {!getPlanPrice(selectedPlanData).isFree && (
                                            <div className="space-y-2">
                                                <p className="text-xs text-[rgb(var(--brand-gray))] text-center">
                                                    Secure payment powered by Stripe. Your payment information is encrypted and secure.
                                                </p>
                                                <div className="flex items-center justify-center gap-2 text-xs text-[rgb(var(--brand-gray))]">
                                                    <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">S</span>
                                                    </div>
                                                    <span>SSL Secured</span>
                                                    <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">✓</span>
                                                    </div>
                                                    <span>PCI Compliant</span>
                                                </div>
                                                <p className="text-xs text-[rgb(var(--brand-gray))] text-center mt-2">
                                                    After successful payment, you'll be redirected back to complete your enrollment.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}