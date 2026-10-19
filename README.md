# Julie's Calculator 💖

A bright, silly little calculator that lives in the browser. It does the four
basic operations — and every time you hit `=` it also says something nice about
Julie.

## Run it

No build step, no dependencies. Just open the file:

```bash
open index.html        # macOS
xdg-open index.html    # Linux
```

Or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

| File          | What it does                              |
| ------------- | ----------------------------------------- |
| `index.html`  | The page structure                        |
| `style.css`   | All the bright and fun styling            |
| `script.js`   | Calculator logic and keypad glue          |
| `messages.js` | Puns, jokes and J-U-L-I-E acrostics       |
| `effects.js`  | The 30 levels of celebration              |

## Celebration levels

The level is the **number of digits in the result**. Every level from 1 up to
yours fires in sequence, 90ms apart, so a big answer visibly builds instead of
dumping everything at once. Julie's pun, joke or acrostic is always shown big
on screen in a banner over the party.

| Lvl | Digits | What happens |
| --- | ------ | ------------ |
| 1 | 1 | Twinkle — a few sparkles on the result |
| 2 | 2 | Sparkle Shower |
| 3 | 3 | Confetti Sprinkles |
| 4 | 4 | Bouncy Digits — the result boings |
| 5 | 5 | Heart Float 💖 |
| 6 | 6 | Balloon Brigade 🎈 |
| 7 | 7 | Streamer Storm |
| 8 | 8 | First Firework 🎆 |
| 9 | 9 | Firework Volley |
| 10 | 10 | Giant Julie Banner + screen flash |
| 11 | 11 | Star Burst shockwave |
| 12 | 12 | Confetti Cannons from both corners |
| 13 | 13 | Rainbow Sky — the whole page hue-shifts |
| 14 | 14 | Dancing JULIE Letters |
| 15 | 15 | Earthquake |
| 16 | 16 | Pinwheel of Joy spinning behind everything |
| 17 | 17 | Emoji Rain |
| 18 | 18 | Calculator Backflip |
| 19 | 19 | Disco Spotlights |
| 20 | 20 | Comet Parade |
| 21 | 21 | Marching Band 🥁🎺 |
| 22 | 22 | Jelly World — the page goes wobbly |
| 23 | 23 | Glitter Tornado |
| 24 | 24 | Scrolling Marquee: JULIE IS THE BEST |
| 25 | 25 | Strobe Fever |
| 26 | 26 | Unicorn Flyby 🦄 with a sparkle trail |
| 27 | 27 | Number Clones flying out of the display |
| 28 | 28 | Supernova Shockwave |
| 29 | 29 | Full Julie Takeover — the screen is hers |
| 30 | 30 | **JULIE SINGULARITY** — everything, at once, spinning |

### Climbing the ladder

Chained multiplication gets you there fast — the result of one `×` feeds
straight into the next:

```
9999999999 × 9999999999 × 9999999999 =   → 30 digits, full meltdown
```

Dividing by zero gives ∞, which also counts as level 30.

### Previewing a level

Add `?level=N` to the URL to force a level without doing the maths:

```
index.html?level=26
https://mattoduffo.github.io/JulieCalculator/?level=30
```

Anyone who has set "reduce motion" in their system settings gets Julie's
message and skips the fireworks.

## Git notes (for practice)

```bash
git status                 # what changed?
git add <file>             # stage a change
git commit -m "message"    # save a snapshot
git log --oneline          # see the history
git push -u origin main    # send it to GitHub
```
