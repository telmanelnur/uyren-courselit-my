"use client";

import { useAddress } from "@/components/contexts/address-context";
import Checkout, { Product } from "@/components/public/payments/checkout";
import { TOAST_TITLE_ERROR } from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { Constants, PaymentPlan } from "@workspace/common-models";
import { useToast } from "@workspace/components-library";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const { MembershipEntityType } = Constants;

export default function ProductCheckout() {
  const { address } = useAddress();
  const searchParams = useSearchParams();
  const entityId = searchParams?.get("id");
  const entityType = searchParams?.get("type");
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);

  // Load course data using tRPC
  const loadCourseQuery =
    trpc.lmsModule.courseModule.course.publicGetByCourseId.useQuery(
      {
        courseId: entityId!,
      },
      {
        enabled: !!entityId && entityType === MembershipEntityType.COURSE,
      },
    );

  useEffect(() => {
    if (loadCourseQuery.data) {
      setProduct({
        id: loadCourseQuery.data.courseId,
        name: loadCourseQuery.data.title,
        slug: loadCourseQuery.data.slug,
        featuredImage: loadCourseQuery.data.featuredImage?.file,
        type: MembershipEntityType.COURSE,
        description: loadCourseQuery.data.description,
      });
      setPaymentPlans(loadCourseQuery.data.paymentPlans || []);
    }
  }, [loadCourseQuery.data]);

  useEffect(() => {
    if (loadCourseQuery.error) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: loadCourseQuery.error.message,
      });
    }
  }, [loadCourseQuery.error, toast]);

  // Load community data using tRPC
  const loadCommunityQuery =
    trpc.communityModule.community.getByCommunityId.useQuery(
      {
        data: { communityId: entityId! },
      },
      {
        enabled: !!entityId && entityType === MembershipEntityType.COMMUNITY,
      },
    );

  useEffect(() => {
    if (loadCommunityQuery.data) {
      setProduct({
        id: loadCommunityQuery.data.communityId,
        name: loadCommunityQuery.data.name,
        type: MembershipEntityType.COMMUNITY,
        featuredImage: loadCommunityQuery.data.featuredImage?.file,
        joiningReasonText: loadCommunityQuery.data.joiningReasonText,
        autoAcceptMembers: loadCommunityQuery.data.autoAcceptMembers,
      });
      setPaymentPlans(loadCommunityQuery.data.paymentPlans || []);
    }
  }, [loadCommunityQuery.data]);

  // Handle errors from queries
  useEffect(() => {
    if (loadCourseQuery.error) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: loadCourseQuery.error.message,
      });
    }
  }, [loadCourseQuery.error, toast]);

  useEffect(() => {
    if (loadCommunityQuery.error) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: loadCommunityQuery.error.message,
      });
    }
  }, [loadCommunityQuery.error, toast]);

  // Show loading state
  if (loadCourseQuery.isLoading || loadCommunityQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadCourseQuery.error || loadCommunityQuery.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to load checkout
          </h3>
          <p className="text-gray-600 mb-4">
            {loadCourseQuery.error?.message ||
              loadCommunityQuery.error?.message ||
              "An error occurred while loading the checkout details."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show no product state
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No product selected
          </h3>
          <p className="text-gray-600">
            Please select a course or community to checkout.
          </p>
        </div>
      </div>
    );
  }

  return <Checkout product={product} paymentPlans={paymentPlans} />;
}
