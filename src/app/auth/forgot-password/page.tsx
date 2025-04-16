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
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }

      setIsSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: `Something went wrong. Please try again. Error: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/auth/login"
        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>

      <Card className="w-full max-w-md">
        {!isSubmitted ? (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                Forgot password
              </CardTitle>
              <CardDescription>
                Enter your email address and we&apos;ll send you a link to reset
                your password
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </CardFooter>
            </form>
          </>
        ) : (
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle className="h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-xl mb-2">Check your email</CardTitle>
            <CardDescription className="mb-6">
              We&apos;ve sent a password reset link to your email address.
            </CardDescription>
            <Link href="/auth/login">
              <Button variant="outline">Back to login</Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
