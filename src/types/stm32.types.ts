export type AppMode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'ISR';

export interface STM32Data {
  mode: AppMode;
  adc: number;
  ledMask: number;
  counter: number;
  score: number;
  lives: number;
  reactionMs: number;
  gameStatus?: string;
  isrActive: boolean;
  isrRemainMs: number;
  temperature?: number;
  humidity?: number;
  distance?: number;
}

export interface LogEntry {
  id: number;
  ts: string;
  type: 'MODE' | 'ISR' | 'CMD' | 'SYS' | 'GAME';
  msg: string;
}

export type Command =
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'TRIGGER_ISR' }
  | { type: 'LED_ALL_ON' }
  | { type: 'LED_ALL_OFF' }
  | { type: 'RESET_STATS' };
