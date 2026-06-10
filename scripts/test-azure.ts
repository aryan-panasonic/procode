import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
});

async function main() {
  const response = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
    messages: [
      {
        role: "user",
        content: "Hello"
      }
    ]
  });

  console.log(response.choices[0].message.content);
}

main();