import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/constants";

export async function GET() {
  try {
    await dbConnect();

    // Fetch the 50 most recent published blogs for a richer feed
    const blogs = await Blog.find({ status: "published", contentType: { $ne: "platform-seo" } })
      .sort({ publishAt: -1 })
      .limit(50)
      .populate("author", "name email")
      .lean();

    const generateRssItem = (blog: any) => {
      const authorEmail = blog.isSystemGenerated ? "editorial@globalchanakya.com" : blog.author?.email || "editorial@globalchanakya.com";
      const authorName = blog.isSystemGenerated ? "Global Chanakya Editorial" : blog.author?.name || "Global Chanakya Editorial";
      
      let enclosure = "";
      if (blog.featuredImage) {
        // Fallback length to 0 if unknown, standard requires length but many readers accept 0
        enclosure = `<enclosure url="${blog.featuredImage}" type="image/jpeg" length="0" />`;
      }

      return `
        <item>
          <title><![CDATA[${blog.title}]]></title>
          <link>${SITE_URL}/blogs/${blog.slug}</link>
          <guid isPermaLink="true">${SITE_URL}/blogs/${blog.slug}</guid>
          <description><![CDATA[${blog.excerpt}]]></description>
          <category><![CDATA[${blog.category}]]></category>
          <author>${authorEmail} (${authorName})</author>
          <pubDate>${new Date(blog.publishAt || blog.createdAt).toUTCString()}</pubDate>
          ${enclosure}
        </item>
      `;
    };

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
        <channel>
          <title>${SITE_NAME}</title>
          <link>${SITE_URL}</link>
          <description>${SITE_DESCRIPTION}</description>
          <language>en-us</language>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
          ${blogs.map(generateRssItem).join("")}
        </channel>
      </rss>
    `;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("RSS generation failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
