import { getMatchingPurchases, update } from "@/lib/db/conditional-purchases";
import { pollMode } from "@/sdk/auth0/ciba";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { type, data } = await request.json();

  // TODO: implement a proper payload validation
  if (type !== "metric") {
    return NextResponse.json(
      `Unsupported type: ${type} (expected: 'metric').`,
      { status: 400 }
    );
  }

  if (!data || !data.symbol || !data.metric || !data.value) {
    return NextResponse.json(
      `A 'data' object with 'symbol', 'metric' and 'value' properties is required.`,
      { status: 400 }
    );
  }

  // TODO: in a real-world scenario, this task should be send to a queue
  const matchingPurchases = await getMatchingPurchases(
    data.symbol,
    data.metric,
    data.value
  );

  console.log("matchingPurchases", matchingPurchases);

  await Promise.all(
    matchingPurchases.map(async (purchase) => {
      try {
        // wait for user's approval
        await pollMode(purchase.user_id);
        // TODO: in a real-world scenario, you will take the user access token to perform the purchase
        await update(purchase.id, { status: "completed" });
        console.log(`completed purchase with id ${purchase.id}`);
      } catch (err) {
        await update(purchase.id, { status: "canceled" });
        console.log(`canceled purchase with id ${purchase.id}`, err);
      }
    })
  );

  return new NextResponse();
}
