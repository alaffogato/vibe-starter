import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AssetCategory, MarketAsset, PortfolioPosition } from '../types/market';
import { INITIAL_ASSETS } from '../data/marketData';

interface MarketContextType {
  assets: MarketAsset[];
  selectedAsset: MarketAsset;
  setSelectedAsset: (asset: MarketAsset) => void;
  activeCategory: AssetCategory | 'all';
  setActiveCategory: (cat: AssetCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  inspectAsset: MarketAsset | null;
  setInspectAsset: (asset: MarketAsset | null) => void;
  watchlist: string[];
  toggleWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  portfolio: PortfolioPosition[];
  cashBalance: number;
  totalPortfolioValue: number;
  executeOrder: (symbol: string, side: 'buy' | 'sell', shares: number) => { success: boolean; message: string };
  closePosition: (symbol: string) => void;
  isWatchlistOpen: boolean;
  setIsWatchlistOpen: (open: boolean) => void;
  activeViewTab: 'overview' | 'screener' | 'heatmap' | 'ideas';
  setActiveViewTab: (tab: 'overview' | 'screener' | 'heatmap' | 'ideas') => void;
  tickerFlashes: Record<string, 'up' | 'down'>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(INITIAL_ASSETS[0]);
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [inspectAsset, setInspectAsset] = useState<MarketAsset | null>(null);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'overview' | 'screener' | 'heatmap' | 'ideas'>('overview');
  
  // Watchlist persisted in localStorage or default list
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_watchlist');
      return saved ? JSON.parse(saved) : ['SPX', 'NVDA', 'AAPL', 'BTCUSD', 'SOLUSD', 'US10Y'];
    } catch {
      return ['SPX', 'NVDA', 'AAPL', 'BTCUSD', 'SOLUSD', 'US10Y'];
    }
  });

  // Paper trading portfolio
  const [cashBalance, setCashBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('apex_cash');
      return saved ? parseFloat(saved) : 100000;
    } catch {
      return 100000;
    }
  });

  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>(() => {
    try {
      const saved = localStorage.getItem('apex_portfolio');
      return saved ? JSON.parse(saved) : [
        {
          symbol: 'NVDA',
          side: 'buy',
          shares: 50,
          avgEntryPrice: 142.50,
          totalCost: 7125.00,
          openedAt: '2026-11-10T14:30:00Z',
        },
        {
          symbol: 'BTCUSD',
          side: 'buy',
          shares: 0.25,
          avgEntryPrice: 89200.00,
          totalCost: 22300.00,
          openedAt: '2026-11-09T09:15:00Z',
        }
      ];
    } catch {
      return [];
    }
  });

  const [tickerFlashes, setTickerFlashes] = useState<Record<string, 'up' | 'down'>>({});

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('apex_watchlist', JSON.stringify(watchlist));
    } catch {
      // ignore
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem('apex_portfolio', JSON.stringify(portfolio));
      localStorage.setItem('apex_cash', cashBalance.toString());
    } catch {
      // ignore
    }
  }, [portfolio, cashBalance]);

  // Global keyboard shortcut for search (Ctrl+K or Command+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time market tick simulation (subtle realistic fluctuation)
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prevAssets) => {
        // Pick 2-3 random assets to tick
        const count = Math.floor(Math.random() * 2) + 1;
        const indicesToTick = new Set<number>();
        while (indicesToTick.size < count) {
          indicesToTick.add(Math.floor(Math.random() * prevAssets.length));
        }

        const newFlashes: Record<string, 'up' | 'down'> = {};

        const updated = prevAssets.map((asset, idx) => {
          if (!indicesToTick.has(idx)) return asset;

          // Fluctuation between -0.3% and +0.3%
          const pctDelta = (Math.random() - 0.48) * 0.003;
          const priceChange = asset.price * pctDelta;
          const newPrice = Math.max(asset.price + priceChange, 0.0001);
          const precision = asset.price > 100 ? 2 : asset.price > 1 ? 2 : 4;
          const formattedPrice = Number(newPrice.toFixed(precision));
          const newAbsChange = Number((asset.change + priceChange).toFixed(precision));
          const newChangePct = Number(((newAbsChange / asset.previousClose) * 100).toFixed(2));

          const direction = priceChange >= 0 ? 'up' : 'down';
          newFlashes[asset.symbol] = direction;

          // Update sparkline tail
          const updatedSparkline = [...asset.sparkline.slice(1), formattedPrice];

          // Also update last candle close
          const updatedCandles = [...asset.candles];
          if (updatedCandles.length > 0) {
            const lastCandle = { ...updatedCandles[updatedCandles.length - 1] };
            lastCandle.close = formattedPrice;
            lastCandle.high = Math.max(lastCandle.high, formattedPrice);
            lastCandle.low = Math.min(lastCandle.low, formattedPrice);
            updatedCandles[updatedCandles.length - 1] = lastCandle;
          }

          const updatedAsset: MarketAsset = {
            ...asset,
            price: formattedPrice,
            change: newAbsChange,
            changePercent: newChangePct,
            high24h: Math.max(asset.high24h, formattedPrice),
            low24h: Math.min(asset.low24h, formattedPrice),
            sparkline: updatedSparkline,
            candles: updatedCandles,
          };

          return updatedAsset;
        });

        if (Object.keys(newFlashes).length > 0) {
          setTickerFlashes((prev) => ({ ...prev, ...newFlashes }));
          // Clear flash after 800ms
          setTimeout(() => {
            setTickerFlashes((prev) => {
              const cleaned = { ...prev };
              Object.keys(newFlashes).forEach((sym) => delete cleaned[sym]);
              return cleaned;
            });
          }, 800);
        }

        return updated;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Keep selectedAsset and inspectAsset synced with price ticks
  useEffect(() => {
    const current = assets.find((a) => a.symbol === selectedAsset.symbol);
    if (current && current.price !== selectedAsset.price) {
      setSelectedAsset(current);
    }
    if (inspectAsset) {
      const currentInspect = assets.find((a) => a.symbol === inspectAsset.symbol);
      if (currentInspect && currentInspect.price !== inspectAsset.price) {
        setInspectAsset(currentInspect);
      }
    }
  }, [assets, selectedAsset.symbol, inspectAsset]);

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  }, []);

  const isInWatchlist = useCallback(
    (symbol: string) => watchlist.includes(symbol),
    [watchlist]
  );

  // Total portfolio market value calculation
  const totalPortfolioValue = useMemo(() => {
    let positionValue = 0;
    portfolio.forEach((pos) => {
      const asset = assets.find((a) => a.symbol === pos.symbol);
      const currentPrice = asset ? asset.price : pos.avgEntryPrice;
      positionValue += pos.shares * currentPrice;
    });
    return cashBalance + positionValue;
  }, [portfolio, cashBalance, assets]);

  // Execute paper trade order
  const executeOrder = useCallback(
    (symbol: string, side: 'buy' | 'sell', shares: number): { success: boolean; message: string } => {
      const asset = assets.find((a) => a.symbol === symbol);
      if (!asset) return { success: false, message: 'Instrument not found' };
      if (shares <= 0) return { success: false, message: 'Quantity must be greater than zero' };

      const orderTotal = asset.price * shares;

      if (side === 'buy') {
        if (orderTotal > cashBalance) {
          return { success: false, message: `Insufficient cash ($${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })})` };
        }

        setCashBalance((prev) => prev - orderTotal);
        setPortfolio((prev) => {
          const existing = prev.find((p) => p.symbol === symbol && p.side === 'buy');
          if (existing) {
            const newShares = existing.shares + shares;
            const newTotalCost = existing.totalCost + orderTotal;
            const newAvgPrice = newTotalCost / newShares;
            return prev.map((p) =>
              p === existing
                ? { ...p, shares: newShares, totalCost: newTotalCost, avgEntryPrice: newAvgPrice }
                : p
            );
          } else {
            return [
              ...prev,
              {
                symbol,
                side: 'buy',
                shares,
                avgEntryPrice: asset.price,
                totalCost: orderTotal,
                openedAt: new Date().toISOString(),
              },
            ];
          }
        });

        return { success: true, message: `Executed BUY ${shares} ${symbol} @ $${asset.price.toFixed(2)}` };
      } else {
        // Sell
        const existing = portfolio.find((p) => p.symbol === symbol && p.side === 'buy');
        if (!existing || existing.shares < shares) {
          return { success: false, message: `You hold only ${existing ? existing.shares : 0} shares of ${symbol}` };
        }

        const proceedTotal = asset.price * shares;
        setCashBalance((prev) => prev + proceedTotal);

        setPortfolio((prev) => {
          return prev
            .map((p) => {
              if (p.symbol === symbol && p.side === 'buy') {
                const remaining = p.shares - shares;
                if (remaining <= 0.000001) return null;
                const ratio = remaining / p.shares;
                return { ...p, shares: remaining, totalCost: p.totalCost * ratio };
              }
              return p;
            })
            .filter(Boolean) as PortfolioPosition[];
        });

        return { success: true, message: `Executed SELL ${shares} ${symbol} @ $${asset.price.toFixed(2)}` };
      }
    },
    [assets, cashBalance, portfolio]
  );

  const closePosition = useCallback(
    (symbol: string) => {
      const pos = portfolio.find((p) => p.symbol === symbol);
      if (!pos) return;
      executeOrder(symbol, 'sell', pos.shares);
    },
    [portfolio, executeOrder]
  );

  return (
    <MarketContext.Provider
      value={{
        assets,
        selectedAsset,
        setSelectedAsset,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        inspectAsset,
        setInspectAsset,
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        portfolio,
        cashBalance,
        totalPortfolioValue,
        executeOrder,
        closePosition,
        isWatchlistOpen,
        setIsWatchlistOpen,
        activeViewTab,
        setActiveViewTab,
        tickerFlashes,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = (): MarketContextType => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
