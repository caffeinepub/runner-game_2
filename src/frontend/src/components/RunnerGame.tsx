import { useCallback, useEffect, useRef } from "react";

const PLAYER_NAME = "মোহাম্মদ আব্দুল্লাহ ইসলাম";

interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  grounded: boolean;
  legPhase: number;
}

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 0 | 1;
}

interface Star {
  x: number;
  y: number;
  r: number;
  brightness: number;
  speed: number;
}

interface Cloud {
  x: number;
  y: number;
  w: number;
  speed: number;
}

interface GameState {
  player: Player;
  obstacles: Obstacle[];
  stars: Star[];
  clouds: Cloud[];
  groundX: number;
  score: number;
  speed: number;
  frameCount: number;
  spawnInterval: number;
  lastTime: number;
  running: boolean;
}

function initGameState(canvasW: number, canvasH: number): GameState {
  const GROUND_Y = canvasH * 0.72;
  const stars: Star[] = [];
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * canvasW,
      y: Math.random() * GROUND_Y * 0.9,
      r: Math.random() * 1.5 + 0.3,
      brightness: Math.random(),
      speed: Math.random() * 0.5 + 0.1,
    });
  }
  const clouds: Cloud[] = [];
  for (let i = 0; i < 4; i++) {
    clouds.push({
      x: Math.random() * canvasW,
      y: 30 + Math.random() * canvasH * 0.25,
      w: 80 + Math.random() * 100,
      speed: 0.4 + Math.random() * 0.3,
    });
  }
  return {
    player: {
      x: canvasW * 0.12,
      y: GROUND_Y,
      w: 36,
      h: 52,
      vy: 0,
      grounded: true,
      legPhase: 0,
    },
    obstacles: [],
    stars,
    clouds,
    groundX: 0,
    score: 0,
    speed: 280,
    frameCount: 0,
    spawnInterval: 120,
    lastTime: 0,
    running: true,
  };
}

const GRAVITY = 1600;
const JUMP_VEL = -680;

