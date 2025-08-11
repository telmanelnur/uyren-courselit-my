import { getAddressFromHeaders, getSiteInfo } from "@/lib/ui/lib/utils";
import { Course } from "@workspace/common-models";
import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { ReactNode } from "react";

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const address = await getAddressFromHeaders(headers);
  const [product, siteInfo] = await Promise.all([
    getProduct(params.id, address),
    getSiteInfo(address),
  ]);

  return {
    title: `${product ? product.title : "Post not found"} | ${(await parent)?.title?.absolute}`,
    openGraph: {
      title: `${product?.title || "Post not found"} | ${(await parent)?.title?.absolute}`,
      images: [
        {
          url: product?.featuredImage?.file || siteInfo?.logo?.file || "",
          alt: product?.featuredImage?.caption || siteInfo?.logo?.caption || "",
        },
      ],
    },
    twitter: {
      title: `${product?.title || "Post not found"} | ${(await parent)?.title?.absolute}`,
      images: [
        {
          url: product?.featuredImage?.file || siteInfo?.logo?.file || "",
          alt: product?.featuredImage?.caption || siteInfo?.logo?.caption || "",
        },
      ],
    },
  };
}

async function getProduct(id: string, address: string): Promise<Course | null> {
  const query = `
            query ($id: String!) {
                product: getCourse(id: $id) {
                    courseId
                    title
                    description
                    slug
                    featuredImage {
                        thumbnail
                        file
                    }
                    creatorName
                    updatedAt
                }
            }
        `;
  const fetch = new FetchBuilder()
    .setUrl(`${address}/api/graph`)
    .setPayload({ query, variables: { id } })
    .setIsGraphQLEndpoint(true)
    .build();
  try {
    const response = await fetch.exec();
    return response.product;
  } catch (err: any) {
    return null;
  }
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
