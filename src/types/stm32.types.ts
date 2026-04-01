export type AppMode = 1 | 2 | 3 | 'ISR';

export interface STM32Data {
  mode: AppMode;
  adc: number;
  ledMask: number;
  counter: number;
  score: number;
  lives: number;
  reactionMs: number;
  isrActive: boolean;
  isrRemainMs: number;
}

export interface LogEntry {
  id: number;
  ts: string;
  type: 'MODE' | 'ISR' | 'CMD' | 'SYS' | 'GAME';
  msg: string;
}

export type Command =
  | { type: 'SET_MODE'; mode: 1 | 2 | 3 }
  | { type: 'TRIGGER_ISR' }
  | { type: 'LED_ALL_ON' }
  | { type: 'LED_ALL_OFF' }
  | { type: 'RESET_STATS' };
