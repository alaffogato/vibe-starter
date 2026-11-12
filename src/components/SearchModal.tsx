import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { AssetCategory } from '../types/market';

export const SearchModal: React.FC = () => {
  const { assets, isSearchOpen, setIsSearchOpen, setSelectedAsset, setInspectAsset } = useMarket();
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<AssetCategory | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesCategory = selectedFilter === 'all' || asset.category === selectedFilter;
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        asset.symbol.toLowerCase().includes(q) ||
        asset.name.toLowerCase().includes(q) ||
        asset.exchange.toLowerCase().includes(q) ||
        (asset.sector && asset.sector.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [assets, query, selectedFilter]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredAssets.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredAssets.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredAssets[selectedIndex]) {
          const chosen = filteredAssets[selectedIndex];
          setSelectedAsset(chosen);
          setInspectAsset(chosen);
          setIsSearchOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, filteredAssets, selectedIndex, setSelectedAsset, setInspectAsset, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#131722]/50 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E0E3EB] gap-3">
          <Search className="w-5 h-5 text-[#787B86] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search symbol, company, crypto, or currency (e.g. NVDA, SPX, BTC)..."
            className="w-full text-sm text-[#131722] placeholder-[#787B86] bg-transparent outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#787B86] hover:text-[#131722] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs font-semibold text-[#787B86] hover:text-[#131722] bg-[#F0F3FA] px-2 py-1 rounded cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#F0F3FA] bg-[#F0F3FA]/40 overflow-x-auto text-xs">
          {(['all', 'indices', 'stocks', 'crypto', 'forex', 'futures', 'bonds'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedFilter(cat);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === cat
                  ? 'bg-[#131722] text-white'
                  : 'text-[#787B86] hover:text-[#131722] hover:bg-white'
              }`}
            >
              {cat === 'all' ? 'All Assets' : cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto flex-1 divide-y divide-[#F0F3FA] p-2">
          {filteredAssets.length === 0 ? (
            <div className="py-12 text-center text-[#787B86] text-sm">
              No matching financial instruments found for "{query}".
            </div>
          ) : (
            filteredAssets.map((asset, index) => {
              const isSelected = index === selectedIndex;
              const isPos = asset.change >= 0;
              return (
                <div
                  key={asset.symbol}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setInspectAsset(asset);
                    setIsSearchOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#F0F3FA]' : 'hover:bg-[#F0F3FA]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                      style={{ backgroundColor: asset.iconBg || '#2962FF' }}
                    >
                      {asset.iconText || asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-[#131722]">
                          {asset.symbol}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-[#787B86] bg-white border border-[#E0E3EB] px-1.5 py-0.2 rounded">
                          {asset.exchange}
                        </span>
                      </div>
                      <div className="text-xs text-[#787B86] truncate max-w-[220px] sm:max-w-xs">
                        {asset.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-sm font-semibold tabular-nums text-[#131722]">
                        ${asset.price > 100
                          ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : asset.price.toFixed(asset.price < 1 ? 4 : 2)}
                      </div>
                      <div
                        className={`text-xs font-semibold tabular-nums flex items-center justify-end gap-0.5 ${
                          isPos ? 'text-[#089981]' : 'text-[#F23645]'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPos ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-[#2962FF] shrink-0 hidden sm:block" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#F0F3FA] border-t border-[#E0E3EB] text-[11px] text-[#787B86] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#c6c6cc] font-mono">↑</kbd>{' '}
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#c6c6cc] font-mono">↓</kbd> navigate
            </span>
            <span>
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#c6c6cc] font-mono">↵</kbd> select
            </span>
          </div>
          <span>Showing {filteredAssets.length} instruments</span>
        </div>
      </div>
    </div>
  );
};
