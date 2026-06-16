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
    console.log("名稱:", quote.longName);
    console.log("短名稱:", quote.shortName);

    console.log(
      "changePercent:",
      quote.regularMarketChangePercent
    );

    console.log(
      "change:",
      quote.regularMarketChange
    );

    console.log(
      "漲幅:",
      quote.regularMarketChangePercent
    );

    return NextResponse.json({
      symbol: quote.symbol,

      name:
        quote.longName ??
        quote.shortName ??
        null,

      price:
        quote.regularMarketPrice,

      change:
        quote.regularMarketChange,

      changePercent:
        quote.regularMarketChangePercent,
    });
  } catch (error) {
    console.error("錯誤:", error);

    return NextResponse.json({
      error: String(error),
    });
  }
}