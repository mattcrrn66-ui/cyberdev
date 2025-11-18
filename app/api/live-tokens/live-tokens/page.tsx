// app/live-tokens/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";

// --- Type Definitions ---
type LiveToken = {
  id: string;
  url: string;
  chainId: string;
  name: string;
  symbol: string;
  priceUsd: string | null;
  volume24h: number | null;
  liquidityUsd: number | null;
  imageUrl: string | null;
};

type SortKey = 'name' | 'priceUsd' | 'volume24h' | 'liquidityUsd';
type SortOrder = 'asc' | 'desc';

// --- Utility Functions ---

/**
 * Custom hook to fetch and manage live token data.
 */
function useLiveTokens() {
  const [tokens, setTokens] = useState<LiveToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the specific API endpoint you were given, but add better error checking
      const res = await fetch("https://api.dexscreener.com/latest/dex/tokens/screener");
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      if (data && data.pairs) {
        setTokens(
          data.pairs.map((p: any) => ({
            id: p.pairAddress,
            url: p.url,
            chainId: p.chainId,
            name: p.baseToken?.name || "Unknown",
            symbol: p.baseToken?.symbol || "",
            priceUsd: p.priceUsd || null,
            volume24h: p.volume?.h24 || null,
            liquidityUsd: p.liquidity?.usd || null,
            imageUrl: p.info?.imageUrl || null, // Keeping this for future image display
          }))
        );
      } else {
        // Handle case where API call succeeds but data format is unexpected
        throw new Error("Invalid data format received from API.");
      }
    } catch (err: any) {
      console.error("Live token feed error:", err);
      setError(`Failed to fetch tokens: ${err.message || 'Unknown error'}`);
      setTokens([]); // Clear tokens on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTokens();

    // Set up a refresh interval (e.g., every 30 seconds)
    const intervalId = setInterval(fetchTokens, 30000); 

    // Cleanup function
    return () => clearInterval(intervalId);
  }, []);

  return { tokens, loading, error, refreshTokens: fetchTokens };
}

/**
 * Formats a number into a dollar currency string.
 * @param value The number value.
 * @returns Formatted string or "N/A".
 */
const formatCurrency = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numberValue)) {
      return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    // Max 2 decimals for whole dollars, but up to 8 for small numbers
    maximumFractionDigits: numberValue < 1 ? 8 : 2,
    minimumFractionDigits: numberValue < 1 ? 2 : 2,
  }).format(numberValue);
};

// --- Components ---

/**
 * A reusable component to display a token card.
 */
function TokenCard({ token }: { token: LiveToken }) {
  const price = formatCurrency(token.priceUsd);
  const volume = formatCurrency(token.volume24h);
  const liquidity = formatCurrency(token.liquidityUsd);

  return (
    <a
      key={token.id}
      href={token.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-slate-800 p-4 rounded-xl shadow-lg 
                 hover:border-cyan-400 hover:shadow-cyan-900/50 
                 transition duration-300 ease-in-out bg-slate-900/50"
    >
      <div className="flex items-center mb-3">
        {/* You can implement image display here using token.imageUrl */}
        <h2 className="text-xl font-bold text-white leading-tight">
          {token.name}
          <span className="text-sm font-medium text-slate-400 ml-2">({token.symbol})</span>
        </h2>
      </div>

      <div className="space-y-1 text-sm">
        <p className="flex justify-between">
          <span className="font-semibold text-cyan-400">Price:</span>
          <span className="font-mono text-lg">{price}</span>
        </p>
        <p className="flex justify-between border-t border-slate-800 pt-1">
          <span className="text-slate-300">Volume (24h):</span>
          <span className="font-mono">{volume}</span>
        </p>
        <p className="flex justify-between border-t border-slate-800 pt-1">
          <span className="text-slate-300">Liquidity:</span>
          <span className="font-mono">{liquidity}</span>
        </p>
        <p className="text-xs text-right text-slate-500 pt-1">
          Chain: {token.chainId}
        </p>
      </div>
    </a>
  );
}

/**
 * A skeleton component to improve the loading experience.
 */
function SkeletonCard() {
  return (
    <div className="border border-slate-800 p-4 rounded-xl shadow-lg bg-slate-900/50 animate-pulse h-40">
      <div className="h-5 bg-slate-700 rounded w-3/4 mb-3"></div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-800 rounded w-full"></div>
        <div className="h-3 bg-slate-800 rounded w-1/2"></div>
        <div className="h-3 bg-slate-800 rounded w-3/5"></div>
      </div>
    </div>
  );
}

/**
 * Component for the sort button logic.
 */
function SortButton({ 
    children, 
    sortKey, 
    currentKey, 
    currentOrder, 
    onSort 
}: { 
    children: React.ReactNode, 
    sortKey: SortKey, 
    currentKey: SortKey, 
    currentOrder: SortOrder, 
    onSort: (key: SortKey) => void 
}) {
  const isCurrent = currentKey === sortKey;
  const arrow = isCurrent ? (currentOrder === 'asc' ? ' ↑' : ' ↓') : '';
  const baseClasses = "text-sm px-3 py-1 rounded transition";
  const activeClasses = isCurrent 
    ? "bg-cyan-600 text-white font-bold" 
    : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50";

  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`${baseClasses} ${activeClasses}`}
    >
      {children}{arrow}
    </button>
  );
}

