import { ragChatStream } from "@/lib/rag/services/ragChat";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = await ragChatStream(messages);

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(
          encoder.encode(chunk)
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