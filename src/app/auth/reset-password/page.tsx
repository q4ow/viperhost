"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      setIsSuccess(true);

      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid or expired token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <CardTitle className="text-xl mb-2">Invalid Reset Link</CardTitle>
            <CardDescription className="mb-6">
              The password reset link is invalid or has expired.
            </CardDescription>
            <Link href="/auth/forgot-password">
              <Button>Request a new link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        {!isSuccess ? (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                Reset password
              </CardTitle>
              <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </CardFooter>
            </form>
          </>
        ) : (
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle className="h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-xl mb-2">
              Password Reset Successful
            </CardTitle>
            <CardDescription className="mb-6">
              Your password has been reset successfully. You will be redirected
              to the login page.
            </CardDescription>
            <Link href="/auth/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
