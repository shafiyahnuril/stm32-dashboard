import { useSTM32Store } from '../../store/stm32Store';
import { Thermometer, Ruler } from 'lucide-react';

export function SensorCards() {
  const { data } = useSTM32Store();
  const temp = (data as any).temperature ?? 24.5;
  const dist = (data as any).distance ?? 150;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-orange-500 p-5 rounded-2xl shadow-sm text-white flex items-center justify-between group cursor-default">
        <div className="relative z-10">
          <div className="text-xs font-medium text-white/80 uppercase tracking-wider mb-1">Temperature</div>
          <div className="text-4xl font-extrabold tracking-tight mb-1">{temp}C</div>
          <div className="text-xs text-white/70 font-medium">Sensor Output</div>
        </div>
        <Thermometer size={56} className="text-white/20 absolute right-4 group-hover:scale-110 transition-transform" />
      </div>
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 p-5 rounded-2xl shadow-sm text-white flex items-center justify-between group cursor-default">
        <div className="relative z-10">
          <div className="text-xs font-medium text-white/80 uppercase tracking-wider mb-1">Distance</div>
          <div className="text-4xl font-extrabold tracking-tight mb-1">{dist} cm</div>
          <div className="text-xs text-white/70 font-medium">Sensor Output</div>
        </div>
        <Ruler size={56} className="text-white/20 absolute right-4 group-hover:scale-110 transition-transform" />
      </div>
    </div>
  );
}
