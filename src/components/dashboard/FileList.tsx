"use client";

import { useState } from "react";
import {
  File,
  MoreHorizontal,
  Download,
  Trash2,
  LinkIcon,
  ExternalLink,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ShareDialog } from "@/components/dashboard/ShareDialog";

interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  rawUrl: string;
  createdAt: Date;
  userId: string;
  fileId: string;
}

interface FileListProps {
  files: FileData[];
  isPro?: boolean;
}

export function FileList({ files, isPro = false }: FileListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const { toast } = useToast();

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "File link copied to clipboard",
    });
  };

  const deleteFile = async (id: string) => {
    try {
      await fetch(`/api/files/${id}`, {
        method: "DELETE",
      });

      toast({
        title: "File deleted",
        description: "The file has been deleted successfully",
      });

      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the file",
        variant: "destructive",
      });
    }
  };

  const openShareDialog = (file: FileData) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("video/")) return "🎬";
    if (type.startsWith("audio/")) return "🎵";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
    if (type.includes("powerpoint") || type.includes("presentation"))
      return "📽️";
    if (type.includes("zip") || type.includes("compressed")) return "🗜️";
    return "📁";
  };

  const downloadFile = (url: string) => {
    const downloadUrl = new URL(url);
    downloadUrl.searchParams.set('download', 'true');
    window.open(downloadUrl.toString(), '_blank');
  };

  const renderFilePreview = (file: FileData) => {
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={file.rawUrl}
          alt={file.name}
          className="h-12 w-12 object-cover rounded"
        />
      );
    }
    if (file.type.startsWith("video/")) {
      return (
        <video
          src={file.rawUrl}
          controls
          className="h-12 w-12 object-cover rounded"
        />
      );
    }
    if (file.type.startsWith("audio/")) {
      return (
        <audio controls className="h-12 w-12">
          <source src={file.rawUrl} type={file.type} />
        </audio>
      );
    }
    return <div className="text-2xl">{getFileIcon(file.type)}</div>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Files</CardTitle>
          <CardDescription>
            Manage and share your uploaded files.
          </CardDescription>
          <div className="mt-4">
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <File className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No files found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {files.length === 0
                  ? "Upload your first file to get started"
                  : "No files match your search criteria"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    {renderFilePreview(file)}
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded{" "}
                        {formatDistanceToNow(new Date(file.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(file.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openShareDialog(file)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(file.url)}
                        >
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => downloadFile(file.url)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteFile(file.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFile && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          fileId={selectedFile.id}
          fileName={selectedFile.name}
          fileUrl={selectedFile.url}
          rawUrl={selectedFile.rawUrl}
          isPro={isPro}
        />
      )}
    </>
  );
}
