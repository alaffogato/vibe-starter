export type AssetCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'futures' | 'bonds';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface SparklinePoint {
  time: string;
  value: number;
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: AssetCategory;
  exchange: string;
  price: number;
  change: number; // absolute change
  changePercent: number; // percentage
  previousClose: number;
  open: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  volumeRaw: number;
  marketCap: string;
  marketCapRaw: number;
  peRatio?: number;
  dividendYield?: number;
  week52High: number;
  week52Low: number;
  technicalRating: TechnicalRating;
  sparkline: number[];
  candles: CandleData[];
  sector?: string;
  subsector?: string;
  iconBg?: string;
  iconText?: string;
  description: string;
  analysts?: {
    buy: number;
    hold: number;
    sell: number;
    targetPrice: number;
  };
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  readTime: string;
  relatedSymbols: string[];
  snippet: string;
}

export interface TradeIdea {
  id: string;
  symbol: string;
  title: string;
  author: string;
  authorAvatar: string;
  sentiment: 'Long' | 'Short';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  likes: number;
  comments: number;
  timeframe: string;
  analysis: string;
}

export interface PortfolioPosition {
  symbol: string;
  side: 'buy' | 'sell';
  shares: number;
  avgEntryPrice: number;
  totalCost: number;
  openedAt: string;
}
