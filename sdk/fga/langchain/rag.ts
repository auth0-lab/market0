import { Document, DocumentInterface } from "@langchain/core/documents";
import { BaseRetriever, BaseRetrieverInput } from "@langchain/core/retrievers";
import { ClientCheckRequest, OpenFgaClient } from "@openfga/sdk";

import type { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";
type FGARetrieverArgsWithoutCheckFromDocument<T extends CheckRequest> = {
  user: string;
  retriever: BaseRetriever;
  checkFromDocument: (
    user: string,
    doc: DocumentInterface<Record<string, any>>,
    query: string
  ) => T;
  fields?: BaseRetrieverInput;
};

type FGARetrieverArgs<T extends CheckRequest> =
  FGARetrieverArgsWithoutCheckFromDocument<T> & {
    accessByDocument: (checks: T[]) => Promise<Map<string, boolean>>;
  };
type CheckRequest = {
  object: string;
};

export class FGARetriever<T extends CheckRequest> extends BaseRetriever {
  lc_namespace = ["langchain", "retrievers"];
  private retriever: BaseRetriever;
  private checkFromDocument: (
    user: string,
    doc: DocumentInterface<Record<string, any>>,
    query: string
  ) => T;
  private user: string;
  private accessByDocument: (checks: T[]) => Promise<Map<string, boolean>>;

  constructor({
    user,
    retriever,
    checkFromDocument,
    accessByDocument,
    fields,
  }: FGARetrieverArgs<T>) {
    super(fields);
    this.user = user;
    this.checkFromDocument = checkFromDocument;
    this.retriever = retriever;
    this.accessByDocument = accessByDocument as (
      checks: CheckRequest[]
    ) => Promise<Map<string, boolean>>;
  }

  static adaptFGA(
    fgaClient: OpenFgaClient,
    args: FGARetrieverArgsWithoutCheckFromDocument<ClientCheckRequest>
  ): FGARetriever<ClientCheckRequest> {
    const accessByDocument = async function accessByDocument(
      checks: ClientCheckRequest[]
    ): Promise<Map<string, boolean>> {
      const results = await fgaClient.batchCheck(checks);
      return results.responses.reduce((c: Map<string, boolean>, v) => {
        c.set(v._request.object, v.allowed || false);
        return c;
      }, new Map<string, boolean>());
    };

    return new FGARetriever({ ...args, accessByDocument });
  }

  async _getRelevantDocuments(
    query: string,
    runManager?: CallbackManagerForRetrieverRun
  ): Promise<Document[]> {
    const documents = await this.retriever._getRelevantDocuments(
      query,
      runManager
    );

    const out = documents.reduce(
      (out, doc) => {
        const check = this.checkFromDocument(this.user, doc, query);
        out.checks.push(check);
        out.documentToObject.set(doc, check.object);
        return out;
      },
      {
        checks: [] as T[],
        documentToObject: new Map<
          DocumentInterface<Record<string, any>>,
          string
        >(),
      }
    );
    const { checks, documentToObject } = out;
    const resultsByObject = await this.accessByDocument(checks);

    return documents.filter(
      (d, i) => resultsByObject.get(documentToObject.get(d) || "") === true
    );
  }
}
