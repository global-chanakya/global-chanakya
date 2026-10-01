import { generateSitemaps } from '../sitemap';
import { SITE_URL } from '@/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sitemaps = await generateSitemaps();
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `  <sitemap>
    <loc>${SITE_URL}/sitemap/${sitemap.id}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    // Return a minimal valid sitemap index on error so Google doesn't mark it as broken
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap/0.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new Response(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=86400',
      },
    });
  }
}
