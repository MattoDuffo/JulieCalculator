/*
 * Thirty levels of celebration.
 *
 * The level is simply how many digits the result has: a 2-digit answer gets
 * level 2, a 30-digit answer gets the full LEVEL 30 meltdown. Every level
 * from 1 up to the current one fires, staggered by 90ms, so big answers
 * build up instead of dumping everything at once.
 */

const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
const layer = document.getElementById("fx-layer");

const COLORS = [
  "#ff5fa2", "#ffa63d", "#ffe14d", "#3fd8c8",
  "#8b5cf6", "#5fd1ff", "#ff7a7a", "#9dff6b",
];
const PARTY_EMOJI = ["🎉", "🎊", "🎈", "💖", "⭐", "🦄", "🍰", "🌈", "✨", "🎆", "🥳", "💫"];
const BODY_CLASSES = ["rainbow", "quake", "jelly", "strobe", "singularity"];
const MAX_PARTICLES = 1500;

const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let particles = [];
let lastMessage = "";
let running = false;
let timers = [];
let intervals = [];

/* ---------- plumbing ---------- */

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

const W = () => window.innerWidth;
const H = () => window.innerHeight;
const rand = (min, max) => min + Math.random() * (max - min);
const pickColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
const choose = (list) => list[Math.floor(Math.random() * list.length)];

function later(fn, ms) {
  timers.push(setTimeout(fn, ms));
}

function repeat(fn, every, duration) {
  const id = setInterval(fn, every);
  intervals.push(id);
  later(() => clearInterval(id), duration);
}

function displayBox() {
  return document.querySelector(".display").getBoundingClientRect();
}

function node(className, html) {
  const el = document.createElement("div");
  el.className = className;
  if (html !== undefined) el.innerHTML = html;
  layer.appendChild(el);
  return el;
}

function bodyClass(name, ms) {
  document.body.classList.add(name);
  later(() => document.body.classList.remove(name), ms);
}

function stopEverything() {
  timers.forEach(clearTimeout);
  intervals.forEach(clearInterval);
  timers = [];
  intervals = [];
  particles = [];
  layer.innerHTML = "";
  BODY_CLASSES.forEach((c) => document.body.classList.remove(c));
  document.querySelector(".calculator").classList.remove("flip");
  document.getElementById("result").classList.remove("bounce");
  ctx.clearRect(0, 0, W(), H());
}

/* ---------- particle engine ---------- */

function addParticle(options) {
  if (particles.length > MAX_PARTICLES) particles.shift();
  particles.push({
    x: 0, y: 0, vx: 0, vy: 0,
    gravity: 0.12, drag: 1, wind: 0,
    size: 8, grow: 0,
    rotation: 0, spin: 0,
    color: pickColor(),
    life: 120, fade: 60,
    shape: "dot",
    text: "",
    orbit: null,
    ...options,
  });
  start();
}

function start() {
  if (running) return;
  running = true;
  requestAnimationFrame(tick);
}

function tick() {
  ctx.clearRect(0, 0, W(), H());

  for (const p of particles) {
    p.life -= 1;
    p.px = p.x;
    p.py = p.y;

    if (p.orbit) {
      p.orbit.angle += p.orbit.speed;
      p.orbit.radius += p.orbit.spread;
      p.orbit.lift += p.orbit.rise;
      p.x = p.orbit.cx + Math.cos(p.orbit.angle) * p.orbit.radius;
      p.y = p.orbit.cy + Math.sin(p.orbit.angle) * p.orbit.radius * 0.4 - p.orbit.lift;
    } else {
      p.vy += p.gravity;
      p.vx = p.vx * p.drag + p.wind;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
    }

    p.size += p.grow;
    p.rotation += p.spin;

    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.fade));
    ctx.fillStyle = p.color;
    ctx.strokeStyle = p.color;

    switch (p.shape) {
      case "confetti":
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
        break;
      case "streamer":
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation + Math.sin(p.life / 8) * 0.6);
        ctx.fillRect(-p.size / 2, -p.size * 1.6, p.size, p.size * 3.2);
        ctx.restore();
        break;
      case "sparkle":
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size, -p.size / 6, p.size * 2, p.size / 3);
        ctx.fillRect(-p.size / 6, -p.size, p.size / 3, p.size * 2);
        ctx.restore();
        break;
      case "ring":
        ctx.lineWidth = Math.max(1, p.width || 4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "comet":
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.px - p.vx * 3, p.py - p.vy * 3);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        break;
      case "text":
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px ${p.font || '"Fredoka", sans-serif'}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.text, 0, 0);
        ctx.restore();
        break;
      default:
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  particles = particles.filter(
    (p) => p.life > 0 && p.y > -260 && p.y < H() + 260 && p.x > -260 && p.x < W() + 260
  );

  if (particles.length > 0) {
    requestAnimationFrame(tick);
  } else {
    running = false;
    ctx.clearRect(0, 0, W(), H());
  }
}

