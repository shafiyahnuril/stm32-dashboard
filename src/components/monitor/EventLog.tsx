import { useSTM32Store } from '../../store/stm32Store';
import type { LogEntry } from '../../types/stm32.types';

const typeStyle: Record<LogEntry['type'], string> = {
  MODE: 'text-blue-500',
  ISR:  'text-red-500',
  CMD:  'text-blue-400',
  SYS:  'text-emerald-500',
  GAME: 'text-amber-500',
};

export function EventLog() {
  const logs = useSTM32Store((s) => s.logs);

  return (
    <div className="card flex-1">
      <div className="flex items-center justify-between mb-3">
        <span className="section-label">Event log</span>
        <span className="text-[10px] text-[var(--text3)]">{logs.length} events</span>
      </div>

      <div className="rounded-lg bg-[var(--bg3)] border border-[var(--border)] overflow-hidden">
        {logs.slice(0, 8).map((log, i) => (
          <div
            key={log.id}
            className={`flex items-baseline gap-2 px-3 py-1.5 font-mono text-[11px] ${
              i < logs.length - 1 ? 'border-b border-[var(--border)]' : ''
            }`}
          >
            <span className="text-[var(--text3)] tabular-nums shrink-0">{log.ts}</span>
            <span className={`font-semibold shrink-0 ${typeStyle[log.type]}`}>{log.type}</span>
            <span className="text-[var(--text2)] truncate">{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
