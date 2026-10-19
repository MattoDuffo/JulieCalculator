/*
 * Every answer deserves a compliment. This file builds the little note that
 * appears under the calculator: a pun, a joke, or a J-U-L-I-E acrostic.
 */

const PUNS = [
  "{n}, but Julie is definitely the best!!",
  "Math says {n}. Julie says hi. 👋",
  "{n}? Ju-lie-ve it or not, that's correct.",
  "Ab-sa-Julie correct! ({n})",
  "You can always count on Julie. And on {n}.",
  "{n} — Julie approved. ✅",
  "Julie + numbers = unstoppable.",
  "Carry the one, carry the Julie... {n}!",
  "{n}. Still a smaller number than Julie's heart.",
  "Sum people are great. Julie is greater.",
  "{n} out of 10, and Julie is the 10.",
  "My circuits ran the numbers and also agree: Julie rules.",
  "This equation was solved on 100% Julie energy.",
  "Roses are red, violets are blue, the answer is {n}, and Julie is too… wonderful.",
  "{n}, calculated with the power of Ju-lie-tiplication.",
];

const JOKES = [
  "Why did Julie bring a ladder to math class? To reach the higher numbers. 🪜",
  "What's Julie's favourite tree? A geome-tree. 🌳",
  "Why is Julie never cold? She's surrounded by degrees. 🌡️",
  "Parallel lines have a lot in common — sadly, they'll never meet Julie.",
  "Julie's favourite number? All of them. She makes every one look good.",
  "Why did {n} start smiling? Julie glanced at it.",
  "I asked the calculator who's the best. It just printed Julie, Julie, Julie…",
];

const ACROSTIC = {
  J: ["Joyful", "Jolly", "Jaw-droppingly kind", "Just the loveliest", "Jazzy"],
  U: ["Unstoppable", "Unbelievably kind", "Unique", "Upbeat", "Unmatched"],
  L: ["Lovely", "Legendary", "Lively", "Luminous", "Laughing always"],
  I: ["Incredible", "Inspiring", "Irreplaceable", "Imaginative", "Infinitely cool"],
  E: ["Excellent", "Energetic", "Extraordinary", "Enchanting", "Everyone's favourite"],
};

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function buildAcrostic() {
  const lines = Object.keys(ACROSTIC).map(
    (letter) => `<b>${letter}</b>${pick(ACROSTIC[letter]).slice(1)}`
  );
  return lines.join("<br />");
}

/**
 * Returns HTML for the message shown after pressing "=".
 * @param {string} shown - the formatted result, e.g. "42"
 * @param {number} value - the numeric result
 */
function julieMessage(shown, value) {
  if (!isFinite(value)) {
    return "Dividing by zero breaks the universe — but not Julie. She's fine. 🌈";
  }
  if (Number.isNaN(value)) {
    return "That one broke my brain. Julie would have solved it instantly. 🧠";
  }
  if (value < 0) {
    return `${shown}. Negative numbers, positive Julie. 💛`;
  }

  const roll = Math.random();
  if (roll < 0.45) return pick(PUNS).replaceAll("{n}", shown);
  if (roll < 0.8) return pick(JOKES).replaceAll("{n}", shown);
  return buildAcrostic();
}
