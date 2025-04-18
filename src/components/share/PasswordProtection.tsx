"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PasswordProtectionProps {
  shareId: string;
  fileName: string;
  onSuccess?: () => void;
}

export function PasswordProtection({
  shareId,
  fileName,
  onSuccess,
}: PasswordProtectionProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/share/${shareId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error("Invalid password");
      }

      const { token } = await response.json();
      sessionStorage.setItem(`share_access_${shareId}`, token);

      if (onSuccess) {
        onSuccess();
      } else {
        router.replace(window.location.pathname);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Lock className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle>Password Protected</CardTitle>
          <CardDescription>
            This file is password protected. Enter the password to access &quot;
            {fileName}&quot;.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Access File"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
