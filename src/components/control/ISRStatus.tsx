import { useSTM32Store } from '../../store/stm32Store';

export function ISRStatus() {
  const { data } = useSTM32Store();
  if (!data.isrActive) return null;

  return (
    <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-2xl border border-rose-200 dark:border-rose-800 shadow-sm flex items-center justify-between col-span-full animate-pulse transition-colors mt-auto">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-rose-500 rounded-xl text-white">
          <svg className="w-6 h-6 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-rose-900 dark:text-rose-400">Interrupt Active</h3>
          <p className="text-xs text-rose-700 dark:text-rose-500">System is processing hardware interrupt</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-3xl font-black tabular-nums text-rose-600 dark:text-rose-400">
          {(data.isrRemainMs / 1000).toFixed(1)}s
        </div>
        <div className="text-[10px] uppercase tracking-wider font-bold text-rose-500 dark:text-rose-600">Remaining</div>
      </div>
    </div>
  );
}
