import { useState } from 'react';

export function SpeedSlider() {
  const [gameSpeed, setGameSpeed] = useState(5);
  const [chartWindow, setChartWindow] = useState(30);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50">
      <span className="text-slate-900 dark:text-slate-100 font-bold mb-4 tracking-tight uppercase text-xs opacity-80 block">Speed control</span>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] text-slate-500 dark:text-slate-400">Game speed</label>
            <span className="text-[11px] font-medium text-slate-900 dark:text-white">{gameSpeed}</span>
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
            <label className="text-[11px] text-slate-500 dark:text-slate-400">Chart window</label>
            <span className="text-[11px] font-medium text-slate-900 dark:text-white">{chartWindow}s</span>
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
