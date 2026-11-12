import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { INITIAL_NEWS, INITIAL_TRADE_IDEAS } from '../data/marketData';
import { Newspaper, Lightbulb, ThumbsUp, MessageSquare, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

export const NewsAndIdeas: React.FC = () => {
  const { setSelectedAsset, setInspectAsset, assets } = useMarket();
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'ideas'>('all');

  const handleSymbolClick = (sym: string) => {
    const asset = assets.find((a) => a.symbol === sym);
    if (asset) {
      setSelectedAsset(asset);
      setInspectAsset(asset);
    }
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between pb-3 border-b border-[#E0E3EB] mb-4">
        <div>
          <h2 className="font-heading font-bold text-lg sm:text-xl text-[#131722]">
            Market News & Technical Analysis Ideas
          </h2>
          <p className="text-xs text-[#787B86] mt-0.5">
            Real-time market headlines and tactical community trading setups.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[#F0F3FA] p-0.5 rounded-lg border border-[#E0E3EB]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all' ? 'bg-[#131722] text-white' : 'text-[#787B86] hover:text-[#131722]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'news' ? 'bg-[#131722] text-white' : 'text-[#787B86] hover:text-[#131722]'
            }`}
          >
            News Wire
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ideas' ? 'bg-[#131722] text-white' : 'text-[#787B86] hover:text-[#131722]'
            }`}
          >
            Trade Ideas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* News Column */}
        {(activeTab === 'all' || activeTab === 'news') && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#131722] uppercase tracking-wider mb-2">
              <Newspaper className="w-4 h-4 text-[#2962FF]" />
              <span>Real-Time News Stream</span>
            </div>

            <div className="space-y-3">
              {INITIAL_NEWS.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-xl p-4 border border-[#E0E3EB] hover:border-[#787B86]/40 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Clean unboxed metadata per Frontend Design Constitution */}
                    <div className="flex items-center gap-2 text-xs text-[#787B86] mb-1.5">
                      <span className="font-semibold text-[#131722]">{item.source}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.publishedAt}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.readTime}</span>
                    </div>

                    <h3 className="font-heading font-bold text-sm sm:text-base text-[#131722] leading-snug hover:text-[#2962FF] transition-colors cursor-pointer">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#787B86] mt-2 leading-relaxed">
                      {item.snippet}
                    </p>
                  </div>

                  {/* Related Symbols row */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F0F3FA]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[#787B86]">Impacts:</span>
                      {item.relatedSymbols.map((sym) => (
                        <button
                          key={sym}
                          onClick={() => handleSymbolClick(sym)}
                          className="font-heading font-bold text-xs text-[#2962FF] hover:underline cursor-pointer"
                        >
                          ${sym}
                        </button>
                      ))}
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        item.sentiment === 'bullish'
                          ? 'bg-[#E6F5F2] text-[#089981]'
                          : item.sentiment === 'bearish'
                          ? 'bg-[#FDEBED] text-[#F23645]'
                          : 'bg-[#F0F3FA] text-[#787B86]'
                      }`}
                    >
                      {item.sentiment}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Trade Ideas Column */}
        {(activeTab === 'all' || activeTab === 'ideas') && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#131722] uppercase tracking-wider mb-2">
              <Lightbulb className="w-4 h-4 text-[#089981]" />
              <span>Technical Analysis & Community Ideas</span>
            </div>

            <div className="space-y-3">
              {INITIAL_TRADE_IDEAS.map((idea) => {
                const isLong = idea.sentiment === 'Long';
                return (
                  <div
                    key={idea.id}
                    className="bg-white rounded-xl p-4 border border-[#E0E3EB] hover:border-[#787B86]/40 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Author Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={idea.authorAvatar}
                            alt={idea.author}
                            className="w-6 h-6 rounded-full object-cover border border-[#E0E3EB]"
                          />
                          <span className="text-xs font-semibold text-[#131722]">
                            {idea.author}
                          </span>
                          <span className="text-xs text-[#787B86]">in {idea.timeframe}</span>
                        </div>

                        <span
                          className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                            isLong
                              ? 'bg-[#E6F5F2] text-[#089981]'
                              : 'bg-[#FDEBED] text-[#F23645]'
                          }`}
                        >
                          {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {idea.sentiment}
                        </span>
                      </div>

                      <h4
                        onClick={() => handleSymbolClick(idea.symbol)}
                        className="font-heading font-bold text-sm text-[#131722] hover:text-[#2962FF] transition-colors cursor-pointer"
                      >
                        <span className="text-[#2962FF] mr-1.5">${idea.symbol}</span>
                        {idea.title}
                      </h4>

                      <p className="text-xs text-[#787B86] mt-1.5 leading-relaxed">
                        {idea.analysis}
                      </p>
                    </div>

                    {/* Trade Levels Strip */}
                    <div className="grid grid-cols-3 gap-2 bg-[#F0F3FA] p-2 rounded-lg mt-3 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-[#787B86] uppercase font-bold">Entry</div>
                        <div className="font-semibold text-[#131722] tabular-nums font-mono">
                          ${idea.entryPrice.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#089981] uppercase font-bold">Target</div>
                        <div className="font-semibold text-[#089981] tabular-nums font-mono">
                          ${idea.targetPrice.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#F23645] uppercase font-bold">Stop Loss</div>
                        <div className="font-semibold text-[#F23645] tabular-nums font-mono">
                          ${idea.stopLoss.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Social feedback */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F0F3FA] text-xs text-[#787B86]">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 hover:text-[#131722] cursor-pointer">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {idea.likes}
                        </span>
                        <span className="flex items-center gap-1 hover:text-[#131722] cursor-pointer">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {idea.comments}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSymbolClick(idea.symbol)}
                        className="flex items-center gap-1 text-[#2962FF] font-semibold hover:underline cursor-pointer"
                      >
                        <span>Open Setup</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
