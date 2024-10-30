import { Document, DocumentInterface } from "@langchain/core/documents";
import { BaseRetriever, BaseRetrieverInput } from "@langchain/core/retrievers";
import { ClientCheckRequest as FGACheckRequest, ConsistencyPreference, OpenFgaClient } from "@openfga/sdk";

import type { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";

type CheckDocument = (
  doc: DocumentInterface,
  query: string
) => FGACheckRequest;

type FGARetrieverArgs = {

  /**
   * The retriever to wrap.
   */
  retriever: BaseRetriever;

  /**
   * The FGA client to use for checking permissions.
   */
  fgaClient: OpenFgaClient;

  fields?: BaseRetrieverInput;

  /**
   * Optional function to create the check permission tuple.
   */
  buildQuery: CheckDocument;
};

export class FGARetriever extends BaseRetriever {
  lc_namespace = ["langchain", "retrievers"];

  private retriever: BaseRetriever;
  private checkDocument: CheckDocument;
  private fgaClient: OpenFgaClient;

  constructor(params: FGARetrieverArgs) {
    super(params.fields);
    this.fgaClient = params.fgaClient;
    this.checkDocument = params.buildQuery;
    this.retriever = params.retriever;
  }

  static adaptFGA(
    args: FGARetrieverArgs
  ): FGARetriever {
    return new FGARetriever({ ...args });
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
        const check = this.checkDocument(doc, query);
        out.checks.push(check);
        out.documentToObject.set(doc, check.object);
        return out;
      },
      {
        checks: [] as FGACheckRequest[],
        documentToObject: new Map<
          DocumentInterface,
          string
        >(),
      }
    );

    const { checks, documentToObject } = out;
    const resultsByObject = await this.accessByDocument(checks);

    return documents.filter(
      (d) => resultsByObject.get(documentToObject.get(d)!) ?? false
    );
  }

  private async accessByDocument(
    checks: FGACheckRequest[]
  ): Promise<Map<string, boolean>> {
    const results = await this.fgaClient.batchCheck(checks, {
      consistency: ConsistencyPreference.HigherConsistency
    });
    return results.responses.reduce((c: Map<string, boolean>, v) => {
      c.set(v._request.object, v.allowed || false);
      return c;
    }, new Map<string, boolean>());
  }
}


