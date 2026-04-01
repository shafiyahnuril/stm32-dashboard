import { useSTM32Store } from '../../store/stm32Store';

export function MetricCards() {
  const { data } = useSTM32Store();
  const modeLabel = data.isrActive ? 'ISR' : ['', 'Shift', 'Counter', 'ADC'][data.mode as number] ?? '—';

  const metrics = [
    { label: 'Mode',      value: String(data.isrActive ? 'ISR' : data.mode), sub: modeLabel },
    { label: 'ADC value', value: String(data.adc),                           sub: '0 – 4095' },
    { label: 'Counter',   value: String(data.counter),                       sub: 'target: 24' },
    { label: 'Score',     value: String(data.score),                         sub: 'this session' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {metrics.map(({ label, value, sub }) => (
        <div key={label} className="metric-card">
          <div className="metric-label">{label}</div>
          <div className="metric-value tabular-nums">{value}</div>
          <div className="metric-sub">{sub}</div>
        </div>
      ))}
    </div>
  );
}
