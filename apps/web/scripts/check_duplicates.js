require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const blogsColl = db.collection('blogs');
  const allBlogs = await blogsColl.find({ status: 'published' }, { projection: { title: 1, slug: 1 } }).toArray();

  const titleCounts = {};
  for (const b of allBlogs) {
    titleCounts[b.title] = (titleCounts[b.title] || 0) + 1;
  }

  const duplicates = Object.keys(titleCounts).filter(t => titleCounts[t] > 1);
  if (duplicates.length > 0) {
      console.log("Duplicates found:");
      for (const d of duplicates) {
          console.log(`- ${d} (${titleCounts[d]} copies)`);
      }
  } else {
      console.log("No exact title duplicates found.");
  }
  
  mongoose.disconnect();
}
run();
