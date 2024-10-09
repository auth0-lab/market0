import { createTransaction } from "@/lib/db";
import { getByID, getMatchingPurchases, update } from "@/lib/db/conditional-purchases";
import { pollMode } from "@/sdk/auth0/ciba";
import { NextRequest, NextResponse } from "next/server";

function getRandomPrice(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export async function POST(request: NextRequest) {
  const { type, data } = await request.json();

  // TODO: implement a proper payload validation
  if (type !== "metric") {
    return NextResponse.json(`Unsupported type: ${type} (expected: 'metric').`, { status: 400 });
  }

  if (!data) {
    return NextResponse.json(
      `A 'data' object with 'symbol', 'metric', 'value' and (optionally) 'user_id' properties, or with 'conditional_purchase_id' and 'user_id' properties is required.`,
      { status: 400 }
    );
  }

  // TODO: in a real-world scenario, this task should be send to a queue
  const matchingPurchases = data.conditional_purchase_id
    ? [await getByID(data.user_id, data.conditional_purchase_id)].filter((p) => p !== null)
    : await getMatchingPurchases(data.symbol, data.metric, data.value, data.user_id);

  console.log("matchingPurchases", matchingPurchases);

  await Promise.all(
    matchingPurchases.map(async (purchase) => {
      try {
        const price = data.metric === "price" ? data.value : getRandomPrice(10, 100);

        // wait for user's approval
        const { accessToken } = await pollMode(purchase.user_id);
        // TODO: in a real-world scenario, you will take the user access token to perform the purchase

        await createTransaction(purchase.symbol, price, purchase.quantity, "buy", purchase.user_id);
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
