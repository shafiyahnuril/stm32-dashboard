import { useSTM32Store } from '../../store/stm32Store';

export function LEDDisplay() {
  const { ledMask, isrActive } = useSTM32Store((s) => s.data);

  const leds = Array.from({ length: 8 }, (_, i) => ({
    on: Boolean((ledMask >> i) & 1),
    isr: isrActive,
  }));

  const onCount = leds.filter((l) => l.on).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <span className="section-label">LED status</span>
        <span className={`badge ${onCount > 0 ? 'badge-blue' : 'badge-muted'}`}>
          {onCount} / 8 on
        </span>
      </div>

      <div className="grid grid-cols-8 gap-1.5 mb-3">
        {leds.map((led, i) => (
          <div
            key={i}
            className={`
              aspect-square rounded-full border flex items-center justify-center
              text-[9px] font-medium transition-all duration-100 select-none
              ${led.on
                ? led.isr
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'bg-blue-500 border-blue-400 text-white'
                : 'bg-[var(--led-off)] border-[var(--border2)] text-[var(--text3)]'
              }
            `}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] text-[var(--text3)]">Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-[var(--text3)]">ISR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[var(--led-off)] border border-[var(--border2)]" />
          <span className="text-[10px] text-[var(--text3)]">Inactive</span>
        </div>
      </div>
    </div>
  );
}
