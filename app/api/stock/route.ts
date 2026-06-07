import YahooFinance from "yahoo-finance2";
import { NextResponse } from "next/server";

const yahooFinance = new YahooFinance();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  let symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "缺少股票代號" },
      { status: 400 }
    );
  }

  symbol = symbol.trim().toUpperCase();

  // 台股代號自動補 .TW
  if (/^\d{4,6}$/.test(symbol)) {
    symbol = `${symbol}.TW`;
  }

  try {
    console.log("查詢股票:", symbol);

    const quote: any = await yahooFinance.quote(symbol);

    return NextResponse.json({
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      name: quote.longName || quote.shortName,
    });
  } catch (error) {
    console.error("錯誤:", error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}