function drawSky(ctx: CanvasRenderingContext2D, w: number, groundY: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, "#0a0820");
  grad.addColorStop(0.5, "#0d1340");
  grad.addColorStop(1, "#1a1060");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, groundY);
}

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], t: number) {
  for (const s of stars) {
    const twinkle = 0.5 + 0.5 * Math.sin(t * 2 + s.brightness * 10);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 220, 255, ${0.5 * twinkle + 0.3})`;
    ctx.fill();
  }
}

function drawClouds(ctx: CanvasRenderingContext2D, clouds: Cloud[]) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  for (const c of clouds) {
    ctx.fillStyle = "#8090ff";
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.w * 0.6, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x - c.w * 0.2, c.y + 6, c.w * 0.35, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + c.w * 0.25, c.y + 5, c.w * 0.3, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  groundY: number,
  groundX: number,
) {
  const dirtGrad = ctx.createLinearGradient(0, groundY, 0, h);
  dirtGrad.addColorStop(0, "#3d2410");
  dirtGrad.addColorStop(1, "#1a0e06");
  ctx.fillStyle = dirtGrad;
  ctx.fillRect(0, groundY, w, h - groundY);

  const grassGrad = ctx.createLinearGradient(0, groundY - 6, 0, groundY + 10);
  grassGrad.addColorStop(0, "#2ecc40");
  grassGrad.addColorStop(0.6, "#1a8c28");
  grassGrad.addColorStop(1, "#0f5c18");
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, groundY - 5, w, 16);

  ctx.strokeStyle = "#3ddf50";
  ctx.lineWidth = 1.5;
  const step = 32;
  const offset = (((groundX * 0.6) % step) + step) % step;
  for (let x = -step + offset; x < w + step; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, groundY - 4);
    ctx.lineTo(x - 3, groundY - 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 6, groundY - 4);
    ctx.lineTo(x + 9, groundY - 13);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 13, groundY - 4);
    ctx.lineTo(x + 11, groundY - 10);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(46, 204, 64, 0.35)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#2ecc40";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, groundY - 4);
  ctx.lineTo(w, groundY - 4);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: Player,
  legPhase: number,
) {
  const cx = p.x + p.w / 2;
  const top = p.y - p.h;
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(cx, p.y + 2, p.w * 0.55, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const legSwing = Math.sin(legPhase) * 10;
  ctx.strokeStyle = "#e67e22";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 6, p.y - 14);
  ctx.lineTo(cx - 8 + legSwing, p.y + 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 6, p.y - 14);
  ctx.lineTo(cx + 8 - legSwing, p.y + 2);
  ctx.stroke();

  ctx.fillStyle = "#c0392b";
  ctx.beginPath();
  ctx.ellipse(cx - 8 + legSwing, p.y + 3, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 8 - legSwing, p.y + 3, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyGrad = ctx.createLinearGradient(
    cx - p.w / 2 + 2,
    top + 20,
    cx + p.w / 2 - 2,
    p.y - 12,
  );
  bodyGrad.addColorStop(0, "#3498db");
  bodyGrad.addColorStop(1, "#1a6ca0");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(cx - p.w / 2 + 2, top + 22, p.w - 4, p.h * 0.42, 6);
  ctx.fill();

  const armSwing = Math.cos(legPhase) * 8;
  ctx.strokeStyle = "#f0a040";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - p.w / 2 + 6, top + 28);
  ctx.lineTo(cx - p.w / 2 - 4, top + 38 + armSwing);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + p.w / 2 - 6, top + 28);
  ctx.lineTo(cx + p.w / 2 + 4, top + 38 - armSwing);
  ctx.stroke();

  ctx.fillStyle = "#f4a460";
  ctx.beginPath();
  ctx.ellipse(cx, top + 16, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2c1810";
  ctx.beginPath();
  ctx.ellipse(cx, top + 6, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a2820";
  ctx.beginPath();
  ctx.ellipse(cx - 2, top + 4, 8, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(cx - 5, top + 16, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 5, top + 16, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(cx - 4, top + 17, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 6, top + 17, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(82, 215, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#52d7ff";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(cx, top + 16, 16, 18, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawCactus(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save();
  const cx = obs.x + obs.w / 2;
  const base = obs.y;
  const h = obs.h;

  ctx.shadowColor = "#e74c3c";
  ctx.shadowBlur = 12;

  const grad = ctx.createLinearGradient(cx - 7, base - h, cx + 7, base);
  grad.addColorStop(0, "#c0392b");
  grad.addColorStop(1, "#7f1910");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(cx - 7, base - h, 14, h, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(cx - 22, base - h * 0.65, 16, 8, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(cx - 22, base - h * 0.65 - 16, 8, 18, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(cx + 6, base - h * 0.5, 16, 8, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(cx + 14, base - h * 0.5 - 14, 8, 16, 3);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,100,80,0.6)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - 7, base - h * 0.2 - i * h * 0.18);
    ctx.lineTo(cx - 13, base - h * 0.22 - i * h * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 7, base - h * 0.2 - i * h * 0.18);
    ctx.lineTo(cx + 13, base - h * 0.22 - i * h * 0.18);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawBlock(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save();
  const grad = ctx.createLinearGradient(
    obs.x,
    obs.y - obs.h,
    obs.x + obs.w,
    obs.y,
  );
  grad.addColorStop(0, "#e67e22");
  grad.addColorStop(1, "#8c4a10");
  ctx.fillStyle = grad;
  ctx.shadowColor = "#e67e22";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.roundRect(obs.x, obs.y - obs.h, obs.w, obs.h, 5);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 0;
  const bh = obs.h / 3;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(obs.x, obs.y - obs.h + i * bh);
    ctx.lineTo(obs.x + obs.w, obs.y - obs.h + i * bh);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(obs.x + obs.w / 2, obs.y - obs.h);
  ctx.lineTo(obs.x + obs.w / 2, obs.y - obs.h * 0.67);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(obs.x + obs.w * 0.25, obs.y - obs.h * 0.67);
  ctx.lineTo(obs.x + obs.w * 0.25, obs.y - obs.h * 0.34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(obs.x + obs.w * 0.75, obs.y - obs.h * 0.67);
  ctx.lineTo(obs.x + obs.w * 0.75, obs.y - obs.h * 0.34);
  ctx.stroke();
  ctx.restore();
}

function drawHUD(ctx: CanvasRenderingContext2D, score: number, w: number) {
  ctx.save();
  ctx.font = "bold 22px 'Bricolage Grotesque', sans-serif";
  ctx.textAlign = "right";
  ctx.shadowColor = "#52d7ff";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#52d7ff";
  ctx.fillText(`SCORE: ${Math.floor(score)}`, w - 20, 40);
  ctx.shadowBlur = 0;
  ctx.restore();
}

function spawnObstacle(canvasW: number, groundY: number): Obstacle {
  const type = Math.random() < 0.55 ? 0 : 1;
  const h = type === 0 ? 55 + Math.random() * 30 : 40 + Math.random() * 20;
  const w = type === 0 ? 46 : 38 + Math.random() * 20;
  return { x: canvasW + 20, y: groundY, w, h, type: type as 0 | 1 };
}

function checkCollision(p: Player, o: Obstacle): boolean {
  const margin = 6;
  return (
    p.x + margin < o.x + o.w - margin &&
    p.x + p.w - margin > o.x + margin &&
    p.y - p.h + margin < o.y &&
    p.y > o.y - o.h + margin
  );
}

export interface RunnerGameProps {
  onGameOver: (score: number) => void;
}

export default function RunnerGame({ onGameOver }: RunnerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (!s || !s.running) return;
    if (s.player.grounded) {
      s.player.vy = JUMP_VEL;
      s.player.grounded = false;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const maxW = Math.min(window.innerWidth, 900);
      const ratio = maxW / 800;
      canvas.width = maxW;
      canvas.height = Math.round(400 * ratio);
    };
    resize();
    window.addEventListener("resize", resize);

    stateRef.current = initGameState(canvas.width, canvas.height);

    const GROUND_Y = canvas.height * 0.72;

    const gameLoop = (timestamp: number) => {
      const s = stateRef.current;
      if (!s || !s.running) return;

      const dt =
        s.lastTime === 0
          ? 0.016
          : Math.min((timestamp - s.lastTime) / 1000, 0.05);
      s.lastTime = timestamp;
      s.frameCount++;

      s.speed = 280 + s.score * 0.06;
      s.spawnInterval = Math.max(45, 120 - s.score * 0.04);

      s.player.vy += GRAVITY * dt;
      s.player.y += s.player.vy * dt;
      if (s.player.y >= GROUND_Y) {
        s.player.y = GROUND_Y;
        s.player.vy = 0;
        s.player.grounded = true;
      }

      s.player.legPhase = s.player.grounded
        ? s.player.legPhase + dt * (s.speed / 80)
        : 0;

      for (const c of s.clouds) {
        c.x -= c.speed * dt * 60;
        if (c.x + c.w < 0) c.x = canvas.width + c.w;
      }

      if (s.frameCount % Math.round(s.spawnInterval) === 0) {
        s.obstacles.push(spawnObstacle(canvas.width, GROUND_Y));
      }
      for (const o of s.obstacles) {
        o.x -= s.speed * dt;
      }
      s.obstacles = s.obstacles.filter((o) => o.x + o.w > -50);

      for (const o of s.obstacles) {
        if (checkCollision(s.player, o)) {
          s.running = false;
          onGameOverRef.current(Math.floor(s.score));
          return;
        }
      }

      s.score += dt * 30;
      s.groundX -= s.speed * dt;

      const w = canvas.width;
      const h = canvas.height;

      drawSky(ctx, w, GROUND_Y);
      drawStars(ctx, s.stars, timestamp / 1000);
      drawClouds(ctx, s.clouds);
      drawGround(ctx, w, h, GROUND_Y, s.groundX);

      for (const o of s.obstacles) {
        if (o.type === 0) drawCactus(ctx, o);
        else drawBlock(ctx, o);
      }

      drawPlayer(ctx, s.player, s.player.legPhase);
      drawHUD(ctx, s.score, w);

      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };
    const handleClick = () => jump();

    window.addEventListener("keydown", handleKey);
    canvas.addEventListener("touchstart", handleTouch, { passive: false });
    canvas.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKey);
      canvas.removeEventListener("touchstart", handleTouch);
      canvas.removeEventListener("click", handleClick);
    };
  }, [jump]);

  return (
    <canvas
      ref={canvasRef}
      data-ocid="game.canvas_target"
      className="block mx-auto cursor-pointer select-none touch-none"
      style={{ imageRendering: "crisp-edges" }}
      tabIndex={0}
    />
  );
}

export { PLAYER_NAME };
