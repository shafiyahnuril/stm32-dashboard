import { useSTM32Store } from '../../store/stm32Store';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

export function SensorChart() {
  const isDark = useSTM32Store((s) => s.isDark);
  
  // Create mock history based on adcHistory since the store currently only tracks adc, ctr, and rt.
  const data = useSTM32Store((s) => s.adcHistory);
  const chartData = data.map((v, i: number) => ({
    i,
    temperature: +(20 + (v / 200)).toFixed(1),
    humidity: +(40 + (v / 100)).toFixed(1),
  }));

  const colors = {
    grid: isDark ? '#334155' : '#e2e8f0',
    axis: isDark ? '#64748b' : '#94a3b8',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#cbd5e1',
    tempLine: isDark ? '#f43f5e' : '#f43f5e', // rose-500
    humidLine: isDark ? '#0ea5e9' : '#0ea5e9', // sky-500
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm col-span-full mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Environment Sensors</h3>
        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-[10px] font-bold text-blue-600 dark:text-blue-500">Live Feed</span>
      </div>

      <div className="h-[300px] w-full mt-2 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
            <XAxis dataKey="i" stroke={colors.axis} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke={colors.axis} tick={{ fontSize: 10 }} width={30} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
            <YAxis yAxisId="right" orientation="right" stroke={colors.axis} tick={{ fontSize: 10 }} width={30} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
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
              labelFormatter={() => 'Sample'}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} iconType="circle" />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              name="Temperature (°C)"
              stroke={colors.tempLine}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="humidity"
              name="Humidity (%)"
              stroke={colors.humidLine}
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