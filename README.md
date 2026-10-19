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

| File         | What it does                     |
| ------------ | -------------------------------- |
| `index.html` | The page structure               |
| `style.css`  | All the bright and fun styling   |
| `script.js`  | Calculator logic and keypad glue |

## Git notes (for practice)

```bash
git status                 # what changed?
git add <file>             # stage a change
git commit -m "message"    # save a snapshot
git log --oneline          # see the history
git push -u origin main    # send it to GitHub
```
