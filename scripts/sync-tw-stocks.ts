import { prisma } from "../lib/prisma";

const TWSE_URL =
  "https://openapi.twse.com.tw/v1/opendata/t187ap03_L";

const TPEX_URL =
  "https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O";

  //
async function main() {
  console.log("開始同步上市...");

  const response = await fetch(TWSE_URL);
  
  const stocks = await response.json();

  console.log(`取得 ${stocks.length} 筆資料`);

  let count = 0;

  for (const stock of stocks) {
    const symbol = stock["公司代號"];
    const name = stock["公司名稱"];

    if (!symbol || !name) continue;

    await prisma.taiwanStock.upsert({
      where: {
        symbol,
      },
      update: {
        name,
        market: "TWSE",
        country: "TW",
      },
      create: {
        symbol,
        name,
        market: "TWSE",
        country: "TW",
      },
    });

    count++;

    if (count % 100 === 0) {
      console.log(`已同步 ${count} 筆`);
    }
  }

  console.log(`同步完成，共 ${count} 筆`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
});