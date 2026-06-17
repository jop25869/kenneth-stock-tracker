import { prisma } from "../lib/prisma";

const etfs = [
  { symbol: "0050", name: "元大台灣50" },
  { symbol: "0051", name: "元大中型100" },
  { symbol: "0052", name: "富邦科技" },
  { symbol: "0053", name: "元大電子" },
  { symbol: "0055", name: "元大MSCI金融" },
  { symbol: "0056", name: "元大高股息" },
  { symbol: "0057", name: "富邦摩台" },
  { symbol: "0061", name: "元大寶滬深" },
  { symbol: "006203", name: "元大MSCI台灣" },
  { symbol: "006204", name: "永豐臺灣加權" },
  { symbol: "006208", name: "富邦台50" },
  { symbol: "00631L", name: "元大台灣50正2" },
  { symbol: "00632R", name: "元大台灣50反1" },
  { symbol: "00637L", name: "元大滬深300正2" },
  { symbol: "00638R", name: "元大滬深300反1" },
  { symbol: "00646", name: "元大S&P500" },
  { symbol: "00655L", name: "國泰中國A50正2" },
  { symbol: "00657", name: "國泰日經225" },
  { symbol: "00662", name: "富邦NASDAQ" },
  { symbol: "00668", name: "國泰美國道瓊" },
  { symbol: "00675L", name: "富邦臺灣加權正2" },
  { symbol: "00676R", name: "富邦臺灣加權反1" },
  { symbol: "00679B", name: "元大美債20年" },
  { symbol: "00685L", name: "群益臺灣加權正2" },
  { symbol: "00686R", name: "群益臺灣加權反1" },
  { symbol: "00687B", name: "國泰20年美債" },
  { symbol: "00690", name: "兆豐藍籌30" },
  { symbol: "00692", name: "富邦公司治理" },
  { symbol: "00696B", name: "富邦美債20年" },
  { symbol: "00701", name: "國泰股利精選30" },
  { symbol: "00713", name: "元大台灣高息低波" },
  { symbol: "00719B", name: "元大美債1-3" },
  { symbol: "00720B", name: "元大投資級公司債" },
  { symbol: "00725B", name: "國泰投資級公司債" },
  { symbol: "00730", name: "富邦NASDAQ反1" },
  { symbol: "00733", name: "富邦臺灣中小" },
  { symbol: "00757", name: "統一FANG+" },
  { symbol: "00762", name: "元大全球AI" },
  { symbol: "00772B", name: "中信高評級公司債" },
  { symbol: "00830", name: "國泰費城半導體" },
  { symbol: "00850", name: "元大臺灣ESG永續" },
  { symbol: "00851", name: "台新全球AI" },
  { symbol: "00878", name: "國泰永續高股息" },
  { symbol: "00881", name: "國泰台灣5G+" },
  { symbol: "00891", name: "中信關鍵半導體" },
  { symbol: "00900", name: "富邦特選高股息30" },
  { symbol: "00904", name: "新光臺灣半導體30" },
  { symbol: "00905", name: "FT臺灣Smart" },
  { symbol: "00907", name: "永豐優息存股" },
  { symbol: "00908", name: "富邦入息REITs+" },
  { symbol: "00915", name: "凱基優選高股息30" },
  { symbol: "00916", name: "國泰全球品牌50" },
  { symbol: "00918", name: "大華優利高填息30" },
  { symbol: "00919", name: "群益台灣精選高息" },
  { symbol: "00922", name: "國泰台灣領袖50" },
  { symbol: "00927", name: "群益半導體收益" },
  { symbol: "00929", name: "復華台灣科技優息" },
  { symbol: "00930", name: "永豐ESG低碳高息" },
  { symbol: "00934", name: "中信成長高股息" },
  { symbol: "00936", name: "台新永續高息中小" },
  { symbol: "00937B", name: "群益ESG投等債20+" },
  { symbol: "00939", name: "統一台灣高息動能" },
  { symbol: "00940", name: "元大台灣價值高息" },
  { symbol: "00944", name: "野村趨勢動能高息" },
  { symbol: "00946", name: "群益科技高息成長" },
  { symbol: "00961", name: "FT臺灣永續高息" },

  // ⚠️ 以下很多不是已確認掛牌 ETF，建議之後再驗證
  { symbol: "009803", name: "保德信市值動能50" },
  { symbol: "009804", name: "聯邦台精彩50" },
  { symbol: "009805", name: "新光美國電力基建" },
  { symbol: "009806", name: "兆豐永續高息" },
  { symbol: "009807", name: "統一台股增長" },
  { symbol: "009808", name: "富邦台灣優質" },
  { symbol: "009809", name: "凱基台灣精選" },
  { symbol: "009810", name: "國泰永續科技" },
  { symbol: "009811", name: "群益台灣動能" },
  { symbol: "009812", name: "元大台灣精選" },
  { symbol: "009813", name: "野村高息成長" },
  { symbol: "009814", name: "永豐價值成長" },
  { symbol: "009815", name: "富邦ESG高息" },
  { symbol: "009816", name: "中信科技高息" },
  { symbol: "009817", name: "第一金優質高息" },
  { symbol: "009818", name: "台新科技成長" },
  { symbol: "009819", name: "國票高息優選" },
  { symbol: "009820", name: "兆豐ESG收益" },
  { symbol: "009821", name: "國泰永續收益" },
  { symbol: "009822", name: "元富科技精選" },
  { symbol: "009823", name: "凱基高股息" },
  { symbol: "009824", name: "富邦科技收益" },
  { symbol: "009825", name: "新光AI科技" },
  { symbol: "009826", name: "元大智慧製造" },
  { symbol: "009827", name: "群益ESG科技" },
  { symbol: "009828", name: "國泰半導體收益" },
  { symbol: "009829", name: "永豐台灣動能" },
  { symbol: "009830", name: "中信高股息" },
  { symbol: "009831", name: "富邦低波動" },
  { symbol: "009832", name: "元大台灣成長" },
  { symbol: "009833", name: "台新ESG優選" },
  { symbol: "009834", name: "群益AI創新" },
];

async function main() {
  console.log("開始同步 ETF...");

  for (const etf of etfs) {
    await prisma.taiwanStock.upsert({
      where: {
        symbol: etf.symbol,
      },
      update: {
        name: etf.name,
        market: "ETF",
        country: "TW",
      },
      create: {
        symbol: etf.symbol,
        name: etf.name,
        market: "ETF",
        country: "TW",
      },
    });

    console.log(`同步完成：${etf.symbol}`);
  }

  console.log(`ETF 同步完成，共 ${etfs.length} 筆`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
});