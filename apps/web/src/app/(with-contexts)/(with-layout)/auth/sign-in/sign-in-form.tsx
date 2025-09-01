"use client";

import { ScrollAnimation } from "@/components/public/scroll-animation";
import { useFirebaseAuth } from "@/hooks/use-auth";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getUserFriendlyErrorMessage } from "@/lib/auth/error-handler";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const firebaseAuth = useFirebaseAuth();
  const router = useRouter();
  const { t } = useTranslation("validation");

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      const result = await firebaseAuth.mutateAsync({ provider: "google" });

      if (result.success) {
        router.push("/dashboard");
      } else {
        const errorMessage = getUserFriendlyErrorMessage(result.error);
        setAuthError(errorMessage);
        console.error("Google sign in failed:", result.error);
      }
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      setAuthError(errorMessage);
      console.error("Google sign in error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      const result = await firebaseAuth.mutateAsync({
        provider: "email",
        data: formData,
      });

      if (result.success) {
        router.push("/dashboard");
      } else {
        const errorMessage = getUserFriendlyErrorMessage(result.error);
        setAuthError(errorMessage);
        console.error("Sign in failed:", result.error);
      }
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      setAuthError(errorMessage);
      console.error("Sign in error:", error);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center py-16">
      <div className="w-full max-w-md px-4">
        <ScrollAnimation variant="fadeUp" delay={0.2}>
          {/* Header Section */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200 text-sm font-semibold px-4 py-2">
              Welcome Back
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
              Sign in to <span className="text-brand-primary">Continue</span>
            </h1>
            <p className="text-muted-foreground">
              Access your personalized learning dashboard
            </p>
          </div>

          {/* Sign In Form */}
          <Card className="w-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-border hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-xl font-bold text-foreground">
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose your preferred sign-in method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Social Authentication */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full flex items-center justify-center gap-3 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300 py-3 rounded-full"
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Error Display */}
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {t(authError)}
                </div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200 bg-background text-foreground"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200 bg-background text-foreground"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-brand-primary hover:text-brand-primary-hover font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy
                Policy
              </div>
            </CardContent>
          </Card>
        </ScrollAnimation>
      </div>
    </div>
  );
}
