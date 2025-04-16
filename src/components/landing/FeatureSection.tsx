"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Clock, Upload, Share2, Lock } from "lucide-react";

export function FeatureSection() {
  const features = [
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "Blazingly Fast",
      description:
        "Experience lightning-fast uploads and downloads with our optimized infrastructure.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Secure Storage",
      description:
        "Your files are encrypted and stored securely with enterprise-grade protection.",
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "Permanent Storage",
      description:
        "Files are stored indefinitely on our free tier, with no expiration dates.",
    },
    {
      icon: <Upload className="h-10 w-10 text-primary" />,
      title: "Easy Uploads",
      description:
        "Drag and drop interface makes uploading files quick and simple.",
    },
    {
      icon: <Share2 className="h-10 w-10 text-primary" />,
      title: "Instant Sharing",
      description:
        "Share your files instantly with direct links and customizable options.",
    },
    {
      icon: <Lock className="h-10 w-10 text-primary" />,
      title: "Privacy Controls",
      description:
        "Control who can access your files with advanced privacy settings.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Powerful Features
          </h2>
          <p className="mt-4 text-muted-foreground md:text-xl">
            Everything you need for seamless file hosting and sharing
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center rounded-lg border bg-card p-6 text-center shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
