import ollama from "ollama";

import { retrieve } from "@/lib/rag/vectorstore/retrieve";
import { buildContext } from "@/lib/rag/prompt/buildContext";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages?.length) {
      return Response.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const latestMessage =
      messages[messages.length - 1];

    const query =
      latestMessage?.content ?? "";

    const chunks = await retrieve(
      query,
      5
    );

    const context =
      buildContext(chunks);

    const ragMessages = [
      {
        role: "system",
        content: `
You are a documentation support assistant.

Rules:
1. Answer only using the provided documentation.
2. Never make up information.
3. If the answer is not found in the documentation, reply exactly:

"I could not find that information in the documentation."

Documentation Context:

${context}
`
      },
      ...messages
    ];

    const stream = await ollama.chat({
      model: process.env.OLLAMA_MODEL!,
      messages: ragMessages,
      stream: true
    });

    const encoder = new TextEncoder();

    const readableStream =
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content =
                chunk.message?.content ?? "";

              controller.enqueue(
                encoder.encode(content)
              );
            }

            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });

    return new Response(
      readableStream,
      {
        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",
          "Cache-Control":
            "no-cache",
          Connection:
            "keep-alive"
        }
      }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          "Failed to process request"
      },
      {
        status: 500
      }
    );
  }
}