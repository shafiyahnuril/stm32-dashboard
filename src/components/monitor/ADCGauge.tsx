import { useSTM32Store } from '../../store/stm32Store';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, ReferenceLine,
} from 'recharts';

export function ADCGauge() {
  const adc = useSTM32Store((s) => s.data.adc);
  const history = useSTM32Store((s) => s.adcHistory);
  const isDark = useSTM32Store((s) => s.isDark);

  const pct = Math.round((adc / 4095) * 100);
  const ledCount = adc === 0 ? 0 : adc > 895 ? 8 : Math.max(1, Math.round((adc / 895) * 7));

  const chartData = history.map((v, i) => ({ i, v }));
  const stroke = isDark ? '#60a5fa' : '#3b82f6';
  const refColor = isDark ? '#f59e0b' : '#d97706';
  const tooltipBg = isDark ? '#1e1e1b' : '#ffffff';
  const tooltipBorder = isDark ? '#2e2e2b' : '#e5e7eb';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="section-label">ADC · potentiometer</span>
        <span className="text-[11px] font-medium text-[var(--text2)]">{pct}%</span>
      </div>

      <div className="h-2 rounded-full bg-[var(--bg3)] border border-[var(--border)] overflow-hidden mb-1">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-[var(--text3)] mb-4">
        <span>0</span>
        <span className="font-medium text-[var(--text2)]">{adc} / 4095</span>
        <span>4095</span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="section-label">ADC history</span>
        <span className="text-[10px] text-[var(--text3)]">
          {adc > 895 ? '8 LED on' : `${ledCount} LED on`}
        </span>
      </div>

      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="adcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 6, fontSize: 11 }}
              formatter={(v) => [Number(v ?? 0), 'ADC']}
              labelFormatter={() => ''}
            />
            <ReferenceLine y={895} stroke={refColor} strokeDasharray="3 3" strokeWidth={1} />
            <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} fill="url(#adcGrad)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-[9px] text-[var(--text3)] mt-1">
        <span>40s ago</span>
        <span className="text-amber-500">— 895 threshold</span>
        <span>now</span>
      </div>
    </div>
  );
}
