# Emoji Slot Machine Game
Slot machine game using emojis, https://unicode.fun/

**Play this fork:** https://babakoban.github.io/emoji-slots/

## Discord
https://discord.com/invite/wyCDHsuk


# Changelog (fork of balidani/emoji)

### New Items

| Item | Description |
|------|-------------|
| Fly 🪰 | Pays 💵-10 for each point of 📦. Cannot be targeted by 📌 or 🧿. Rarity -5% |

### Changes to Existing Items

| Item | Change |
|------|--------|
| Moon 🌝 | Every 31 turns pays 💵300, then doubles (x2, x4, … shown on the tile) |
| Wildcard 🃏 | Pays the same as the highest-paying neighboring item. Rarity -15% |

### Other Changes
- Top bar 📦 shows empty board spaces this spin (negative if over cap)

---

# Branches

- **`master`** — this hosted fork: changelog, GitHub link, GitHub Pages paths
- **`pr/upstream`** — same gameplay, with fork-only branding/paths stripped for PRs to [balidani/emoji](https://github.com/balidani/emoji)

New game changes go on `pr/upstream`, then cherry-pick onto `master`. Changelog and README stay on `master` only.

---

# Development

## Linter
Finds unused vars and code syntax issues:

`npm run lint`

## Formatter
Enforces code style rules like semicolons, line spacing, etc:

`npm run format`

## Setup

> **Note**
> Some browsers will cache the JS files. Disable caching in the network tab of your developer tools to make life easier.

### WSL (Windows Subsystem for Linux)
- Install [Node.js](https://nodejs.org/en)
- `npm install -g http-server`
- Navigate to repository in WSL console
- `http-server`
- Open browser and navigate to http://127.0.0.1:8080/

### VS Code
- Install Live Server extension, https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer
- CMD + L, CMD + O to open browser to http://127.0.0.1:5500/

<!-- GitHub integration test line -->
