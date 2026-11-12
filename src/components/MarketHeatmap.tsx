import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketAsset } from '../types/market';
import { Sparkles, Layers } from 'lucide-react';

export const MarketHeatmap: React.FC = () => {
  const { assets, setSelectedAsset, setInspectAsset } = useMarket();
  const [filterMode, setFilterMode] = useState<'all' | 'stocks' | 'crypto'>('all');

  // Helper function to calculate background color and text color based on delta percentage
  const getHeatmapColor = (changePct: number): { bg: string; text: string; border: string } => {
    if (changePct >= 5.0) {
      return { bg: '#089981', text: '#ffffff', border: '#077d69' };
    } else if (changePct >= 2.0) {
      return { bg: '#10b981', text: '#ffffff', border: '#059669' };
    } else if (changePct >= 0.5) {
      return { bg: '#86efac', text: '#064e3b', border: '#4ade80' };
    } else if (changePct > -0.5) {
      return { bg: '#F0F3FA', text: '#131722', border: '#E0E3EB' };
    } else if (changePct > -2.0) {
      return { bg: '#fca5a5', text: '#7f1d1d', border: '#f87171' };
    } else if (changePct > -5.0) {
      return { bg: '#ef4444', text: '#ffffff', border: '#dc2626' };
    } else {
      return { bg: '#F23645', text: '#ffffff', border: '#b91c1c' };
    }
  };

  // Group assets into sectors
  const sectorGroups: { sector: string; assets: MarketAsset[] }[] = [
    {
      sector: 'Technology & Semiconductors',
      assets: assets.filter((a) => a.sector === 'Technology' || ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMD'].includes(a.symbol)),
    },
    {
      sector: 'Consumer & Retail',
      assets: assets.filter((a) => a.sector === 'Consumer Cyclical' || ['AMZN', 'TSLA'].includes(a.symbol)),
    },
    {
      sector: 'Financials & Healthcare',
      assets: assets.filter((a) => ['JPM', 'LLY'].includes(a.symbol)),
    },
    {
      sector: 'Cryptocurrency Benchmarks',
      assets: assets.filter((a) => a.category === 'crypto'),
    },
    {
      sector: 'Commodities & Energy',
      assets: assets.filter((a) => a.category === 'futures'),
    },
  ];

  const filteredGroups = sectorGroups.filter((g) => {
    if (filterMode === 'stocks') return !g.sector.includes('Crypto') && !g.sector.includes('Commodities');
    if (filterMode === 'crypto') return g.sector.includes('Crypto');
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-[#E0E3EB] p-4 sm:p-5 mb-8 shadow-xs">
      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E0E3EB] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2962FF]" />
            <h2 className="font-heading font-bold text-base sm:text-lg text-[#131722]">
              Market Sector Heatmap
            </h2>
          </div>
          <p className="text-xs text-[#787B86] mt-0.5">
            Visual matrix of asset performance grouped by industrial sector. Click any tile to inspect and chart.
          </p>
        </div>

        {/* Filter buttons & Legend */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-[#F0F3FA] p-0.5 rounded-lg border border-[#E0E3EB] text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                filterMode === 'all' ? 'bg-[#131722] text-white' : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              All Sectors
            </button>
            <button
              onClick={() => setFilterMode('stocks')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                filterMode === 'stocks' ? 'bg-[#131722] text-white' : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              Equities
            </button>
            <button
              onClick={() => setFilterMode('crypto')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                filterMode === 'crypto' ? 'bg-[#131722] text-white' : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              Crypto
            </button>
          </div>

          {/* Color Scale Legend */}
          <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono text-[#787B86]">
            <span>-5%</span>
            <div className="w-3.5 h-3.5 rounded-xs bg-[#F23645]" title="-5%" />
            <div className="w-3.5 h-3.5 rounded-xs bg-[#fca5a5]" title="-1%" />
            <div className="w-3.5 h-3.5 rounded-xs bg-[#F0F3FA]" title="0%" />
            <div className="w-3.5 h-3.5 rounded-xs bg-[#86efac]" title="+1%" />
            <div className="w-3.5 h-3.5 rounded-xs bg-[#089981]" title="+5%" />
            <span>+5%</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {filteredGroups.map((group) => {
          if (group.assets.length === 0) return null;
          return (
            <div
              key={group.sector}
              className="bg-[#F0F3FA]/40 rounded-xl p-3 border border-[#E0E3EB] flex flex-col justify-between"
            >
              <div className="text-xs font-bold text-[#131722] uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>{group.sector}</span>
                <span className="text-[10px] text-[#787B86] font-normal lowercase">
                  {group.assets.length} assets
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {group.assets.map((asset) => {
                  const colors = getHeatmapColor(asset.changePercent);
                  const isPos = asset.changePercent >= 0;

                  return (
                    <div
                      key={asset.symbol}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setInspectAsset(asset);
                      }}
                      className="p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs flex flex-col justify-between min-h-[82px]"
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                        borderColor: colors.border,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-extrabold text-sm tracking-wider">
                          {asset.symbol}
                        </span>
                        <span className="text-[10px] uppercase font-semibold opacity-80">
                          {asset.exchange}
                        </span>
                      </div>

                      <div className="mt-1">
                        <div className="text-[11px] truncate opacity-90">
                          {asset.name}
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="font-heading font-extrabold text-sm tabular-nums">
                            {isPos ? '+' : ''}
                            {asset.changePercent.toFixed(2)}%
                          </span>
                          <span className="text-[11px] font-mono tabular-nums opacity-90">
                            ${asset.price > 100 ? asset.price.toFixed(1) : asset.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
