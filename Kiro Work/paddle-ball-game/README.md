# Paddle Ball Game

A simple, spec-driven paddle-ball game. One player (right paddle, arrow keys) vs. a
computer-controlled opponent (left paddle). Built following the AWS
[Spec-Driven Development](https://catalog.workshops.aws/lightning-labs/en-US/generative-ai/spec-driven-development)
workshop.

## Play

Open `index.html` in any modern browser. Use **↑ / ↓** arrow keys to move the right paddle.

> Note: `index.html` loads `game.js` as an ES module, so some browsers require it to be
> served over HTTP rather than opened via `file://`. From this folder:
>
> ```bash
> npx serve .      # or: python3 -m http.server
> ```
>
> then open the printed URL.

## Project layout

```
paddle-ball-game/
├── index.html       # Playable game: rendering, input, game loop
├── game.js          # Core logic (state, update, collisions) — testable module
├── game.test.js     # Property-based tests (fast-check, 100 runs each)
├── package.json
└── .kiro/specs/paddle-ball-game/
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

## Testing

```bash
npm install
npm test
```

Covers the three correctness properties from `design.md`:

1. Ball reverses horizontal direction when it hits a paddle (Req 2.1)
2. Ball reverses vertical direction when it hits a wall (Req 2.2)
3. Ball resets to center when it leaves the left/right edge (Req 2.3)

## Customization

Appearance and difficulty live in `CONFIG` at the top of `game.js`:

| Setting | Value |
|---|---|
| Ball color | `#9B6DFF` (purple) |
| Paddle color | `#0D0D0D` (black) |
| Background | `#1E1E24` (dark grey) |
| AI difficulty | 0.7 (medium) |
| Ball speed | 4 |
| Paddle speed | 5 |
| Paddle size | 10 × 80 |
| Scoreboard | Simple, top-center |
