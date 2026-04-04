import { useSTM32Store } from '../../store/stm32Store';
import { Layers, Activity, Target } from 'lucide-react';

export function MetricCards() {
  const { data } = useSTM32Store();
  const modeLabels: Record<number, string> = {
    1: 'Shift Left', 2: 'Counter Chart', 3: 'ADC Control', 4: 'Train Crash',
    5: 'Binary Counter', 6: 'LED Pattern', 7: 'Servo Control',
    8: 'Rhythm Tap', 9: 'Tebak Biner', 10: 'Game Lobby',
  };
  const modeLabel = data.isrActive ? 'ISR' : modeLabels[data.mode as number] ?? 'Unknown';

  const metrics = [
    { label: 'System Mode', value: String(data.isrActive ? 'ISR' : data.mode), sub: modeLabel, icon: Layers, color: 'text-indigo-500' },
    { label: 'ADC Value', value: String(data.adc), sub: 'Range: 0 - 4095', icon: Activity, color: 'text-rose-500' },
    { label: 'Counter Target', value: String(data.counter), sub: 'Threshold: 24', icon: Target, color: 'text-amber-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {metrics.map(({ label, value, sub, icon: Icon, color }) => (
        <div key={label} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4 transition-all hover:shadow-md">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{label}</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight mb-0.5">{value}</div>
            <div className="text-xs font-medium text-slate-400 dark:text-slate-500">{sub}</div>
          </div>
          <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 ${color}`}>
            <Icon size={28} strokeWidth={2} />
          </div>
        </div>
      ))}
    </div>
  );
}
