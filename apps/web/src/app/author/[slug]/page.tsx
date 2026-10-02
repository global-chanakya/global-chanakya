import { User } from "@/lib/models/User";
import { Blog } from "@/lib/models/Blog";
import dbConnect from "@/lib/mongoose";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, ChevronRight } from "lucide-react";
import { formatDate } from "@repo/utils";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  await dbConnect();
  const author = await User.findOne({ authorSlug: resolvedParams.slug });
  if (!author) {
    return { title: "Author Not Found" };
  }
  return {
    title: `${author.name} | Global Chanakya`,
    description: author.bio || `Articles by ${author.name} on Global Chanakya — geopolitical intelligence and strategic analysis.`,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://www.globalchanakya.in/author/${resolvedParams.slug}`,
    },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);

  await dbConnect();
  const author = await User.findOne({ authorSlug: decodedSlug }).lean();
  
  if (!author) {
    notFound();
  }

  // Get author's articles
  const blogs = await Blog.find({ author: author._id, status: "published" })
    .sort({ publishAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="container mx-auto max-w-5xl px-6 md:px-8 py-32">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-[var(--secondary)] text-[12px] font-bold uppercase tracking-widest hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Intel Desk
        </Link>
        
        {/* Author Header */}
        <div className="bg-[var(--surface)] border border-[var(--border)] p-8 md:p-12 rounded-sm mb-12 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 shrink-0 rounded-sm bg-[var(--bg)] intel-border flex items-center justify-center text-4xl text-white shadow-sm overflow-hidden">
            {author.avatar && author.avatar.startsWith('http') ? (
              <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              author.name[0].toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{author.name}</h1>
            {author.role && (
              <div className="text-[var(--gold)] text-sm font-bold uppercase tracking-widest mb-6">
                {author.role === 'editor' ? 'Lead Analyst / Editor' : author.role}
              </div>
            )}
            {author.bio && (
              <p className="text-[var(--muted)] leading-relaxed max-w-3xl text-lg">
                {author.bio}
              </p>
            )}
          </div>
        </div>

        {/* Author's Articles */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <BookOpen className="text-[var(--cyan)]" /> Intelligence Reports by {author.name}
          </h2>
          
          {blogs.length === 0 ? (
            <div className="p-8 text-center border border-[var(--border)] border-dashed rounded-sm bg-[var(--surface)] text-[var(--muted)]">
              No reports published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map((blog: any) => (
                <Link key={blog._id.toString()} href={`/blogs/${blog.slug}`} className="group block h-full">
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm p-6 h-full flex flex-col hover:border-[var(--gold)] transition-colors">
                    <div className="text-[10px] text-[var(--cyan)] font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
                      <span>{blog.category}</span>
                      <span className="text-[var(--muted)] flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(blog.publishAt, "short")}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-3 leading-tight line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-[var(--muted)] text-sm line-clamp-3 mb-6 flex-grow">
                      {blog.excerpt}
                    </p>
                    <div className="mt-auto text-[var(--gold)] text-xs font-bold uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Report <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
