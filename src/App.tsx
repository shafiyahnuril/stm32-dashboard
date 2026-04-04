import { useEffect } from "react";
import { useSTM32Store } from "./store/stm32Store";
import { useSTM32 } from "./hooks/useSTM32";

import { Header } from "./components/layout/Header";
import { MetricCards } from "./components/monitor/MetricCards";
import { LEDDisplay } from "./components/monitor/LEDDisplay";
import { ADCGauge } from "./components/monitor/ADCGauge";
import { CounterChart } from "./components/monitor/CounterChart";
import { EventLog } from "./components/monitor/EventLog";
import { ModeSelector } from "./components/control/ModeSelector";
import { SpeedSlider } from "./components/control/SpeedSlider";
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
      className="min-h-screen transition-colors duration-200"
      style={{ background: "var(--bg)" }}
    >
      {connectionError && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 text-center text-sm font-medium text-red-600 dark:text-red-400">
          ⚠️ {connectionError}
        </div>
      )}
      <div className="max-w-[1280px] mx-auto px-3 pb-6">
        <Header />
        <MetricCards />

        {/* Main responsive grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_260px]">
          {/* Col 1 — Monitor */}
          <div className="flex flex-col gap-2.5">
            <LEDDisplay />
            <ADCGauge />
          </div>

          {/* Col 2 — Charts + Log */}
          <div className="flex flex-col gap-2.5">
            <CounterChart />
            <GamePanel />
            <EventLog />
          </div>

          {/* Col 3 — Controls */}
          <div className="flex flex-col md:grid md:grid-cols-3 lg:flex lg:flex-col gap-2.5 md:col-span-2 lg:col-span-1">
            <ModeSelector />
            <SpeedSlider />
            <ISRStatus />
          </div>
        </div>
      </div>
    </div>
  );
}
