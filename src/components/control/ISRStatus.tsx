import { useSTM32Store } from '../../store/stm32Store';
import { useState, useEffect } from 'react';

export function ISRStatus() {
  const { data } = useSTM32Store();
  const [lastTriggeredAgo, setLastTriggeredAgo] = useState(14);
  const [totalISR] = useState(3);

  useEffect(() => {
    const t = setInterval(() => setLastTriggeredAgo((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const savedMode = data.mode === 'ISR' ? '—' : `Mode ${data.mode}`;

  return (
    <div className="card">
      <span className="section-label mb-3 block">ISR status</span>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text2)]">Last triggered</span>
          <span className="text-[11px] font-medium text-[var(--text)]">{lastTriggeredAgo}s ago</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text2)]">Total ISR count</span>
          <span className="text-[11px] font-medium text-[var(--text)]">{totalISR}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text2)]">Saved mode</span>
          <span className="badge badge-blue text-[10px]">{savedMode}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text2)]">Status</span>
          <span className={`text-[11px] font-medium ${data.isrActive ? 'text-amber-500' : 'text-emerald-500'}`}>
            {data.isrActive ? `Active (${(data.isrRemainMs / 1000).toFixed(1)}s)` : 'Idle'}
          </span>
        </div>
      </div>
    </div>
  );
}
