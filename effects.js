/*
 * Party department. The bigger the answer, the bigger the celebration:
 *
 *   any result   → sparkles
 *   10 and up    → confetti sprinkles
 *   100 and up   → flying balloons
 *   1 000 and up → fireworks
 *   10 000 and up→ the whole lot, plus a rainbow shake
 */

const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
const balloonLayer = document.getElementById("balloons");

const COLORS = ["#ff5fa2", "#ffa63d", "#ffe14d", "#3fd8c8", "#8b5cf6", "#5fd1ff", "#ff7a7a"];
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let particles = [];
let running = false;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function pickColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function start() {
  if (running) return;
  running = true;
  requestAnimationFrame(tick);
}

function tick() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const p of particles) {
    p.life -= 1;
    p.vy += p.gravity;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;

    const alpha = Math.max(0, Math.min(1, p.life / p.fade));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;

    if (p.shape === "confetti") {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    } else if (p.shape === "sparkle") {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillRect(-p.size, -p.size / 6, p.size * 2, p.size / 3);
      ctx.fillRect(-p.size / 6, -p.size, p.size / 3, p.size * 2);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  particles = particles.filter(
    (p) => p.life > 0 && p.y < window.innerHeight + 60 && p.x > -60 && p.x < window.innerWidth + 60
  );

  if (particles.length > 0) {
    requestAnimationFrame(tick);
  } else {
    running = false;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function addParticle(options) {
  particles.push({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    gravity: 0.12,
    drag: 1,
    size: 8,
    rotation: 0,
    spin: 0,
    color: pickColor(),
    life: 120,
    fade: 60,
    shape: "dot",
    ...options,
  });
}

function sparkles(count) {
  const rect = document.querySelector(".display").getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    addParticle({
      shape: "sparkle",
      x: rect.left + Math.random() * rect.width,
      y: rect.top + Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 3 - 1,
      gravity: 0.05,
      size: 4 + Math.random() * 6,
      spin: (Math.random() - 0.5) * 0.2,
      life: 50 + Math.random() * 30,
      fade: 50,
    });
  }
  start();
}

function confetti(count) {
  for (let i = 0; i < count; i++) {
    addParticle({
      shape: "confetti",
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 2,
      vy: 1 + Math.random() * 3,
      gravity: 0.06,
      size: 8 + Math.random() * 8,
      spin: (Math.random() - 0.5) * 0.3,
      life: 260,
      fade: 40,
    });
  }
  start();
}

function firework(x, y) {
  const color = pickColor();
  const count = 36;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2 + Math.random() * 4;
    addParticle({
      shape: "dot",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.06,
      drag: 0.97,
      size: 2 + Math.random() * 2,
      color: Math.random() < 0.3 ? pickColor() : color,
      life: 70 + Math.random() * 30,
      fade: 70,
    });
  }
  start();
}

function balloons(count) {
  for (let i = 0; i < count; i++) {
    const sway = document.createElement("div");
    sway.className = "balloon-sway";
    sway.style.left = Math.random() * 92 + "vw";
    sway.style.animationDelay = Math.random() * 1.5 + "s";

    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.style.background = pickColor();
    balloon.style.animationDuration = 5 + Math.random() * 3 + "s";
    balloon.style.animationDelay = sway.style.animationDelay;
    balloon.addEventListener("animationend", () => sway.remove());

    sway.appendChild(balloon);
    balloonLayer.appendChild(sway);
  }
}

/** Celebrate a result. Bigger number, bigger party. */
function celebrate(value) {
  if (calm || Number.isNaN(value)) return;

  const size = isFinite(value) ? Math.abs(value) : Infinity;
  let tier = 0;
  if (size >= 10) tier = 1;
  if (size >= 100) tier = 2;
  if (size >= 1000) tier = 3;
  if (size >= 10000) tier = 4;

  sparkles(10 + tier * 6);

  if (tier >= 1) confetti(30 + tier * 25);
  if (tier >= 2) balloons(6 + tier * 3);

  if (tier >= 3) {
    for (let i = 0; i < 3; i++) {
      setTimeout(
        () => firework(window.innerWidth * (0.2 + Math.random() * 0.6), window.innerHeight * 0.3),
        i * 260
      );
    }
  }

  if (tier >= 4) {
    document.body.classList.add("mega");
    setTimeout(() => document.body.classList.remove("mega"), 1600);
    for (let i = 0; i < 9; i++) {
      setTimeout(
        () =>
          firework(
            window.innerWidth * (0.1 + Math.random() * 0.8),
            window.innerHeight * (0.15 + Math.random() * 0.45)
          ),
        600 + i * 200
      );
    }
  }
}
