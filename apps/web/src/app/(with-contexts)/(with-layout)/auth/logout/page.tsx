"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@workspace/components-library";
import { useEffect } from "react";

const Logout = () => {
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // NextAuth will automatically handle Firebase logout through the callback
        await signOut({ callbackUrl: "/auth/login" });

        toast({
          title: "Signed out successfully",
          description: "You have been logged out",
        });

        // Redirect to login page
        router.replace("/auth/login");
      } catch (error) {
        console.error("Logout error:", error);
        toast({
          title: "Logout error",
          description: "There was an issue logging out. Please try again.",
          variant: "destructive",
        });

        // Force redirect even if there's an error
        router.replace("/auth/login");
      }
    };

    if (status === "authenticated") {
      handleLogout();
    } else if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router, toast]);

  return <div>Logging out...</div>;
};

export default Logout;
