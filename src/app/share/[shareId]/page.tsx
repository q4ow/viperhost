import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FilePreview } from "@/components/share/FilePreview";
import { PasswordProtection } from "@/components/share/PasswordProtection";
import { ExpiredLink } from "@/components/share/ExpiredLink";
import { logger } from "@/lib/logger";

interface SharePageProps {
  params: {
    shareId: string;
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = params;

  const shareLink = await db.shareLink.findUnique({
    where: {
      shareId,
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
    shareId,
    fileId: shareLink.fileId,
  });

  if (shareLink.password) {
    return (
      <PasswordProtection shareId={shareId} fileName={shareLink.file.name} />
    );
  }

  return <FilePreview file={shareLink.file} shareId={shareId} />;
}
