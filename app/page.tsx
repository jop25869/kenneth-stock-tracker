"use client";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
//圓餅圖
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

  //台股美股切換
  const [market, setMarket] = useState("US");

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
        ? `${symbol}.TW`
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

    // 寫入資料庫
    await fetch("/api/stock/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      symbol: symbol.toUpperCase(),
      name: selectedStock?.name || null,

      market,
      shares: Number(shares),
      cost: Number(cost),
      currentPrice: data.price,

      userId: decoded.userId,
    })
    });

    // 重新載入持股
    await loadStocks();

    // 清空輸入框
    setSymbol("");
    setShares("");
    setCost("");
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
      shares: Number(editShares),
      cost: Number(editCost),
      currentPrice: data.price,
      userId: decoded.userId,
    }),
  });

  await loadStocks();

  setEditingSymbol("");
};
//持股排序
const moveUp = async (
  currentId: number
) => {
  const index =
    filteredStocks.findIndex(
      (s) => s.id === currentId
    );

  if (index <= 0) return;

  const target =
    filteredStocks[index - 1];

  await fetch(
    "/api/stock/reorder",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        currentId,
        targetId: target.id,
      }),
    }
  );

  await loadStocks();
};
//移動順序
const moveDown = async (
  currentId: number
) => {
  const index =
    filteredStocks.findIndex(
      (s) => s.id === currentId
    );

  if (
    index ===
    filteredStocks.length - 1
  )
    return;

  const target =
    filteredStocks[index + 1];

  await fetch(
    "/api/stock/reorder",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        currentId,
        targetId: target.id,
      }),
    }
  );

  await loadStocks();
};

  //更新股價
  const refreshPrices = async () => {
  const updatedStocks = await Promise.all(
    stocks.map(async (stock) => {
      const yahooSymbol =
    stock.market === "TW"
    ? `${stock.symbol}.TW`
    : stock.symbol;

    const response = await fetch(
      `/api/stock?symbol=${yahooSymbol}`
    );

      const data = await response.json();

      return {
        ...stock,
        currentPrice: data.price,
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

const filteredStocks = stocks.filter(
  (stock) => stock.market === market
);

  const totalCost = filteredStocks.reduce(
    (sum, stock) => sum + stock.cost * stock.shares,
    0
  );

  const totalValue = filteredStocks.reduce(
    (sum, stock) =>
      sum + stock.currentPrice * stock.shares,
    0
  );

  const totalProfit = totalValue - totalCost;

  //正負損益計算
  const totalGain = filteredStocks.reduce(
  (sum, stock) => {
    const profit =
      (stock.currentPrice - stock.cost) *
      stock.shares;

    return profit > 0
      ? sum + profit
      : sum;
  },
  0
  );

  const totalLoss = filteredStocks.reduce(
    (sum, stock) => {
      const profit =
        (stock.currentPrice - stock.cost) *
        stock.shares;

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
  
  if (!pricesLoaded) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-2xl font-bold">
        📈 正在更新即時股價...
      </div>
    </main>
    );
  }

  /* =========================
     JSX 畫面
  ========================= */

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-10">

      <div className="flex items-center mb-8">

      {/* 左邊 Logo */}
      <h1 className="text-5xl font-bold">
        📈 Stock Tracker
      </h1>

      {/* 中間切換 */}
      <div className="flex-1 flex justify-center">
        <div className="flex bg-zinc-800 rounded-xl p-1 gap-1">

          <button
            onClick={() => setMarket("US")}
            className={`px-6 py-2 rounded-lg ${
              market === "US"
                ? "bg-blue-600 text-white"
                : "hover:bg-zinc-700"
            }`}
          >
            🇺🇸 美股
          </button>

          <button
            onClick={() => setMarket("TW")}
            className={`px-6 py-2 rounded-lg ${
              market === "TW"
                ? "bg-blue-600 text-white"
                : "hover:bg-zinc-700"
            }`}
          >
            🇹🇼 台股
          </button>

        </div>
      </div>

      {/* 右邊帳號 */}
      <div className="flex items-center gap-4">
        <span className="text-zinc-400">
          👤 {userEmail}
        </span>

        <button
          onClick={logout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-500"
        >
          登出
        </button>
      </div>

    </div>

      

      {/* =========================
          新增持股
      ========================= */}

      <div className="bg-zinc-900 p-6 rounded-xl mb-6 max-w-4xl">
        <h2 className="text-xl font-bold mb-4">
          新增持股
        </h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
  <input
    
  
    className="bg-zinc-800 p-2 rounded w-64"
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
  />

  {market === "TW" &&
    searchResults.length > 0 && (
      <div className="absolute top-12 left-0 w-80 bg-zinc-800 rounded shadow-lg z-50">
        {searchResults.map((stock) => (
          <div
            key={stock.id}
            className="p-2 hover:bg-zinc-700 cursor-pointer"
            onClick={() => {
              setSymbol(stock.symbol);
              setSelectedStock(stock);
              setSearchResults([]);
            }}
          >
            {stock.symbol} - {stock.name}
          </div>
        ))}
      </div>
    )}
</div>
  {selectedStock && (
    <div className="mt-2 text-sm text-green-400">
      {selectedStock.symbol} - {selectedStock.name}
    </div>
  )}

          <input
            className="bg-zinc-800 p-2 rounded"
            placeholder="股數"
            type="number"
            value={shares}
            onChange={(e) =>
              setShares(e.target.value)
            }
          />

          <input
            className="bg-zinc-800 p-2 rounded"
            placeholder="成本"
            type="number"
            value={cost}
            onChange={(e) =>
              setCost(e.target.value)
            }
          />

          <button
            onClick={addStock}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
          >
            新增股票
          </button>
        </div>
      </div>
          
          <button
            onClick={refreshPrices}
            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 mb-4"
          >
            🔄 更新全部股價
          </button>
          
          {lastUpdate && (
            <div className="text-zinc-400 text-sm mt-2">
              最後更新：{lastUpdate}
            </div>
          )}
      {/* =========================
          Dashboard
      ========================= */}

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
        
        <div className="bg-zinc-900 p-4 rounded-xl">
          <div className="text-zinc-400 text-sm">
            總投入
          </div>
          <div className="text-2xl font-bold">
            ${formatMoney(totalCost)}
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <div className="text-zinc-400 text-sm">
            總市值
          </div>
          <div className="text-2xl font-bold">
            ${formatMoney(totalValue)}
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <div className="text-zinc-400 text-sm">
            總損益
          </div>
          <div
            className={`text-2xl font-bold ${
              totalProfit >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            ${formatMoney(totalProfit)}
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <div className="text-zinc-400 text-sm">
            總獲利
          </div>

          <div className="text-2xl font-bold text-green-400">
              ${formatMoney(totalGain)}
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <div className="text-zinc-400 text-sm">
            總虧損
          </div>

          <div className="text-2xl font-bold text-red-400">
            ${formatMoney(totalLoss)}
          </div>
        </div>


        <div className="bg-zinc-900 p-4 rounded-xl">
          <div className="text-zinc-400 text-sm">
            報酬率
          </div>
          <div
            className={`text-2xl font-bold ${
              returnRate >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {returnRate.toFixed(2)}%
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <div className="text-zinc-400 text-sm">
            🏆 最佳持股
          </div>

          <div className="text-xl font-bold text-green-400">
            {bestStock?.symbol}
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
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
        <div className="bg-zinc-900 rounded-xl p-6 shadow-lg w-full lg:w-[60%]">
        <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="w-[5%] text-left px-2 py-3">股票</th>
              <th className="w-[5%] text-center px-2 py-3">股數</th>
              <th className="w-[5%] text-right px-2 py-3">成本</th>
              <th className="w-[5%] text-right px-2 py-3">現價</th>
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
                <tr
                  key={stock.id}
                  className="border-b border-zinc-800"
                >
                  <td className="px-2 py-3">
                  <div className="font-semibold">
                    {stock.symbol}
                  </div>

                  {stock.name && (
                    <div className="text-xs text-zinc-400 truncate max-w-[180px]">
                      {stock.name}
                    </div>
                  )}
                </td>

                  <td className="px-2 py-3 text-center">
                    {editingSymbol === stock.symbol ? (
                      <input
                        className="bg-zinc-800 p-1 w-20 rounded"
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
                        className="bg-zinc-800 p-1 w-24 rounded"
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
                    className={`px-2 py-3 text-right ${
                      profit >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    ${formatMoney(profit)}
                  </td>

                  <td
                    className={`px-2 py-3 text-right ${
                      profitRate >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {profitRate.toFixed(2)}%
                  </td>
                  
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-center gap-1">

                      <button
                        onClick={() => moveUp(stock.id)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700"
                      >
                        ↑
                      </button>

                      <button
                        onClick={() => moveDown(stock.id)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700"
                      >
                        ↓
                      </button>

                      {editingSymbol === stock.symbol ? (
                        <button
                          onClick={saveEdit}
                        className="w-7 h-7 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(stock)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700"
                        >
                          ✏️
                        </button>
                      )}

                      <button
                        onClick={() => deleteStock(stock.symbol)}
                        className="
                        w-8 h-8
                        flex items-center justify-center
                        rounded-lg
                        bg-zinc-800
                        hover:bg-zinc-700
                        "
                      >
                        ❌
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        </div>
          {/* 圓餅圖區塊 */}
        <div className="bg-zinc-900 rounded-xl p-6 w-full lg:w-[40%]">

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