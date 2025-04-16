"use client";

import type React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsTab } from "@/components/dashboard/AnalyticsTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";

interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  username: string;
  createdAt: Date;
}

interface AnalyticsData {
  fileTypeDistribution: { name: string; value: number }[];
  uploadActivity: Array<{ date: string; count: number }>;
  downloadActivity: Array<{ date: string; count: number }>;
  fileCount: number;
  totalStorage: number;
  storageUsed: number;
  storageLimit: number;
  bandwidth: number;
  bandwidthUsed: number;
  bandwidthLimit: number;
  popularFiles: Array<{ name: string; views: number; downloads: number }>;
}

interface DashboardTabsProps {
  children: React.ReactNode;
  analyticsData: AnalyticsData;
  user: User;
  isPro: boolean;
}

export function DashboardTabs({
  children,
  analyticsData,
  user,
  isPro,
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="files" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="files" className="space-y-4 pt-4">
        {children}
      </TabsContent>
      <TabsContent value="analytics" className="space-y-4 pt-4">
        <AnalyticsTab data={analyticsData} isPro={isPro} />
      </TabsContent>
      <TabsContent value="settings" className="space-y-4 pt-4">
        <SettingsTab
          user={{
            ...user,
            name: user.name ?? "",
            email: user.email ?? "",
            image: user.image ?? null,
          }}
          isPro={isPro}
        />
      </TabsContent>
    </Tabs>
  );
}
