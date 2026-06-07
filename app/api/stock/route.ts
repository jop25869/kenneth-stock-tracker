import YahooFinance from "yahoo-finance2";
import { NextResponse } from "next/server";

const yahooFinance = new YahooFinance();
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const symbol = searchParams.get("symbol");

  try {
    console.log("查詢股票:", symbol);

    const quote: any =
      await yahooFinance.quote(symbol!);

    console.log("結果:", quote);

    return NextResponse.json({
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
    });
  } catch (error) {
    console.error("錯誤:", error);

    return NextResponse.json({
      error: String(error),
    });
  }
}