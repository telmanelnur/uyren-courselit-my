import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  return <NuqsAdapter>{children}</NuqsAdapter>;
}
