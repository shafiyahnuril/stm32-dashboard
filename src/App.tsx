import { useEffect } from "react";
import { useSTM32Store } from "./store/stm32Store";
import { useSTM32 } from "./hooks/useSTM32";

import { Header } from "./components/layout/Header";
import { MetricCards } from "./components/monitor/MetricCards";
import { SensorCards } from "./components/monitor/SensorCards";
import { LEDDisplay } from "./components/monitor/LEDDisplay";
import { ADCGauge } from "./components/monitor/ADCGauge";
import { CounterChart } from "./components/monitor/CounterChart";
import { SensorChart } from "./components/monitor/SensorChart";
import { EventLog } from "./components/monitor/EventLog";
import { ModeSelector } from "./components/control/ModeSelector";
import { ISRStatus } from "./components/control/ISRStatus";
import { GamePanel } from "./components/game/GamePanel";

export default function App() {
  useSTM32();

  const isDark = useSTM32Store((s) => s.isDark);
  const connectionError = useSTM32Store((s) => s.connectionError);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div
      className="min-h-screen transition-colors duration-200 bg-slate-50 dark:bg-slate-950"
    >
      {connectionError && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3 text-center text-sm font-semibold text-red-600 dark:text-red-400">
           {connectionError}
        </div>
      )}
      <div className="max-w-[1280px] mx-auto px-4 pb-10">
        <Header />
        
        {/* Top Level Metrics */}
        <MetricCards />
        
        {/* New Temperature and Distance Sensors */}
        <SensorCards />

        {/* Main responsive grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-12">
          {/* Col 1  Monitor (4 Cols) */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <ModeSelector />
            <LEDDisplay />
            <ADCGauge />
          </div>

          {/* Col 2  Charts + Game (5 Cols) */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <SensorChart />
            <CounterChart />
            <GamePanel />
            <EventLog />
            <ISRStatus />
          </div>
        </div>
      </div>
    </div>
  );
}

