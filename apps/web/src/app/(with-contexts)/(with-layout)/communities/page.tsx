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
    [router]
  );

  return (
    <Section theme={theme.theme}>
      <div className="flex flex-col gap-4">
        <Header1 theme={theme.theme}>Communities</Header1>
        <CommunitiesList
          page={page}
          onPageChange={handlePageChange}
          itemsPerPage={10}
        />
      </div>
    </Section>
  );
}
