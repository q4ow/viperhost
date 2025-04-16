"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for personal use",
      features: [
        "5GB storage",
        "Max file size: 100MB",
        "Basic analytics",
        "Standard upload speed",
        "Community support",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Pro",
      price: "$5",
      period: "/month",
      description: "For power users and professionals",
      features: [
        "50GB storage",
        "Max file size: 2GB",
        "Advanced analytics",
        "Priority upload speed",
        "Email support",
        "Custom domain",
        "No advertisements",
        "Password protection",
      ],
      buttonText: "Subscribe Now",
      buttonVariant: "default" as const,
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-background/50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-muted-foreground md:text-xl">
            Choose the plan that works best for you
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`flex flex-col rounded-lg border ${plan.popular ? "border-primary" : "border-border"} bg-card p-6 shadow-sm`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {plan.popular && (
                <div className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground w-fit mx-auto mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-center">{plan.name}</h3>
              <div className="mt-4 text-center">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>
              <p className="mt-2 text-center text-muted-foreground">
                {plan.description}
              </p>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href={plan.name === "Free" ? "/auth/register" : "/pricing"}
                >
                  <Button variant={plan.buttonVariant} className="w-full">
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
