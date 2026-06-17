"use client";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";

import SortableRow from "@/components/SortableRow";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";


//圓餅圖
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { LogOut } from "lucide-react";

/* =========================
   股票資料型別
========================= */
type Stock = {
  id: number;

  symbol: string;
  name?: string;

  market: string;
  shares: number;
  cost: number;
  currentPrice: number;
  changePercent?: number;
};

type TokenPayload = {
  userId: number;
  email: string;
};


export default function Home() {
  /* =========================
     State 區
  ========================= */

  // 股票清單
  const [stocks, setStocks] = useState<Stock[]>([]);

  // 即時股價載入完成
  const [pricesLoaded, setPricesLoaded] = useState(false);

  // 新增股票輸入框
  const [symbol, setSymbol] = useState("");
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [shares, setShares] = useState("");
  const [cost, setCost] = useState("");

  // 編輯模式
  const [editingSymbol, setEditingSymbol] = useState("");
  const [editShares, setEditShares] = useState("");
  const [editCost, setEditCost] = useState("");

  //新增更新時間
  const [lastUpdate, setLastUpdate] = useState("");

  //顯示目前登入帳號
  const [userEmail, setUserEmail] =useState("");

  //拖曳
  const [sortMode, setSortMode] = useState(false);

  //台股美股切換
  const [market, setMarket] = useState("US");

  //獲利顏色(正損益)
  const profitColor =
  market === "TW"
    ? "text-red-500"
    : "text-emerald-500";
  //獲利顏色(負損益)
const lossColor =
  market === "TW"
    ? "text-emerald-500"
    : "text-red-500";

  //台美股漲跌顏色
    const getColorClass = (
      value: number,
      market: string
    ) => {
      const isTaiwanStock = [
        "TW",
        "TWSE",
        "TPEx",
      ].includes(market);

      if (isTaiwanStock) {
        return value >= 0
          ? "text-red-400"
          : "text-green-400";
      }

      return value >= 0
        ? "text-green-400"
        : "text-red-400";
    };

  /* =========================
     工具函式
  ========================= */

  // 金額格式化
  const formatMoney = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    
  /* =========================
     功能區
  ========================= */

  // 新增股票
const searchStocks = async (
    keyword: string
  ) => {
    if (!keyword) {
      setSearchResults([]);
      return;
    }

    const response = await fetch(
      `/api/stocks/search?q=${keyword}`
    );

    const data = await response.json();
   
    setSearchResults(data);
  };

  const addStock = async () => {
    if (!symbol || !shares || !cost) return;

    // 抓現價
    const yahooSymbol =
    market === "TW"
    ? selectedStock?.market === "TPEx"
      ? `${symbol}.TWO`
      : `${symbol}.TW`
    : symbol.toUpperCase();

    const response = await fetch(
      `/api/stock?symbol=${yahooSymbol}`
    );

    const data = await response.json();

    console.log("Yahoo Symbol:", yahooSymbol);
    console.log("Yahoo Data:", data);

    // 取得登入 Token
    const token = localStorage.getItem("token");

    if (!token) {
      alert("請先登入");
      return;
    }

    // 解析 Token
    const decoded =
      jwtDecode<TokenPayload>(token);
    
      console.log("market:", market);
      console.log("selectedStock:", selectedStock);
      console.log("symbol:", symbol);
      console.log("yahooSymbol:", yahooSymbol);

    // 寫入資料庫
    const res = await fetch("/api/stock/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
        body: JSON.stringify({
        symbol:
          market === "TW"
            ? symbol
            : symbol.toUpperCase(),

        name:
          market === "TW"
            ? selectedStock?.name ?? null
            : data.name ?? null,

        shares: Number(shares),

        cost: Number(cost),

        currentPrice:
          data.price ?? Number(cost),

        changePercent:
          data.changePercent ?? 0,

        userId: decoded.userId,

        market:
        market === "TW"
          ? selectedStock?.market === "TPEx"
            ? "TPEx"
            : "TW"
          : "US",
      }),
    });

    console.log("create status:", res.status);

    if (!res.ok) {
      const err = await res.text();

      console.error("新增失敗：", err);

      alert("新增失敗：" + err);

      return;
    }

    console.log("新增成功");



    // 重新載入持股
    await loadStocks();

    // 清空輸入框
    setSymbol("");
    setShares("");
    setCost("");
    setSelectedStock(null);
  };

