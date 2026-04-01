import { useEffect, useRef } from 'react';
import { useSTM32Store } from '../store/stm32Store';
import type { STM32Data } from '../types/stm32.types';

let tick = 0;
let counter = 17;

export function generateMockData(current: STM32Data): STM32Data {
  tick++;

  const wsUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (wsUrl && wsUrl !== 'mock') return current;

  let { mode, isrActive, isrRemainMs, ledMask, score, lives } = current;

  if (isrActive) {
    isrRemainMs = Math.max(0, isrRemainMs - 200);
    if (isrRemainMs === 0) isrActive = false;
    return { ...current, isrActive, isrRemainMs, ledMask: isrActive ? 0xff : ledMask };
  }

  const adc = Math.max(0, Math.min(4095,
    Math.round(2048 + Math.sin(tick * 0.07) * 1400 + (Math.random() - 0.5) * 150)
  ));

  if (mode === 2) {
    counter = (counter + 1) % 25;
    ledMask = counter & 0xff;
  } else if (mode === 3) {
    const cnt = adc === 0 ? 0 : adc > 895 ? 8 : Math.max(1, Math.round((adc / 895) * 7));
    ledMask = cnt >= 8 ? 0xff : (1 << cnt) - 1;
  } else if (mode === 1) {
    const pos = tick % 8;
    ledMask = 1 << pos;
  }

  const reactionMs = Math.round(160 + Math.random() * 220);
  if (tick % 4 === 0) score += reactionMs < 250 ? 10 : 5;

  return { ...current, adc, ledMask, counter, score, lives, reactionMs, isrActive: false, isrRemainMs: 0 };
}

export function useSTM32() {
  const { data, setData, pushAdcHistory, pushCtrHistory, pushRtHistory } = useSTM32Store();
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const interval = setInterval(() => {
      const next = generateMockData(dataRef.current);
      setData(next);
      pushAdcHistory(next.adc);
      if (next.mode === 2) pushCtrHistory(next.counter);
      if (tick % 4 === 0) pushRtHistory(next.reactionMs);
    }, 200);
    return () => clearInterval(interval);
  }, [setData, pushAdcHistory, pushCtrHistory, pushRtHistory]);
}
