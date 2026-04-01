import { useEffect } from 'react';
import { useSTM32Store } from './store/stm32Store';
import { useSTM32 } from './hooks/useSTM32';

import { Header }       from './components/layout/Header';
import { MetricCards }  from './components/monitor/MetricCards';
import { LEDDisplay }   from './components/monitor/LEDDisplay';
import { ADCGauge }     from './components/monitor/ADCGauge';
import { CounterChart } from './components/monitor/CounterChart';
import { EventLog }     from './components/monitor/EventLog';
import { ModeSelector } from './components/control/ModeSelector';
import { SpeedSlider }  from './components/control/SpeedSlider';
import { ISRStatus }    from './components/control/ISRStatus';
import { GamePanel }    from './components/game/GamePanel';

export default function App() {
  useSTM32();

  const isDark = useSTM32Store((s) => s.isDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-[1280px] mx-auto px-3 pb-6">
        <Header />
        <MetricCards />

        {/* Main 3-column grid */}
        <div className="grid gap-2.5" style={{ gridTemplateColumns: '1fr 1fr 260px' }}>

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
          <div className="flex flex-col gap-2.5">
            <ModeSelector />
            <SpeedSlider />
            <ISRStatus />
          </div>

        </div>
      </div>
    </div>
  );
}