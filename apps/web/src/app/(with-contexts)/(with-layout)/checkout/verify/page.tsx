"use client";

import { InvoicesStatus } from "@workspace/common-models";
import { Button } from "@workspace/ui/components/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PaymentVerificationStatus } from "./payment-verification-status";
import { useAddress } from "@/components/contexts/address-context";

export default function Page() {
    const params = useSearchParams();
    const id = params?.get("id");
    const [paymentStatus, setPaymentStatus] =
        useState<InvoicesStatus>("pending");
    const [loading, setLoading] = useState(false);
    const { address } = useAddress();

    const verifyPayment = async () => {
        setPaymentStatus("pending"); // Hide check status again
        try {
            setLoading(true);
            const response = await fetch(`${address.backend}/api/payment/verify-new`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });
            const responseData = await response.json();
            if (responseData.status) {
                setPaymentStatus(responseData.status);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifyPayment();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto pt-20">
            {paymentStatus === "paid" ? (
                <>
                    {/* <CheckCircle className="w-16 h-16 text-green-500" /> */}
                    <h2 className="text-2xl font-bold">
                        Thank you for your purchase!
                    </h2>
                    <p className="text-muted-foreground">
                        Your order number is:{" "}
                        <span className="font-medium">{id}</span>
                    </p>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <p className="text-lg font-medium text-green-600">
                        Payment verified successfully!
                    </p>
                    <p className="text-muted-foreground">
                        We have sent a confirmation email with order details and
                        tracking information.
                    </p>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold">
                        Thank you for your order!
                    </h2>
                    <p className="text-muted-foreground">
                        Your order number is:{" "}
                        <span className="font-medium">{id}</span>
                    </p>
                    <PaymentVerificationStatus
                        status={paymentStatus}
                        onRetryVerification={verifyPayment}
                        loading={loading}
                    />
                </>
            )}

            <div className="flex space-x-4 mt-6">
                {paymentStatus === "paid" && (
                    <Button asChild>
                        <Link href="/dashboard/my-content">
                            Go to Dashboard
                        </Link>
                    </Button>
                )}
                {/* <Button variant="outline" asChild>
          <Link href="/support">Need Help?</Link>
        </Button> */}
            </div>
        </div>
    );
}
