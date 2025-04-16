"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Check } from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
  fileName: string;
  fileUrl: string;
  isPro: boolean;
}

export function ShareDialog({
  open,
  onOpenChange,
  fileId,
  fileName,
  fileUrl,
  isPro,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [shareLink, setShareLink] = useState(fileUrl);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);

    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const createShareLink = async () => {
    setIsCreatingLink(true);

    try {
      const response = await fetch("/api/files/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          password: isPasswordProtected ? password : null,
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create share link");

      const data = await response.json();
      setShareLink(data.shareUrl);

      toast({
        title: "Share link created",
        description: "Your custom share link has been created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive",
      });
    } finally {
      setIsCreatingLink(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Share &quot;{fileName}&quot; with others
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Direct Link</TabsTrigger>
            <TabsTrigger value="custom" disabled={!isPro}>
              Custom Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input value={fileUrl} readOnly className="flex-1" />
              <Button size="icon" onClick={copyToClipboard}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {!isPro && (
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro for password protection and expiring links.
              </p>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="password-protection">
                    Password Protection
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Require a password to access this file
                  </p>
                </div>
                <Switch
                  id="password-protection"
                  checked={isPasswordProtected}
                  onCheckedChange={setIsPasswordProtected}
                />
              </div>

              {isPasswordProtected && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a password"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="expiry">Link Expiration</Label>
                <Input
                  id="expiry"
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for a link that never expires
                </p>
              </div>

              <Button
                onClick={createShareLink}
                disabled={isCreatingLink || (isPasswordProtected && !password)}
                className="w-full"
              >
                {isCreatingLink ? "Creating..." : "Create Share Link"}
              </Button>

              {shareLink !== fileUrl && (
                <div className="flex items-center space-x-2 mt-4">
                  <Input value={shareLink} readOnly className="flex-1" />
                  <Button size="icon" onClick={copyToClipboard}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
