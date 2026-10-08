const https = require('https');

const urlsToTest = [
  "https://www.globalchanakya.in/",
  "https://www.globalchanakya.in/blogs",
  "https://www.globalchanakya.in/topics",
  "https://www.globalchanakya.in/breaking",
  "https://www.globalchanakya.in/intelligence",
  "https://www.globalchanakya.in/blogs/trump-let-them-take-out-los-angeles-iran-war-defense",
  "https://www.globalchanakya.in/topics/2026-iran-war",
  "https://www.globalchanakya.in/categories/geopolitics",
  "https://www.globalchanakya.in/regions/indo-pacific",
  "https://www.globalchanakya.in/organizations/brics",
  "https://www.globalchanakya.in/about",
  "https://www.globalchanakya.in/contact",
  "https://www.globalchanakya.in/privacy",
  "https://www.globalchanakya.in/terms",
  "https://www.globalchanakya.in/editorial-policy",
  "https://www.globalchanakya.in/methodology",
  "https://www.globalchanakya.in/source-verification",
  "https://www.globalchanakya.in/robots.txt",
  "https://www.globalchanakya.in/sitemap.xml",
  "https://www.globalchanakya.in/ads.txt"
];

const legacyTerms = [
  "Ask Chanakya",
  "Command Center",
  "Live Intelligence",
  "Latest Intelligence",
  "Real-Time Intelligence",
  "Active Liveblog",
  "Linked Topic",
  "Linked Country",
  "Linked Leader",
  "Linked Conflict"
];

async function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      const isRedirect = res.statusCode >= 300 && res.statusCode < 400;
      const redirectUrl = isRedirect ? res.headers.location : null;

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let title = '';
        const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/);
        if (titleMatch) title = titleMatch[1];
        
        let canonical = '';
        const canMatch = data.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
        if (canMatch) canonical = canMatch[1];

        let robots = '';
        const robMatch = data.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/);
        if (robMatch) robots = robMatch[1];
        
        let footerTopicsOk = false;
        if (data.includes('href="/topics"')) {
           footerTopicsOk = true;
        }

        const foundLegacy = legacyTerms.filter(term => data.toLowerCase().includes(term.toLowerCase()));
        
        const hasPublisherId = data.includes("ca-pub-3046817657353243");

        resolve({
          url,
          status: res.statusCode,
          redirectUrl,
          title,
          canonical,
          robots,
          hasPublisherId,
          footerTopicsOk,
          foundLegacy,
          length: data.length,
          snippet: data.substring(0, 50).replace(/\n/g, '')
        });
      });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function run() {
  for (const url of urlsToTest) {
    const res = await fetchUrl(url);
    console.log(`\nURL: ${res.url}`);
    if (res.error) {
      console.log(`ERROR: ${res.error}`);
    } else {
      console.log(`Status: ${res.status}`);
      if (res.redirectUrl) console.log(`Redirect Target: ${res.redirectUrl}`);
      if (res.title) console.log(`Title: ${res.title}`);
      if (res.canonical) console.log(`Canonical: ${res.canonical}`);
      if (res.robots) console.log(`Robots: ${res.robots}`);
      if (res.foundLegacy.length > 0) console.log(`Legacy Terms Found: ${res.foundLegacy.join(', ')}`);
      if (res.url.includes('ads.txt') || res.url.includes('blogs') || res.url === 'https://www.globalchanakya.in/') {
         console.log(`Has Publisher ID: ${res.hasPublisherId}`);
      }
      console.log(`Length: ${res.length}`);
    }
  }
}
run();
