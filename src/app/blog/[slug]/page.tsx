import { getBlogPost, getBlogPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="flex items-center text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to blog
        </Link>

        <article>
          <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
          <div className="text-muted-foreground mb-8">
            {format(new Date(post.date), "MMMM d, yyyy")}
          </div>
          <Separator className="mb-8" />
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  );
}
