import { RELATION } from "@/lib/constants";
import { getDocumentsVectorStore } from "@/lib/documents";
import { fgaClient, getUser } from "@/sdk/fga";
import { FGARetriever } from "@/sdk/fga/langchain/rag";

export async function getSymbolRetriever(symbol: string) {
  const claims = await getUser();

  // Get the db vector store
  const vectorStore = await getDocumentsVectorStore();

  // Create a retriever that filters the documents by symbol
  const retriever = vectorStore.asRetriever({
    filter: { symbol },
  });


  // Create a Retriever Wrapper that filters the documents by user access
  return new FGARetriever(
    {
      retriever,
      fgaClient,
      buildQuery: (doc) => ({
        user: `user:${claims.sub}`,
        relation: RELATION.CAN_VIEW_DOCS,
        object: `doc:${doc.metadata.id}`,
      })
    }
  );
}
