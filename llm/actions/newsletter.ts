'use server';

import { documents } from "@/lib/db";
import { fgaClient, getUser } from "@/sdk/fga";
import { Claims } from "@auth0/nextjs-auth0";
import { ConsistencyPreference } from "@openfga/sdk";

type Document = documents.Document;

function generateTuples(user: Claims, docs: Document[]) {
  return docs.map(doc => {
    return {
      user: `user:${user.sub}`,
      object: `doc:${doc.metadata.id}`,
      relation: "can_view",
    };
  });
}

async function batchCheckTuples(tuples: any[]) {
  const { responses: batchCheckResult } = await fgaClient.batchCheck(tuples);
  return batchCheckResult;
}

async function getDocs(symbol?: string) {
  return symbol ? await documents.query("forecast", symbol) : await documents.query("forecast");
}

export async function enrollToNewsletter() {
  const user = await getUser();
  const docs = await getDocs();
  const tuples = generateTuples(user, docs);
  const batchCheckResult = await batchCheckTuples(tuples);
  const createTuples = tuples.filter((_tuple, index) => !batchCheckResult[index].allowed);

  await fgaClient.write(
    {
      writes: createTuples,
    }
  );
}

export async function unenrollFromNewsletter() {
  const user = await getUser();
  const docs = await getDocs();
  const tuples = generateTuples(user, docs);
  const batchCheckResult = await batchCheckTuples(tuples);
  const deleteTuples = tuples.filter((_tuple, index) => batchCheckResult[index].allowed);

  await fgaClient.deleteTuples(deleteTuples);
}

export async function checkEnrollment({ symbol }: { symbol: string }) {
  const user = await getUser();
  const docs = await documents.query("forecast", symbol);
  if (docs.length === 0) { return false; }

  //Test if the user is allowed to view any forecast.
  const { allowed } = await fgaClient.check({
    user: `user:${user.sub}`,
    object: `doc:${docs[0].metadata.id}`,
    relation: "can_view",
  }, {
    consistency: ConsistencyPreference.HigherConsistency
  });

  return allowed;
}