/* ---------- the effects themselves ---------- */

function sparkles(count, spread = 1) {
  const box = displayBox();
  for (let i = 0; i < count; i++) {
    addParticle({
      shape: "sparkle",
      x: box.left + box.width / 2 + rand(-box.width, box.width) * 0.5 * spread,
      y: box.top + box.height / 2 + rand(-box.height, box.height) * 0.5 * spread,
      vx: rand(-4, 4) * spread,
      vy: rand(-4, -0.5),
      gravity: 0.05,
      size: rand(4, 11),
      spin: rand(-0.2, 0.2),
      life: rand(50, 90),
      fade: 60,
    });
  }
}

function confetti(count) {
  for (let i = 0; i < count; i++) {
    addParticle({
      shape: "confetti",
      x: rand(0, W()),
      y: rand(-240, -10),
      vx: rand(-1.2, 1.2),
      vy: rand(1, 4),
      gravity: 0.06,
      size: rand(8, 17),
      spin: rand(-0.3, 0.3),
      life: 320,
      fade: 40,
    });
  }
}

function emojiRain(count, emojis = PARTY_EMOJI) {
  for (let i = 0; i < count; i++) {
    addParticle({
      shape: "text",
      text: choose(emojis),
      font: "serif",
      x: rand(0, W()),
      y: rand(-320, -20),
      vx: rand(-0.6, 0.6),
      vy: rand(1.5, 3.5),
      gravity: 0.03,
      size: rand(22, 46),
      spin: rand(-0.05, 0.05),
      life: 360,
      fade: 40,
    });
  }
}

function floatUp(count, emojis) {
  for (let i = 0; i < count; i++) {
    addParticle({
      shape: "text",
      text: choose(emojis),
      font: "serif",
      x: rand(0, W()),
      y: H() + rand(10, 120),
      vx: rand(-0.5, 0.5),
      vy: rand(-3.2, -1.4),
      gravity: -0.004,
      size: rand(20, 44),
      spin: rand(-0.03, 0.03),
      life: 340,
      fade: 50,
    });
  }
}

function streamers(count) {
  for (let i = 0; i < count; i++) {
    addParticle({
      shape: "streamer",
      x: rand(0, W()),
      y: rand(-200, -20),
      vx: rand(-1, 1),
      vy: rand(1.5, 3),
      gravity: 0.02,
      size: rand(6, 11),
      spin: rand(-0.1, 0.1),
      life: 320,
      fade: 50,
    });
  }
}

function firework(x, y, count = 40) {
  const color = pickColor();
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = rand(2, 6.5);
    addParticle({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.06,
      drag: 0.97,
      size: rand(2, 4.5),
      color: Math.random() < 0.3 ? pickColor() : color,
      life: rand(70, 105),
      fade: 70,
    });
  }
}

function fireworkVolley(shots, gap = 240, highOnly = false) {
  for (let i = 0; i < shots; i++) {
    later(
      () => firework(rand(W() * 0.1, W() * 0.9), highOnly ? rand(H() * 0.1, H() * 0.4) : rand(H() * 0.15, H() * 0.6)),
      i * gap
    );
  }
}

function balloons(count) {
  for (let i = 0; i < count; i++) {
    const sway = node("balloon-sway");
    sway.style.left = rand(0, 92) + "vw";
    sway.style.animationDelay = rand(0, 1.5) + "s";

    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.style.background = pickColor();
    balloon.style.animationDuration = rand(5, 8.5) + "s";
    balloon.style.animationDelay = sway.style.animationDelay;
    balloon.addEventListener("animationend", () => sway.remove());
    sway.appendChild(balloon);
  }
}

function shockwave(x, y, rings = 3) {
  for (let i = 0; i < rings; i++) {
    later(
      () =>
        addParticle({
          shape: "ring",
          x, y,
          gravity: 0,
          size: 6,
          grow: 9,
          width: 6,
          color: pickColor(),
          life: 60,
          fade: 60,
        }),
      i * 130
    );
  }
}

function confettiCannon(fromLeft) {
  const x = fromLeft ? -10 : W() + 10;
  for (let i = 0; i < 70; i++) {
    addParticle({
      shape: "confetti",
      x,
      y: H() + 10,
      vx: (fromLeft ? 1 : -1) * rand(4, 13),
      vy: rand(-17, -8),
      gravity: 0.25,
      size: rand(9, 18),
      spin: rand(-0.4, 0.4),
      life: 320,
      fade: 50,
    });
  }
}

