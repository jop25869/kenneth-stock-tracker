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
} from "recharts";

/* =========================
   股票資料型別
========================= */
type Stock = {
  symbol: string;
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
  const [stocks, setStocks] =
  useState<Stock[]>([]);

  // 新增股票輸入框
  const [symbol, setSymbol] = useState("");
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
  const addStock = async () => {
    if (!symbol || !shares || !cost) return;

    // 抓現價
    const response = await fetch(
      `/api/stock?symbol=${symbol.toUpperCase()}`
    );

    const data = await response.json();

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
        shares: Number(shares),
        cost: Number(cost),
        currentPrice: data.price,
        userId: decoded.userId,
      }),
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

  //更新股價
  const refreshPrices = async () => {
  const updatedStocks = await Promise.all(
    stocks.map(async (stock) => {
      const response = await fetch(
        `/api/stock?symbol=${stock.symbol}`
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

  //防止未登入直接進入首頁
  useEffect(() => {
  const token =
    localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  const decoded =
    jwtDecode<TokenPayload>(token);

  setUserEmail(decoded.email);

  loadStocks();
  }, []);
  
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

  const totalCost = stocks.reduce(
    (sum, stock) => sum + stock.cost * stock.shares,
    0
  );

  const totalValue = stocks.reduce(
    (sum, stock) =>
      sum + stock.currentPrice * stock.shares,
    0
  );

  const totalProfit = totalValue - totalCost;

  //正負損益計算
  const totalGain = stocks.reduce(
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

  const totalLoss = stocks.reduce(
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
  const pieData = stocks.map((stock) => ({
  name: stock.symbol,
  value: stock.currentPrice * stock.shares,
  }));

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
  const bestStock = [...stocks].sort(
  (a, b) =>
    (b.currentPrice - b.cost) * b.shares -
    (a.currentPrice - a.cost) * a.shares
  )[0];

  //最差持股
  const worstStock = [...stocks].sort(
  (a, b) =>
    (a.currentPrice - a.cost) * a.shares -
    (b.currentPrice - b.cost) * b.shares
  )[0];
  
  /* =========================
     JSX 畫面
  ========================= */

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-10">

      <div className="flex justify-end items-center gap-4 mb-4">
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

      <h1 className="text-5xl font-bold mb-8">
        📈 Stock Tracker
      </h1>

      {/* =========================
          新增持股
      ========================= */}

      <div className="bg-zinc-900 p-6 rounded-xl mb-6 max-w-4xl">
        <h2 className="text-xl font-bold mb-4">
          新增持股
        </h2>

        <div className="flex gap-4 flex-wrap">
          <input
            className="bg-zinc-800 p-2 rounded"
            placeholder="股票代號"
            value={symbol}
            onChange={(e) =>
              setSymbol(e.target.value)
            }
          />

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

      <div className="grid grid-cols-8 gap-4 mb-6">
        
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
            ${totalGain.toFixed(2)}
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <div className="text-zinc-400 text-sm">
            總虧損
          </div>

          <div className="text-2xl font-bold text-red-400">
            ${totalLoss.toFixed(2)}
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
      
      <div className="flex gap-6 items-start">
        <div className="bg-zinc-900 rounded-xl p-6 shadow-lg w-[50%]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left p-3">股票</th>
              <th className="text-left p-3">股數</th>
              <th className="text-left p-3">成本</th>
              <th className="text-left p-3">現價</th>
              <th className="text-left p-3">損益</th>
              <th className="text-left p-3">報酬率</th>
              <th className="text-left p-3">操作</th>
            </tr>
          </thead>

          <tbody>
            {stocks.map((stock) => {
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
                  key={stock.symbol}
                  className="border-b border-zinc-800"
                >
                  <td className="p-3">
                    {stock.symbol}
                  </td>

                  <td className="p-3">
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

                  <td className="p-3">
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

                  <td className="p-3">
                    ${stock.currentPrice}
                  </td>

                  
                  <td
                    className={`p-3 ${
                      profit >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    ${formatMoney(profit)}
                  </td>

                  
                  <td
                    className={`p-3 ${
                      profitRate >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {profitRate.toFixed(2)}%
                  </td>

                  <td className="p-3 flex gap-2">
                    {editingSymbol ===
                    stock.symbol ? (
                      <button
                        onClick={saveEdit}
                        className="bg-blue-600 px-3 py-1 rounded"
                      >
                        儲存
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          startEdit(stock)
                        }
                        className="bg-yellow-600 px-3 py-1 rounded"
                      >
                        編輯
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteStock(stock.symbol)
                      }
                      className="bg-red-600 px-3 py-1 rounded"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
          {/* 圓餅圖區塊 */}
        <div className="bg-zinc-900 rounded-xl p-6 w-[50%]">
                <div className="bg-zinc-900 rounded-xl p-6 w-[50%]">

          <h2 className="text-xl font-bold mb-4">
            持股比例
          </h2>

          <PieChart width={700} height={600}>
            <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={250}
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

        </div>
        </div>
      </div>
    </main>
  );
}