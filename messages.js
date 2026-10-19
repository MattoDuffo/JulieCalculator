/*
 * Every answer deserves a compliment.
 *
 * Six kinds of message take turns: puns, jokes, little rhymes, cheers,
 * "Julie facts" and J-U-L-I-E acrostics. Everything here is kind and happy on
 * purpose. {n} is replaced with the result.
 *
 * Wrapped in a function so nothing leaks into the page's global names.
 */

const julieMessage = (function () {
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
    "That's truly — sorry, Julie-ly — correct.",
    "{n}: a jewel of a number. Much like Julie. 💎",
    "That took {n} joules of effort. Julie would do it smiling.",
    "Ju-lie? Never. Julie only tells the truth. 💯",
    "Warm as July, bright as Julie. ☀️",
    "Unruly numbers? Not on Julie's watch.",
    "Duly noted: the answer is {n}, and Julie is wonderful.",
    "Freshly calculated, Julie-approved: {n}.",
    "Julie makes every equation add up.",
    "Subtract the worries, multiply the joy — the Julie method.",
    "The square root of awesome is Julie.",
    "Julie's constant: always kind, never negative.",
    "In base Julie, every number is a lucky one.",
    "{n} is correct. Julie is correct-er.",
    "This calculator runs on Julie-powered batteries. 🔋",
    "My circuits ran the numbers and agree: Julie rules.",
    "Solved on 100% Julie energy.",
    "{n}, calculated with the power of Ju-lie-tiplication.",
    "One in a million? Julie is one in {n}.",
  ];

  const JOKES = [
    "Why did Julie bring a ladder to maths class? To reach the higher numbers. 🪜",
    "What's Julie's favourite tree? A geome-tree. 🌳",
    "Why is Julie never cold? She's surrounded by degrees. 🌡️",
    "Parallel lines have a lot in common — sadly, they'll never meet Julie.",
    "Julie's favourite number? All of them. She makes every one look good.",
    "Why did {n} start smiling? Julie glanced at it.",
    "I asked the calculator who's the best. It just printed Julie, Julie, Julie…",
    "Why was the equal sign so humble? It knew it was never greater than Julie.",
    "What's Julie's favourite dessert? Pi. 🥧",
    "Why did the triangle call Julie? It needed a right angle on life. 📐",
    "Why don't numbers argue with Julie? She always has a solid point.",
    "What did zero say to eight? \"Nice belt!\" Then they both waved at Julie.",
    "Why bring Julie to an exam? Moral support and perfect answers.",
    "What's Julie's superpower? Making Mondays feel like Fridays.",
    "Why did the abacus retire? Julie did the sums faster. 🧮",
    "What's Julie's favourite shape? The circle — no sharp edges, just like her. ⭕",
    "Why is Julie better than a calculator? She shows her work *and* her kindness.",
    "What do you get when you cross Julie with a sunny day? A great day. ☀️",
    "Why did the fraction cheer up? Julie made it feel whole again.",
    "How many Julies does it take to change a lightbulb? One. She brightens everything. 💡",
    "Why did the graph blush? Julie complimented its curves. 📈",
    "Why do calculators adore Julie? She never presses their buttons the wrong way.",
    "What do you call a number that won't sit still? A roamin' numeral. Julie caught it anyway.",
    "Why did the decimal point feel important? Julie put it in exactly the right place.",
  ];

  const RHYMES = [
    "Roses are red, violets are blue, the answer is {n}, and Julie is too… wonderful.",
    "Numbers go up, numbers go down — Julie's the best in any town.",
    "A pinch of maths, a dash of fun: Julie makes it {n}, and then some.",
    "Tick goes the clock, click goes the key, out pops {n} — hooray for Julie!",
    "Count the stars, count the sun: Julie outshines every one.",
    "Add it, subtract it, give it a whirl — the answer is {n}, thanks to that girl.",
  ];

  const CHEERS = [
    "{n}! And you did that. Julie's proud. 🌟",
    "Great maths. Greater company. Hi Julie! 👋",
    "Keep going — you and Julie are unstoppable.",
    "{n} down, infinite to go. Julie believes in you.",
    "Today's forecast: 100% chance of Julie being brilliant. ☀️",
    "That was smooth. Julie-smooth.",
    "Big number energy. Bigger Julie energy. 💪",
    "If maths had a mascot, it would be Julie. 🏆",
    "You pressed the buttons. Julie brings the style.",
    "Nothing but good vibes and correct answers today. 🎉",
  ];

  const FACTS = [
    "Fun fact: every calculator secretly hopes Julie will use it.",
    "Certified Julie fact: her smile has no remainder. 😄",
    "Studies show {n} sounds nicer when Julie reads it aloud.",
    "Scientists tried to measure Julie's kindness. The number kept growing.",
    "Fact: Julie's laugh is the only thing that always rounds up.",
    "Rumour has it {n} is Julie's lucky number today. 🍀",
    "Breaking: local calculator describes Julie as \"just the loveliest\".",
    "Historians agree: the best day was the day we met Julie.",
  ];

  const ACROSTIC = {
    J: ["Joyful", "Jolly", "Jaw-droppingly kind", "Just the loveliest", "Jazzy", "Generous of spirit", "Joy in person", "Just brilliant"],
    U: ["Unstoppable", "Unbelievably kind", "Unique", "Upbeat", "Unmatched", "Utterly delightful", "Uplifting", "Unforgettable"],
    L: ["Lovely", "Legendary", "Lively", "Luminous", "Laughing always", "Loyal to the end", "Light in any room", "Lovable"],
    I: ["Incredible", "Inspiring", "Irreplaceable", "Imaginative", "Infinitely cool", "Immensely fun", "Impossible to top", "In a league of her own"],
    E: ["Excellent", "Energetic", "Extraordinary", "Enchanting", "Everyone's favourite", "Endlessly kind", "Especially great", "Easy to love"],
  };

  // Keep a short memory so the same line does not come round twice in a row.
  const recent = [];
  const RECENT_LIMIT = 15;

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function freshPick(list) {
    for (let tries = 0; tries < 12; tries++) {
      const choice = pick(list);
      if (!recent.includes(choice)) {
        recent.push(choice);
        if (recent.length > RECENT_LIMIT) recent.shift();
        return choice;
      }
    }
    return pick(list);
  }

  function buildAcrostic() {
    return Object.keys(ACROSTIC)
      .map((letter) => `<b>${letter}</b>${pick(ACROSTIC[letter]).slice(1)}`)
      .join("<br />");
  }

  /**
   * Returns HTML for the line printed on the calculator screen.
   * @param {string} shown - the formatted result, e.g. "42"
   * @param {number} value - the numeric result
   */
  return function julieMessage(shown, value) {
    if (!isFinite(value)) {
      return "Dividing by zero breaks the universe — but not Julie. She's fine. 🌈";
    }
    if (Number.isNaN(value)) {
      return "That one broke my brain. Julie would have solved it instantly. 🧠";
    }
    if (value < 0) {
      return `${shown}. Negative numbers, positive Julie. 💛`;
    }
    if (value === 0) {
      return "Zero! The only thing Julie has none of is bad days. ☀️";
    }

    const roll = Math.random();
    if (roll < 0.26) return freshPick(PUNS).replaceAll("{n}", shown);
    if (roll < 0.52) return freshPick(JOKES).replaceAll("{n}", shown);
    if (roll < 0.66) return freshPick(CHEERS).replaceAll("{n}", shown);
    if (roll < 0.78) return freshPick(FACTS).replaceAll("{n}", shown);
    if (roll < 0.88) return freshPick(RHYMES).replaceAll("{n}", shown);
    return buildAcrostic();
  };
})();
