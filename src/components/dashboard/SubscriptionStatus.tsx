"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface SubscriptionStatusProps {
  isPro: boolean;
  isAdmin?: boolean;
}

export function SubscriptionStatus({
  isPro,
  isAdmin = false,
}: SubscriptionStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const hasProFeatures = isPro || isAdmin;

  const handleSubscription = async () => {
    setIsLoading(true);

    try {
      if (isPro) {
        const response = await fetch("/api/subscription/cancel", {
          method: "POST",
        });

        if (!response.ok) throw new Error("Failed to cancel subscription");

        toast({
          title: "Subscription cancelled",
          description:
            "Your subscription will remain active until the end of the billing period.",
        });
      } else {
        const response = await fetch("/api/subscription/create-checkout", {
          method: "POST",
        });

        if (!response.ok) throw new Error("Failed to create checkout session");

        const data = await response.json();
        router.push(data.url);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </div>
          <Badge
            variant={hasProFeatures ? "default" : "outline"}
            className={hasProFeatures ? "bg-primary" : ""}
          >
            {isAdmin ? "Admin" : hasProFeatures ? "Pro" : "Free"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Storage</span>
            <span className="font-medium">
              {hasProFeatures ? "50GB" : "5GB"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Max file size</span>
            <span className="font-medium">
              {hasProFeatures ? "2GB" : "100MB"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Analytics</span>
            <span className="font-medium">
              {hasProFeatures ? "Advanced" : "Basic"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Support</span>
            <span className="font-medium">
              {hasProFeatures ? "Priority" : "Community"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isAdmin ? (
          <Button disabled className="w-full" variant="outline">
            Admin Access
          </Button>
        ) : (
          <Button
            onClick={handleSubscription}
            disabled={isLoading}
            className="w-full"
            variant={isPro ? "outline" : "default"}
          >
            {isLoading ? (
              "Processing..."
            ) : isPro ? (
              "Cancel Subscription"
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
