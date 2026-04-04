import { create } from "zustand";
import type { STM32Data, LogEntry, Command } from "../types/stm32.types";

let logIdCounter = 100;

function nowTs() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

interface STM32Store {
  data: STM32Data;
  logs: LogEntry[];
  adcHistory: number[];
  ctrHistory: number[];
  rtHistory: number[];
  isDark: boolean;
  connectionError: string | null;
  wsRef: { current: WebSocket | null } | null;
  setWsRef: (ref: { current: WebSocket | null }) => void;
  setConnectionError: (error: string | null) => void;
  setData: (d: STM32Data) => void;
  addLog: (type: LogEntry["type"], msg: string) => void;
  pushAdcHistory: (v: number) => void;
  pushCtrHistory: (v: number) => void;
  pushRtHistory: (v: number) => void;
  toggleTheme: () => void;
  sendCommand: (cmd: Command) => void;
}

export const useSTM32Store = create<STM32Store>((set, get) => ({
  data: {
    mode: 2,
    adc: 2041,
    ledMask: 0b00001111,
    counter: 17,
    score: 340,
    lives: 3,
    reactionMs: 218,
    isrActive: false,
    isrRemainMs: 0,
  },
  logs: [
    { id: 1, ts: "09:14:32", type: "MODE", msg: "changed → 2 (Counter)" },
    { id: 2, ts: "09:14:28", type: "ISR", msg: "triggered — 5s hold" },
    { id: 3, ts: "09:14:21", type: "MODE", msg: "changed → 1 (Shift)" },
    { id: 4, ts: "09:13:55", type: "ISR", msg: "triggered — 5s hold" },
    { id: 5, ts: "09:13:40", type: "SYS", msg: "connected" },
  ],
  adcHistory: Array(40).fill(2041),
  ctrHistory: Array(40).fill(0),
  rtHistory: Array(16).fill(220),
  isDark: false,
  connectionError: null,

  // ✅ WAJIB ADA DI SINI
  wsRef: null,
  setWsRef: (ref) => set({ wsRef: ref }),
  setConnectionError: (e) => set({ connectionError: e }),

  setData: (d) => set({ data: d }),

  addLog: (type, msg) =>
    set((s) => ({
      logs: [
        { id: ++logIdCounter, ts: nowTs(), type, msg },
        ...s.logs.slice(0, 49),
      ],
    })),

  pushAdcHistory: (v) =>
    set((s) => ({ adcHistory: [...s.adcHistory.slice(-39), v] })),

  pushCtrHistory: (v) =>
    set((s) => ({ ctrHistory: [...s.ctrHistory.slice(-39), v] })),

  pushRtHistory: (v) =>
    set((s) => ({ rtHistory: [...s.rtHistory.slice(-15), v] })),

  toggleTheme: () => set((s) => ({ isDark: !s.isDark })),

  sendCommand: (cmd) => {
    const { addLog, data, wsRef } = get();

    if (wsRef?.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(cmd));
    }

    switch (cmd.type) {
      case "SET_MODE":
        addLog("MODE", `changed → ${cmd.mode}`);
        set((s) => ({ data: { ...s.data, mode: cmd.mode } }));
        break;
      case "TRIGGER_ISR":
        addLog("ISR", "triggered from web");
        set((s) => ({
          data: {
            ...s.data,
            isrActive: true,
            isrRemainMs: 5000,
            ledMask: 0xff,
          },
        }));
        break;
      case "LED_ALL_ON":
        addLog("CMD", "all LED on");
        set((s) => ({ data: { ...s.data, ledMask: 0xff } }));
        break;
      case "LED_ALL_OFF":
        addLog("CMD", "all LED off");
        if (!data.isrActive)
          set((s) => ({ data: { ...s.data, ledMask: 0x00 } }));
        break;
      case "RESET_STATS":
        addLog("SYS", "stats reset");
        set((s) => ({ data: { ...s.data, score: 0, lives: 3 } }));
        break;
    }
  },
}));
