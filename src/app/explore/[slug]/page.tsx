import { getLearnPage, getAllLearnPages } from "@/lib/learn";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { MDXRemote } from "next-mdx-remote/rsc"; // If using remote MDX pattern

// Generate Static Params for SSG (Enterprise Performance)
export async function generateStaticParams() {
  const posts = getAllLearnPages();
  return posts.map((post) => ({ slug: post.slug }));
}

export default function LearnPage({ params }: { params: { slug: string } }) {
  const post = getLearnPage(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto py-10 px-6">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <div className="text-gray-500">
          {format(post.date, "MMMM d, yyyy")} • {post.contentType.toUpperCase()}
        </div>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        {post.contentType === "mdx" ? (
          /* Render MDX */
          <MDXRemote source={post.content} />
        ) : (
          /* Render Static HTML */
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        )}
      </div>
    </article>
  );
}
