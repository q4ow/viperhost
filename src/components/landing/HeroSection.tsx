"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <motion.div
            className="flex flex-col justify-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Blazingly Fast File Hosting
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Upload, share, and manage your files with ease. Free to use,
                with premium features for power users.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/auth/register">
                <Button size="lg" className="gap-1.5">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="gap-1.5">
                  Try Demo <Upload className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative h-[350px] w-full overflow-hidden rounded-lg border bg-background p-4 shadow-xl">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="text-lg font-semibold">
                    ViperHost Dashboard
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="flex-1 space-y-4 overflow-auto p-2">
                  <div className="rounded border p-2 text-sm">
                    <div className="font-medium">profile.jpg</div>
                    <div className="text-xs text-muted-foreground">
                      Uploaded 2 minutes ago
                    </div>
                    <div className="mt-1 text-xs text-primary">
                      viperhost.io/uploads/u1a2b3c4/a1b2c3d4.jpg
                    </div>
                  </div>
                  <div className="rounded border p-2 text-sm">
                    <div className="font-medium">document.pdf</div>
                    <div className="text-xs text-muted-foreground">
                      Uploaded 5 minutes ago
                    </div>
                    <div className="mt-1 text-xs text-primary">
                      viperhost.io/uploads/u1a2b3c4/e5f6g7h8.pdf
                    </div>
                  </div>
                  <div className="rounded border p-2 text-sm">
                    <div className="font-medium">presentation.pptx</div>
                    <div className="text-xs text-muted-foreground">
                      Uploaded 10 minutes ago
                    </div>
                    <div className="mt-1 text-xs text-primary">
                      viperhost.io/uploads/u1a2b3c4/i9j0k1l2.pptx
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Button size="sm" className="w-full">
                    Upload New File
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
