/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Header } from './components/Header';
import { SearchModal } from './components/SearchModal';
import { HeroOverview } from './components/HeroOverview';
import { BenchmarkCards } from './components/BenchmarkCards';
import { InteractiveChart } from './components/InteractiveChart';
import { MarketTable } from './components/MarketTable';
import { MarketHeatmap } from './components/MarketHeatmap';
import { NewsAndIdeas } from './components/NewsAndIdeas';
import { InstrumentModal } from './components/InstrumentModal';
import { WatchlistPortfolioDrawer } from './components/WatchlistPortfolioDrawer';

const MainAppContent: React.FC = () => {
  const { activeViewTab } = useMarket();
  const [timeframe, setTimeframe] = useState('1D');

  return (
    <div className="min-h-screen bg-white text-[#131722] flex flex-col antialiased selection:bg-[#2962FF] selection:text-white">
      {/* 1. Header with live ticker tape & navigation */}
      <Header />

      {/* 2. Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Hero Section */}
        <HeroOverview timeframe={timeframe} setTimeframe={setTimeframe} />

        {/* Tab 1: Overview (TradingView Markets home page style) */}
        {activeViewTab === 'overview' && (
          <>
            {/* Top 6 Benchmark cards */}
            <BenchmarkCards />

            {/* Interactive Chart Canvas */}
            <InteractiveChart timeframe={timeframe} setTimeframe={setTimeframe} />

            {/* Dense Market Tables */}
            <MarketTable />

            {/* Sector Heatmap Matrix */}
            <MarketHeatmap />

            {/* Market News & Community Trade Ideas */}
            <NewsAndIdeas />
          </>
        )}

        {/* Tab 2: Screener & Tables Focus */}
        {activeViewTab === 'screener' && (
          <div className="pt-2">
            <MarketTable />
            <InteractiveChart timeframe={timeframe} setTimeframe={setTimeframe} />
          </div>
        )}

        {/* Tab 3: Heatmap Focus */}
        {activeViewTab === 'heatmap' && (
          <div className="pt-2">
            <MarketHeatmap />
            <InteractiveChart timeframe={timeframe} setTimeframe={setTimeframe} />
          </div>
        )}

        {/* Tab 4: News & Ideas Focus */}
        {activeViewTab === 'ideas' && (
          <div className="pt-2">
            <NewsAndIdeas />
            <MarketTable />
          </div>
        )}
      </main>

      {/* 3. Global Modals & Drawers */}
      <SearchModal />
      <InstrumentModal />
      <WatchlistPortfolioDrawer />

      {/* 4. Institutional Footer */}
      <footer className="border-t border-[#E0E3EB] bg-[#F0F3FA] py-8 text-xs text-[#787B86]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#131722] flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-[#131722]">
                Apex Market Terminal
              </span>
              <p className="text-[11px] text-[#787B86] mt-0.5">
                Modeled after TradingView Markets · High-density multi-asset intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-medium">
            <span>Market Data: S&P, Nasdaq, NYSE, CME, Binance, FXCM</span>
            <span aria-hidden="true">·</span>
            <span>Paper Trading Simulation Sandbox</span>
            <span aria-hidden="true">·</span>
            <span>2026 Telemetry Protocol</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <MainAppContent />
    </MarketProvider>
  );
}
