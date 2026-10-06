import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";

export async function GET() {
  await dbConnect();

  // Fetch only public blogs or expose only public fields of premium blogs
  const blogs = await Blog.find({ status: "published" })
    .select("title slug aiSummary keyInsights faq citations entityRelations updatedAt")
    .sort({ publishAt: -1 })
    .limit(50)
    .lean();

  let llmsTxt = `# Global Chanakya - Geopolitical Intelligence Platform

Welcome to the machine-readable version of Global Chanakya. This endpoint exposes key geopolitical insights for AI indexing.

## Latest Reports

`;

  blogs.forEach((blog: any) => {
    llmsTxt += `### ${blog.title}\n`;
    llmsTxt += `- URL: https://www.globalchanakya.in/blogs/${blog.slug}\n`;
    llmsTxt += `- Last Updated: ${new Date(blog.updatedAt).toISOString()}\n\n`;
    
    if (blog.aiSummary) {
      llmsTxt += `**Summary:**\n${blog.aiSummary}\n\n`;
    }
    
    if (blog.keyInsights && blog.keyInsights.length > 0) {
      llmsTxt += `**Key Insights:**\n`;
      blog.keyInsights.forEach((insight: string) => {
        llmsTxt += `- ${insight}\n`;
      });
      llmsTxt += `\n`;
    }

    if (blog.faq && blog.faq.length > 0) {
      llmsTxt += `**FAQ:**\n`;
      blog.faq.forEach((q: any) => {
        llmsTxt += `- **Q:** ${q.question}\n  **A:** ${q.answer}\n`;
      });
      llmsTxt += `\n`;
    }
    
    if (blog.citations && blog.citations.length > 0) {
      llmsTxt += `**Citations:**\n`;
      blog.citations.forEach((cit: any) => {
        llmsTxt += `- [${cit.type}] ${cit.source} ${cit.url ? `(${cit.url})` : ''}\n`;
      });
      llmsTxt += `\n`;
    }

    llmsTxt += `---\n\n`;
  });

  return new NextResponse(llmsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
