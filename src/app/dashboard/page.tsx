import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { ExtendedSession } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FileUploader } from "@/components/dashboard/FileUploader";
import { FileList } from "@/components/dashboard/FileList";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { SubscriptionStatus } from "@/components/dashboard/SubscriptionStatus";
import { db } from "@/lib/db";

interface FileType {
  name: string;
  size: number;
  type: string;
  createdAt: Date;
}

export default async function DashboardPage() {
  const session = (await getServerSession(
    authOptions,
  )) as ExtendedSession | null;

  if (!session) {
    redirect("/auth/login");
  }

  const files = await db.file.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const subscription = await db.subscription.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  const isPro = subscription?.status === "active";

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const storageUsed: number = files.reduce(
    (total: number, file: FileType) => total + file.size,
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
          user={{
            ...user,
            name: user.name ?? undefined,
            email: user.email ?? undefined,
            image: user.image ?? undefined,
            username: user.name ?? "",
          }}
          isPro={isPro}
        >
          <FileUploader userId={session.user.id} isPro={isPro} />
          <FileList files={files} />
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
