import { Sun, Moon, Wifi } from 'lucide-react';
import { useSTM32Store } from '../../store/stm32Store';

const MODE_LABELS: Record<string, { label: string; cls: string }> = {
  '1':   { label: 'Mode 1 — Shift',   cls: 'badge-amber' },
  '2':   { label: 'Mode 2 — Counter', cls: 'badge-blue' },
  '3':   { label: 'Mode 3 — ADC',     cls: 'badge-green' },
  'ISR': { label: 'ISR active',       cls: 'badge-red' },
};

export function Header() {
  const { data, isDark, toggleTheme } = useSTM32Store();
  const modeKey = String(data.isrActive ? 'ISR' : data.mode);
  const modeInfo = MODE_LABELS[modeKey] ?? MODE_LABELS['1'];

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] mb-4">
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-[var(--text)]">STM32 Dashboard</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-600">
          <Wifi size={11} />
          <span>192.168.1.5</span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
        <span className={`badge ${modeInfo.cls}`}>{modeInfo.label}</span>
        <button
          onClick={toggleTheme}
          className="w-7 h-7 rounded-md border border-[var(--border2)] bg-[var(--bg2)]
            flex items-center justify-center text-[var(--text2)]
            hover:bg-[var(--bg3)] transition-colors"
          title="Toggle dark/light"
        >
          {isDark
            ? <Sun size={13} />
            : <Moon size={13} />
          }
        </button>
      </div>
    </header>
  );
}
