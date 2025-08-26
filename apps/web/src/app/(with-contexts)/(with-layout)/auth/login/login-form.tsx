"use client";

import { useTheme } from "@/components/contexts/theme-context";
import { useFirebaseAuth } from "@/hooks/use-auth";
import { Section } from "@workspace/page-primitives";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const { theme } = useTheme();
  const firebaseAuth = useFirebaseAuth();
  const router = useRouter();

  // Handler for Google login
  const handleGoogleLogin = () => {
    firebaseAuth.mutateAsync({ provider: "google" }).then((response) => {
      console.log("[firebaseAuth with google]", response);
      router.push(redirectTo || "/dashboard");
    });
  };

  return (
    <div className="bg-background min-h-screen">
      <Section theme={theme.theme} className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center gap-6 min-h-[70vh]">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-[32px] font-[700] text-foreground">
                Welcome <span className="text-brand-primary">Back</span>
              </h1>
              <p className="text-[16px] text-muted-foreground">
                Sign in to continue your learning journey
              </p>
            </div>

            {/* Login Card */}
            <Card className="w-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-border">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-[24px] font-[600] text-foreground">
                  Sign in to your account
                </CardTitle>
                <CardDescription className="text-[14px] text-muted-foreground">
                  Choose your preferred sign-in method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Social Authentication Buttons */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full flex items-center justify-center gap-3 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300 py-3"
                    onClick={handleGoogleLogin}
                    disabled={firebaseAuth.isPending}
                  >
                    {firebaseAuth.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    Sign in with Google
                  </Button>
                </div>

                <div className="text-center text-[12px] text-muted-foreground mt-4">
                  By signing in, you agree to our Terms of Service and Privacy
                  Policy
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
}
