import dbConnect from "../src/lib/mongoose";
import { Topic } from "../src/lib/models/Topic";

async function checkTopics() {
  await dbConnect();
  const topics = await Topic.find({});
  console.log("Found topics:", topics.length);
  if (topics.length === 0) {
    console.log("Seeding initial topic...");
    const newTopic = new Topic({
      name: "Geopolitics",
      slug: "geopolitics",
      status: "active"
    });
    await newTopic.save();
    console.log("Created topic:", newTopic.name);
  } else {
    console.log(topics.map(t => t.name));
  }
  process.exit(0);
}

checkTopics();
