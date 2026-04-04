import { useState, useEffect, useRef } from 'react';
import { useSTM32Store } from '../../store/stm32Store';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Info, Gamepad2, Zap } from 'lucide-react';

export function GamePanel() {
  const { score, lives, mode } = useSTM32Store((s) => s.data);
  const reactHistory = useSTM32Store((s) => s.rtHistory);

  const prevScore = useRef(score);
  const prevLives = useRef(lives);
  const prevMode = useRef(mode);

  const [gameState, setGameState] = useState<'IDLE' | 'COUNTDOWN' | 'PLAYING'>('IDLE');
  const [countdownNum, setCountdownNum] = useState<number | string>(3);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);

  // Mode 8 = Rhythm Tap, Mode 9 = Tebak Biner, Mode 10 = Lobby pemilihan game
  const isGameMode = typeof mode === 'number' && mode >= 8 && mode <= 10;

  // Hitung rata-rata waktu reaksi
  const avgRt = reactHistory.length > 0 
    ? Math.round(reactHistory.reduce((a, b) => a + b, 0) / reactHistory.length) 
    : 0;

  // Feedback logika (Correct/Wrong) ketika score/lives berubah selama bermain
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      prevScore.current = score;
      prevLives.current = lives;
      return;
    }

    if (score > prevScore.current) {
      setFeedback('CORRECT');
      setTimeout(() => setFeedback(null), 800);
    } 
    if (lives < prevLives.current) {
      setFeedback('WRONG');
      setTimeout(() => setFeedback(null), 800);
    }
    
    prevScore.current = score;
    prevLives.current = lives;
  }, [score, lives, gameState]);

  // Handle otomatisasi mulai game ketika pindah mode
  useEffect(() => {
    if (isGameMode && mode !== prevMode.current) {
      startCountdown();
    } else if (!isGameMode) {
      setGameState('IDLE');
    }
    prevMode.current = mode;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isGameMode]);

  const startCountdown = () => {
    setGameState('COUNTDOWN');
    setCountdownNum(3);
    
    setTimeout(() => setCountdownNum(2), 1000);
    setTimeout(() => setCountdownNum(1), 2000);
    setTimeout(() => setCountdownNum('GO!'), 3000);
    setTimeout(() => setGameState('PLAYING'), 4000);
  };

  const getGameInfo = (m: number) => {
    switch (m) {
      case 8:  return { title: 'Rhythm Tap', icon: '🎵', desc: 'STM32 akan memperlihatkan pola ketukan lewat LED. Setelah demo selesai, tekan Tombol 1 untuk meniru polanya. Tekan Tombol 2 untuk mendengar demo ulang.' };
      case 9:  return { title: 'Tebak Biner', icon: '🔢', desc: 'Konversi angka desimal yang ditampilkan ke biner 8-bit. Tekan Tombol 1 untuk bit "1" dan Tombol 2 untuk bit "0". Masukkan 8 bit dari MSB ke LSB.' };
      case 10: return { title: 'Game Lobby', icon: '🎮', desc: 'Pilih game dengan Tombol 1 (Rhythm Tap — LED8 menyala) atau Tombol 2 (Tebak Biner — LED7+LED8 menyala). Tekan BTN2 dua kali untuk memulai game yang dipilih.' };
      default: return null;
    }
  };

  const gameInfo = getGameInfo(mode as number);
  
  // Sistem Title/Nama Pangkat dari Score yang serasi dengan tema UI
  const getScoreTitle = (s: number) => {
    if (s < 20) return { title: 'NEWBIE', color: 'text-gray-500 dark:text-gray-400' };
    if (s < 50) return { title: 'NICE', color: 'text-blue-500 dark:text-blue-400' };
    if (s < 100) return { title: 'GREAT', color: 'text-emerald-500 dark:text-emerald-400' };
    if (s < 200) return { title: 'AWESOME', color: 'text-orange-500 dark:text-orange-400' };
    return { title: 'GODLIKE', color: 'text-red-500 font-black' };
  };

  const scoreData = getScoreTitle(score);
  const derivedLevel = Math.floor(score / 50) + 1;

  // KOMPONEN INACTIVE (Dashboard Normal)
  if (!isGameMode) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
        <Gamepad2 className="w-12 h-12 mb-3 opacity-50" />
        <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-base mb-1">Arcade Standby</h3>
        <p className="text-xs max-w-[200px] leading-relaxed">
          Tekan Tombol 1 + Tombol 2 bersamaan pada STM32, atau pilih Mode 8 / 9 dari panel Mode.
        </p>
      </div>
    );
  }

  // KOMPONEN ACTIVE (Tampilan Arena Yang Ringkas dan Serasi)
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative flex flex-col h-full min-h-[380px] overflow-hidden">
      {/* Countdown Overlay */}
      <AnimatePresence>
        {gameState === 'COUNTDOWN' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.span 
              key={countdownNum}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-7xl md:text-8xl font-black text-purple-500 drop-shadow-lg"
            >
              {countdownNum}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{gameInfo?.icon}</span>
          <div>
            <h2 className="text-slate-900 dark:text-slate-100 font-bold text-base leading-tight">{gameInfo?.title}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-bold text-[9px] px-1.5 py-0">Level {derivedLevel}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Bermain</span>
            </div>
          </div>
        </div>

        {/* Feedback Mini Pop-up */}
        <div className="w-20 text-right">
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className={`text-sm font-black italic ${feedback === 'CORRECT' ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {feedback === 'CORRECT' ? '+ NICE!' : '- OOPS!'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Instructions Box */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 lg:p-4 mb-4 border border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500" /> Cara Bermain
        </h3>
        <p className="text-slate-900 dark:text-slate-100 text-xs leading-relaxed mb-4">
          {gameInfo?.desc}
        </p>

        <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" /> Kendali Papan
        </h3>
        <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed">
          Gunakan tombol di perangkat STM32. Untuk ganti game: <b>Tekan Tombol 1 & 2 bersamaan</b>.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col !items-start bg-slate-50 dark:bg-slate-900/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-full text-left">Rank & Skor</div>
          <div className="flex justify-between items-baseline w-full mt-1">
            <span className={`text-base font-black ${scoreData.color}`}>{scoreData.title}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{score} pt</span>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col !items-start bg-slate-50 dark:bg-slate-900/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-full text-left">Nyawa & Kecepatan</div>
          <div className="flex justify-between items-center w-full mt-1">
            <div className="flex gap-1.5 justify-start">
              {[...Array(3)].map((_, i) => (
                <Heart 
                  key={i} 
                  className={`w-4 h-4 transition-colors ${i < lives ? 'fill-red-500 text-red-500' : 'fill-transparent text-slate-200 dark:text-slate-700'}`} 
                />
              ))}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {avgRt}<span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal ml-0.5">ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

