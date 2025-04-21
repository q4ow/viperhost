"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Download,
  FileIcon,
  ImageIcon,
  Film,
  FileAudio,
  FileText,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import Image from "next/image";

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    rawUrl: string;
  };
  shareId: string;
  downloadUrl?: string;
  showDownloadButton?: boolean;
}

export function FilePreview({
  file,
  shareId,
  downloadUrl,
  showDownloadButton = false
}: FilePreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      if (shareId) {
        await fetch(`/api/share/${shareId}/download`, {
          method: "POST",
        });
        window.open(file.rawUrl, "_blank");
      } else if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      } else {
        const url = new URL(file.rawUrl);
        url.searchParams.set("download", "true");
        window.open(url.toString(), "_blank");
      }

      toast({
        title: "Download started",
        description: "Your file download has started",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const renderPreview = () => {
    if (file.type.startsWith("image/")) {
      return (
        <div className="flex justify-center p-4">
          <Image
            src={file.rawUrl || "/placeholder.svg"}
            alt={file.name}
            className="max-h-[400px] max-w-full rounded-lg object-contain"
            width={400}
            height={400}
          />
        </div>
      );
    }

    if (file.type.startsWith("video/")) {
      return (
        <div className="p-4">
          <video
            src={file.rawUrl}
            controls
            className="max-h-[400px] w-full rounded-lg"
          />
        </div>
      );
    }

    if (file.type.startsWith("audio/")) {
      return (
        <div className="p-4">
          <audio src={file.rawUrl} controls className="w-full" />
        </div>
      );
    }

    if (file.type === "application/pdf") {
      return (
        <div className="flex h-[400px] items-center justify-center p-4">
          <iframe src={file.rawUrl} className="h-full w-full rounded-lg" />
        </div>
      );
    }

    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 min-h-[400px]">
        {file.type.startsWith("image/") ? (
          <ImageIcon className="h-24 w-24 text-muted-foreground" />
        ) : file.type.startsWith("video/") ? (
          <Film className="h-24 w-24 text-muted-foreground" />
        ) : file.type.startsWith("audio/") ? (
          <FileAudio className="h-24 w-24 text-muted-foreground" />
        ) : file.type === "application/pdf" || file.type.includes("text") ? (
          <FileText className="h-24 w-24 text-muted-foreground" />
        ) : (
          <FileIcon className="h-24 w-24 text-muted-foreground" />
        )}
        <p className="mt-4 text-center text-muted-foreground">
          Preview not available for this file type
        </p>
      </div>
    );
  };

  return (
    <div className="container py-10">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>{file.name}</CardTitle>
          <CardDescription>
            {formatBytes(file.size)} • {file.type}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderPreview()}</CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Shared via ViperHost
          </div>
          {(shareId || showDownloadButton) && (
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
