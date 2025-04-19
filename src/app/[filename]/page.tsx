import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ExpiredLink } from "@/components/share/ExpiredLink";
import { logger } from "@/lib/logger";
import { ShareClient } from "@/components/share/ShareClient";

interface SharePageProps {
  params: {
    filename: string;
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { filename } = params;

  const shareLink = await db.shareLink.findUnique({
    where: {
      shareId: filename,
    },
    include: {
      file: true,
    },
  });

  if (!shareLink) {
    notFound();
  }

  const isExpired =
    shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date();

  if (isExpired) {
    return <ExpiredLink />;
  }

  await db.shareLink.update({
    where: {
      id: shareLink.id,
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  logger.info(`Shared file viewed: ${shareLink.fileId}`, {
    shareId: filename,
    fileId: shareLink.fileId,
  });

  return (
    <ShareClient
      shareId={filename}
      file={shareLink.file}
      fileName={shareLink.file.name}
      passwordProtected={!!shareLink.password}
    />
  );
}
