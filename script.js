const resultEl = document.getElementById("result");
const expressionEl = document.getElementById("expression");
const messageEl = document.getElementById("message");

const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

let current = "0"; // what the display shows while typing
let accumulator = null; // the running total
let operator = null; // the pending operation
let waiting = false; // true right after an operator is pressed

function formatNumber(value) {
  if (!isFinite(value)) return "∞";
  if (Number.isNaN(value)) return "oops";
  const rounded = Math.round(value * 1e10) / 1e10;
  return String(rounded);
}

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
  } else {
    current = current === "0" ? digit : current + digit;
  }
  render();
}

function inputDot() {
  if (waiting) {
    current = "0.";
    waiting = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
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
  messageEl.innerHTML = julieMessage(current, value);
  celebrate(value);
}

function clearAll() {
  current = "0";
  accumulator = null;
  operator = null;
  waiting = false;
  messageEl.textContent = "Fresh start! Julie believes in you. 💪";
  render();
}

function deleteLast() {
  if (waiting) return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  render();
}

document.querySelectorAll(".key").forEach((key) => {
  key.addEventListener("click", () => {
    if (key.dataset.digit !== undefined) return inputDigit(key.dataset.digit);
    if (key.dataset.op !== undefined) return chooseOperator(key.dataset.op);
    if (key.dataset.action === "dot") return inputDot();
    if (key.dataset.action === "clear") return clearAll();
    if (key.dataset.action === "delete") return deleteLast();
    if (key.dataset.action === "equals") return equals();
  });
});

function flash(selector) {
  const key = document.querySelector(selector);
  if (!key) return;
  key.classList.add("is-pressed");
  setTimeout(() => key.classList.remove("is-pressed"), 100);
}

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

render();
