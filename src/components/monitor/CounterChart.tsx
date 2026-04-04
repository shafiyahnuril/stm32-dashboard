import { useSTM32Store } from '../../store/stm32Store';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

export function CounterChart() {
  const isDark = useSTM32Store((s) => s.isDark);
  const data = useSTM32Store((s) => s.ctrHistory);
  const chartData = data.map((v, i: number) => ({ i, value: v }));

  const colors = {
    grid: isDark ? '#334155' : '#e2e8f0',
    axis: isDark ? '#64748b' : '#94a3b8',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#cbd5e1',
    line: isDark ? '#f43f5e' : '#f43f5e', // rose-500
    ref: isDark ? '#f59e0b' : '#d97706',  // amber
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm col-span-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Counter Status</h3>
        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-[10px] font-bold text-amber-600 dark:text-amber-500">Threshold 24</span>
      </div>

      <div className="h-[300px] w-full mt-2 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="i" stroke={colors.axis} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis stroke={colors.axis} tick={{ fontSize: 10 }} width={30} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                borderColor: colors.tooltipBorder,
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                color: isDark ? '#fff' : '#000',
              }}
              cursor={{ stroke: colors.grid, strokeWidth: 1, strokeDasharray: '4 4' }}
              labelFormatter={() => ''}
            />
            <ReferenceLine y={24} stroke={colors.ref} strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Target', position: 'insideTopLeft', fill: colors.ref, fontSize: 10 }} />
            <Line
              type="stepAfter"
              dataKey="value"
              stroke={colors.line}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

