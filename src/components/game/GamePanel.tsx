import { useState, useEffect, useRef } from "react";
import { useSTM32Store } from "../../store/stm32Store";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Info, Gamepad2, Zap, Trophy, Target, Cpu } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Web Audio — browser-side beep (mirrors STM32 buzzer patterns)
   ────────────────────────────────────────────────────────────── */
function playBeep(freq: number, durationMs: number, vol = 0.22) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AC = window.AudioContext ?? (window as any).webkitAudioContext;
    const ctx = new AC() as AudioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + durationMs / 1000,
    );
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationMs / 1000 + 0.05);
    setTimeout(() => ctx.close(), durationMs + 300);
  } catch {
    /* browser blocked or not supported */
  }
}

/* Mirrors bg_buzz_countdown in binary_game.c:
 *   count 3 → 3× short beep (120ms on, 150ms off)
 *   count 2 → 2× short beep
 *   count 1 → 1× long  beep (600ms) */
function playCdBeep(count: number) {
  if (count === 1) {
    playBeep(880, 600);
  } else {
    for (let i = 0; i < count; i++) {
      setTimeout(() => playBeep(880, 120), i * 270);
    }
  }
}

/* ──────────────────────────────────────────────────────────────
   Countdown LED visual
   Hardware uses 3 dedicated countdown LEDs (LED9/10/11):
     "3" → LED11 lit  (rightmost countdown LED)
     "2" → LED10 lit
     "1" → LED9  lit
     "GO!" → all three flash together
   ────────────────────────────────────────────────────────────── */
