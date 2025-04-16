import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import Link from "next/link";

export function ExpiredLink() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle>Link Expired</CardTitle>
          <CardDescription>
            This shared link has expired and is no longer available.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
