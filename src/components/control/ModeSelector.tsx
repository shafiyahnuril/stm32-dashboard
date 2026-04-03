import { useState, useEffect } from "react";
import { useSTM32Store } from "../../store/stm32Store";

const MODES = [
  { n: 1, label: "Mode 1", sub: "Shift Left" },
  { n: 2, label: "Mode 2", sub: "Counter" },
  { n: 3, label: "Mode 3", sub: "ADC Control" },
  { n: 4, label: "Mode 4", sub: "Train Crash" },
  { n: 5, label: "Mode 5", sub: "Binary Counter" },
  { n: 6, label: "Mode 6", sub: "LED Pattern" },
  { n: 7, label: "Mode 7", sub: "Rhythm Tap" },
  { n: 8, label: "Mode 8", sub: "Charge & Rel" },
  { n: 9, label: "Mode 9", sub: "Whack-a-LED" },
  { n: 10, label: "Mode 10", sub: "Binary Game" },
] as const;

export function ModeSelector() {
  const { data, sendCommand } = useSTM32Store();
  const currentMode = data.mode === "ISR" ? null : data.mode;

  const [isrProgress, setIsrProgress] = useState(0);

  useEffect(() => {
    if (data.isrActive) {
      setIsrProgress(Math.round(((5000 - data.isrRemainMs) / 5000) * 100));
    } else {
      setIsrProgress(0);
    }
  }, [data.isrActive, data.isrRemainMs]);

  return (
    <div className="card">
      <span className="section-label mb-3 block">Mode selector</span>

      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {MODES.slice(0, 5).map(({ n, label, sub }) => (
          <button
            key={n}
            onClick={() => sendCommand({ type: "SET_MODE", mode: n as any })}
            disabled={data.isrActive}
            className={`
              py-2 rounded-lg border text-center text-xs font-medium transition-all
              disabled:opacity-40 disabled:cursor-not-allowed
              ${
                currentMode === n
                  ? "bg-[var(--accent-bg)] border-[var(--accent)] text-[var(--accent-text)]"
                  : "bg-[var(--bg3)] border-[var(--border2)] text-[var(--text2)] hover:bg-[var(--bg2)]"
              }
            `}
          >
            <div>{label}</div>
            <div className="text-[9px] font-normal opacity-70 mt-0.5">
              {sub}
            </div>
          </button>
        ))}
      </div>

      <span className="section-label mb-3 block mt-2">Game Modes</span>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {MODES.slice(5).map(({ n, label, sub }) => (
          <button
            key={n}
            onClick={() => sendCommand({ type: "SET_MODE", mode: n as any })}
            disabled={data.isrActive}
            className={`
              py-2 rounded-lg border text-center text-xs font-medium transition-all
              disabled:opacity-40 disabled:cursor-not-allowed
              ${
                currentMode === n
                  ? "bg-purple-900/40 border-purple-500/50 text-purple-400"
                  : "bg-[var(--bg3)] border-[var(--border2)] text-[var(--text2)] hover:bg-[var(--bg2)]"
              }
            `}
          >
            <div>{label}</div>
            <div className="text-[9px] font-normal opacity-70 mt-0.5">
              {sub}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        <button
          onClick={() => sendCommand({ type: "TRIGGER_ISR" })}
          disabled={data.isrActive}
          className="ctrl-btn ctrl-btn-danger"
        >
          {data.isrActive
            ? `ISR ${(data.isrRemainMs / 1000).toFixed(1)}s`
            : "Trigger ISR"}
        </button>
        <button
          onClick={() => sendCommand({ type: "LED_ALL_ON" })}
          className="ctrl-btn ctrl-btn-success"
        >
          All LED on
        </button>
        <button
          onClick={() => sendCommand({ type: "LED_ALL_OFF" })}
          className="ctrl-btn"
        >
          All LED off
        </button>
        <button
          onClick={() => sendCommand({ type: "RESET_STATS" })}
          className="ctrl-btn"
        >
          Reset stats
        </button>
      </div>

      {data.isrActive && (
        <div>
          <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden mb-1">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-200"
              style={{ width: `${isrProgress}%` }}
            />
          </div>
          <p className="text-center text-[10px] text-amber-500">
            ISR active — returning to mode in{" "}
            {(data.isrRemainMs / 1000).toFixed(1)}s
          </p>
        </div>
      )}
    </div>
  );
}
