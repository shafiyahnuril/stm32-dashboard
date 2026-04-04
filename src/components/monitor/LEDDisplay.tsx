import { useSTM32Store } from '../../store/stm32Store';

export function LEDDisplay() {
  const { ledMask } = useSTM32Store((s) => s.data);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">LED STATUS</h3>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400">8 bits</span>
      </div>

      <div className="flex justify-between items-center bg-slate-50 dark:bg-[#0b101e] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
        {[...Array(8)].map((_, i) => {
          const bitIndex = 7 - i;
          const isOn = (ledMask & (1 << bitIndex)) !== 0;
          return (
            <div key={i} className="flex flex-col items-center gap-2 group">
              <div 
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full shadow-inner transition-all duration-300 ring-2 ${
                  isOn 
                    ? 'bg-rose-500 ring-rose-500/50 shadow-rose-500/50 dark:bg-rose-400 dark:ring-rose-400/50 dark:shadow-rose-500/40 glow-red' 
                    : 'bg-slate-200 ring-slate-100/0 dark:bg-slate-700 dark:ring-slate-800'
                }`}
              />
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                L{bitIndex}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

