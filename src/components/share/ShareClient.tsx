"use client";

import { useEffect, useState } from "react";
import { FilePreview } from "@/components/share/FilePreview";
import { PasswordProtection } from "@/components/share/PasswordProtection";

interface ShareClientProps {
  shareId: string;
  file: any;
  fileName: string;
  passwordProtected: boolean;
}

export function ShareClient({
  shareId,
  file,
  fileName,
  passwordProtected,
}: ShareClientProps) {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!passwordProtected) {
      setHasAccess(true);
      return;
    }
    const token = sessionStorage.getItem(`share_access_${shareId}`);
    if (token) {
      setHasAccess(true);
    }
  }, [shareId, passwordProtected]);

  if (!hasAccess && passwordProtected) {
    return (
      <PasswordProtection
        shareId={shareId}
        fileName={fileName}
        onSuccess={() => setHasAccess(true)}
      />
    );
  }

  return <FilePreview file={file} shareId={shareId} />;
}
