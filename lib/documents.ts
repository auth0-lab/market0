import { NeonPostgres } from "@langchain/community/vectorstores/neon";
import { DistanceStrategy, PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

export const getDocumentsVectorStore = async () => {
  if (process.env.USE_NEON) {
    const vectorStore = await NeonPostgres.initialize(embeddings, {
      connectionString: process.env.DATABASE_URL as string,
    });
    return vectorStore;
  }

  return await PGVectorStore.initialize(embeddings, {
    postgresConnectionOptions: {
      connectionString: process.env.DATABASE_URL as string,
    },
    tableName: "documents",
    columns: {
      idColumnName: "id",
      vectorColumnName: "embedding",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    },
    // supported distance strategies: cosine (default), innerProduct, or euclidean
    distanceStrategy: "cosine",
  });
};
