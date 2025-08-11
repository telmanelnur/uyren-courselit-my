"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useEffect } from "react";

const Logout = () => {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      signOut();
      router.replace("/");
    } else if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  return <div></div>;
};

export default Logout;
