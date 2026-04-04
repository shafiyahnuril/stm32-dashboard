import { useSTM32Store } from '../../store/stm32Store';
import { Moon, Sun, Activity } from 'lucide-react';

export function Header() {
  const { connectionError, isDark, toggleTheme } = useSTM32Store();

  return (
    <header className="flex items-center justify-between py-6 mb-2">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl text-white shadow-sm ${!connectionError ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-600'}`}>
          <Activity size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">STM32 Dashboard</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="relative flex h-2.5 w-2.5">
              {!connectionError && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${!connectionError ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {!connectionError ? 'System Online' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={toggleTheme}
        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
}

