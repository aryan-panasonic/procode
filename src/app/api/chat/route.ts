import ollama from "ollama";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = await ollama.chat({
    model: process.env.OLLAMA_MODEL!,
    messages,
    stream: true
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(
          encoder.encode(
            chunk.message?.content || ""
          )
        );
      }

      controller.close();
    }
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}