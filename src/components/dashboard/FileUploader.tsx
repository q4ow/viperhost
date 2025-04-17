"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploaderProps {
  userId: string;
  isPro: boolean;
  onUploadComplete?: () => void;
}

export function FileUploader({ userId, isPro, onUploadComplete }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // im prolly gonna change this but for now its 2GB for pro and 100MB for free
      const maxSize = isPro ? 2 * 1024 * 1024 * 1024 : 100 * 1024 * 1024;

      const validFiles = acceptedFiles.filter((file) => file.size <= maxSize);
      const invalidFiles = acceptedFiles.filter((file) => file.size > maxSize);

      if (invalidFiles.length > 0) {
        toast({
          title: "File too large",
          description: `${invalidFiles.length} file(s) exceed the size limit (${isPro ? "2GB" : "100MB"})`,
          variant: "destructive",
        });
      }

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [isPro, toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    const totalFiles = files.length;
    let uploadedFiles = 0;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const fileProgress = (event.loaded / event.total) * 100;
              // (completed files + current file progress) / total files
              const overallProgress =
                ((uploadedFiles + fileProgress / 100) / totalFiles) * 100;
              setProgress(overallProgress);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              uploadedFiles++;
              // Ensure progress hits 100% for the file segment
              setProgress((uploadedFiles / totalFiles) * 100);
              resolve();
            } else {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error("Network error during upload"));
          };

          xhr.open("POST", "/api/upload", true);
          xhr.send(formData);
        });
      }

      toast({
        title: "Upload complete",
        description: `Successfully uploaded ${totalFiles} file(s)`,
      });

      setFiles([]);
      if (onUploadComplete) onUploadComplete();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/10" : "border-border"
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Drag & drop files here</h3>
            <p className="text-sm text-muted-foreground">
              or click to browse files (max {isPro ? "2GB" : "100MB"} per file)
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="text-sm font-medium">
              Selected files ({files.length})
            </div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="text-sm font-medium truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {uploading ? (
              <div className="space-y-2">
                <Progress value={progress} />
                <div className="text-xs text-muted-foreground text-center">
                  Uploading... {Math.round(progress)}%
                </div>
              </div>
            ) : (
              <Button onClick={uploadFiles} className="w-full">
                Upload {files.length} file{files.length > 1 ? "s" : ""}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
