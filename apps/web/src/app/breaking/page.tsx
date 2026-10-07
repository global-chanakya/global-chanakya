import React from "react";
import { Metadata } from "next";
import { Zap } from "lucide-react";
import { BlogRepository } from "@/modules/blog/repositories/blog.repository";
import EmptyState from "@/components/shared/EmptyState";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Breaking News & Alerts | Global Chanakya Intelligence",
  description: "Latest breaking news and geopolitical updates from the newsroom.",
};

// ISR near real-time (60 seconds)
export const revalidate = 60;

export default async function BreakingNewsPage() {
  const breakingBlogs = await BlogRepository.getBreakingBlogs(10);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-12 border-b border-gray-800 pb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
            Breaking Alerts
          </h1>
          <p className="text-gray-400 mt-2">Latest breaking reports from the newsroom.</p>
        </div>
      </header>

      <div className="relative border-l-2 border-red-500/50 ml-4 space-y-12">
        {breakingBlogs.length === 0 ? (
          <div className="pl-8 py-8">
            <EmptyState 
              title="No Breaking Alerts" 
              description="No breaking reports are currently available." 
            />
          </div>
        ) : (
          breakingBlogs.map((blog: any, idx: number) => (
            <div key={blog._id?.toString() || idx} className="relative pl-8">
              {idx === 0 ? (
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-red-500"></div>
              ) : (
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-gray-600 border-2 border-gray-950"></div>
              )}
              <time className={`text-xs font-bold uppercase tracking-wider mb-2 block ${idx === 0 ? 'text-red-400' : 'text-gray-500'}`}>
                {formatDistanceToNow(new Date(blog.publishAt || blog.createdAt), { addSuffix: true })} — {blog.category?.toUpperCase() || "REPORT"}
              </time>
              <h2 className={`text-2xl font-bold mb-3 ${idx === 0 ? 'text-white' : 'text-gray-200'}`}>{blog.title}</h2>
              <p className={`${idx === 0 ? 'text-gray-300' : 'text-gray-400'} leading-relaxed mb-4`}>
                {blog.excerpt}
              </p>
              <Link href={`/blogs/${blog.slug}`} className="text-blue-400 hover:underline text-sm font-bold">
                Read Full Report →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