//登出
const logout = () => {
  localStorage.removeItem("token");

  window.location.href = "/login";
};

  // 刪除股票
const deleteStock = async (
  symbol: string
) => {
  const token =
    localStorage.getItem("token");

  if (!token) return;

  const decoded =
    jwtDecode<TokenPayload>(token);

  await fetch("/api/stock/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      symbol,
      userId: decoded.userId,
    }),
  });

  await loadStocks();
};

  // 開始編輯
  const startEdit = (stock: Stock) => {
    setEditingSymbol(stock.symbol);
    setEditShares(stock.shares.toString());
    setEditCost(stock.cost.toString());
  };

// 儲存編輯
const saveEdit = async () => {
  const response = await fetch(
    `/api/stock?symbol=${editingSymbol}`
  );

  const data = await response.json();

  console.log("Yahoo 回傳：", data);

  const token =
    localStorage.getItem("token");

  if (!token) return;

  const decoded =
    jwtDecode<TokenPayload>(token);

  await fetch("/api/stock/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  symbol: editingSymbol,

  name: data.name ?? null,

  shares: Number(editShares),

  cost: Number(editCost),

  currentPrice:
    data.price ?? Number(editCost),

  changePercent:
    data.changePercent ?? 0,

  userId: decoded.userId,
}),
  });

  await loadStocks();

  setEditingSymbol("");
};

