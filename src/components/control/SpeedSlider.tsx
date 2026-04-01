import { useState } from 'react';

export function SpeedSlider() {
  const [gameSpeed, setGameSpeed] = useState(5);
  const [chartWindow, setChartWindow] = useState(30);

  return (
    <div className="card">
      <span className="section-label mb-3 block">Speed control</span>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] text-[var(--text2)]">Game speed</label>
            <span className="text-[11px] font-medium text-[var(--text)]">{gameSpeed}</span>
          </div>
          <input
            type="range" min={1} max={10} step={1}
            value={gameSpeed}
            onChange={(e) => setGameSpeed(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] text-[var(--text2)]">Chart window</label>
            <span className="text-[11px] font-medium text-[var(--text)]">{chartWindow}s</span>
          </div>
          <input
            type="range" min={10} max={60} step={5}
            value={chartWindow}
            onChange={(e) => setChartWindow(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
