import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBlogPosts } from "@/lib/blog";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">ViperHost Blog</h1>
          <p className="text-muted-foreground">
            Latest news, updates, and insights about ViperHost
          </p>
        </div>

        <div className="grid gap-6">
          {posts.length === 0 ? (
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold">No posts yet</h2>
              <p className="text-muted-foreground mt-2">
                Check back soon for new content!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.slug}>
                <CardHeader>
                  <CardTitle>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {formatDistanceToNow(new Date(post.date), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-primary hover:underline"
                  >
                    Read more
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
