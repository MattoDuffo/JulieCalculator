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
| `effects.js`  | Sparkles, confetti, balloons, fireworks   |

## Celebration levels

The bigger the answer, the bigger the party:

| Result        | What happens                      |
| ------------- | --------------------------------- |
| anything      | ✨ sparkles                        |
| 10 and up     | 🎊 confetti sprinkles              |
| 100 and up    | 🎈 flying balloons                 |
| 1 000 and up  | 🎆 fireworks                       |
| 10 000 and up | 🌈 all of it, plus a rainbow shake |

Try `9 × 9` for a gentle one, then `999 × 999` for the full show.

## Git notes (for practice)

```bash
git status                 # what changed?
git add <file>             # stage a change
git commit -m "message"    # save a snapshot
git log --oneline          # see the history
git push -u origin main    # send it to GitHub
```
