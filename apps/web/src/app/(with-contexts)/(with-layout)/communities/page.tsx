"use client";

import { useTheme } from "@/components/contexts/theme-context";
import { Header1, Section } from "@workspace/page-primitives";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CommunitiesList } from "./communities-list";

export default function CommunitiesPage() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams?.get("page") || "1");
  const router = useRouter();
  const { theme } = useTheme();

  const handlePageChange = useCallback(
    (value: number) => {
      router.push(`/communities?page=${value}`);
    },
    [router],
  );

  return (
    <div className="bg-background min-h-screen">
      <Section theme={theme.theme} className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Header1
                theme={theme.theme}
                className="text-[42px] font-[700] text-foreground mb-4"
              >
                <span className="text-brand-primary">Learning</span> Communities
              </Header1>
              <p className="text-[18px] text-muted-foreground max-w-2xl">
                Connect with fellow learners, share knowledge, and grow together
                in our vibrant communities.
              </p>
            </div>
            <CommunitiesList
              page={page}
              onPageChange={handlePageChange}
              itemsPerPage={10}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
