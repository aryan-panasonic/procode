import { getProvider }
from "../providers/ProviderFactory";

export async function generateResponse(
  messages: any[]
) {
  const provider =
    getProvider();

  return provider.chat(messages);
}