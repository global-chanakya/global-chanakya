require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const blogsColl = db.collection('blogs');
  const sample = await blogsColl.find({ status: 'published' }).limit(3).toArray();

  for (const b of sample) {
      console.log(`\n\n--- Title: ${b.title} ---`);
      console.log(`Word Count: ${b.wordCount}`);
      console.log(`Citations count: ${b.citations?.length || 0}`);
      
      const text = b.content.replace(/<[^>]*>?/gm, '');
      console.log(`Snippet:\n${text.substring(0, 800)}...`);
  }

  mongoose.disconnect();
}
run();
