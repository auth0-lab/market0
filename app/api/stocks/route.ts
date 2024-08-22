import { NextRequest, NextResponse } from "next/server";

import data from "./data.json";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const result = data.find(
    (stock) => stock.symbol.toLowerCase() === query?.toLowerCase()
  ) || {
    symbol: query,
    current_price: Number.parseFloat((Math.random() * 286 + 55).toFixed(2)),
    delta: Number.parseFloat((Math.random() * 10 - 5).toFixed(2)),
  };

  return NextResponse.json(result);
}
