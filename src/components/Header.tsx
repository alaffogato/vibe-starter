import React from 'react';
import { useMarket } from '../context/MarketContext';
import { Search, Bookmark, TrendingUp, BarChart2, Grid, Lightbulb, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    assets,
    setSelectedAsset,
    setInspectAsset,
    setIsSearchOpen,
    watchlist,
    setIsWatchlistOpen,
    portfolio,
    totalPortfolioValue,
    cashBalance,
    activeViewTab,
    setActiveViewTab,
    tickerFlashes,
  } = useMarket();

  // Top marquee assets (12 major assets)
  const marqueeAssets = assets.slice(0, 14);

  // Compute portfolio unrealized P&L
  const initialCapital = 100000;
  const totalPnL = totalPortfolioValue - initialCapital;
  const totalPnLPct = (totalPnL / initialCapital) * 100;
  const isPnLPositive = totalPnL >= 0;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E0E3EB]">
      {/* 1. Real-time Marquee Ticker Tape */}
      <div className="bg-[#131722] text-[#F0F3FA] text-xs h-8 border-b border-[#252936] overflow-hidden relative flex items-center">
        <div className="flex animate-marquee hover:pause whitespace-nowrap">
          {[...marqueeAssets, ...marqueeAssets].map((asset, i) => {
            const isPos = asset.change >= 0;
            const flash = tickerFlashes[asset.symbol];
            return (
              <button
                key={`${asset.symbol}-${i}`}
                onClick={() => {
                  setSelectedAsset(asset);
                  setInspectAsset(asset);
                }}
                className={`inline-flex items-center gap-2 px-4 py-1 border-r border-[#252936] hover:bg-[#1f2433] transition-colors cursor-pointer text-left ${
                  flash === 'up' ? 'bg-[#089981]/20' : flash === 'down' ? 'bg-[#F23645]/20' : ''
                }`}
              >
                <span className="font-semibold text-white tracking-wider text-[11px] uppercase">
                  {asset.symbol}
                </span>
                <span className="tabular-nums font-mono text-[12px] text-gray-200">
                  {asset.price > 100
                    ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : asset.price.toFixed(asset.price < 1 ? 4 : 2)}
                </span>
                <span
                  className={`inline-flex items-center text-[10px] font-medium tabular-nums ${
                    isPos ? 'text-[#089981]' : 'text-[#F23645]'
                  }`}
                >
                  {isPos ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand & Platform */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setActiveViewTab('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* TradingView-inspired technical diamond mark */}
            <div className="w-8 h-8 rounded-lg bg-[#131722] flex items-center justify-center text-white shadow-sm group-hover:bg-[#2962FF] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 18L10 12L14 16L20 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="8" r="2" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-[16px] tracking-tight text-[#131722]">
                  APEX
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#2962FF] px-1.5 py-0.5 rounded">
                  Markets
                </span>
              </div>
              <div className="text-[10px] text-[#787B86] font-medium hidden sm:block -mt-0.5">
                Real-Time Telemetry
              </div>
            </div>
          </div>

          {/* Navigation View Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveViewTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeViewTab === 'overview'
                  ? 'bg-[#131722] text-white shadow-xs'
                  : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Overview
            </button>
            <button
              onClick={() => setActiveViewTab('screener')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeViewTab === 'screener'
                  ? 'bg-[#131722] text-white shadow-xs'
                  : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Screener & Tables
            </button>
            <button
              onClick={() => setActiveViewTab('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeViewTab === 'heatmap'
                  ? 'bg-[#131722] text-white shadow-xs'
                  : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Sector Heatmap
            </button>
            <button
              onClick={() => setActiveViewTab('ideas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeViewTab === 'ideas'
                  ? 'bg-[#131722] text-white shadow-xs'
                  : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              News & Ideas
            </button>
          </nav>
        </div>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Button (Ctrl+K trigger) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 h-9 bg-[#F0F3FA] hover:bg-[#E0E3EB] border border-[#E0E3EB] text-[#787B86] hover:text-[#131722] rounded-full text-xs transition-colors cursor-pointer w-40 sm:w-56 justify-between"
            aria-label="Search markets and symbols"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 shrink-0 text-[#787B86]" />
              <span className="truncate">Search symbol, asset...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#787B86] bg-white border border-[#c6c6cc] rounded">
              ⌘K
            </kbd>
          </button>

          {/* Watchlist Toggle */}
          <button
            onClick={() => setIsWatchlistOpen(true)}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#F0F3FA] hover:bg-[#E0E3EB] text-[#131722] border border-[#E0E3EB] transition-colors cursor-pointer"
            title="Open Watchlist"
            aria-label="Open Watchlist"
          >
            <Bookmark className="w-4 h-4" />
            {watchlist.length > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-[#2962FF] rounded-full">
                {watchlist.length}
              </span>
            )}
          </button>

          {/* Paper Trading Portfolio Widget */}
          <button
            onClick={() => setIsWatchlistOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 h-9 bg-white hover:bg-[#F0F3FA] border border-[#E0E3EB] rounded-full text-xs cursor-pointer transition-all"
            title="Paper Trading Portfolio"
          >
            <div className="w-5 h-5 rounded-full bg-[#E6F5F2] flex items-center justify-center text-[#089981]">
              <Wallet className="w-3 h-3" />
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-[10px] text-[#787B86] uppercase font-semibold leading-none">
                Paper Equity
              </div>
              <div className="text-[12px] font-bold text-[#131722] tabular-nums leading-tight">
                ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <span
              className={`text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                isPnLPositive
                  ? 'bg-[#E6F5F2] text-[#089981]'
                  : 'bg-[#FDEBED] text-[#F23645]'
              }`}
            >
              {isPnLPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {isPnLPositive ? '+' : ''}
              {totalPnLPct.toFixed(1)}%
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
