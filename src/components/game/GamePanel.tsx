import { useSTM32Store } from '../../store/stm32Store';
import {
  BarChart, Bar, ResponsiveContainer, Tooltip, ReferenceLine, Cell,
} from 'recharts';

export function GamePanel() {
  const { score, lives } = useSTM32Store((s) => s.data);
  const rtHistory = useSTM32Store((s) => s.rtHistory);
  const isDark = useSTM32Store((s) => s.isDark);

  const avg = Math.round(rtHistory.reduce((a, b) => a + b, 0) / rtHistory.length);
  const tooltipBg = isDark ? '#1e1e1b' : '#ffffff';
  const tooltipBorder = isDark ? '#2e2e2b' : '#e5e7eb';

  const chartData = rtHistory.map((v, i) => ({ i, v }));

  const livesDisplay = Array.from({ length: 3 }, (_, i) => i < lives);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <span className="section-label">Game panel</span>
        <span className="badge badge-green text-[10px]">Whack-a-LED</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="metric-mini">
          <div className="metric-mini-label">Score</div>
          <div className="metric-mini-val tabular-nums">{score}</div>
        </div>
        <div className="metric-mini">
          <div className="metric-mini-label">Lives</div>
          <div className="flex gap-1 mt-1">
            {livesDisplay.map((alive, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${alive ? 'bg-emerald-500' : 'bg-[var(--border2)]'}`} />
            ))}
          </div>
        </div>
        <div className="metric-mini">
          <div className="metric-mini-label">Avg RT</div>
          <div className="metric-mini-val tabular-nums">
            {avg}<span className="text-[10px] font-normal">ms</span>
          </div>
        </div>
      </div>

      <span className="section-label mb-2 block">Reaction time history</span>

      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }} barCategoryGap="20%">
            <Tooltip
              contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 6, fontSize: 11 }}
              formatter={(v) => [`${String(v ?? '-') }ms`, 'reaction']}
              labelFormatter={() => ''}
            />
            <ReferenceLine y={250} stroke={isDark ? '#94a3b8' : '#64748b'} strokeDasharray="3 2" strokeWidth={1} />
            <Bar dataKey="v" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.v < 200
                    ? '#10b981'
                    : entry.v < 300
                    ? (isDark ? '#60a5fa' : '#3b82f6')
                    : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center text-[9px] text-[var(--text3)] mt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />fast &lt;200ms
        </span>
        <span className="text-[var(--text3)]">— 250ms human avg</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />slow &gt;300ms
        </span>
      </div>
    </div>
  );
}