import { useEffect } from "react";
import { useSTM32Store } from "../../store/stm32Store";

const MODES = [
  { n: 1, label: "Mode 1", sub: "Shift Left" },
  { n: 2, label: "Mode 2", sub: "Counter Chart" },
  { n: 3, label: "Mode 3", sub: "ADC Control" },
  { n: 4, label: "Mode 4", sub: "Train Crash" },
  { n: 5, label: "Mode 5", sub: "Binary Counter" },
  { n: 6, label: "Mode 6", sub: "LED Pattern" },
  { n: 7, label: "Mode 7", sub: "Servo Control" },
] as const;

// Mode 8 & 9 aktif via BTN1+BTN2 di hardware (lobby → pilih game).
// Tombol ini mengirim SET_MODE ke STM32 sebagai shortcut.
const GAME_MODES = [
  { n: 8, label: "Rhythm Tap", sub: "Mode 8" },
  { n: 9, label: "Tebak Biner", sub: "Mode 9" },
] as const;

export function ModeSelector() {
  const { data, sendCommand } = useSTM32Store();
  const currentMode = data.mode === "ISR" ? null : data.mode;

  // Timer frontend untuk mengurus countdown ISR State
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (data.isrActive && data.isrRemainMs > 0) {
      interval = setInterval(() => {
        useSTM32Store.setState((state) => {
          const remain = Math.max(0, state.data.isrRemainMs - 100);
          return {
            data: {
              ...state.data,
              isrRemainMs: remain,
              isrActive: remain > 0,
            },
          };
        });
      }, 100);
    } else if (data.isrActive && data.isrRemainMs <= 0) {
      useSTM32Store.setState((state) => ({
        data: { ...state.data, isrActive: false },
      }));
    }
    return () => clearInterval(interval);
  }, [data.isrActive, data.isrRemainMs]);

  const isrProgress = data.isrActive
    ? Math.round(((5000 - data.isrRemainMs) / 5000) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50">
      <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-4 tracking-tight uppercase text-xs opacity-80">
        Modes
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {MODES.map(({ n, label, sub }) => (
          <button
            key={n}
            onClick={() => sendCommand({ type: "SET_MODE", mode: n as any })}
            disabled={data.isrActive}
            className={`p-3 rounded-xl border text-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              currentMode === n
                ? "bg-blue-500 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
            }`}
          >
            <div className="font-semibold text-sm">{label}</div>
            <div
              className={`text-[10px] mt-1 ${currentMode === n ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}
            >
              {sub}
            </div>
          </button>
        ))}
      </div>

      <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-4 tracking-tight uppercase text-xs opacity-80 mt-2">
        Game Modes
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {GAME_MODES.map(({ n, label, sub }) => (
          <button
            key={n}
            onClick={() => sendCommand({ type: "SET_MODE", mode: n as any })}
            disabled={data.isrActive}
            className={`p-4 rounded-xl border text-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              currentMode === n
                ? "bg-purple-500 border-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                : "bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40"
            }`}
          >
            <div className="font-semibold text-md">{label}</div>
            <div
              className={`text-xs mt-1 ${currentMode === n ? "text-purple-100" : "text-purple-400 dark:text-purple-500"}`}
            >
              {sub}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => sendCommand({ type: "TRIGGER_ISR" })}
          disabled={data.isrActive}
          className="col-span-2 py-4 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all border border-red-600 disabled:opacity-50"
        >
          {data.isrActive
            ? `ISR Active (${(data.isrRemainMs / 1000).toFixed(1)}s)`
            : "TRIGGER ISR"}
        </button>
        <button
          onClick={() => sendCommand({ type: "LED_ALL_ON" })}
          className="col-span-1 py-3 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors"
        >
          All LED ON
        </button>
        <button
          onClick={() => sendCommand({ type: "LED_ALL_OFF" })}
          className="col-span-1 py-3 rounded-xl text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow-sm transition-colors"
        >
          All LED OFF
        </button>
      </div>

      {data.isrActive && (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-slate-100 dark:bg-gray-700 overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-200 ease-out"
              style={{ width: `${isrProgress}%` }}
            />
          </div>
          <p className="text-center text-xs font-medium text-red-500 animate-pulse">
            ISR Active Returning in {(data.isrRemainMs / 1000).toFixed(1)}s
          </p>
        </div>
      )}
    </div>
  );
}
