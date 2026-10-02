import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getRelatedArticles } from "@/lib/recommendation";

interface RelatedArticlesProps {
  currentBlogId: string;
  limit?: number;
}

export async function RelatedArticles({ currentBlogId, limit = 3 }: RelatedArticlesProps) {
  const related = await getRelatedArticles(currentBlogId, limit);

  if (!related || related.length === 0) return null;

  return (
    <section className="my-12" aria-label="Related Intelligence Reports">
      <h3 className="text-xl font-bold mb-6 text-gray-100 flex items-center gap-2 border-b border-gray-800 pb-2">
        Strategic Continuum
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {related.map(blog => (
          <Link 
            href={`/blogs/${blog.slug}`} 
            key={blog._id.toString()}
            className="group flex flex-col h-full bg-gray-900/50 rounded-sm border border-gray-800 hover:border-gray-600 transition-all overflow-hidden"
          >
            {blog.featuredImage && (
              <div className="relative h-32 w-full overflow-hidden bg-gray-800">
                <Image 
                  src={blog.featuredImage} 
                  alt={blog.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                {blog.category}
              </span>
              <h4 className="text-sm font-bold text-gray-200 leading-snug mb-2 group-hover:text-blue-300 transition-colors">
                {blog.title}
              </h4>
              <p className="text-xs text-gray-500 mt-auto">
                {new Date(blog.publishAt).toLocaleDateString()} • {blog.readingTime || 5} min read
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