const handleDragEnd = async (
  event: any
) => {
  const { active, over } = event;

  if (!over) return;

  if (active.id === over.id)
    return;

  const oldIndex =
    stocks.findIndex(
      (s) => s.id === active.id
    );

  const newIndex =
    stocks.findIndex(
      (s) => s.id === over.id
    );

        const newStocks = arrayMove(
        stocks,
        oldIndex,
        newIndex
      );

      setStocks(newStocks);

      try {
        const res = await fetch(
          "/api/stock/reorder-all",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              newStocks.map(
                (stock, index) => ({
                  id: stock.id,
                  sortOrder: index,
                })
              )
            ),
          }
        );

        console.log(
          "reorder status:",
          res.status
        );

        console.log(
          "reorder response:",
          await res.text()
        );
      } catch (error) {
        console.error(
          "reorder error:",
          error
        );
      }
};

  const refreshPrices = async () => {
  const token = localStorage.getItem("token");

  if (!token) return;

  const decoded =
    jwtDecode<TokenPayload>(token);

  const updatedStocks = await Promise.all(
    stocks.map(async (stock) => {
      const yahooSymbol =
      ["TW", "TWSE", "ETF"].includes(stock.market)
        ? `${stock.symbol}.TW`
        : stock.market === "TPEx"
        ? `${stock.symbol}.TWO`
        : stock.symbol.toUpperCase();

      const response = await fetch(
        `/api/stock?symbol=${yahooSymbol}`
      );

      const data = await response.json();

      // ⭐同步更新資料庫
      await fetch("/api/stock/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          shares: stock.shares,
          cost: stock.cost,
          currentPrice:
          data.price ?? stock.cost,

          changePercent:
          data.changePercent ?? 0,
          userId: decoded.userId,
        }),
      });

      return {
        ...stock,
        currentPrice:
          data.price ?? stock.cost,

        changePercent:
          data.changePercent ?? 0,
      };
    })
  );

  setStocks(updatedStocks);

  setLastUpdate(
    new Date().toLocaleString("zh-TW")
  );
};


  /* =========================
     localStorage
  ========================= */

  useEffect(() => {
  const init = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const decoded =
      jwtDecode<TokenPayload>(token);

    setUserEmail(decoded.email);

    await loadStocks();

    
  };

    init();
  }, []);
  
  useEffect(() => {
    const updatePrices = async () => {
      if (stocks.length === 0) return;

      await refreshPrices();

      setPricesLoaded(true);
    };

    updatePrices();
  }, [stocks.length]);

  const loadStocks = async () => {
  const token =
    localStorage.getItem("token");

  if (!token) return;

  const decoded =
    jwtDecode<TokenPayload>(token);

  const response = await fetch(
    `/api/stock/list?userId=${decoded.userId}`
  );

  const data = await response.json();


  setStocks(data);
  };

  /* =========================
     Dashboard 計算
  ========================= */

  const filteredStocks = stocks.filter((stock) =>
  market === "TW"
    ? ["TW", "TWSE", "TPEx", "ETF"].includes(stock.market)
    : stock.market === market
);

    const totalCost = filteredStocks.reduce(
    (sum, stock) =>
      sum +
      (Number(stock.cost) || 0) *
      (Number(stock.shares) || 0),
    0
  );

  const totalValue = filteredStocks.reduce(
    (sum, stock) =>
      sum +
      (Number(stock.currentPrice) || 0) *
      (Number(stock.shares) || 0),
    0
  );

  const totalProfit = totalValue - totalCost;

  //正負損益計算
  const totalGain = filteredStocks.reduce(
    (sum, stock) => {
      const profit =
        ((Number(stock.currentPrice) || 0) -
          (Number(stock.cost) || 0)) *
        (Number(stock.shares) || 0);

      return profit > 0
        ? sum + profit
        : sum;
    },
    0
  );

  const totalLoss = filteredStocks.reduce(
    (sum, stock) => {
      const profit =
        ((Number(stock.currentPrice) || 0) -
          (Number(stock.cost) || 0)) *
        (Number(stock.shares) || 0);

      return profit < 0
        ? sum + Math.abs(profit)
        : sum;
    },
    0
  );
  const returnRate =
    totalCost > 0
      ? (totalProfit / totalCost) * 100
      : 0;

  //圓餅圖
  

  const pieData = filteredStocks.map(
  (stock) => ({
    name: stock.symbol,
    value: stock.currentPrice * stock.shares,
  })
);
  const COLORS = [
  "#22c55e", // 綠
  "#3b82f6", // 藍
  "#f59e0b", // 橘
  "#ef4444", // 紅
  "#8b5cf6", // 紫
  "#06b6d4", // 青
  "#ec4899", // 粉
  "#84cc16", // 萊姆

  "#14b8a6", // 綠松石
  "#f97316", // 深橘
  "#6366f1", // 靛藍
  "#a855f7", // 亮紫
  "#eab308", // 黃
  "#10b981", // 翡翠綠
  "#f43f5e", // 桃紅
  "#0ea5e9", // 天藍

  "#c084fc", // 淡紫
  "#fb7185", // 粉紅
  "#2dd4bf", // 薄荷綠
  "#fde047", // 亮黃
];

  //最佳持股
  const bestStock = [...filteredStocks].sort(
  (a, b) =>
    (b.currentPrice - b.cost) * b.shares -
    (a.currentPrice - a.cost) * a.shares
  )[0];

  //最差持股
  const worstStock = [...filteredStocks].sort(
  (a, b) =>
    (a.currentPrice - a.cost) * a.shares -
    (b.currentPrice - b.cost) * b.shares
  )[0];
  

  //正在更新即時股價
  /*if (!pricesLoaded) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-2xl font-bold">
        📈 正在更新即時股價...
      </div>
    </main>
    );
  }*?

  /* =========================
     JSX 畫面
  ========================= */

  return (
      <main className="min-h-screen bg-[#F5ECE7] text-zinc-900 p-10">
        
      {/* Header */}
    <div className="flex items-start justify-between mb-8">

  {/* 左邊 Logo */}
 <div>
  <h1 className="text-5xl font-bold">
    📈 Stock Tracker
  </h1>

  <p className="text-zinc-600 mt-2">
    歡迎回來，{userEmail.split("@")[0]} 👋
  </p>

  <p className="text-sm text-zinc-500">
    最後更新：{lastUpdate || "尚未更新"}
  </p>
</div>

  {/* 中間切換 */}
  <div className="flex flex-col items-center">

    <img
      src={market === "US"
        ? "/flags/us.png"
        : "/flags/tw.png"}
      alt="flag"
      className="w-24 h-14 rounded-md transition-all duration-300"
    />

    <div className="flex bg-white rounded-2xl p-1 shadow-md border border-zinc-200">
  <button
    onClick={() => setMarket("US")}
    className={`px-6 py-2 rounded-xl transition-all duration-200 ${
      market === "US"
        ? "bg-blue-600 text-white shadow-md"
        : "text-zinc-700 hover:bg-zinc-100"
    }`}
  >
    US 美股
  </button>

  <button
    onClick={() => setMarket("TW")}
    className={`px-6 py-2 rounded-xl transition-all duration-200 ${
      market === "TW"
        ? "bg-blue-600 text-white shadow-md"
        : "text-zinc-700 hover:bg-zinc-100"
    }`}
  >
    TW 台股
  </button>
</div>

  </div>

  {/* 右邊帳號 */}
  <div className="flex items-center gap-4">
    <span className="text-zinc-600">
      👤 {userEmail}
    </span>

    <button
  onClick={logout}
  className="
    flex items-center gap-4
    px-4 py-2
    bg-zinc-700
    text-white
    hover:bg-zinc-800
    transition
    w-fit
  "
>
  <LogOut className="w-8 h-8" />

  <span className="text-2xl font-bold">
    登出
  </span>
</button>
  </div>

</div>

      

      {/* =========================
          新增持股
      ========================= */}

      <div className="bg-white p-6 rounded-3xl mb-6 max-w-4xl shadow-xl border border-zinc-200">
        <h2 className="text-2xl font-bold mb-4 text-zinc-900">
          新增持股
        </h2>

        <div className="flex flex-wrap items-start gap-4">
          <div className="relative flex flex-col">
  <input
    
    className="
        bg-zinc-100
        text-zinc-900
        border border-zinc-300
        px-5
        py-4
        rounded-2xl
        w-[320px]
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        "
    placeholder={
      market === "TW"
        ? "輸入台股名稱或代號"
        : "股票代號"
    }
    value={symbol}
      onChange={(e) => {
        setSymbol(e.target.value);

        if (market === "TW") {
          searchStocks(e.target.value);
        }
      }}
      onBlur={() => {
        setTimeout(() => {
          setSearchResults([]);
        }, 150);
      }}
    />

  {market === "TW" &&
    searchResults.length > 0 && (
      <div className="absolute top-12 left-0 w-80 bg-white rounded-2xl shadow-xl border border-zinc-200 z-50">
        {searchResults.map((stock) => (
          <div
            key={stock.symbol}
            onClick={() => {
              setSymbol(stock.symbol);
              setSelectedStock(stock);   // ← 加這行
              setSearchResults([]);
            }}
          >
            {stock.symbol} {stock.name}
          </div>
        ))
        }
      </div>
    )}
     {selectedStock && (
    <div className="mt-1 text-sm text-emerald-600">
      {selectedStock.symbol} - {selectedStock.name}
    </div>
  )}
</div>
 

          <input
            className="
              bg-zinc-100
              text-zinc-900
              border border-zinc-300
              px-5
              py-4
              rounded-2xl
              w-32
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              "
            placeholder="股數"
            type="number"
            value={shares}
            onChange={(e) =>
              setShares(e.target.value)
            }
          />

          <input
            className="
              bg-zinc-100
              text-zinc-900
              border border-zinc-300
              px-5
              py-4
              rounded-2xl
              w-40
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              "
            placeholder="成本"
            type="number"
            value={cost}
            onChange={(e) =>
              setCost(e.target.value)
            }
          />

          <button
            onClick={addStock}
            className="
              bg-emerald-600
              hover:bg-emerald-500
              text-white
              font-semibold
              rounded-2xl
              px-8
              py-4
              min-w-[140px]
              shadow-md
              transition
              whitespace-nowrap
              self-start md:self-auto
              "
          >
            新增股票
          </button>
        </div>
      </div>
          
          <button
            onClick={refreshPrices}
            className="
              bg-blue-600
              px-5
              py-3
              rounded-xl
              hover:bg-blue-500
              text-white
              font-semibold
              shadow-md
              mb-4
              "
          >
            🔄 更新全部股價
          </button>

           {/* 更新股價文字 
          {lastUpdate && (
            <div className="text-zinc-400 text-sm mt-2">
              最後更新：{lastUpdate}
            </div>
          )}*/}

      {/* =========================
          Dashboard
      ========================= */}

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
        
        <div className="bg-white p-4 rounded-2xl shadow-md border border-zinc-200">
            <div className="text-zinc-400 text-sm">
            總投入
          </div>
          <div className="text-2xl font-bold">
            ${formatMoney(totalCost)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md border border-zinc-200">
          <div className="text-zinc-400 text-sm">
            總市值
          </div>
          <div className="text-2xl font-bold">
            ${formatMoney(totalValue)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md border border-zinc-200">
          <div className="text-zinc-400 text-sm">
            總損益
          </div>
          <div
            className={`text-2xl font-bold ${
              totalProfit >= 0
               ? profitColor
                : lossColor}
            }`}
          >
            ${formatMoney(totalProfit)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md border border-zinc-200">
          <div className="text-zinc-400 text-sm">
            總獲利
          </div>

          <div
            className={`text-2xl font-bold ${
              market === "TW"
                ? "text-red-500"
                : "text-green-400"
            }`}
          >
            +${formatMoney(totalGain)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md border border-zinc-200">
          <div className="text-zinc-400 text-sm">
            總虧損
          </div>

          <div
          className={`text-2xl font-bold ${
            market === "TW"
              ? "text-green-500"
              : "text-red-400"
          }`}
        >
          -${formatMoney(totalLoss)}
        </div>
        </div>


        <div className="bg-white p-4 rounded-2xl shadow-md border border-zinc-200">
          <div className="text-zinc-400 text-sm">
            報酬率
          </div>
         <div
            className={`text-2xl font-bold ${
              returnRate >= 0
                ? market === "TW"
                  ? "text-red-500"
                  : "text-green-400"
                : market === "TW"
                  ? "text-green-500"
                  : "text-red-400"
            }`}
          >
            {returnRate >= 0 ? "+" : ""}
            {returnRate.toFixed(2)}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md border border-zinc-200">
          <div className="text-zinc-400 text-sm">
            🏆 最佳持股
          </div>

          <div className="text-xl font-bold text-green-400">
            {bestStock?.symbol}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md border border-zinc-200">
          <div className="text-zinc-400 text-sm">
            ⚠️ 最差持股
          </div>

          <div className="text-xl font-bold text-red-400">
            {worstStock?.symbol}
          </div>
        </div>
      </div>

      {/* =========================
          持股表格
      ========================= */}
      
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-zinc-200 w-full lg:w-[60%]">

          <div className="flex justify-between mb-3">

            <button
              onClick={() =>
                setSortMode(!sortMode)
              }
              className="w-10 h-10 flex items-center justify-center rounded bg-zinc-100 hover:bg-zinc-200 text-xl"

            >
              ☰
            </button>

          </div>

        <div className="overflow-x-auto">
        
          <DndContext
            collisionDetection={
              closestCenter
            }
            onDragEnd={
              handleDragEnd
            }
          >
          <SortableContext
            items={stocks.map(
              (s) => s.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >

            <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="w-[8%] text-left px-2 py-3">股票</th>
              <th className="w-[5%] text-center px-2 py-3">股數</th>
              <th className="w-[5%] text-right px-2 py-3">成本</th>
              <th className="w-[5%] text-right px-2 py-3">現價</th>
              <th className="w-[5%] text-right px-2 py-3">漲幅</th>
              <th className="w-[5%] text-right px-2 py-3">損益</th>
              <th className="w-[5%] text-right px-2 py-3">報酬率</th>
              <th className="w-[10%] text-center px-2 py-3">操作</th>
            </tr>
          </thead>

          <tbody>
            {filteredStocks.map((stock) => {
              const profit =
                (stock.currentPrice - stock.cost) *
                stock.shares;
                //計算損益百分比
                const profitRate =
                ((stock.currentPrice - stock.cost) /
                  stock.cost) *
                100;

              return (
                <SortableRow
                  key={stock.id}
                  id={stock.id}
                  enabled={sortMode}
                >
                  
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">

                      {sortMode && (
                        
                          <span
                            className="
                              text-zinc-500
                              select-none
                            "
                          >
                            ☰
                          </span>
                        )}
                      <div>
                        <div className="font-semibold">
                          {
                            stock.market === "TW"
                              ? stock.symbol.replace(".TW", "")
                              : stock.symbol
                          }
                        </div>

                        {stock.name && (
                          <div className="text-xs text-zinc-400 truncate max-w-[180px]">
                            {stock.name}
                          </div>
                        )}
                      </div>

                    </div>
                  </td>

                  <td className="px-2 py-3 text-center">
                    {editingSymbol === stock.symbol ? (
                      <input
                        className="
                        bg-white
                        text-black
                        p-1
                        w-20
                        rounded-md
                        border
                        border-gray-300
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                        value={editShares}
                        onChange={(e) =>
                          setEditShares(
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      stock.shares
                    )}
                  </td>

                  <td className="px-2 py-3 text-right">
                    {editingSymbol === stock.symbol ? (
                      <input
                        className="
                        bg-white
                        text-black
                        p-1
                        w-20
                        rounded-md
                        border
                        border-gray-300
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                        value={editCost}
                        onChange={(e) =>
                          setEditCost(
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      `$${stock.cost}`
                    )}
                  </td>

                  <td className="px-2 py-3 text-right">
                    ${stock.currentPrice}
                  </td>

                  <td
                      className={`px-2 py-3 text-right ${getColorClass(
                        stock.changePercent ?? 0,
                        stock.market
                      )}`}
                    >
                      {(stock.changePercent ?? 0).toFixed(2)}%
                    </td>
                  
                  <td
                    className={`px-2 py-3 text-right ${
                      getColorClass(
                        profit,
                        stock.market
                      )
                    }`}
                  >
                    ${formatMoney(profit)}
                  </td>

                 <td
                    className={`px-2 py-3 text-right ${getColorClass(
                      profitRate,
                      stock.market
                    )}`}
                  >
                    {profitRate.toFixed(2)}%
                  </td>
                  
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-center gap-1">

                      

                      {editingSymbol === stock.symbol ? (
                        <button
                          onClick={saveEdit}
                          className="w-10 h-10 flex items-center justify-center rounded bg-zinc-100 hover:bg-zinc-100 text-xl"
                        >
                          💾
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(stock)}
                          className="w-10 h-10 flex items-center justify-center rounded bg-zinc-100 hover:bg-zinc-200 text-xl"
                        >
                          ✏️
                        </button>
                      )}

                      <button
                        onClick={() => deleteStock(stock.symbol)}
                          className="w-10 h-10 flex items-center justify-center rounded bg-zinc-100 hover:bg-zinc-200 text-xl"

                      >
                        ❌
                      </button>

                    </div>
                  </td>
                </SortableRow>
              );
            })}
          </tbody>
        </table>
          </SortableContext>
          </DndContext>
        </div>
        </div>
          {/* 圓餅圖區塊 */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-zinc-200 w-full lg:w-[40%]">

          <h2 className="text-xl font-bold mb-4">
            持股比例
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
            <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={160}
            dataKey="value"
            fontSize={18}
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(1)}%`
            }
          >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    COLORS[index % COLORS.length]
                  }
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) =>
                `$${Number(value).toLocaleString()}`
              }
            />

           
          </PieChart>
        </ResponsiveContainer>

        </div>
        
      </div>
    </main>
  );
}