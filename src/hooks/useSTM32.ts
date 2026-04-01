import { useEffect, useRef } from 'react';
import { useSTM32Store } from '../store/stm32Store';
import type { STM32Data } from '../types/stm32.types';

let tick = 0;
let counter = 17;

export function generateMockData(current: STM32Data): STM32Data {
  tick++;

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
  const { setData, pushAdcHistory, pushCtrHistory, pushRtHistory } = useSTM32Store();
  const dataRef = useRef(useSTM32Store.getState().data);
  const wsRef = useRef<WebSocket | null>(null);

  // Selalu update dataRef saat store berubah
  useEffect(() => {
    return useSTM32Store.subscribe((state) => {
      dataRef.current = state.data;
    });
  }, []);

  const wsUrl = import.meta.env.VITE_WS_URL as string;
  const isMock = !wsUrl || wsUrl === 'mock';

  useEffect(() => {
    // ── MODE MOCK ──
    if (isMock) {
      const interval = setInterval(() => {
        const next = generateMockData(dataRef.current);
        setData(next);
        pushAdcHistory(next.adc);
        if (next.mode === 2) pushCtrHistory(next.counter);
        if (tick % 4 === 0) pushRtHistory(next.reactionMs);
      }, 200);
      return () => clearInterval(interval);
    }

    // ── MODE REAL (WebSocket ke CubeMonitor) ──
    const connect = () => {
      console.log('[WS] Connecting to', wsUrl); // ← cek di console browser
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Simpan ref ke store agar sendCommand bisa kirim command
      useSTM32Store.getState().setWsRef(wsRef);

      ws.onopen = () => {
        console.log('[WS] Connected!'); // ← harus muncul jika berhasil
      };

      ws.onmessage = (event) => {
        try {
          const incoming: Partial<STM32Data> = JSON.parse(event.data);
          const next: STM32Data = { ...dataRef.current, ...incoming };
          setData(next);
          pushAdcHistory(next.adc);
          pushCtrHistory(next.counter);
          pushRtHistory(next.reactionMs);
        } catch (e) {
          console.warn('[WS] Parse error:', e);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected, reconnecting in 2s...');
        setTimeout(connect, 2000);
      };

      ws.onerror = (e) => {
        console.error('[WS] Error:', e);
        ws.close();
      };
    };

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [isMock, wsUrl, setData, pushAdcHistory, pushCtrHistory, pushRtHistory]);
}