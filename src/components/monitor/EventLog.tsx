import { useSTM32Store } from '../../store/stm32Store';
import { Terminal, CopyX } from 'lucide-react';
import { useRef, useEffect } from 'react';

export function EventLog() {
  const logs = useSTM32Store((s) => s.logs);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[300px] overflow-hidden text-slate-700 dark:text-slate-300 transition-colors">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-emerald-500" />
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Terminal Log</h3>
        </div>
        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-500 border border-slate-200 dark:border-slate-800">
          MAX 100 LINES
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-2 font-mono text-xs">
        {logs.length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-600 mt-10 flex flex-col items-center gap-2">
            <CopyX size={24} className="opacity-50" />
            <p>No activity recorded yet.</p>
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 p-1.5 rounded-md transition-colors">
            <span className="text-slate-400 dark:text-slate-600 shrink-0 select-none">[{log.ts}]</span>
            <span className={log.type === 'CMD' ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'}>
              {log.type === 'CMD' ? '->' : '<-'}
            </span>
            <span className="break-all whitespace-pre-wrap">{log.msg}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

