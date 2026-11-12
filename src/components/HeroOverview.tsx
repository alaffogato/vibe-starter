import React from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetCategory } from '../types/market';
import { Clock, Globe, Activity, ShieldCheck } from 'lucide-react';

interface HeroOverviewProps {
  timeframe: string;
  setTimeframe: (tf: string) => void;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({ timeframe, setTimeframe }) => {
  const { activeCategory, setActiveCategory, assets } = useMarket();

  // Calculate live market breadth metrics
  const advancing = assets.filter((a) => a.change >= 0).length;
  const declining = assets.length - advancing;
  const advanceRatio = ((advancing / assets.length) * 100).toFixed(0);

  const categories: { key: AssetCategory | 'all'; label: string; count: number }[] = [
    { key: 'all', label: 'All Markets', count: assets.length },
    { key: 'indices', label: 'Indices', count: assets.filter((a) => a.category === 'indices').length },
    { key: 'stocks', label: 'US Stocks', count: assets.filter((a) => a.category === 'stocks').length },
    { key: 'crypto', label: 'Crypto', count: assets.filter((a) => a.category === 'crypto').length },
    { key: 'forex', label: 'Forex', count: assets.filter((a) => a.category === 'forex').length },
    { key: 'futures', label: 'Futures & Commodities', count: assets.filter((a) => a.category === 'futures').length },
    { key: 'bonds', label: 'Bonds & Rates', count: assets.filter((a) => a.category === 'bonds').length },
  ];

  const timeframes = ['1D', '5D', '1M', '3M', '1Y', 'ALL'];

  return (
    <div className="pt-6 pb-4">
      {/* Editorial Title & Macro Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#E0E3EB]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#787B86] font-medium mb-1.5">
            <span className="flex items-center gap-1 text-[#089981] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse"></span>
              Live Telemetry
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              US Equities: Regular Hours
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              Crypto 24/7 Active
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#131722] tracking-tight">
            Markets overview
          </h1>
          <p className="text-sm text-[#787B86] mt-1 max-w-2xl">
            Where the world charts, chats and trades markets. Track global asset flows, key benchmark indices, equities, crypto, and currency vectors in real time.
          </p>
        </div>

        {/* Live Breadth & Macro Pulse */}
        <div className="flex items-center gap-3 bg-[#F0F3FA] p-2.5 rounded-xl border border-[#E0E3EB] text-xs shrink-0 self-start lg:self-auto">
          <div className="flex items-center gap-2 pr-3 border-r border-[#c6c6cc]">
            <Activity className="w-4 h-4 text-[#2962FF]" />
            <div>
              <div className="text-[10px] text-[#787B86] uppercase font-bold">Market Breadth</div>
              <div className="font-bold text-[#131722] tabular-nums">
                <span className="text-[#089981]">{advancing} Up</span> / <span className="text-[#F23645]">{declining} Down</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#787B86] uppercase font-bold">Bullish Ratio</div>
            <div className="font-bold text-[#131722] tabular-nums">{advanceRatio}% Green</div>
          </div>
        </div>
      </div>

      {/* Segment Pill Strip & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
        {/* Navigation Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#131722] text-white shadow-xs'
                    : 'bg-[#F0F3FA] text-[#787B86] hover:text-[#131722] hover:bg-[#E0E3EB]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-[#2962FF] text-white' : 'bg-white/80 text-[#787B86]'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time Interval Pills */}
        <div className="flex items-center gap-1 bg-[#F0F3FA] p-1 rounded-full border border-[#E0E3EB] self-start sm:self-auto shrink-0">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-white text-[#131722] shadow-xs'
                  : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
