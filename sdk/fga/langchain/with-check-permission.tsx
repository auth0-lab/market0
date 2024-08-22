import {
  VectorStore,
  VectorStoreRetriever,
} from "@langchain/core/vectorstores";
import { ClientCheckRequest } from "@openfga/sdk";

import { fgaClient, getUser } from "../";
import { FGARetriever } from "./rag";

type FnResolver = (data?: any) => string;

type CheckPermissionParams = {
  user?: FnResolver;
  object?: string | FnResolver;
  relation: string | FnResolver;
};

export type WithCheckPermissionParams = (
  retriever: VectorStoreRetriever<VectorStore>
) => FGARetriever<ClientCheckRequest>;

export function resolveParam(relation: string | FnResolver, data?: any) {
  return typeof relation === "function" ? relation(data) : relation;
}

export async function withCheckPermission(
  params: CheckPermissionParams,
  retriever: VectorStoreRetriever<VectorStore>
) {
  const user = await getUser();
  const userTemplate = (user: string) => `user:${user}`;
  const objectTemplate = (doc: any) => `doc:${doc.metadata.id}`;

  return FGARetriever.adaptFGA(fgaClient, {
    user: user.sub,
    retriever,
    checkFromDocument: (user, doc) => ({
      user: params.user ? params.user(user) : userTemplate(user),
      object: params.object
        ? resolveParam(params.object, doc)
        : objectTemplate(doc),
      relation: resolveParam(params.relation),
    }),
  });
}
