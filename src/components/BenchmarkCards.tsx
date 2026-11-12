import React from 'react';
import { useMarket } from '../context/MarketContext';
import { Sparkline } from './Sparkline';
import { Bookmark, ExternalLink } from 'lucide-react';
import { MarketAsset } from '../types/market';

export const BenchmarkCards: React.FC = () => {
  const {
    assets,
    selectedAsset,
    setSelectedAsset,
    setInspectAsset,
    watchlist,
    toggleWatchlist,
    tickerFlashes,
  } = useMarket();

  // Find 6 premier benchmarks
  const benchmarkSymbols = ['SPX', 'NDX', 'BTCUSD', 'US10Y', 'XAUUSD', 'EURUSD'];
  const benchmarks = benchmarkSymbols
    .map((sym) => assets.find((a) => a.symbol === sym))
    .filter(Boolean) as MarketAsset[];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 py-3">
      {benchmarks.map((asset) => {
        const isSelected = selectedAsset.symbol === asset.symbol;
        const isPos = asset.change >= 0;
        const flash = tickerFlashes[asset.symbol];
        const isBookmarked = watchlist.includes(asset.symbol);

        return (
          <div
            key={asset.symbol}
            onClick={() => setSelectedAsset(asset)}
            className={`group relative bg-white rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between hover:shadow-sm ${
              isSelected
                ? 'border-[#2962FF] ring-2 ring-[#2962FF]/15 shadow-xs'
                : 'border-[#E0E3EB] hover:border-[#787B86]/40'
            } ${
              flash === 'up'
                ? 'tick-flash-up'
                : flash === 'down'
                ? 'tick-flash-down'
                : ''
            }`}
          >
            {/* Top row: Avatar & Symbol + Bookmark */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: asset.iconBg || '#131722' }}
                >
                  {asset.iconText || asset.symbol.slice(0, 3)}
                </div>
                <div>
                  <div className="font-heading font-bold text-xs text-[#131722] tracking-wider uppercase flex items-center gap-1">
                    {asset.symbol}
                  </div>
                  <div className="text-[11px] text-[#787B86] truncate max-w-[80px]">
                    {asset.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWatchlist(asset.symbol);
                  }}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isBookmarked
                      ? 'text-[#2962FF] hover:bg-[#F0F3FA]'
                      : 'text-transparent group-hover:text-[#787B86] hover:bg-[#F0F3FA]'
                  }`}
                  title={isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  <Bookmark
                    className="w-3.5 h-3.5"
                    fill={isBookmarked ? '#2962FF' : 'none'}
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectAsset(asset);
                  }}
                  className="p-1 rounded-md text-transparent group-hover:text-[#787B86] hover:bg-[#F0F3FA] transition-colors cursor-pointer"
                  title="Inspect Details"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Price & Delta Badge */}
            <div className="my-1.5">
              <div className="font-heading font-bold text-[15px] sm:text-[16px] text-[#131722] tabular-nums tracking-tight">
                {asset.price > 100
                  ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : asset.price.toFixed(asset.price < 1 ? 4 : 2)}
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${
                    isPos
                      ? 'bg-[#E6F5F2] text-[#089981]'
                      : 'bg-[#FDEBED] text-[#F23645]'
                  }`}
                >
                  {isPos ? '+' : '−'}
                  {Math.abs(asset.changePercent).toFixed(2)}%
                </span>
                <span className="text-[10px] text-[#787B86] tabular-nums font-mono">
                  {isPos ? '+' : ''}
                  {asset.change.toFixed(asset.price < 1 ? 4 : 2)}
                </span>
              </div>
            </div>

            {/* Sparkline vector */}
            <div className="pt-2 mt-auto">
              <Sparkline
                data={asset.sparkline}
                width={120}
                height={28}
                isPositive={isPos}
                className="w-full h-7"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
