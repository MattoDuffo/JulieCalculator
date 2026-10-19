const resultEl = document.getElementById("result");
const expressionEl = document.getElementById("expression");
const screenMessageEl = document.getElementById("screen-message");

const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

let current = "0"; // what the display shows while typing
let accumulator = null; // the running total
let operator = null; // the pending operation
let waiting = false; // true right after an operator is pressed

function formatNumber(value) {
  if (!isFinite(value)) return "∞";
  if (Number.isNaN(value)) return "oops";
  // Big results would print as "1e+30"; spell them out so every digit counts.
  if (Math.abs(value) >= 1e15) {
    return value.toLocaleString("fullwide", {
      useGrouping: false,
      maximumFractionDigits: 0,
    });
  }
  const rounded = Math.round(value * 1e10) / 1e10;
  return String(rounded);
}

// ?level=17 forces a celebration level, so you can tour the show without
// having to multiply your way up to a 17-digit number.
const previewLevel = Number(new URLSearchParams(location.search).get("level")) || 0;

function render() {
  resultEl.textContent = current;
  expressionEl.textContent =
    operator === null
      ? " "
      : `${formatNumber(accumulator)} ${SYMBOLS[operator]}${waiting ? "" : " " + current}`;
}

function compute() {
  const a = accumulator;
  const b = parseFloat(current);
  switch (operator) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return a / b;
    default:
      return b;
  }
}

function inputDigit(digit) {
  if (waiting) {
    current = digit;
    waiting = false;
    screenMessageEl.textContent = "";
  } else {
    current = current === "0" ? digit : current + digit;
  }
  const muteButton = document.getElementById("mute");

function paintMuteButton() {
  muteButton.textContent = Sound.isMuted() ? "🔇" : "🔊";
  muteButton.setAttribute("aria-label", Sound.isMuted() ? "Unmute the band" : "Mute the band");
}

muteButton.addEventListener("click", () => {
  Sound.toggleMute();
  paintMuteButton();
});

paintMuteButton();
render();
}

