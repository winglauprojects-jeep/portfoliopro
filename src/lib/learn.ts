import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";
import * as cheerio from "cheerio"; // New parser

// 1. The Schema (unchanged)
const LearnPageSchema = z.object({
  title: z.string(),
  date: z.string().transform((str) => new Date(str)),
  description: z.string().optional(),
  slug: z.string(),
  contentType: z.enum(["mdx", "html"]), // Track the type
  content: z.string(), // The actual body content
});

export type LearnPage = z.infer<typeof LearnPageSchema>;

const contentDirectory = path.join(process.cwd(), "content/learn");

export function getAllLearnPages(): LearnPage[] {
  if (!fs.existsSync(contentDirectory)) return [];

  const fileNames = fs.readdirSync(contentDirectory);

  const allPages = fileNames
    // 2. Accept both .mdx and .html
    .filter((fileName) => /\.(mdx|html)$/.test(fileName))
    .map((fileName) => {
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const extension = path.extname(fileName).toLowerCase();
      const slug = fileName.replace(/\.(mdx|html)$/, "");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any;
      let content: string;

      // 3. Strategy: Try Frontmatter first (even for HTML)
      const matterResult = matter(fileContents);

      if (Object.keys(matterResult.data).length > 0) {
        // CASE A: File has Frontmatter (Best for sorting/filtering)
        data = matterResult.data;
        content = matterResult.content;
      } else if (extension === ".html") {
        // CASE B: Pure HTML file (Scrape metadata)
        const $ = cheerio.load(fileContents);

        // Extract <title>
        const title = $("title").text() || slug;

        // Extract <meta name="description">
        const description = $('meta[name="description"]').attr("content") || "";

        // Extract date (Try custom meta, fallback to file creation time)
        const dateMeta = $('meta[name="date"]').attr("content");
        const stats = fs.statSync(fullPath);
        const date = dateMeta || stats.birthtime.toISOString(); // Fallback to file creation

        data = { title, description, date };
        content = fileContents; // Keep original HTML
      } else {
        throw new Error(`MDX file ${fileName} is missing Frontmatter.`);
      }

      // 4. Validate with Zod
      const validationResult = LearnPageSchema.safeParse({
        ...data,
        slug,
        contentType: extension === ".mdx" ? "mdx" : "html",
        content,
      });

      if (!validationResult.success) {
        console.error(
          `Invalid metadata in ${fileName}:`,
          validationResult.error
        );
        return null; // Skip bad files instead of crashing app
      }

      return validationResult.data;
    })
    .filter(Boolean) as LearnPage[]; // Remove nulls

  // 5. Sort by Date
  return allPages.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getLearnPage(slug: string): LearnPage | undefined {
  const pages = getAllLearnPages();
  return pages.find((p) => p.slug === slug);
}
