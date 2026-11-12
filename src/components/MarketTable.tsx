import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { Sparkline } from './Sparkline';
import { Bookmark, ArrowUpDown, ExternalLink } from 'lucide-react';
import { MarketAsset } from '../types/market';

type TableTab = 'active' | 'gainers' | 'losers' | 'crypto' | 'forex' | 'futures' | 'bonds';
type SortField = 'symbol' | 'price' | 'changePercent' | 'volumeRaw' | 'marketCapRaw';

export const MarketTable: React.FC = () => {
  const {
    assets,
    selectedAsset,
    setSelectedAsset,
    setInspectAsset,
    watchlist,
    toggleWatchlist,
    tickerFlashes,
  } = useMarket();

  const [activeTab, setActiveTab] = useState<TableTab>('active');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter assets based on activeTab
  const tabAssets = useMemo(() => {
    switch (activeTab) {
      case 'active':
        // Equities and major indices sorted by volume
        return [...assets].sort((a, b) => b.volumeRaw - a.volumeRaw);
      case 'gainers':
        return [...assets].filter((a) => a.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
      case 'losers':
        return [...assets].filter((a) => a.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);
      case 'crypto':
        return assets.filter((a) => a.category === 'crypto');
      case 'forex':
        return assets.filter((a) => a.category === 'forex');
      case 'futures':
        return assets.filter((a) => a.category === 'futures');
      case 'bonds':
        return assets.filter((a) => a.category === 'bonds');
      default:
        return assets;
    }
  }, [assets, activeTab]);

  // Sort tabAssets
  const sortedAssets = useMemo(() => {
    return [...tabAssets].sort((a, b) => {
      let diff = 0;
      if (sortField === 'symbol') diff = a.symbol.localeCompare(b.symbol);
      else if (sortField === 'price') diff = a.price - b.price;
      else if (sortField === 'changePercent') diff = a.changePercent - b.changePercent;
      else if (sortField === 'volumeRaw') diff = a.volumeRaw - b.volumeRaw;
      else if (sortField === 'marketCapRaw') diff = a.marketCapRaw - b.marketCapRaw;
      return sortAsc ? diff : -diff;
    });
  }, [tabAssets, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const tabs: { key: TableTab; label: string }[] = [
    { key: 'active', label: 'Most Active' },
    { key: 'gainers', label: 'Top Gainers' },
    { key: 'losers', label: 'Top Losers' },
    { key: 'crypto', label: 'Crypto' },
    { key: 'forex', label: 'Currencies' },
    { key: 'futures', label: 'Futures & Commodities' },
    { key: 'bonds', label: 'Bonds' },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E0E3EB] overflow-hidden mb-8 shadow-xs">
      {/* Table Navigation Header */}
      <div className="px-4 py-3 border-b border-[#E0E3EB] flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#131722] text-white shadow-xs'
                  : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#787B86] font-medium hidden sm:block">
          Showing {sortedAssets.length} instruments · OpenType tabular numerals
        </div>
      </div>

      {/* Responsive Dense Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="h-8 bg-[#F0F3FA]/60 border-b border-[#E0E3EB] text-[11px] font-semibold text-[#787B86] uppercase tracking-wider">
              <th className="px-4 py-1 text-left">
                <button
                  onClick={() => handleSort('symbol')}
                  className="inline-flex items-center gap-1 hover:text-[#131722] cursor-pointer"
                >
                  <span>Symbol / Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-1 text-right">
                <button
                  onClick={() => handleSort('price')}
                  className="inline-flex items-center gap-1 hover:text-[#131722] cursor-pointer ml-auto"
                >
                  <span>Last Price</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-1 text-right">
                <button
                  onClick={() => handleSort('changePercent')}
                  className="inline-flex items-center gap-1 hover:text-[#131722] cursor-pointer ml-auto"
                >
                  <span>Change %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-1 text-right hidden sm:table-cell">Change $</th>
              <th className="px-3 py-1 text-right hidden lg:table-cell">24h High / Low</th>
              <th className="px-3 py-1 text-right hidden md:table-cell">
                <button
                  onClick={() => handleSort('volumeRaw')}
                  className="inline-flex items-center gap-1 hover:text-[#131722] cursor-pointer ml-auto"
                >
                  <span>24h Volume</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-1 text-right hidden xl:table-cell">
                <button
                  onClick={() => handleSort('marketCapRaw')}
                  className="inline-flex items-center gap-1 hover:text-[#131722] cursor-pointer ml-auto"
                >
                  <span>Market Cap</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-1 text-center hidden md:table-cell">Technical</th>
              <th className="px-3 py-1 text-right">24h Trend</th>
              <th className="px-3 py-1 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F3FA] text-xs">
            {sortedAssets.map((asset) => {
              const isSelected = selectedAsset.symbol === asset.symbol;
              const isPos = asset.change >= 0;
              const flash = tickerFlashes[asset.symbol];
              const isBookmarked = watchlist.includes(asset.symbol);

              return (
                <tr
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`h-11 transition-colors cursor-pointer group hover:bg-[#F0F3FA] ${
                    isSelected ? 'bg-[#F0F3FA]/90 font-medium' : ''
                  } ${
                    flash === 'up'
                      ? 'tick-flash-up'
                      : flash === 'down'
                      ? 'tick-flash-down'
                      : ''
                  }`}
                >
                  {/* Symbol & Name */}
                  <td className="px-4 py-1.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: asset.iconBg || '#131722' }}
                      >
                        {asset.iconText || asset.symbol.slice(0, 2)}
                      </div>
                      <div className="truncate max-w-[140px] sm:max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-heading font-bold text-xs text-[#131722] tracking-wide">
                            {asset.symbol}
                          </span>
                          <span className="text-[9px] uppercase font-semibold text-[#787B86] bg-white border border-[#E0E3EB] px-1 py-0.2 rounded">
                            {asset.exchange}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#787B86] truncate">
                          {asset.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Last Price */}
                  <td className="px-3 py-1.5 text-right font-semibold text-xs text-[#131722] tabular-nums">
                    ${asset.price > 100
                      ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : asset.price.toFixed(asset.price < 1 ? 4 : 2)}
                  </td>

                  {/* Change % (strict pill conforming to design spec) */}
                  <td className="px-3 py-1.5 text-right">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${
                        isPos
                          ? 'bg-[#E6F5F2] text-[#089981]'
                          : 'bg-[#FDEBED] text-[#F23645]'
                      }`}
                    >
                      {isPos ? '+' : '−'}
                      {Math.abs(asset.changePercent).toFixed(2)}%
                    </span>
                  </td>

                  {/* Change $ */}
                  <td className="px-3 py-1.5 text-right text-[11px] font-mono tabular-nums text-[#787B86] hidden sm:table-cell">
                    {isPos ? '+' : ''}
                    {asset.change.toFixed(asset.price < 1 ? 4 : 2)}
                  </td>

                  {/* 24h High/Low bar */}
                  <td className="px-3 py-1.5 text-right text-[11px] hidden lg:table-cell">
                    <div className="flex items-center justify-end gap-1.5 font-mono text-[#787B86] tabular-nums">
                      <span>{asset.low24h.toFixed(1)}</span>
                      <div className="w-12 h-1 bg-[#E0E3EB] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#131722]"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                10,
                                ((asset.price - asset.low24h) /
                                  (asset.high24h - asset.low24h || 1)) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-[#131722] font-medium">{asset.high24h.toFixed(1)}</span>
                    </div>
                  </td>

                  {/* 24h Volume */}
                  <td className="px-3 py-1.5 text-right text-xs text-[#787B86] font-mono tabular-nums hidden md:table-cell">
                    {asset.volume24h}
                  </td>

                  {/* Market Cap */}
                  <td className="px-3 py-1.5 text-right text-xs text-[#131722] font-mono tabular-nums hidden xl:table-cell">
                    {asset.marketCap}
                  </td>

                  {/* Technical Rating */}
                  <td className="px-3 py-1.5 text-center hidden md:table-cell">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        asset.technicalRating.includes('Buy')
                          ? 'bg-[#E6F5F2] text-[#089981]'
                          : asset.technicalRating.includes('Sell')
                          ? 'bg-[#FDEBED] text-[#F23645]'
                          : 'bg-[#F0F3FA] text-[#787B86]'
                      }`}
                    >
                      {asset.technicalRating}
                    </span>
                  </td>

                  {/* 24h Trend Sparkline (84px x 24px per spec) */}
                  <td className="px-3 py-1.5 text-right">
                    <Sparkline
                      data={asset.sparkline}
                      width={84}
                      height={24}
                      isPositive={isPos}
                    />
                  </td>

                  {/* Quick Action buttons */}
                  <td className="px-3 py-1.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(asset.symbol);
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'text-[#2962FF]'
                            : 'text-[#787B86] hover:text-[#131722]'
                        }`}
                        title={isBookmarked ? 'In Watchlist' : 'Add to Watchlist'}
                      >
                        <Bookmark
                          className="w-3.5 h-3.5"
                          fill={isBookmarked ? '#2962FF' : 'none'}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectAsset(asset);
                        }}
                        className="p-1 rounded text-[#787B86] hover:text-[#2962FF] hover:bg-white transition-colors cursor-pointer"
                        title="Dossier & Paper Trade"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
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
  );
};
