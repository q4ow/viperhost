import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatBytes } from "@/lib/utils";
import { FilePreview } from "@/components/share/FilePreview";

interface FilePageProps {
  params: {
    filename: string;
  };
}

export async function generateMetadata({
  params,
}: FilePageProps): Promise<Metadata> {
  const file = await db.file.findFirst({
    where: {
      fileId: params.filename.split(".")[0],
    },
    include: {
      user: true,
    },
  });

  if (!file) {
    return {
      title: "File Not Found",
      description: "The requested file could not be found.",
    };
  }

  const fileSize = formatBytes(file.size);
  const fileType = file.type.split("/")[1]?.toUpperCase() || "File";

  return {
    title: file.name,
    description: `${fileType} • ${fileSize}`,
    openGraph: {
      title: file.name,
      description: `${fileType} • ${fileSize}`,
      type: "website",
      images: file.type.startsWith("image/")
        ? [
          {
            url: file.rawUrl,
            width: 1200,
            height: 630,
            alt: file.name,
          },
        ]
        : [
          {
            url: "/placeholder.svg",
            width: 1200,
            height: 630,
            alt: "File preview",
          },
        ],
    },
    twitter: {
      card: file.type.startsWith("image/") ? "summary_large_image" : "summary",
      title: file.name,
      description: `${fileType} • ${fileSize}`,
    },
  };
}

export default async function FilePage({ params }: FilePageProps) {
  const fileId = params.filename.split(".")[0];
  const file = await db.file.findFirst({
    where: {
      fileId: fileId,
    },
  });

  if (!file) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <FilePreview file={file} shareId={""} />
    </div>
  );
}
