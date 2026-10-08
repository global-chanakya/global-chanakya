require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const blog = await db.collection('blogs').findOne({ status: 'published' });
  const category = await db.collection('categories').findOne({});
  const region = await db.collection('regions').findOne({});
  const org = await db.collection('organizations').findOne({});
  const topics = await db.collection('blogs').distinct("tags", { status: "published" });

  console.log("BLOG:", blog?.slug);
  console.log("CATEGORY:", category?.slug);
  console.log("REGION:", region?.slug);
  console.log("ORGANIZATION:", org?.slug);
  
  if (topics && topics.length > 0) {
      console.log("TOPIC:", topics[0].toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-'));
  }

  mongoose.disconnect();
}
run();
