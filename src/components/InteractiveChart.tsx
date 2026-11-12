import React, { useState, useMemo, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import {
  TrendingUp,
  TrendingDown,
  Maximize2,
  Minimize2,
  Sliders,
  ExternalLink,
  Bookmark,
  Check,
} from 'lucide-react';
import { CandleData } from '../types/market';

interface InteractiveChartProps {
  timeframe: string;
  setTimeframe: (tf: string) => void;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ timeframe, setTimeframe }) => {
  const {
    selectedAsset,
    setInspectAsset,
    watchlist,
    toggleWatchlist,
    tickerFlashes,
  } = useMarket();

  const [chartType, setChartType] = useState<'area' | 'candles'>('candles');
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const isPos = selectedAsset.change >= 0;
  const isBookmarked = watchlist.includes(selectedAsset.symbol);
  const flash = tickerFlashes[selectedAsset.symbol];

  // Adjust candle slice based on timeframe
  const candles = useMemo(() => {
    const raw = selectedAsset.candles || [];
    if (timeframe === '1D') return raw.slice(-12);
    if (timeframe === '5D') return raw.slice(-20);
    return raw;
  }, [selectedAsset.candles, timeframe]);

  // Dimensions & bounds
  const chartHeight = isExpanded ? 460 : 340;
  const chartWidth = 900; // virtual svg coordinate system
  const padding = { top: 20, right: 65, bottom: 40, left: 15 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const volumeHeight = showVolume ? innerHeight * 0.22 : 0;
  const priceChartHeight = innerHeight - volumeHeight;

  // Calculate scales
  const { minPrice, maxPrice, priceRange, maxVolume } = useMemo(() => {
    if (candles.length === 0) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100, maxVolume: 1000 };
    }
    let min = Infinity;
    let max = -Infinity;
    let vol = 0;
    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > vol) vol = c.volume;
    });
    // add 2% padding
    const range = max - min || 1;
    return {
      minPrice: min - range * 0.02,
      maxPrice: max + range * 0.02,
      priceRange: (max - min) * 1.04 || 1,
      maxVolume: vol || 1,
    };
  }, [candles]);

  // Compute 20-period Simple Moving Average (SMA)
  const smaPoints = useMemo(() => {
    if (!showSMA || candles.length < 5) return [];
    const period = Math.min(7, candles.length);
    return candles.map((c, i) => {
      const slice = candles.slice(Math.max(0, i - period + 1), i + 1);
      const avg = slice.reduce((sum, item) => sum + item.close, 0) / slice.length;
      return avg;
    });
  }, [candles, showSMA]);

  // Compute 50-period Exponential Moving Average (EMA)
  const emaPoints = useMemo(() => {
    if (!showEMA || candles.length < 5) return [];
    const k = 2 / (candles.length + 1);
    const result: number[] = [];
    candles.forEach((c, i) => {
      if (i === 0) {
        result.push(c.close);
      } else {
        const ema = c.close * k + result[i - 1] * (1 - k);
        result.push(ema);
      }
    });
    return result;
  }, [candles, showEMA]);

  const getY = (price: number) => {
    return padding.top + priceChartHeight - ((price - minPrice) / priceRange) * priceChartHeight;
  };

  const getX = (index: number) => {
    if (candles.length <= 1) return padding.left;
    return padding.left + (index / (candles.length - 1)) * innerWidth;
  };

  // Generate Area chart paths
  const areaLinePath = useMemo(() => {
    if (candles.length === 0) return '';
    return candles.reduce((acc, c, i) => {
      const x = getX(i);
      const y = getY(c.close);
      return i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [candles, minPrice, priceRange, innerWidth, priceChartHeight]);

  const areaFillPath = useMemo(() => {
    if (!areaLinePath || candles.length === 0) return '';
    const lastX = getX(candles.length - 1);
    const firstX = getX(0);
    const bottomY = padding.top + priceChartHeight;
    return `${areaLinePath} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  }, [areaLinePath, candles]);

  // Moving averages SVG paths
  const smaPath = useMemo(() => {
    if (!showSMA || smaPoints.length === 0) return '';
    return smaPoints.reduce((acc, val, i) => {
      const x = getX(i);
      const y = getY(val);
      return i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [smaPoints, showSMA]);

  const emaPath = useMemo(() => {
    if (!showEMA || emaPoints.length === 0) return '';
    return emaPoints.reduce((acc, val, i) => {
      const x = getX(i);
      const y = getY(val);
      return i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [emaPoints, showEMA]);

  // Handle cursor hover over chart coordinates
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || candles.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Map clientX to virtual chartWidth
    const scaleX = chartWidth / rect.width;
    const scaleY = chartHeight / rect.height;
    const virtualX = clientX * scaleX;
    const virtualY = clientY * scaleY;

    if (virtualX < padding.left || virtualX > chartWidth - padding.right) {
      setHoveredCandle(null);
      setHoverPosition(null);
      return;
    }

    const ratio = (virtualX - padding.left) / innerWidth;
    const index = Math.round(ratio * (candles.length - 1));
    const safeIndex = Math.max(0, Math.min(candles.length - 1, index));

    setHoveredCandle(candles[safeIndex]);
    setHoverPosition({ x: getX(safeIndex), y: virtualY });
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setHoverPosition(null);
  };

  // Price axis tick marks (4 intervals)
  const priceTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = minPrice + pct * priceRange;
    const y = getY(val);
    return { val, y };
  });

  const activeDisplayCandle = hoveredCandle || candles[candles.length - 1] || {
    open: selectedAsset.open,
    high: selectedAsset.high24h,
    low: selectedAsset.low24h,
    close: selectedAsset.price,
    volume: selectedAsset.volumeRaw,
    time: 'Latest',
  };

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-xl border border-[#E0E3EB] overflow-hidden transition-all duration-200 mb-6 ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl overflow-y-auto' : 'relative'
      }`}
    >
      {/* 1. Header Toolbar */}
      <div className="px-4 py-3 border-b border-[#E0E3EB] bg-white flex flex-wrap items-center justify-between gap-3">
        {/* Left: Asset Identity & Price Info */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
            style={{ backgroundColor: selectedAsset.iconBg || '#131722' }}
          >
            {selectedAsset.iconText || selectedAsset.symbol.slice(0, 3)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base sm:text-lg text-[#131722] tracking-tight">
                {selectedAsset.symbol}
              </span>
              <span className="text-xs text-[#787B86] font-medium hidden sm:inline">
                {selectedAsset.name}
              </span>
              <span className="text-[10px] uppercase font-bold text-[#787B86] bg-[#F0F3FA] border border-[#E0E3EB] px-1.5 py-0.5 rounded">
                {selectedAsset.exchange}
              </span>
            </div>

            {/* OHLC Inspector Ribbon */}
            <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-mono text-[#787B86] mt-0.5 flex-wrap">
              <span>O: <strong className="text-[#131722] font-semibold">{activeDisplayCandle.open}</strong></span>
              <span>H: <strong className="text-[#131722] font-semibold">{activeDisplayCandle.high}</strong></span>
              <span>L: <strong className="text-[#131722] font-semibold">{activeDisplayCandle.low}</strong></span>
              <span>C: <strong className="text-[#131722] font-semibold">{activeDisplayCandle.close}</strong></span>
              {showVolume && (
                <span>Vol: <strong className="text-[#131722] font-semibold">{(activeDisplayCandle.volume / 1000).toFixed(1)}k</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Price and Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div
              className={`font-heading font-extrabold text-lg sm:text-xl text-[#131722] tabular-nums tracking-tight ${
                flash === 'up' ? 'text-[#089981]' : flash === 'down' ? 'text-[#F23645]' : ''
              }`}
            >
              ${selectedAsset.price > 100
                ? selectedAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : selectedAsset.price.toFixed(selectedAsset.price < 1 ? 4 : 2)}
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span
                className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[11px] font-semibold tabular-nums ${
                  isPos
                    ? 'bg-[#E6F5F2] text-[#089981]'
                    : 'bg-[#FDEBED] text-[#F23645]'
                }`}
              >
                {isPos ? '+' : ''}
                {selectedAsset.changePercent.toFixed(2)}%
              </span>
              <span className="text-[11px] text-[#787B86] tabular-nums font-mono hidden sm:inline">
                ({isPos ? '+' : ''}
                {selectedAsset.change.toFixed(2)})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 border-l border-[#E0E3EB] pl-3">
            {/* Watchlist Toggle */}
            <button
              onClick={() => toggleWatchlist(selectedAsset.symbol)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isBookmarked
                  ? 'border-[#2962FF] text-[#2962FF] bg-[#2962FF]/5'
                  : 'border-[#E0E3EB] text-[#787B86] hover:bg-[#F0F3FA] hover:text-[#131722]'
              }`}
              title="Watchlist"
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>

            {/* Inspect Modal Trigger */}
            <button
              onClick={() => setInspectAsset(selectedAsset)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131722] hover:bg-[#2962FF] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <span>Trade & Dossier</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Expand */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg border border-[#E0E3EB] text-[#787B86] hover:bg-[#F0F3FA] hover:text-[#131722] transition-colors cursor-pointer hidden sm:block"
              title={isExpanded ? 'Minimize' : 'Expand Chart'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Secondary Indicator & Mode Bar */}
      <div className="px-4 py-2 border-b border-[#F0F3FA] bg-[#F0F3FA]/50 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          {/* Chart type toggle */}
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#E0E3EB]">
            <button
              onClick={() => setChartType('candles')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                chartType === 'candles' ? 'bg-[#131722] text-white' : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                chartType === 'area' ? 'bg-[#131722] text-white' : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              Area
            </button>
          </div>

          {/* Indicators checkboxes */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E0E3EB]">
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-semibold transition-colors cursor-pointer ${
                showSMA ? 'border-[#2962FF] text-[#2962FF] bg-[#2962FF]/10' : 'border-[#E0E3EB] text-[#787B86]'
              }`}
            >
              {showSMA && <Check className="w-3 h-3" />}
              SMA 20
            </button>
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-semibold transition-colors cursor-pointer ${
                showEMA ? 'border-[#E1251B] text-[#E1251B] bg-[#E1251B]/10' : 'border-[#E0E3EB] text-[#787B86]'
              }`}
            >
              {showEMA && <Check className="w-3 h-3" />}
              EMA 50
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-semibold transition-colors cursor-pointer ${
                showVolume ? 'border-[#089981] text-[#089981] bg-[#089981]/10' : 'border-[#E0E3EB] text-[#787B86]'
              }`}
            >
              {showVolume && <Check className="w-3 h-3" />}
              Volume
            </button>
          </div>
        </div>

        {/* Technical Status Badge & Timeframe */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-[#787B86]">Technical:</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded ${
                selectedAsset.technicalRating.includes('Buy')
                  ? 'bg-[#E6F5F2] text-[#089981]'
                  : selectedAsset.technicalRating.includes('Sell')
                  ? 'bg-[#FDEBED] text-[#F23645]'
                  : 'bg-[#F0F3FA] text-[#787B86]'
              }`}
            >
              {selectedAsset.technicalRating}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {['1D', '5D', '1M', '3M', '1Y', 'ALL'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  timeframe === tf ? 'bg-[#131722] text-white' : 'text-[#787B86] hover:text-[#131722]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Interactive Canvas */}
      <div className="relative w-full select-none bg-white overflow-hidden" style={{ height: chartHeight }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full cursor-crosshair"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="areaChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPos ? '#089981' : '#F23645'} stopOpacity={0.2} />
              <stop offset="100%" stopColor={isPos ? '#089981' : '#F23645'} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {priceTicks.map((pt, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={pt.y}
                x2={chartWidth - padding.right}
                y2={pt.y}
                stroke="#F0F3FA"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={chartWidth - padding.right + 6}
                y={pt.y + 4}
                fill="#787B86"
                fontSize="10"
                fontFamily="Inter"
                className="tabular-nums font-mono"
              >
                {pt.val > 100 ? pt.val.toFixed(1) : pt.val.toFixed(3)}
              </text>
            </g>
          ))}

          {/* Volume histogram bars */}
          {showVolume &&
            candles.map((c, i) => {
              const x = getX(i);
              const barWidth = Math.max(3, (innerWidth / candles.length) * 0.7);
              const barHeight = (c.volume / maxVolume) * volumeHeight;
              const y = chartHeight - padding.bottom - barHeight;
              const candleIsPos = c.close >= c.open;
              return (
                <rect
                  key={`vol-${i}`}
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={candleIsPos ? '#089981' : '#F23645'}
                  opacity={0.3}
                />
              );
            })}

          {/* Area Chart Mode */}
          {chartType === 'area' && (
            <>
              <path d={areaFillPath} fill="url(#areaChartGrad)" />
              <path
                d={areaLinePath}
                fill="none"
                stroke={isPos ? '#089981' : '#F23645'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Candlestick Chart Mode */}
          {chartType === 'candles' &&
            candles.map((c, i) => {
              const x = getX(i);
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const candleIsPos = c.close >= c.open;
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(openY - closeY));
              const candleWidth = Math.max(4, (innerWidth / candles.length) * 0.65);
              const color = candleIsPos ? '#089981' : '#F23645';

              return (
                <g key={`candle-${i}`}>
                  {/* High - Low Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })}

          {/* Moving average overlays */}
          {showSMA && smaPath && (
            <path
              d={smaPath}
              fill="none"
              stroke="#2962FF"
              strokeWidth="1.5"
              opacity={0.85}
            />
          )}
          {showEMA && emaPath && (
            <path
              d={emaPath}
              fill="none"
              stroke="#E1251B"
              strokeWidth="1.5"
              opacity={0.85}
            />
          )}

          {/* Crosshair & Hover Tooltip */}
          {hoverPosition && (
            <g pointerEvents="none">
              {/* Vertical line */}
              <line
                x1={hoverPosition.x}
                y1={padding.top}
                x2={hoverPosition.x}
                y2={chartHeight - padding.bottom}
                stroke="#787B86"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Horizontal line */}
              <line
                x1={padding.left}
                y1={hoverPosition.y}
                x2={chartWidth - padding.right}
                y2={hoverPosition.y}
                stroke="#787B86"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Crosshair intersection dot */}
              <circle
                cx={hoverPosition.x}
                cy={hoverPosition.y}
                r="4"
                fill="#2962FF"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Bottom X-axis time marks */}
          {candles.filter((_, i) => i % Math.ceil(candles.length / 5) === 0).map((c, i) => {
            const x = getX(candles.indexOf(c));
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={chartHeight - 12}
                fill="#787B86"
                fontSize="10"
                fontFamily="Inter"
                textAnchor="middle"
              >
                {c.time.split(',')[0]}
              </text>
            );
          })}
        </svg>

        {/* Right-edge Current Price Pill Indicator */}
        <div
          className="absolute right-0 pr-1.5 pointer-events-none transition-all duration-300"
          style={{
            top: `${Math.max(10, Math.min(chartHeight - 50, getY(selectedAsset.price) - 10))}px`,
          }}
        >
          <div
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white tabular-nums font-mono shadow-xs ${
              isPos ? 'bg-[#089981]' : 'bg-[#F23645]'
            }`}
          >
            {selectedAsset.price > 100
              ? selectedAsset.price.toFixed(2)
              : selectedAsset.price.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
};
