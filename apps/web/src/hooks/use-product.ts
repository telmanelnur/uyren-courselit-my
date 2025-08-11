import { TOAST_TITLE_ERROR } from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { Address, Course, Lesson } from "@workspace/common-models";
import { useToast } from "@workspace/components-library";
import { useEffect, useState } from "react";

export type ProductWithAdminProps = Partial<
  Omit<Course, "paymentPlans"> &
    Pick<Course, "paymentPlans"> & {
      lessons: Pick<Lesson, "title" | "groupId" | "lessonId" | "type"> &
        { id: string }[];
    }
>;

export default function useProduct(
  id: string,
  address: Address
): { product: ProductWithAdminProps | undefined | null; loaded: boolean } {
  const [product, setProduct] = useState<
    ProductWithAdminProps | undefined | null
  >();
  const { toast } = useToast();
  const [, setHasError] = useState(false);

  const loadQuery =
    trpc.lmsModule.courseModule.course.getByCourseDetailed.useQuery({
      courseId: id,
    });

  useEffect(() => {
    if (loadQuery.data) {
      const lessons = loadQuery.data.lessons;
      setProduct({
        ...loadQuery.data,
        lessons: lessons as unknown as ProductWithAdminProps["lessons"],
      });
    }
  }, [loadQuery.data]);

  useEffect(() => {
    if (loadQuery.error) {
      setHasError(true);
      setProduct(null);
      toast({
        title: TOAST_TITLE_ERROR,
        description: loadQuery.error.message,
        variant: "destructive",
      });
    }
  }, [loadQuery.error]);

  //     const query = `
  //     query {
  //         course: getCourse(id: "${courseId}") {
  //             title,
  //             description,
  //             type,
  //             slug,
  //             lessons {
  //                 id,
  //                 title,
  //                 groupId,
  //                 lessonId,
  //                 type
  //             },
  //             groups {
  //                 id,
  //                 name,
  //                 rank,
  //                 lessonsOrder,
  //                 drip {
  //                     type,
  //                     status,
  //                     delayInMillis,
  //                     dateInUTC,
  //                     email {
  //                         content {
  //                             content {
  //                                 blockType,
  //                                 settings
  //                             },
  //                             style,
  //                             meta
  //                         },
  //                         subject
  //                         emailId
  //                     }
  //                 }
  //             },
  //             courseId,
  //             cost,
  //             costType,
  //             creatorName,
  //             featuredImage {
  //                 mediaId,
  //                 originalFileName,
  //                 mimeType,
  //                 size,
  //                 access,
  //                 file,
  //                 thumbnail,
  //                 caption
  //             },
  //             published,
  //             privacy,
  //             pageId,
  //             updatedAt
  //             paymentPlans {
  //                 planId
  //                 name
  //                 type
  //                 oneTimeAmount
  //                 emiAmount
  //                 emiTotalInstallments
  //                 subscriptionMonthlyAmount
  //                 subscriptionYearlyAmount
  //             }
  //             leadMagnet
  //             defaultPaymentPlan
  //         }
  //     }
  // `;

  return { product, loaded: loadQuery.isLoading };
}
