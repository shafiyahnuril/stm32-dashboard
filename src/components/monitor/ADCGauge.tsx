import { useSTM32Store } from '../../store/stm32Store';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export function ADCGauge() {
  const adc = useSTM32Store((s) => s.data.adc);
  const history = useSTM32Store((s) => s.adcHistory);
  const isDark = useSTM32Store((s) => s.isDark);

  const pct = Math.round((adc / 4095) * 100);
  const chartData = history.map((v, i) => ({ i, v }));
  
  const strokeColor = isDark ? '#818cf8' : '#6366f1';
  const fillStart = isDark ? '#4f46e5' : '#818cf8';

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">ADC / Potentiometer</h3>
        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md">{pct}%</span>
      </div>

      <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="h-[140px] w-full mt-2 opacity-90">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="adcGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillStart} stopOpacity={0.3} />
                <stop offset="95%" stopColor={fillStart} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area strokeWidth={2} type="monotone" dataKey="v" stroke={strokeColor} fill="url(#adcGradient)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
