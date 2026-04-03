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

  const isGameMode = typeof mode === 'number' && mode >= 7 && mode <= 10;

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
      case 7:  return { title: 'Rhythm Tap', icon: '🎵', desc: 'Lampu akan memberikan pola ketukan. Tekan Tombol 1 setelah pola selesai untuk menirunya. Jika lupa, tekan Tombol 2 untuk mendengar polanya lagi.' };
      case 8:  return { title: 'Charge & Release', icon: '⚡', desc: 'Tahan Tombol 1 untuk mengisi energi (lampu menyala perlahan ke kanan). Lepaskan Tombol 1 tepat saat lampu menyentuh titik target!' };
      case 9:  return { title: 'Whack-a-LED', icon: '🔨', desc: 'Lampu akan menyala acak. Jika lampu kiri (1-4) menyala, cepat tekan Tombol 1. Jika lampu kanan (5-8) menyala, cepat tekan Tombol 2!' };
      case 10: return { title: 'Tebak Biner', icon: '🔢', desc: 'Terjemahkan angka desimal yang muncul. Tekan Tombol 1 untuk memasukkan angka "1", dan Tombol 2 untuk angka "0".' };
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
      <div className="card h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center text-[var(--text3)]">
        <Gamepad2 className="w-12 h-12 mb-3 opacity-50" />
        <h3 className="text-[var(--text1)] font-semibold text-base mb-1">Arcade Standby</h3>
        <p className="text-xs max-w-[200px] leading-relaxed">
          Pilih mode game (Mode 6 - 10) pada pengatur mode untuk memunculkan arena.
        </p>
      </div>
    );
  }

  // KOMPONEN ACTIVE (Tampilan Arena Yang Ringkas dan Serasi)
  return (
    <div className="card relative flex flex-col h-full min-h-[380px] overflow-hidden">
      {/* Countdown Overlay */}
      <AnimatePresence>
        {gameState === 'COUNTDOWN' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--bg)]/80 backdrop-blur-sm"
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
            <h2 className="text-[var(--text1)] font-bold text-base leading-tight">{gameInfo?.title}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="badge badge-purple text-[9px] px-1.5 py-0">Level {derivedLevel}</span>
              <span className="text-[10px] text-[var(--text3)] font-medium">Bermain</span>
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
      <div className="flex-1 bg-[var(--bg2)] rounded-lg p-3 lg:p-4 mb-4 border border-[var(--border2)]">
        <h3 className="text-[var(--text2)] text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500" /> Cara Bermain
        </h3>
        <p className="text-[var(--text1)] text-xs leading-relaxed mb-4">
          {gameInfo?.desc}
        </p>

        <h3 className="text-[var(--text2)] text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" /> Kendali Papan
        </h3>
        <p className="text-[var(--text3)] text-xs leading-relaxed">
          Gunakan tombol di perangkat STM32. Untuk ganti game: <b>Tekan Tombol 1 & 2 bersamaan</b>.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <div className="metric-mini !items-start bg-[var(--bg2)]">
          <div className="metric-mini-label w-full text-left">Rank & Skor</div>
          <div className="flex justify-between items-baseline w-full mt-1">
            <span className={`text-base font-black ${scoreData.color}`}>{scoreData.title}</span>
            <span className="text-xs font-semibold text-[var(--text2)]">{score} pt</span>
          </div>
        </div>

        <div className="metric-mini !items-start bg-[var(--bg2)]">
          <div className="metric-mini-label w-full text-left">Nyawa & Kecepatan</div>
          <div className="flex justify-between items-center w-full mt-1">
            <div className="flex gap-1.5 justify-start">
              {[...Array(3)].map((_, i) => (
                <Heart 
                  key={i} 
                  className={`w-4 h-4 transition-colors ${i < lives ? 'fill-red-500 text-red-500' : 'fill-transparent text-[var(--border2)]'}`} 
                />
              ))}
            </div>
            <div className="text-sm font-bold text-[var(--text1)] tabular-nums">
              {avgRt}<span className="text-[10px] text-[var(--text3)] font-normal ml-0.5">ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}