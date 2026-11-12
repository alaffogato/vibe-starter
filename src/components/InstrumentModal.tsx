import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Sparkline } from './Sparkline';
import { X, Bookmark, TrendingUp, TrendingDown, CheckCircle2, AlertCircle, ArrowUpRight, DollarSign } from 'lucide-react';

export const InstrumentModal: React.FC = () => {
  const {
    inspectAsset,
    setInspectAsset,
    watchlist,
    toggleWatchlist,
    cashBalance,
    portfolio,
    executeOrder,
  } = useMarket();

  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderShares, setOrderShares] = useState<number>(10);
  const [orderFeedback, setOrderFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!inspectAsset) return null;

  const isPos = inspectAsset.change >= 0;
  const isBookmarked = watchlist.includes(inspectAsset.symbol);
  const userPosition = portfolio.find((p) => p.symbol === inspectAsset.symbol);

  // 52-week position calculation
  const weekRange = inspectAsset.week52High - inspectAsset.week52Low || 1;
  const weekPositionPct = Math.min(
    100,
    Math.max(0, ((inspectAsset.price - inspectAsset.week52Low) / weekRange) * 100)
  );

  const orderTotal = inspectAsset.price * (orderShares || 0);

  const handleExecute = () => {
    if (!orderShares || orderShares <= 0) {
      setOrderFeedback({ type: 'error', message: 'Please enter a valid share quantity.' });
      return;
    }

    const res = executeOrder(inspectAsset.symbol, orderSide, orderShares);
    if (res.success) {
      setOrderFeedback({ type: 'success', message: res.message });
      setTimeout(() => setOrderFeedback(null), 4000);
    } else {
      setOrderFeedback({ type: 'error', message: res.message });
      setTimeout(() => setOrderFeedback(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131722]/50 backdrop-blur-xs">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E0E3EB] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs"
              style={{ backgroundColor: inspectAsset.iconBg || '#131722' }}
            >
              {inspectAsset.iconText || inspectAsset.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg text-[#131722] tracking-tight">
                  {inspectAsset.symbol}
                </h2>
                <span className="text-[10px] uppercase font-bold text-[#787B86] bg-[#F0F3FA] border border-[#E0E3EB] px-1.5 py-0.5 rounded">
                  {inspectAsset.exchange}
                </span>
                <span className="text-xs text-[#787B86] capitalize">
                  {inspectAsset.category}
                </span>
              </div>
              <div className="text-xs text-[#787B86] font-medium">
                {inspectAsset.name} {inspectAsset.sector && `· ${inspectAsset.sector}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWatchlist(inspectAsset.symbol)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isBookmarked
                  ? 'border-[#2962FF] text-[#2962FF] bg-[#2962FF]/10'
                  : 'border-[#E0E3EB] text-[#787B86] hover:bg-[#F0F3FA] hover:text-[#131722]'
              }`}
              title="Watchlist"
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => setInspectAsset(null)}
              className="p-2 rounded-lg text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 space-y-6">
          {/* Price & Sparkline Banner */}
          <div className="bg-[#F0F3FA]/50 rounded-xl p-4 border border-[#E0E3EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#787B86] uppercase font-bold tracking-wider">
                Real-Time Benchmark Price
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#131722] tabular-nums">
                  ${inspectAsset.price > 100
                    ? inspectAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : inspectAsset.price.toFixed(inspectAsset.price < 1 ? 4 : 2)}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums ${
                    isPos
                      ? 'bg-[#E6F5F2] text-[#089981]'
                      : 'bg-[#FDEBED] text-[#F23645]'
                  }`}
                >
                  {isPos ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                  {isPos ? '+' : ''}
                  {inspectAsset.changePercent.toFixed(2)}% (${inspectAsset.change.toFixed(2)})
                </span>
              </div>
            </div>

            <div className="w-full sm:w-48 h-12">
              <Sparkline
                data={inspectAsset.sparkline}
                width={190}
                height={48}
                isPositive={isPos}
                strokeWidth={2}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* 52-Week & 24-Hour Range Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 52-Week Range */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E0E3EB]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#787B86] mb-2">
                <span>52-Week Range</span>
                <span className="text-[#131722] font-mono tabular-nums">
                  {weekPositionPct.toFixed(0)}% of Range
                </span>
              </div>
              <div className="relative w-full h-2 bg-[#E0E3EB] rounded-full overflow-hidden my-2">
                <div
                  className="h-full bg-[#2962FF] rounded-full"
                  style={{ width: `${weekPositionPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#787B86] tabular-nums">
                <span>Low: ${inspectAsset.week52Low.toFixed(2)}</span>
                <span>High: ${inspectAsset.week52High.toFixed(2)}</span>
              </div>
            </div>

            {/* 24-Hour Day Range */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E0E3EB]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#787B86] mb-2">
                <span>Day Session Range</span>
                <span className="text-[#131722] font-mono tabular-nums">
                  Vol: {inspectAsset.volume24h}
                </span>
              </div>
              <div className="relative w-full h-2 bg-[#E0E3EB] rounded-full overflow-hidden my-2">
                <div
                  className="h-full bg-[#131722] rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        5,
                        ((inspectAsset.price - inspectAsset.low24h) /
                          (inspectAsset.high24h - inspectAsset.low24h || 1)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#787B86] tabular-nums">
                <span>Low: ${inspectAsset.low24h.toFixed(2)}</span>
                <span>High: ${inspectAsset.high24h.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Key Fundamentals Grid */}
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#787B86] mb-2">
              Key Metrics & Telemetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#F0F3FA]/40 p-2.5 rounded-lg border border-[#E0E3EB]">
                <div className="text-[10px] text-[#787B86] uppercase font-bold">Market Cap</div>
                <div className="font-semibold text-sm text-[#131722] tabular-nums font-mono mt-0.5">
                  {inspectAsset.marketCap}
                </div>
              </div>

              <div className="bg-[#F0F3FA]/40 p-2.5 rounded-lg border border-[#E0E3EB]">
                <div className="text-[10px] text-[#787B86] uppercase font-bold">P/E Ratio</div>
                <div className="font-semibold text-sm text-[#131722] tabular-nums font-mono mt-0.5">
                  {inspectAsset.peRatio ? inspectAsset.peRatio.toFixed(1) : 'N/A'}
                </div>
              </div>

              <div className="bg-[#F0F3FA]/40 p-2.5 rounded-lg border border-[#E0E3EB]">
                <div className="text-[10px] text-[#787B86] uppercase font-bold">Dividend Yield</div>
                <div className="font-semibold text-sm text-[#131722] tabular-nums font-mono mt-0.5">
                  {inspectAsset.dividendYield ? `${inspectAsset.dividendYield.toFixed(2)}%` : '0.00%'}
                </div>
              </div>

              <div className="bg-[#F0F3FA]/40 p-2.5 rounded-lg border border-[#E0E3EB]">
                <div className="text-[10px] text-[#787B86] uppercase font-bold">Technical Rating</div>
                <div
                  className={`font-bold text-xs mt-1 ${
                    inspectAsset.technicalRating.includes('Buy')
                      ? 'text-[#089981]'
                      : inspectAsset.technicalRating.includes('Sell')
                      ? 'text-[#F23645]'
                      : 'text-[#787B86]'
                  }`}
                >
                  {inspectAsset.technicalRating}
                </div>
              </div>
            </div>
          </div>

          {/* Analyst Consensus if available */}
          {inspectAsset.analysts && (
            <div className="bg-white p-4 rounded-xl border border-[#E0E3EB]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#787B86]">
                  Wall Street Analyst Consensus
                </span>
                <span className="text-xs text-[#089981] font-semibold">
                  Avg Target: ${inspectAsset.analysts.targetPrice.toFixed(2)} (
                  {(((inspectAsset.analysts.targetPrice - inspectAsset.price) / inspectAsset.price) * 100).toFixed(1)}% Upside)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex-1 bg-[#E6F5F2] text-[#089981] py-1 text-center font-bold rounded">
                  {inspectAsset.analysts.buy} Buy
                </div>
                <div className="flex-1 bg-[#F0F3FA] text-[#787B86] py-1 text-center font-bold rounded">
                  {inspectAsset.analysts.hold} Hold
                </div>
                <div className="flex-1 bg-[#FDEBED] text-[#F23645] py-1 text-center font-bold rounded">
                  {inspectAsset.analysts.sell} Sell
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="text-xs text-[#787B86] leading-relaxed">
            <strong className="text-[#131722] font-semibold">Profile: </strong>
            {inspectAsset.description}
          </div>

          {/* Paper Trading Execution Ticket */}
          <div className="bg-[#F0F3FA] rounded-xl p-4 border border-[#E0E3EB]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#2962FF]" />
                <h4 className="font-heading font-bold text-sm text-[#131722]">
                  Paper Trading Simulation Desk
                </h4>
              </div>
              <div className="text-xs text-[#787B86]">
                Available Cash: <strong className="text-[#131722] font-mono">${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {userPosition && (
              <div className="bg-white p-2.5 rounded-lg border border-[#E0E3EB] mb-3 text-xs flex items-center justify-between">
                <span>
                  You hold: <strong className="text-[#131722]">{userPosition.shares} shares</strong> @ ${userPosition.avgEntryPrice.toFixed(2)}
                </span>
                <span
                  className={`font-semibold tabular-nums ${
                    inspectAsset.price >= userPosition.avgEntryPrice ? 'text-[#089981]' : 'text-[#F23645]'
                  }`}
                >
                  Unrealized:{' '}
                  {inspectAsset.price >= userPosition.avgEntryPrice ? '+' : ''}$
                  {((inspectAsset.price - userPosition.avgEntryPrice) * userPosition.shares).toFixed(2)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Buy / Sell switch */}
              <div className="flex bg-white p-1 rounded-lg border border-[#E0E3EB]">
                <button
                  type="button"
                  onClick={() => setOrderSide('buy')}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                    orderSide === 'buy'
                      ? 'bg-[#089981] text-white shadow-xs'
                      : 'text-[#787B86] hover:text-[#131722]'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('sell')}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                    orderSide === 'sell'
                      ? 'bg-[#F23645] text-white shadow-xs'
                      : 'text-[#787B86] hover:text-[#131722]'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0.01"
                  step="1"
                  value={orderShares}
                  onChange={(e) => setOrderShares(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-[#E0E3EB] rounded-lg px-3 py-1.5 text-xs text-[#131722] font-mono outline-none focus:border-[#2962FF]"
                  placeholder="Qty"
                />
                <div className="flex gap-1">
                  {[5, 25, 100].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setOrderShares(q)}
                      className="px-2 py-1 bg-white border border-[#E0E3EB] hover:bg-[#F0F3FA] text-[10px] font-semibold text-[#787B86] rounded cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  type="button"
                  onClick={handleExecute}
                  className={`w-full py-2 px-4 rounded-lg text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                    orderSide === 'buy' ? 'bg-[#089981] hover:bg-[#077d69]' : 'bg-[#F23645] hover:bg-[#d62837]'
                  }`}
                >
                  Execute {orderSide.toUpperCase()} · ${(orderTotal).toFixed(2)}
                </button>
              </div>
            </div>

            {orderFeedback && (
              <div
                className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  orderFeedback.type === 'success'
                    ? 'bg-[#E6F5F2] text-[#089981] border border-[#089981]/30'
                    : 'bg-[#FDEBED] text-[#F23645] border border-[#F23645]/30'
                }`}
              >
                {orderFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{orderFeedback.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