function comets(count) {
  for (let i = 0; i < count; i++) {
    later(() => {
      const fromLeft = Math.random() < 0.5;
      addParticle({
        shape: "comet",
        x: fromLeft ? -40 : W() + 40,
        y: rand(40, H() * 0.7),
        vx: (fromLeft ? 1 : -1) * rand(11, 20),
        vy: rand(-1.5, 1.5),
        gravity: 0,
        size: rand(3, 7),
        life: 140,
        fade: 90,
      });
    }, i * 110);
  }
}

function tornado(count) {
  const cx = W() / 2;
  const cy = H() * 0.62;
  for (let i = 0; i < count; i++) {
    addParticle({
      shape: "sparkle",
      size: rand(3, 8),
      spin: rand(-0.3, 0.3),
      life: rand(130, 220),
      fade: 90,
      orbit: {
        cx, cy,
        angle: rand(0, Math.PI * 2),
        radius: rand(10, 90),
        speed: rand(0.12, 0.22),
        spread: rand(0.4, 1.3),
        lift: 0,
        rise: rand(1.2, 2.6),
      },
    });
  }
}

function numberClones(text, count) {
  const box = displayBox();
  for (let i = 0; i < count; i++) {
    addParticle({
      shape: "text",
      text,
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
      vx: rand(-9, 9),
      vy: rand(-11, -2),
      gravity: 0.18,
      size: rand(22, 64),
      spin: rand(-0.12, 0.12),
      life: 110,
      fade: 70,
    });
  }
}

function flashScreen(color, ms) {
  const flash = node("fx-flash");
  flash.style.background = color;
  flash.style.animationDuration = ms + "ms";
  later(() => flash.remove(), ms + 60);
}

function dancingLetters() {
  "JULIE".split("").forEach((letter, i) => {
    const el = node("dancing-letter", letter);
    el.style.left = 8 + i * 18 + "vw";
    el.style.color = COLORS[i % COLORS.length];
    el.style.animationDelay = i * 0.12 + "s";
    later(() => el.remove(), 4000);
  });
}

function pinwheel() {
  const el = node("pinwheel");
  later(() => el.remove(), 4200);
}

function spotlights() {
  for (let i = 0; i < 3; i++) {
    const beam = node("spotlight");
    beam.style.left = 15 + i * 35 + "vw";
    beam.style.animationDelay = i * 0.4 + "s";
    beam.style.background = `linear-gradient(to bottom, ${COLORS[i * 2]}cc, transparent)`;
    later(() => beam.remove(), 5000);
  }
}

function parade() {
  const band = node("parade", "🥁 🎺 🎷 🎸 🪗 🎻 🥳 🎉 🦄 🎺");
  later(() => band.remove(), 7000);
}

function marquee(text) {
  const band = node("marquee");
  const inner = document.createElement("div");
  inner.className = "marquee__text";
  inner.textContent = (text + " ★ ").repeat(6);
  band.appendChild(inner);
  later(() => band.remove(), 8000);
}

function unicornFlyby() {
  const uni = node("unicorn", "🦄");
  repeat(() => {
    const rect = uni.getBoundingClientRect();
    for (let i = 0; i < 4; i++) {
      addParticle({
        x: rect.left + rand(-10, 30),
        y: rect.top + rand(0, 50),
        vx: rand(-2, 0),
        vy: rand(-1, 1),
        gravity: 0.02,
        size: rand(3, 7),
        life: 70,
        fade: 55,
      });
    }
  }, 40, 3200);
  later(() => uni.remove(), 3400);
}

function takeover(messageHtml) {
  const curtain = node("takeover");
  const text = document.createElement("div");
  text.className = "takeover__text";
  text.innerHTML = messageHtml || "JULIE IS THE BEST";
  curtain.appendChild(text);
  later(() => curtain.remove(), 5000);
}

function showBanner(html, level) {
  const banner = node("julie-banner", `<div class="julie-banner__text">${html}</div>`);
  if (level >= 10) banner.classList.add("julie-banner--giant");
  if (level >= 20) banner.classList.add("julie-banner--wild");
  later(() => banner.classList.add("is-leaving"), 4200 + level * 60);
  later(() => banner.remove(), 5000 + level * 60);
}

