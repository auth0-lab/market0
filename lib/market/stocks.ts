import data from "./data.json";

export async function getStockPrices({ symbol }: { symbol: string }) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const result = data.find(
    (stock) => stock.symbol.toLowerCase() === symbol.toLowerCase()
  ) || {
    symbol: symbol.toUpperCase(),
    current_price: Number.parseFloat((Math.random() * 286 + 55).toFixed(2)),
    delta: Number.parseFloat((Math.random() * 10 - 5).toFixed(2)),
  };
  return result;
}
