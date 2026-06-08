import { retrieve }
from "../vectorstore/retrieve";

import { buildContext }
from "../prompt/buildContext";

import { getProvider }
from "@/lib/ai/providers/ProviderFactory";

export async function ragChat(
  question: string
) {

  const chunks =
    await retrieve(
      question,
      5
    );

  const context =
    buildContext(chunks);

  const provider =
    getProvider();

  const response =
    await provider.chat([
      {
        role: "system",

        content:
`
You are an AI support assistant.

Answer ONLY using
the provided context.

If the answer is not
contained in the context,
say:

"I could not find that information in the documentation."

Context:

${context}
`
      },

      {
        role: "user",

        content: question
      }
    ]);

  return {
    response
  };
}