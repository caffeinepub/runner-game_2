import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChevronRight, Play, RotateCcw, Save, Trophy, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import RunnerGame, { PLAYER_NAME } from "./components/RunnerGame";
import { STAR_POSITIONS } from "./components/StarField";
import { useLeaderBoard, useSaveHighScore } from "./hooks/useQueries";

const queryClient = new QueryClient();

type Screen = "welcome" | "playing" | "gameover";

function LeaderBoardRow({
  rank,
  name,
  score,
  dataOcid,
}: { rank: number; name: string; score: number; dataOcid: string }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <motion.div
      data-ocid={dataOcid}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.08 }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-colors"
    >
      <span className="text-lg w-6 text-center">
        {rank <= 3 ? medals[rank - 1] : rank}
      </span>
      <span className="flex-1 text-sm text-white/80 font-body truncate">
        {name}
      </span>
      <span className="font-display font-bold text-cyan-400 tabular-nums">
        {score.toLocaleString()}
      </span>
    </motion.div>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const { data: leaderboard, isLoading } = useLeaderBoard(5);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Stable starfield */}
      <div className="absolute inset-0 overflow-hidden">
        {STAR_POSITIONS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              width: s.width,
              height: s.width,
              left: `${s.left}%`,
              top: `${s.top}%`,
              opacity: s.opacity,
              animation: `pulse-neon ${s.duration}s ease-in-out infinite`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, oklch(0.45 0.18 195 / 0.15), transparent)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: "oklch(0.82 0.18 195)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 max-w-lg w-full px-6"
      >
        <div className="text-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="mb-3"
          >
            <span className="text-7xl">🏃</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl tracking-tight mb-2 shimmer-text">
            RUNNER
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" style={{ color: "oklch(0.85 0.18 85)" }} />
            <span
              className="font-body text-sm tracking-widest uppercase"
              style={{ color: "oklch(0.85 0.18 85)" }}
            >
              Infinite Runner
            </span>
            <Zap className="w-4 h-4" style={{ color: "oklch(0.85 0.18 85)" }} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center px-6 py-4 rounded-2xl border relative scanlines"
          style={{
            background: "oklch(0.18 0.04 195 / 0.6)",
            borderColor: "oklch(0.82 0.18 195 / 0.5)",
            boxShadow:
              "0 0 30px oklch(0.82 0.18 195 / 0.25), inset 0 0 20px oklch(0.82 0.18 195 / 0.05)",
          }}
        >
          <p className="text-xs tracking-widest uppercase text-white/50 mb-1 font-body">
            Welcome,
          </p>
          <p
            className="font-display font-bold text-xl glow-cyan"
            style={{ color: "oklch(0.85 0.18 195)" }}
          >
            {PLAYER_NAME}
          </p>
        </motion.div>

        <div className="flex gap-6 text-white/40 text-xs font-body">
          <span>⌨️ Space / ↑ to jump</span>
          <span>👆 Tap to jump</span>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Button
            data-ocid="game.start_button"
            onClick={onStart}
            size="lg"
            className="font-display font-bold text-lg px-12 py-6 rounded-xl tracking-wide relative overflow-hidden group"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.18 195), oklch(0.7 0.2 220))",
              color: "oklch(0.1 0.02 195)",
              boxShadow:
                "0 0 30px oklch(0.82 0.18 195 / 0.5), 0 4px 20px rgba(0,0,0,0.4)",
              border: "none",
            }}
          >
            <Play className="w-5 h-5 mr-2" />
            START GAME
            <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full"
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy
              className="w-4 h-4"
              style={{ color: "oklch(0.85 0.18 85)" }}
            />
            <h2
              className="font-display font-bold text-sm tracking-widest uppercase glow-gold"
              style={{ color: "oklch(0.85 0.18 85)" }}
            >
              Top Scores
            </h2>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {["s1", "s2", "s3"].map((k) => (
                <div
                  key={k}
                  className="h-10 rounded-lg bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <LeaderBoardRow
                  key={`${entry.playerName}-${i}`}
                  rank={i + 1}
                  name={entry.playerName}
                  score={Number(entry.score)}
                  dataOcid={`game.leaderboard.item.${i + 1}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-white/30 text-sm font-body">
              No scores yet — be the first!
            </div>
          )}
        </motion.div>
      </motion.div>

      <footer className="absolute bottom-6 text-xs text-white/20 font-body">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/40 transition-colors"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </footer>
    </div>
  );
}

function GameOverScreen({
  score,
  onRestart,
}: { score: number; onRestart: () => void }) {
  const { mutate: saveScore, isPending, isSuccess } = useSaveHighScore();
  const { data: leaderboard } = useLeaderBoard(5);

  const handleSave = () => {
    saveScore(
      { playerName: PLAYER_NAME, score },
      {
        onSuccess: () => toast.success("Score saved! 🎉"),
        onError: () => toast.error("Failed to save score"),
      },
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.5 0.2 25 / 0.15), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className="relative z-10 flex flex-col items-center gap-6 max-w-md w-full px-6"
      >
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-6xl tracking-tight mb-1"
            style={{
              color: "oklch(0.75 0.22 25)",
              textShadow:
                "0 0 20px oklch(0.75 0.22 25 / 0.6), 0 0 60px oklch(0.75 0.22 25 / 0.3)",
            }}
          >
            GAME OVER
          </motion.h1>
          <p className="text-white/40 font-body text-sm">{PLAYER_NAME}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: "spring", bounce: 0.4 }}
          className="text-center px-8 py-5 rounded-2xl border"
          style={{
            background: "oklch(0.18 0.04 195 / 0.5)",
            borderColor: "oklch(0.82 0.18 195 / 0.5)",
            boxShadow: "0 0 40px oklch(0.82 0.18 195 / 0.2)",
          }}
        >
          <p className="text-xs tracking-widest uppercase text-white/40 mb-1 font-body">
            Final Score
          </p>
          <p
            className="font-display font-black text-5xl glow-cyan"
            style={{ color: "oklch(0.85 0.18 195)" }}
          >
            {score.toLocaleString()}
          </p>
        </motion.div>

        <div className="flex gap-3 flex-wrap justify-center">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Button
              data-ocid="game.restart_button"
              onClick={onRestart}
              size="lg"
              className="font-display font-bold text-base px-8 py-5 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.82 0.18 195), oklch(0.7 0.2 220))",
                color: "oklch(0.1 0.02 195)",
                boxShadow: "0 0 20px oklch(0.82 0.18 195 / 0.4)",
                border: "none",
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              PLAY AGAIN
            </Button>
          </motion.div>

          {!isSuccess && (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                data-ocid="game.save_button"
                onClick={handleSave}
                disabled={isPending}
                size="lg"
                className="font-display font-bold text-base px-8 py-5 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.78 0.2 135), oklch(0.65 0.22 150))",
                  color: "oklch(0.1 0.02 135)",
                  boxShadow: "0 0 20px oklch(0.78 0.2 135 / 0.4)",
                  border: "none",
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                {isPending ? "Saving..." : "SAVE SCORE"}
              </Button>
            </motion.div>
          )}

          {isSuccess && (
            <div
              className="flex items-center gap-2 px-4 text-sm font-body"
              style={{ color: "oklch(0.85 0.22 135)" }}
            >
              ✓ Score saved!
            </div>
          )}
        </div>

        {leaderboard && leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full"
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy
                className="w-4 h-4"
                style={{ color: "oklch(0.85 0.18 85)" }}
              />
              <h2
                className="font-display font-bold text-sm tracking-widest uppercase"
                style={{ color: "oklch(0.85 0.18 85)" }}
              >
                Leaderboard
              </h2>
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 3).map((entry, i) => (
                <LeaderBoardRow
                  key={`${entry.playerName}-${i}`}
                  rank={i + 1}
                  name={entry.playerName}
                  score={Number(entry.score)}
                  dataOcid={`game.leaderboard.item.${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      <footer className="absolute bottom-6 text-xs text-white/20 font-body">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/40 transition-colors"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </footer>
    </div>
  );
}

function GameScreen() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [finalScore, setFinalScore] = useState(0);

  const handleStart = () => setScreen("playing");
  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setScreen("gameover");
  };
  const handleRestart = () => setScreen("playing");

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <motion.div
            key="welcome"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeScreen onStart={handleStart} />
          </motion.div>
        )}
        {screen === "playing" && (
          <motion.div
            key={`playing-${finalScore}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center bg-background"
          >
            <div className="w-full">
              <RunnerGame onGameOver={handleGameOver} />
              <p className="text-center mt-3 text-xs text-white/30 font-body">
                Space / ↑ or tap to jump
              </p>
            </div>
          </motion.div>
        )}
        {screen === "gameover" && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GameOverScreen score={finalScore} onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameScreen />
    </QueryClientProvider>
  );
}
