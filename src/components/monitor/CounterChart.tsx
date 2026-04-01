import { useSTM32Store } from '../../store/stm32Store';
import {
  LineChart, Line, ResponsiveContainer, Tooltip, ReferenceLine, YAxis,
} from 'recharts';

export function CounterChart() {
  const counter = useSTM32Store((s) => s.data.counter);
  const mode = useSTM32Store((s) => s.data.mode);
  const history = useSTM32Store((s) => s.ctrHistory);
  const isDark = useSTM32Store((s) => s.isDark);

  const chartData = history.map((v, i) => ({ i, v }));
  const stroke = isDark ? '#a78bfa' : '#7c3aed';
  const refColor = isDark ? '#34d399' : '#059669';
  const tooltipBg = isDark ? '#1e1e1b' : '#ffffff';
  const tooltipBorder = isDark ? '#2e2e2b' : '#e5e7eb';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <span className="section-label">Counter chart · Mode {mode}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--text3)]">current</span>
          <span className="text-lg font-semibold text-[var(--text)] tabular-nums">{counter}</span>
        </div>
      </div>

      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <YAxis domain={[0, 25]} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 6, fontSize: 11 }}
              formatter={(v) => [Number(v ?? 0), 'counter']}
              labelFormatter={() => ''}
            />
            <ReferenceLine y={24} stroke={refColor} strokeDasharray="3 3" strokeWidth={1} label={{ value: 'NIM 24', fontSize: 9, fill: refColor, position: 'right' }} />
            <ReferenceLine y={19} stroke={isDark ? '#fb923c' : '#ea580c'} strokeDasharray="3 3" strokeWidth={1} label={{ value: 'partner 19', fontSize: 9, fill: isDark ? '#fb923c' : '#ea580c', position: 'right' }} />
            <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between text-[9px] text-[var(--text3)] mt-1">
        <span>40s ago</span>
        <span>now</span>
      </div>
    </div>
  );
}
