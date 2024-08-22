import { RELATION } from "@/lib/constants";
import { getDocumentsVectorStore } from "@/lib/documents";
import { withCheckPermission } from "@/sdk/fga/langchain/with-check-permission";

export async function getSymbolRetriever(symbol: string) {
  const vectorStore = await getDocumentsVectorStore();

  const retriever = await withCheckPermission(
    {
      relation: RELATION.CAN_VIEW_DOCS,
    },
    vectorStore.asRetriever({
      filter: { symbol },
    })
  );

  return retriever;
}
