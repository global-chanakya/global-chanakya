require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const blogsColl = db.collection('blogs');
  const count = await blogsColl.countDocuments({ status: 'published' });
  
  const allBlogs = await blogsColl.find({ status: 'published' }, { projection: { slug: 1, title: 1, wordCount: 1, content: 1 } }).toArray();

  let strong = 0;
  let acceptable = 0;
  let thin = 0;
  let duplicate = 0;
  let broken = 0;

  const thinList = [];
  const brokenList = [];

  for (const b of allBlogs) {
    const textLen = (b.content || "").length;
    // approx 5 chars per word
    const wc = b.wordCount || textLen / 5;

    if (wc < 100 || !b.content) {
      broken++;
      brokenList.push(b.slug);
    } else if (wc < 500) {
      thin++;
      thinList.push(b.slug);
    } else if (wc > 1500) {
      strong++;
    } else {
      acceptable++;
    }
  }

  console.log("Total published:", count);
  console.log("Strong:", strong);
  console.log("Acceptable:", acceptable);
  console.log("Thin:", thin);
  console.log("Broken/Empty:", broken);

  console.log("\nThin Slugs (sample):", thinList.slice(0,10));
  console.log("\nBroken Slugs (sample):", brokenList.slice(0,10));

  const entitiesColl = db.collection('entities');
  if (entitiesColl) {
      try {
          const entitiesCount = await entitiesColl.countDocuments();
          console.log("Total Entities (Legacy):", entitiesCount);
      } catch(e) {}
  }
  
  mongoose.disconnect();
}
run();
