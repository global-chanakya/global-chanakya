require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const cats = await db.collection('categories').countDocuments();
  const regions = await db.collection('regions').countDocuments();
  const orgs = await db.collection('organizations').countDocuments();

  console.log("Categories:", cats);
  console.log("Regions:", regions);
  console.log("Organizations:", orgs);

  mongoose.disconnect();
}
run();
