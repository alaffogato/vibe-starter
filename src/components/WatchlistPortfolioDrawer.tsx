import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Sparkline } from './Sparkline';
import { X, Bookmark, Wallet, TrendingUp, TrendingDown, Trash2, RotateCcw, ArrowRight } from 'lucide-react';

export const WatchlistPortfolioDrawer: React.FC = () => {
  const {
    isWatchlistOpen,
    setIsWatchlistOpen,
    watchlist,
    toggleWatchlist,
    assets,
    setSelectedAsset,
    setInspectAsset,
    portfolio,
    cashBalance,
    totalPortfolioValue,
    closePosition,
    setIsSearchOpen,
  } = useMarket();

  const [activeTab, setActiveTab] = useState<'watchlist' | 'portfolio'>('watchlist');

  if (!isWatchlistOpen) return null;

  const watchlistAssets = watchlist
    .map((sym) => assets.find((a) => a.symbol === sym))
    .filter(Boolean);

  const initialCapital = 100000;
  const totalPnL = totalPortfolioValue - initialCapital;
  const totalPnLPct = (totalPnL / initialCapital) * 100;
  const isPnLPositive = totalPnL >= 0;

  const handleResetPortfolio = () => {
    localStorage.removeItem('apex_portfolio');
    localStorage.removeItem('apex_cash');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#131722]/40 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#E0E3EB] animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E0E3EB] flex items-center justify-between">
          <div className="flex items-center bg-[#F0F3FA] p-1 rounded-lg border border-[#E0E3EB]">
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'watchlist'
                  ? 'bg-[#131722] text-white shadow-xs'
                  : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Watchlist ({watchlist.length})
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'portfolio'
                  ? 'bg-[#131722] text-white shadow-xs'
                  : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              Portfolio ({portfolio.length})
            </button>
          </div>

          <button
            onClick={() => setIsWatchlistOpen(false)}
            className="p-1.5 rounded-lg text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'watchlist' ? (
            <div>
              {watchlistAssets.length === 0 ? (
                <div className="py-16 text-center text-[#787B86]">
                  <Bookmark className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p className="text-sm font-semibold text-[#131722]">Your watchlist is empty</p>
                  <p className="text-xs text-[#787B86] mt-1 max-w-xs mx-auto">
                    Click the bookmark icon on any market table row or benchmark card to track instruments.
                  </p>
                  <button
                    onClick={() => {
                      setIsWatchlistOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="mt-4 px-4 py-2 bg-[#131722] text-white text-xs font-semibold rounded-full hover:bg-[#2962FF] transition-colors cursor-pointer"
                  >
                    Browse Symbols
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {watchlistAssets.map((asset) => {
                    if (!asset) return null;
                    const isPos = asset.change >= 0;

                    return (
                      <div
                        key={asset.symbol}
                        onClick={() => {
                          setSelectedAsset(asset);
                          setInspectAsset(asset);
                        }}
                        className="p-3 bg-[#F0F3FA]/50 hover:bg-[#F0F3FA] rounded-xl border border-[#E0E3EB] transition-colors cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                            style={{ backgroundColor: asset.iconBg || '#131722' }}
                          >
                            {asset.iconText || asset.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-heading font-bold text-xs text-[#131722]">
                                {asset.symbol}
                              </span>
                              <span className="text-[9px] uppercase font-semibold text-[#787B86] bg-white border border-[#E0E3EB] px-1 py-0.2 rounded">
                                {asset.exchange}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#787B86] truncate max-w-[120px]">
                              {asset.name}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Sparkline
                            data={asset.sparkline}
                            width={54}
                            height={20}
                            isPositive={isPos}
                          />

                          <div className="text-right">
                            <div className="text-xs font-semibold tabular-nums text-[#131722]">
                              ${asset.price > 100 ? asset.price.toFixed(2) : asset.price.toFixed(4)}
                            </div>
                            <div
                              className={`text-[10px] font-semibold tabular-nums ${
                                isPos ? 'text-[#089981]' : 'text-[#F23645]'
                              }`}
                            >
                              {isPos ? '+' : ''}
                              {asset.changePercent.toFixed(2)}%
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(asset.symbol);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-[#787B86] hover:text-[#F23645] transition-opacity cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Account Balance Card */}
              <div className="bg-[#131722] text-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>Net Portfolio Value</span>
                  <span className="text-[10px] uppercase font-bold text-[#089981] bg-[#089981]/20 px-1.5 py-0.5 rounded">
                    Simulated
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums mt-1">
                  ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-gray-700/80 text-xs">
                  <div>
                    <span className="text-gray-400 text-[11px] block">Cash Balance</span>
                    <span className="font-semibold font-mono tabular-nums">
                      ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block">Unrealized P&L</span>
                    <span
                      className={`font-semibold font-mono tabular-nums flex items-center gap-0.5 ${
                        isPnLPositive ? 'text-[#089981]' : 'text-[#F23645]'
                      }`}
                    >
                      {isPnLPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPnLPositive ? '+' : ''}${totalPnL.toFixed(2)} ({isPnLPositive ? '+' : ''}
                      {totalPnLPct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Positions List */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#131722] uppercase tracking-wider mb-2">
                  <span>Active Positions ({portfolio.length})</span>
                  <button
                    onClick={handleResetPortfolio}
                    className="flex items-center gap-1 text-[10px] text-[#787B86] hover:text-[#131722] cursor-pointer"
                    title="Reset to $100k"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                {portfolio.length === 0 ? (
                  <div className="py-12 text-center text-[#787B86] text-xs">
                    No active positions. Execute a trade in the asset dossier to open a position.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {portfolio.map((pos) => {
                      const asset = assets.find((a) => a.symbol === pos.symbol);
                      const currentPrice = asset ? asset.price : pos.avgEntryPrice;
                      const currentValue = pos.shares * currentPrice;
                      const pnl = currentValue - pos.totalCost;
                      const pnlPct = (pnl / pos.totalCost) * 100;
                      const posIsPositive = pnl >= 0;

                      return (
                        <div
                          key={pos.symbol}
                          className="bg-white p-3 rounded-xl border border-[#E0E3EB] shadow-xs text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-extrabold text-sm text-[#131722]">
                                {pos.symbol}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-white bg-[#089981] px-1.5 py-0.2 rounded">
                                {pos.side}
                              </span>
                            </div>
                            <span className="font-mono text-xs text-[#787B86] tabular-nums">
                              {pos.shares} shares @ ${pos.avgEntryPrice.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-[#F0F3FA]">
                            <div>
                              <span className="text-[10px] text-[#787B86] block">Market Value</span>
                              <span className="font-semibold text-xs text-[#131722] font-mono tabular-nums">
                                ${currentValue.toFixed(2)}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-[#787B86] block">P&L</span>
                              <span
                                className={`font-semibold text-xs font-mono tabular-nums ${
                                  posIsPositive ? 'text-[#089981]' : 'text-[#F23645]'
                                }`}
                              >
                                {posIsPositive ? '+' : ''}${pnl.toFixed(2)} ({posIsPositive ? '+' : ''}
                                {pnlPct.toFixed(1)}%)
                              </span>
                            </div>
                          </div>

                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => closePosition(pos.symbol)}
                              className="px-2.5 py-1 bg-[#FDEBED] hover:bg-[#F23645] text-[#F23645] hover:text-white text-[11px] font-semibold rounded transition-colors cursor-pointer"
                            >
                              Close Position
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
