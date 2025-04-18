"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FileUploader } from "@/components/dashboard/FileUploader";
import { FileList } from "@/components/dashboard/FileList";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { SubscriptionStatus } from "@/components/dashboard/SubscriptionStatus";
import { useEffect, useState } from "react";

interface FileType {
  name: string;
  size: number;
  type: string;
  createdAt: Date;
}

export default function DashboardPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUserAndFiles() {
      setLoading(true);
      const userRes = await fetch("/api/user/me");
      let userData = null;
      if (userRes.ok) {
        userData = await userRes.json();
        setUser(userData);
      }
      const filesRes = await fetch("/api/files/me");
      if (filesRes.ok) {
        const data = await filesRes.json();
        setFiles(data.files);
        setIsPro(data.isPro);
      }
      setLoading(false);
    }
    fetchUserAndFiles();
  }, []);

  const handleUploadComplete = () => {
    (async () => {
      setLoading(true);
      const filesRes = await fetch("/api/files/me");
      if (filesRes.ok) {
        const data = await filesRes.json();
        setFiles(data.files);
        setIsPro(data.isPro);
      }
      setLoading(false);
    })();
  };

  const storageUsed: number = files.reduce(
    (total: number, file: any) => total + file.size,
    0,
  );

  const analyticsData = {
    fileCount: files.length,
    totalStorage: isPro ? 50 * 1024 * 1024 * 1024 : 5 * 1024 * 1024 * 1024,
    storageUsed,
    storageLimit: isPro ? 50 * 1024 * 1024 * 1024 : 5 * 1024 * 1024 * 1024,
    fileTypeDistribution: generateFileTypeDistribution(files),
    uploadActivity: generateActivityData(7),
    downloadActivity: generateActivityData(7),
    popularFiles: generatePopularFiles(files),
    bandwidth: isPro ? 200 * 1024 * 1024 * 1024 : 20 * 1024 * 1024 * 1024,
    bandwidthUsed: 0,
    bandwidthLimit: isPro ? 200 * 1024 * 1024 * 1024 : 20 * 1024 * 1024 * 1024,
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Manage your files and account settings."
      />
      <div className="grid gap-8">
        <SubscriptionStatus isPro={isPro} />
        <DashboardTabs
          analyticsData={analyticsData}
          user={user || { id: "", username: "", createdAt: new Date() }}
          isPro={isPro}
          isAdmin={user?.isadmin}
        >
          <FileUploader
            userId={user?.id || ""}
            isPro={isPro}
            onUploadComplete={handleUploadComplete}
          />
          {loading ? (
            <div>Loading files...</div>
          ) : (
            <FileList files={files} isPro={isPro} />
          )}
        </DashboardTabs>
      </div>
    </DashboardShell>
  );
}

function generateFileTypeDistribution(files: FileType[]) {
  const typeCount: Record<string, number> = {};

  files.forEach((file) => {
    const type = file.type.split("/")[0] || "other";
    typeCount[type] = (typeCount[type] || 0) + 1;
  });

  if (Object.keys(typeCount).length === 0) {
    return [
      { name: "image", value: 0 },
      { name: "video", value: 0 },
      { name: "audio", value: 0 },
      { name: "document", value: 0 },
      { name: "other", value: 0 },
    ];
  }

  return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
}

function generateActivityData(days: number) {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: Math.floor(Math.random() * 10),
    });
  }

  return data;
}

function generatePopularFiles(files: FileType[]) {
  return files.slice(0, 5).map((file) => ({
    name:
      file.name.length > 20 ? file.name.substring(0, 17) + "..." : file.name,
    views: Math.floor(Math.random() * 100),
    downloads: Math.floor(Math.random() * 50),
  }));
}
