import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { logger } from "@/lib/logger";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true });
      logger.info("Created blog posts directory");
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = await Promise.all(
      fileNames
        .filter((fileName) => fileName.endsWith(".md"))
        .map(async (fileName) => {
          const slug = fileName.replace(/\.md$/, "");
          const fullPath = path.join(postsDirectory, fileName);
          const fileContents = fs.readFileSync(fullPath, "utf8");
          const matterResult = matter(fileContents);

          const processedContent = await remark()
            .use(html)
            .process(matterResult.content);
          const content = processedContent.toString();

          return {
            slug,
            title: matterResult.data.title,
            date: matterResult.data.date,
            excerpt: matterResult.data.excerpt || "",
            content,
          };
        }),
    );

    return allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });
  } catch (error) {
    logger.error("Error getting blog posts", { error });
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    const processedContent = await remark()
      .use(html)
      .process(matterResult.content);
    const content = processedContent.toString();

    return {
      slug,
      title: matterResult.data.title,
      date: matterResult.data.date,
      excerpt: matterResult.data.excerpt || "",
      content,
    };
  } catch (error) {
    logger.error("Error getting blog post", { slug, error });
    return null;
  }
}