function showBadge(level, digits, forced) {
  const name = LEVELS[level - 1].name;
  const tail = forced
    ? "preview"
    : `${digits} digit${digits === 1 ? "" : "s"}`;
  const badge = node(
    "level-badge",
    `<span class="level-badge__n">LVL ${level}</span> ${name} <span class="level-badge__d">${tail}</span>`
  );
  if (level >= 20) badge.classList.add("level-badge--hot");
  later(() => badge.remove(), 4200);
}

/* ---------- the ladder ---------- */

const LEVELS = [
  { name: "Twinkle", run: () => sparkles(6, 0.6) },
  { name: "Sparkle Shower", run: () => sparkles(20) },
  { name: "Confetti Sprinkles", run: () => confetti(45) },
  {
    name: "Bouncy Digits",
    run: () => {
      const r = document.getElementById("result");
      r.classList.add("bounce");
      later(() => r.classList.remove("bounce"), 1000);
    },
  },
  { name: "Heart Float", run: () => floatUp(14, ["💖", "💗", "💞", "💓"]) },
  { name: "Balloon Brigade", run: () => balloons(10) },
  { name: "Streamer Storm", run: () => streamers(26) },
  { name: "First Firework", run: () => firework(W() / 2, H() * 0.3) },
  { name: "Firework Volley", run: () => fireworkVolley(4) },
  { name: "Giant Julie Banner", run: () => flashScreen("rgba(255,255,255,0.55)", 420) },
  { name: "Star Burst", run: () => (shockwave(W() / 2, H() * 0.35, 3), sparkles(30, 2)) },
  { name: "Confetti Cannons", run: () => (confettiCannon(true), confettiCannon(false)) },
  { name: "Rainbow Sky", run: () => bodyClass("rainbow", 5000) },
  { name: "Dancing JULIE Letters", run: dancingLetters },
  { name: "Earthquake", run: () => bodyClass("quake", 1800) },
  { name: "Pinwheel of Joy", run: pinwheel },
  { name: "Emoji Rain", run: () => emojiRain(34) },
  {
    name: "Calculator Backflip",
    run: () => {
      const calc = document.querySelector(".calculator");
      calc.classList.add("flip");
      later(() => calc.classList.remove("flip"), 1400);
    },
  },
  { name: "Disco Spotlights", run: spotlights },
  { name: "Comet Parade", run: () => comets(9) },
  { name: "Marching Band", run: parade },
  { name: "Jelly World", run: () => bodyClass("jelly", 3000) },
  { name: "Glitter Tornado", run: () => tornado(90) },
  { name: "Scrolling Marquee", run: () => marquee("JULIE IS THE BEST") },
  { name: "Strobe Fever", run: () => bodyClass("strobe", 2600) },
  { name: "Unicorn Flyby", run: unicornFlyby },
  { name: "Number Clones", run: () => numberClones(document.getElementById("result").textContent, 16) },
  {
    name: "Supernova Shockwave",
    run: () => {
      flashScreen("#fff", 700);
      shockwave(W() / 2, H() / 2, 6);
      sparkles(60, 3);
    },
  },
  {
    name: "Full Julie Takeover",
    run: (level) => {
      takeover(lastMessage);
      confetti(150);
      balloons(18);
      repeat(() => firework(rand(0, W()), rand(0, H() * 0.7)), 320, 4000);
    },
  },
  {
    name: "JULIE SINGULARITY",
    run: () => {
      bodyClass("singularity", 9000);
      bodyClass("rainbow", 9000);
      emojiRain(60);
      confetti(220);
      balloons(30);
      tornado(140);
      comets(14);
      dancingLetters();
      repeat(() => firework(rand(0, W()), rand(0, H() * 0.8), 54), 180, 8000);
      later(() => {
        flashScreen("#fff", 900);
        shockwave(W() / 2, H() / 2, 8);
      }, 7800);
    },
  },
];

function countDigits(shown) {
  if (shown === "∞") return 30;
  const digits = shown.replace("-", "").split(".")[0].replace(/\D/g, "");
  return Math.max(1, digits.length);
}

/**
 * Throw a party sized to the result.
 * @param {string} shown - the formatted result
 * @param {string} messageHtml - Julie's line, shown big on screen
 * @param {number} [forcedLevel] - override, used by the ?level=N preview
 */
function celebrate(shown, messageHtml, forcedLevel) {
  stopEverything();

  lastMessage = messageHtml;
  const digits = countDigits(shown);
  const level = Math.max(1, Math.min(30, forcedLevel || digits));

  showBanner(messageHtml, level);
  if (calm) return;

  showBadge(level, digits, Boolean(forcedLevel));
  for (let i = 1; i <= level; i++) {
    later(() => LEVELS[i - 1].run(level), (i - 1) * 90);
  }
}
