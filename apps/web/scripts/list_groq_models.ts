import { config } from "dotenv";
config({ path: ".env.local" });

async function listModels() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("No GROQ_API_KEY");

  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: {
      "Authorization": `Bearer ${apiKey}`
    }
  });
  
  const data = await res.json();
  const modelIds = data.data.map((m: any) => m.id);
  console.log("AVAILABLE GROQ MODELS:\n", modelIds.join("\n"));
}

listModels().catch(console.error);
