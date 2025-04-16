"use client";

import type React from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  username: string | null;
  createdAt: Date;
}

interface SettingsTabProps {
  user: UserProfile;
  isPro: boolean;
}

export function SettingsTab({ user, isPro }: SettingsTabProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChangingPassword(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      setIsChangingPassword(false);
      return;
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) throw new Error("Failed to change password");

      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });

      e.currentTarget.reset();
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to change password. Please check your current password and try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAccountDeletion = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete account");

      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      });

      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" variant="outline" size="sm">
                      Change Avatar
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
                      JPG, GIF or PNG. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={user.name} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={user.username || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user.email} disabled />
                  <p className="text-xs text-muted-foreground">
                    Your email address is used for login and cannot be changed.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications about your account and files
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">File Upload Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when files are uploaded to your
                    account
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">File Download Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when your files are downloaded
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new features and promotions
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize your dashboard experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compact View</p>
                  <p className="text-sm text-muted-foreground">
                    Display more files in a compact layout
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show File Previews</p>
                  <p className="text-sm text-muted-foreground">
                    Display previews for supported file types
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="font-medium">Account Type</div>
                <div className="text-sm">{isPro ? "Pro" : "Free"}</div>
              </div>

              <div className="grid gap-2">
                <div className="font-medium">Member Since</div>
                <div className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="font-medium">User ID</div>
                <div className="text-sm font-mono">{user.id}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download a copy of your data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You can export all your data including file information and
                account details. This does not include the actual files.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Export Data</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This action is irreversible. All your files, settings, and
                account information will be permanently deleted.
              </p>

              {showDeleteConfirm && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Are you sure you want to delete your account? This action
                    cannot be undone.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-2">
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    onClick={handleAccountDeletion}
                    disabled={isDeleting}
                  >
                    {isDeleting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