function CountdownLEDs({ count }: { count: number | string }) {
  // which LED label lights up per count value
  const activeLed =
    count === 3 ? "LED11" : count === 2 ? "LED10" : count === 1 ? "LED9" : null;
  const isGo = count === "GO!";

  return (
    <div className="flex flex-col items-center mt-3 gap-1">
      <div className="flex gap-3 justify-center">
        {(["LED11", "LED10", "LED9"] as const).map((label) => {
          const lit = isGo || activeLed === label;
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <motion.div
                animate={
                  lit
                    ? { opacity: [1, 0.3, 1], scale: [1, 1.25, 1] }
                    : { opacity: 0.15 }
                }
                transition={{
                  duration: isGo ? 0.4 : 0.6,
                  repeat: lit ? Infinity : 0,
                }}
                className={`w-5 h-5 rounded-full border-2 ${
                  lit
                    ? "bg-amber-400 border-amber-300 shadow-amber-400/70 shadow-md"
                    : "bg-slate-300 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                }`}
              />
              <span
                className={`text-[8px] font-mono ${lit ? "text-amber-400" : "text-slate-400 dark:text-slate-600"}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Game metadata
   ────────────────────────────────────────────────────────────── */
interface GameInfo {
  title: string;
  icon: string;
  shortDesc: string;
  controls: { btn: string; action: string }[];
  scoring: { label: string; pts: string; highlight?: boolean }[];
  targetNote: string;
  hasLives: boolean;
}

function getGameInfo(m: number, lobbyType?: number): GameInfo | null {
  // If in lobby but a specific game is selected, show that game's info!
  if (m === 10) {
    if (lobbyType === 1) m = 8;
    else if (lobbyType === 2) m = 9;
  }

  switch (m) {
    case 8:
      return {
        title: "Rhythm Tap",
        icon: "🎵",
        shortDesc:
          "Dengarkan pola irama DEMO dari STM32. Setelah peringatan nada 3..2..1..GO!, tiru pola ketukan tempo tersebut dengan BTN1.",
        controls: [
          {
            btn: "BTN1",
            action:
              "Ketukan PERTAMA penentu jeda awal. Setelah itu ikuti tempo sebelumnya secara presisi!",
          },
          { btn: "BTN2", action: "Ulang demo pola (hint, bonus −50%)" },
          { btn: "BTN1 + BTN2", action: "Keluar ke lobby / ganti game" },
        ],
        scoring: [
          { label: "PERFECT  ≤50 ms", pts: "+100 / ketukan" },
          { label: "NEAR  51–150 ms", pts: "+30–60 / ketukan" },
          { label: "MISS  >150 ms", pts: "+0 / ketukan" },
          {
            label: "Mulai main yang benar",
            pts: "Tunggu aba-aba 'GO!'",
          },
          { label: "Semua PERFECT", pts: "+200 bonus", highlight: true },
          {
            label: "Ketukan berlebih (Extra) / MISS",
            pts: "−1 Nyawa otomatis",
          },
        ],
        targetNote: "Tepat 5 Level.",
        hasLives: true,
      };
    case 9:
      return {
        title: "Tebak Biner",
        icon: "🔢",
        shortDesc:
          "LED menampilkan angka desimal. Konversi ke biner 8-bit, masukkan dari MSB ke LSB.",
        controls: [
          { btn: "BTN1", action: 'Input bit "1"' },
          { btn: "BTN2", action: 'Input bit "0"' },
          {
            btn: "— otomatis —",
            action: "Jawaban terkirim setelah 8 bit masuk",
          },
          { btn: "BTN1 + BTN2", action: "Keluar ke lobby / ganti game" },
        ],
        scoring: [
          { label: "Jawaban benar (8-bit tepat)", pts: "+1 skor" },
          {
            label: "Jawaban salah",
            pts: "+0  (STM32 tampilkan jawaban benar)",
          },
          {
            label: "Target: 10 benar",
            pts: "= PERFECT (skor sempurna)",
            highlight: true,
          },
        ],
        targetNote: "10 pertanyaan per sesi — target skor = 10/10",
        hasLives: false,
      };
    case 10:
      return {
        title: "Game Lobby",
        icon: "🎮",
        shortDesc: "Pilih game yang ingin dimainkan menggunakan tombol STM32.",
        controls: [
          { btn: "BTN1", action: "Pilih Rhythm Tap  (LED8 menyala)" },
          { btn: "BTN2", action: "Pilih Tebak Biner  (LED7 + LED8 menyala)" },
          { btn: "BTN2 × 2", action: "Konfirmasi & mulai game yang dipilih" },
          { btn: "BTN1 + BTN2", action: "Kembali ke mode normal" },
        ],
        scoring: [],
        targetNote: "",
        hasLives: false,
      };
    default:
      return null;
  }
}

/* ──────────────────────────────────────────────────────────────
   Score rank
   ────────────────────────────────────────────────────────────── */
function getScoreTitle(s: number) {
  if (s < 20)
    return { title: "NEWBIE", color: "text-gray-500 dark:text-gray-400" };
  if (s < 50)
    return { title: "NICE", color: "text-blue-500 dark:text-blue-400" };
  if (s < 100)
    return { title: "GREAT", color: "text-emerald-500 dark:text-emerald-400" };
  if (s < 200)
    return { title: "AWESOME", color: "text-orange-500 dark:text-orange-400" };
  return { title: "GODLIKE", color: "text-red-500 font-black" };
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export function GamePanel() {
  const {
    score,
    lives,
    mode,
    gameLobby,
    binaryTarget,
    binaryRound,
    rhythmLevel,
    gameStatus,
  } = useSTM32Store((s) => s.data);
  const rtHistory = useSTM32Store((s) => s.rtHistory);
  const setData = useSTM32Store((s) => s.setData);

  const prevScore = useRef(score);
  const prevLives = useRef(lives);
  const prevMode = useRef(mode);

  const [gameState, setGameState] = useState<"IDLE" | "COUNTDOWN" | "PLAYING">(
    "IDLE",
  );
  const [countdownNum, setCountdownNum] = useState<number | string>(3);
  const [feedback, setFeedback] = useState<"CORRECT" | "WRONG" | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showPerfect, setShowPerfect] = useState(false);
  const [popStatus, setPopStatus] = useState<string | null>(null);

  // Sync gameStatus to popStatus for Rhythm Game
  useEffect(() => {
    if (mode === 8 && gameStatus && gameState === "PLAYING") {
      setPopStatus(gameStatus);
      const t = setTimeout(() => setPopStatus(null), 1200);
      return () => clearTimeout(t);
    }
  }, [gameStatus, score, mode, gameState]);

  // Session-local binary question counter (bg_score not exposed in MQTT JSON)
  const [binaryQ, setBinaryQ] = useState(0);
  const prevBinaryScore = useRef(score);

  const isGameMode = typeof mode === "number" && mode >= 8 && mode <= 10;

  const avgRt =
    rtHistory.length > 0
      ? Math.round(rtHistory.reduce((a, b) => a + b, 0) / rtHistory.length)
      : 0;

  // Calculate answered questions from current round
  const answeredBinary =
    binaryRound !== undefined && binaryRound > 0 ? binaryRound - 1 : binaryQ;

  /* ── count binary questions from score changes in mode 9 ── */
  useEffect(() => {
    if (mode !== 9 || gameState !== "PLAYING") return;
    if (binaryRound !== undefined && binaryRound > 0) {
      setBinaryQ(binaryRound - 1);
    } else if (score !== prevBinaryScore.current) {
      setBinaryQ((q) => Math.min(q + 1, 10));
      prevBinaryScore.current = score;
    }
  }, [score, mode, gameState, binaryRound]);

  const lastProcessedGameStatus = useRef<string | undefined>(gameStatus);

  /* ── detect GAME OVER / PERFECT based on JSON msg ── */
  useEffect(() => {
    if (gameState !== "PLAYING") return;
    if (
      gameStatus === "GAME_OVER" &&
      lastProcessedGameStatus.current !== "GAME_OVER"
    ) {
      setShowGameOver(true);
      const t = setTimeout(() => setShowGameOver(false), 3200);
      lastProcessedGameStatus.current = "GAME_OVER";
      return () => clearTimeout(t);
    }
  }, [gameStatus, gameState]);

  /* ── detect PERFECT for binary (10/10) ── */
  useEffect(() => {
    if (mode !== 9 || gameState !== "PLAYING") return;
    if (
      (gameStatus === "PERFECT_SCORE" &&
        lastProcessedGameStatus.current !== "PERFECT_SCORE") ||
      (answeredBinary >= 10 && score >= 10 && !showPerfect)
    ) {
      setShowPerfect(true);
      const t = setTimeout(() => setShowPerfect(false), 3200);
      if (gameStatus === "PERFECT_SCORE") {
        lastProcessedGameStatus.current = "PERFECT_SCORE";
      }
      return () => clearTimeout(t);
    }
  }, [answeredBinary, score, mode, gameState, gameStatus, showPerfect]);

  /* ── CORRECT / WRONG feedback ── */
  useEffect(() => {
    if (gameState !== "PLAYING") {
      prevScore.current = score;
      prevLives.current = lives;
      return;
    }
    if (score > prevScore.current) {
      setFeedback("CORRECT");
      setTimeout(() => setFeedback(null), 800);
    }
    if (lives < prevLives.current) {
      setFeedback("WRONG");
      setTimeout(() => setFeedback(null), 800);
    }
    prevScore.current = score;
    prevLives.current = lives;
  }, [score, lives, gameState]);

  /* ── mode change → start countdown ── */
  useEffect(() => {
    if (mode === 8 || mode === 9) {
      if (mode !== prevMode.current) {
        setBinaryQ(0);
        prevBinaryScore.current = score;
        lastProcessedGameStatus.current = undefined; // reset so we can trigger again
        setShowGameOver(false);
        setShowPerfect(false);
        setData({ ...useSTM32Store.getState().data, gameStatus: undefined });
        startCountdown();
      }
    } else if (mode === 10) {
      setGameState("IDLE");
      // Let the timeouts naturally close the game over / perfect overlays
    } else if (!isGameMode) {
      setGameState("IDLE");
      setPopStatus(null);
    }
    prevMode.current = mode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isGameMode]);

  /* ── Countdown: visual + Web Audio beeps matching STM32 pattern ── */
  const startCountdown = () => {
    setGameState("COUNTDOWN");
    setCountdownNum(3);
    playCdBeep(3); // 3 short beeps

    setTimeout(() => {
      setCountdownNum(2);
      playCdBeep(2);
    }, 1000); // 2 short beeps
    setTimeout(() => {
      setCountdownNum(1);
      playCdBeep(1);
    }, 2000); // 1 long  beep
    setTimeout(() => {
      setCountdownNum("GO!");
      playBeep(1047, 150); // ascending two-tone
      setTimeout(() => playBeep(1319, 300), 160);
    }, 3000);
    setTimeout(() => setGameState("PLAYING"), 4000);
  };

  const gameInfo = getGameInfo(mode as number, gameLobby);
  const scoreData = getScoreTitle(score);

  /* ────────────────── INACTIVE ────────────────── */
  if (!isGameMode) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
        <Gamepad2 className="w-12 h-12 mb-3 opacity-50" />
        <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-base mb-1">
          Arcade Standby
        </h3>
        <p className="text-xs max-w-[200px] leading-relaxed">
          Tekan <b>BTN1 + BTN2 bersamaan</b> pada STM32, atau pilih Mode 8 / 9
          dari panel Mode.
        </p>
      </div>
    );
  }

  /* ────────────────── ACTIVE ────────────────── */
  const isBinary = mode === 9 || (mode === 10 && gameLobby === 2);
  const isRhythm = mode === 8 || (mode === 10 && gameLobby === 1);
  const isLobby = mode === 10;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative flex flex-col h-full min-h-[420px] overflow-hidden">
      {/* ── COUNTDOWN OVERLAY ── */}
      <AnimatePresence>
        {gameState === "COUNTDOWN" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
              Game dimulai dalam…
            </p>
            <motion.span
              key={countdownNum}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`text-8xl font-black drop-shadow-lg ${
                countdownNum === "GO!" ? "text-emerald-500" : "text-purple-500"
              }`}
            >
              {countdownNum}
            </motion.span>

            {/* LED visual — mirrors STM32 LED9/10/11 countdown pattern */}
            <CountdownLEDs count={countdownNum} />
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
              {countdownNum === 3
                ? "LED11 menyala di STM32"
                : countdownNum === 2
                  ? "LED10 menyala di STM32"
                  : countdownNum === 1
                    ? "LED9 menyala di STM32"
                    : "LED9–LED11 flash — MULAI!"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GAME OVER OVERLAY ── */}
      <AnimatePresence>
        {showGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-950/80 backdrop-blur-sm rounded-2xl"
          >
            <span className="text-5xl mb-2">💀</span>
            <span className="text-2xl font-black text-red-400 tracking-widest">
              GAME OVER
            </span>
            <span className="text-xs text-red-300/70 mt-1">
              Nyawa habis — STM32 mereset sesi
            </span>
            <span className="text-base font-bold text-white mt-3">
              Skor akhir: {score}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PERFECT OVERLAY ── */}
      <AnimatePresence>
        {showPerfect && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-amber-950/80 backdrop-blur-sm rounded-2xl"
          >
            <motion.span
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="text-5xl mb-2"
            >
              🏆
            </motion.span>
            <span className="text-2xl font-black text-amber-300 tracking-widest">
              PERFECT!
            </span>
            <span className="text-xs text-amber-200/70 mt-1">
              {isBinary ? "10/10 jawaban benar!" : "Semua level tuntas!"}
            </span>
            <span className="text-base font-bold text-white mt-3">
              Skor: {score}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{gameInfo?.icon}</span>
          <div>
            <h2 className="text-slate-900 dark:text-slate-100 font-bold text-base leading-tight">
              {gameInfo?.title}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isRhythm && (
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-bold text-[9px] px-1.5">
                  {gameState === "PLAYING" ? "Bermain" : "Siap"}
                </span>
              )}
              {isBinary && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-bold text-[9px] px-1.5">
                  {gameState === "PLAYING"
                    ? `${answeredBinary}/10 soal`
                    : "Siap"}
                </span>
              )}
              {isLobby && (
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-bold text-[9px] px-1.5">
                  Lobby
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Feedback pop */}
        <div className="w-20 text-right">
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                className={`text-sm font-black italic ${feedback === "CORRECT" ? "text-emerald-500" : "text-red-500"}`}
              >
                {feedback === "CORRECT" ? "+ NICE!" : "- OOPS!"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── BINARY PROGRESS BAR ── */}
      {isBinary && gameState === "PLAYING" && (
        <div className="px-4 pt-2">
          <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 mb-1">
            <span>Progress soal</span>
            <span>{answeredBinary}/10</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              animate={{ width: `${(answeredBinary / 10) * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full border transition-colors ${
                  i < answeredBinary
                    ? "bg-blue-500 border-blue-400"
                    : i < score
                      ? "bg-emerald-500 border-emerald-400"
                      : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── RHYTHM LEVEL PROGRESS ── */}
      {isRhythm && gameState === "PLAYING" && (
        <div className="px-4 pt-2">
          <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 mb-1">
            <span>Level progress</span>
            <span>Target: 5 level</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((lvl) => {
              const active = lvl <= (rhythmLevel ?? 1);
              return (
                <div
                  key={lvl}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    active ? "bg-purple-500" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[8px] text-slate-400 dark:text-slate-500 mt-0.5">
            {["Lv.1", "Lv.2", "Lv.3", "Lv.4", "Lv.5"].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── GAME INFO CARD ── */}
      <div className="flex-1 mx-4 mt-3 mb-0 flex flex-col gap-3">
        {/* If Game is playing and it's Binary game, show the target number beautifully */}
        {isBinary && gameState === "PLAYING" && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 text-center shadow-inner flex-1 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 shadow-sm">
              S O A L &nbsp; D E S I M A L
            </span>
            <motion.div
              key={binaryTarget}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tighter drop-shadow-md"
            >
              {binaryTarget ?? "?"}
            </motion.div>
            <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-2 max-w-[200px] leading-tight">
              Kirim jawaban 8-bit dari MSB → LSB menggunakan STM32.
            </p>
          </div>
        )}

        {/* If Game is playing and it's Rhythm game, show the large stats card too */}
        {isRhythm && gameState === "PLAYING" && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4 text-center shadow-inner flex-1 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1 shadow-sm">
              L E V E L &nbsp; S A A T &nbsp; I N I
            </span>
            <motion.div
              key={rhythmLevel}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tighter drop-shadow-md"
            >
              {rhythmLevel ?? "?"}
            </motion.div>
            <div className="flex items-center gap-2 mt-3">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 ${
                    i < lives
                      ? "text-red-500 fill-red-500"
                      : "text-slate-300 dark:text-slate-600 fill-slate-200 dark:fill-slate-700"
                  }`}
                />
              ))}
            </div>
            {/* Show latest reaction text */}
            <div className="mt-4 h-8 flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {popStatus && (
                  <motion.span
                    initial={{ y: 20, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className={`text-2xl font-black tracking-[0.2em] ${
                      popStatus === "PERFECT"
                        ? "text-emerald-500"
                        : popStatus === "NEAR"
                          ? "text-amber-500"
                          : "text-red-500"
                    }`}
                  >
                    {popStatus}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Only show Instructions IF not playing, or if we want to collapse it. Let's hide instructions while playing to save space. */}
        {!(isBinary && gameState === "PLAYING") &&
          !(isRhythm && gameState === "PLAYING") && (
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
              {/* Short description */}
              <div className="px-3 pt-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                  {gameInfo?.shortDesc}
                </p>
              </div>

              {/* Controls */}
              <div className="px-3 pt-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1.5">
                  <Cpu className="w-3 h-3 text-indigo-500" /> Kontrol STM32
                </h3>
                <div className="space-y-1">
                  {gameInfo?.controls.map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
                        {c.btn}
                      </span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight pt-0.5">
                        {c.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scoring — only for game modes */}
              {!isLobby && (gameInfo?.scoring?.length ?? 0) > 0 && (
                <div className="px-3 pt-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1.5">
                    <Target className="w-3 h-3 text-amber-500" /> Sistem Skor
                  </h3>
                  <div className="space-y-0.5">
                    {gameInfo?.scoring.map((s, i) => (
                      <div
                        key={i}
                        className={`flex justify-between items-baseline text-[10px] ${s.highlight ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-slate-600 dark:text-slate-400"}`}
                      >
                        <span>{s.label}</span>
                        <span className="font-mono ml-2 shrink-0">{s.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Target / session limit */}
              {!isLobby && gameInfo?.targetNote && (
                <div className="px-3 pt-2 pb-2">
                  <h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1">
                    <Trophy className="w-3 h-3 text-emerald-500" /> Target Sesi
                  </h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400">
                    {gameInfo.targetNote}
                  </p>
                </div>
              )}

              {/* Binary: explain 8-bit input mechanism */}
              {isBinary && (
                <div className="px-3 pt-0 pb-2">
                  <h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1.5">
                    <Info className="w-3 h-3 text-blue-500" /> Cara Input 8-bit
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 border border-blue-100 dark:border-blue-800">
                    <p className="text-[10px] text-blue-800 dark:text-blue-300 leading-relaxed mb-1">
                      Masukkan 8 bit dari <b>MSB (bit-7) → LSB (bit-0)</b>, kiri
                      ke kanan. LED menampilkan progress secara real-time.
                    </p>
                    <div className="flex gap-1 items-center justify-center">
                      {["b7", "b6", "b5", "b4", "b3", "b2", "b1", "b0"].map(
                        (b, i) => (
                          <div
                            key={i}
                            className={`text-center ${i === 0 ? "opacity-100" : "opacity-40"}`}
                          >
                            <div className="w-5 h-5 rounded border border-blue-400 dark:border-blue-600 bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[7px] font-bold text-blue-700 dark:text-blue-400">
                              {i === 0 ? "?" : "·"}
                            </div>
                            <div className="text-[6px] text-blue-500 dark:text-blue-500 mt-0.5">
                              {b}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                    <p className="text-[9px] text-blue-600 dark:text-blue-400 text-center mt-1.5">
                      Setelah bit ke-8 masuk → jawaban otomatis terkirim
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>

      {/* ── STATS FOOTER ── */}
      <div className="grid grid-cols-2 gap-3 p-4 pt-3">
        {/* Score + rank */}
        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {isBinary ? "Benar / Total" : "Rank & Skor"}
          </div>
          <div className="flex justify-between items-baseline w-full mt-1">
            {isBinary ? (
              <>
                <span className="text-base font-black text-blue-500">
                  {score}
                  <span className="text-xs text-slate-400 font-normal">
                    /10
                  </span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {answeredBinary} soal dijawab
                </span>
              </>
            ) : (
              <>
                <span
                  className={`text-base font-black ${isRhythm && gameStatus && gameStatus !== "GAME_OVER" && gameStatus !== "PERFECT_SCORE" ? (gameStatus === "PERFECT" ? "text-emerald-500" : gameStatus === "MISS" ? "text-red-500" : "text-amber-500") : scoreData.color}`}
                >
                  {isRhythm &&
                  gameStatus &&
                  gameStatus !== "GAME_OVER" &&
                  gameStatus !== "PERFECT_SCORE"
                    ? gameStatus
                    : scoreData.title}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {score} pt
                </span>
              </>
            )}
          </div>
        </div>

        {/* Lives + reaction time */}
        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {isRhythm ? "Nyawa & Reaksi" : "Performa"}
          </div>
          <div className="flex justify-between items-center w-full mt-1">
            {isRhythm ? (
              <>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 transition-colors ${i < lives ? "fill-red-500 text-red-500" : "fill-transparent text-slate-200 dark:text-slate-700"}`}
                    />
                  ))}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {avgRt}
                  <span className="text-[9px] text-slate-400 font-normal ml-0.5">
                    ms avg
                  </span>
                </div>
              </>
            ) : (
              <div className="flex gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {isBinary ? "Tanpa nyawa" : "Mode Lobby"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