function inputDot() {
  if (waiting) {
    current = "0.";
    waiting = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  const muteButton = document.getElementById("mute");

function paintMuteButton() {
  muteButton.textContent = Sound.isMuted() ? "🔇" : "🔊";
  muteButton.setAttribute("aria-label", Sound.isMuted() ? "Unmute the band" : "Mute the band");
}

muteButton.addEventListener("click", () => {
  Sound.toggleMute();
  paintMuteButton();
});

paintMuteButton();
render();
}

function chooseOperator(op) {
  if (operator !== null && !waiting) {
    accumulator = compute();
    current = formatNumber(accumulator);
  } else {
    accumulator = parseFloat(current);
  }
  operator = op;
  waiting = true;
  const muteButton = document.getElementById("mute");

function paintMuteButton() {
  muteButton.textContent = Sound.isMuted() ? "🔇" : "🔊";
  muteButton.setAttribute("aria-label", Sound.isMuted() ? "Unmute the band" : "Mute the band");
}

muteButton.addEventListener("click", () => {
  Sound.toggleMute();
  paintMuteButton();
});

paintMuteButton();
render();
}

function equals() {
  if (operator === null) return;
  const value = compute();
  expressionEl.textContent = `${formatNumber(accumulator)} ${SYMBOLS[operator]} ${current} =`;
  current = formatNumber(value);
  accumulator = null;
  operator = null;
  waiting = true;
  resultEl.textContent = current;
  const message = julieMessage(current, value);
  screenMessageEl.innerHTML = message;
  celebrate(current, message, previewLevel);
}

function clearAll() {
  current = "0";
  accumulator = null;
  operator = null;
  waiting = false;
  screenMessageEl.textContent = "";
  const muteButton = document.getElementById("mute");

function paintMuteButton() {
  muteButton.textContent = Sound.isMuted() ? "🔇" : "🔊";
  muteButton.setAttribute("aria-label", Sound.isMuted() ? "Unmute the band" : "Mute the band");
}

muteButton.addEventListener("click", () => {
  Sound.toggleMute();
  paintMuteButton();
});

paintMuteButton();
render();
}

function deleteLast() {
  if (waiting) return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  const muteButton = document.getElementById("mute");

function paintMuteButton() {
  muteButton.textContent = Sound.isMuted() ? "🔇" : "🔊";
  muteButton.setAttribute("aria-label", Sound.isMuted() ? "Unmute the band" : "Mute the band");
}

muteButton.addEventListener("click", () => {
  Sound.toggleMute();
  paintMuteButton();
});

paintMuteButton();
render();
}

function press(key) {
  if (key.dataset.digit !== undefined) return inputDigit(key.dataset.digit);
  if (key.dataset.op !== undefined) return chooseOperator(key.dataset.op);
  if (key.dataset.action === "dot") return inputDot();
  if (key.dataset.action === "clear") return clearAll();
  if (key.dataset.action === "delete") return deleteLast();
  if (key.dataset.action === "equals") return equals();
}

// pointerdown rather than click: the key reacts on the way down, which lets
// us cancel the tap that follows without losing the press.
let lastPointerAt = 0;
let lastPointerType = "";

document.querySelectorAll(".key").forEach((key) => {
  key.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    Sound.unlock(); // browsers only allow audio after a gesture like this one
    const now = Date.now();
    // A touch is replayed as a synthetic mouse pointerdown moments later;
    // without this, one tap would count twice.
    const isReplay =
      event.pointerType === "mouse" && lastPointerType === "touch" && now - lastPointerAt < 700;
    lastPointerAt = now;
    if (!isReplay) lastPointerType = event.pointerType;
    if (isReplay) return;
    event.preventDefault();
    press(key);
  });
  // A keyboard-activated click (Enter or Space on a focused key) carries no
  // pointer type and no click count; pointerdown never sees it. Taps and
  // mouse clicks are already handled above, so they must not fall through.
  key.addEventListener("click", (event) => {
    if (event.detail === 0 && !event.pointerType) press(key);
  });
});

function flash(selector) {
  const key = document.querySelector(selector);
  if (!key) return;
  key.classList.add("is-pressed");
  setTimeout(() => key.classList.remove("is-pressed"), 100);
}

// Safari ignores touch-action in places, so swallow the second tap of a
// double tap outright. The press already registered on pointerdown.
let lastTapAt = 0;
document.addEventListener(
  "touchend",
  (event) => {
    const now = Date.now();
    if (now - lastTapAt <= 400) event.preventDefault();
    lastTapAt = now;
  },
  { passive: false }
);

document.addEventListener("dblclick", (event) => event.preventDefault());

document.addEventListener("keydown", (event) => {
  const k = event.key;
  if (k >= "0" && k <= "9") {
    inputDigit(k);
    flash(`[data-digit="${k}"]`);
  } else if (k === "." || k === ",") {
    inputDot();
    flash('[data-action="dot"]');
  } else if (["+", "-", "*", "/"].includes(k)) {
    chooseOperator(k);
    flash(`[data-op="${k}"]`);
  } else if (k === "Enter" || k === "=") {
    // A focused key handles its own Enter.
    if (document.activeElement && document.activeElement.classList.contains("key")) return;
    event.preventDefault();
    equals();
    flash('[data-action="equals"]');
  } else if (k === "Backspace") {
    deleteLast();
    flash('[data-action="delete"]');
  } else if (k === "Escape") {
    clearAll();
    flash('[data-action="clear"]');
  }
});

const muteButton = document.getElementById("mute");

function paintMuteButton() {
  muteButton.textContent = Sound.isMuted() ? "🔇" : "🔊";
  muteButton.setAttribute("aria-label", Sound.isMuted() ? "Unmute the band" : "Mute the band");
}

muteButton.addEventListener("click", () => {
  Sound.toggleMute();
  paintMuteButton();
});

paintMuteButton();
render();
