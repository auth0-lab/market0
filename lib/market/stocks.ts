import data from "./stocks.json";

export async function getStockPrices({ symbol }: { symbol: string }) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const result = data.find((stock) => stock.symbol.toLowerCase() === symbol.toLowerCase());

  if (!result) {
    throw new Error(`Stock ${symbol} not found`);
  }

  return result;
}

export async function getCompanyInfo({ symbol }: { symbol: string }) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const result = data.find((stock) => stock.symbol.toLowerCase() === symbol.toLowerCase());

  if (!result) {
    throw new Error(`Stock ${symbol} not found`);
  }

  return {
    symbol: result.symbol,
    shortname: result.shortname,
    longname: result.longname,
    industry: result.industry,
    sector: result.sector,
  };
}