// --- Main Page Component ---

export default function LiveTokensPage() {
  const { tokens, loading, error, refreshTokens } = useLiveTokens();
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, order: SortOrder }>({ 
    key: 'liquidityUsd', // Default sort: highest liquidity
    order: 'desc' 
  });

  const handleSort = (key: SortKey) => {
    setSortConfig(prevConfig => {
      // If the same key is clicked, toggle the order, otherwise default to descending
      const order: SortOrder = prevConfig.key === key && prevConfig.order === 'desc' ? 'asc' : 'desc';
      return { key, order };
    });
  };

  const sortedTokens = useMemo(() => {
    // Create a mutable copy of the tokens array
    let sortableTokens = [...tokens];
    const { key, order } = sortConfig;
  
    // Define a helper to extract the comparable value
    const getValue = (token: LiveToken, sortKey: SortKey): number | string => {
        if (sortKey === 'name') {
            return token.name.toLowerCase();
        }
        // For numerical values, safely convert to number, treating null as 0
        const val = token[sortKey];
        if (typeof val === 'string') {
            const num = parseFloat(val);
            return isNaN(num) ? 0 : num;
        }
        return val === null ? 0 : val;
    };

    sortableTokens.sort((a, b) => {
        const valA = getValue(a, key);
        const valB = getValue(b, key);

        if (typeof valA === 'string' && typeof valB === 'string') {
            // String comparison for 'name'
            return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
            // Number comparison for price, volume, liquidity
            const comparison = valA - valB;
            return order === 'asc' ? comparison : -comparison;
        }
        return 0;
    });

    return sortableTokens;
  }, [tokens, sortConfig]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10">
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-4xl font-extrabold text-cyan-400 tracking-tight">
          🚀 Live Token Feed
        </h1>
        <button 
          onClick={refreshTokens} 
          disabled={loading}
          className="bg-slate-700 hover:bg-slate-600 text-sm px-4 py-2 rounded-lg transition disabled:opacity-50"
          title="Manually refresh data"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>
      
      {/* Sort Controls */}
      <section className="mb-6 flex flex-wrap gap-2 items-center">
        <span className="text-slate-400 text-sm mr-2">Sort by:</span>
        <SortButton sortKey="name" currentKey={sortConfig.key} currentOrder={sortConfig.order} onSort={handleSort}>
            Name
        </SortButton>
        <SortButton sortKey="priceUsd" currentKey={sortConfig.key} currentOrder={sortConfig.order} onSort={handleSort}>
            Price
        </SortButton>
        <SortButton sortKey="volume24h" currentKey={sortConfig.key} currentOrder={sortConfig.order} onSort={handleSort}>
            Volume (24h)
        </SortButton>
        <SortButton sortKey="liquidityUsd" currentKey={sortConfig.key} currentOrder={sortConfig.order} onSort={handleSort}>
            Liquidity
        </SortButton>
      </section>

      {/* Content Display Area */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg mb-6 text-red-200">
          ⚠️ Error fetching data: {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Display 8 skeletons while loading */}
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : sortedTokens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedTokens.map((t) => (
            <TokenCard key={t.id} token={t} />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-400 text-lg p-10 border border-slate-800 rounded-xl">
          No tokens found or the feed is currently empty.
        </p>
      )}
    </main>
  );
}