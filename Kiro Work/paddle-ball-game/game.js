// Core game logic for the paddle-ball game.
// Extracted into a module so it can be unit/property-tested with fast-check,
// while index.html keeps the game playable in the browser.
//
// Spec: .kiro/specs/paddle-ball-game/{requirements,design,tasks}.md

// ----- Configuration (from the customization section of tasks.md) -----
export const CONFIG = {
  // Canvas
  width: 600,
  height: 300,

  // Appearance
  ballColor: '#9B6DFF',       // purple
  paddleColor: '#0D0D0D',     // black
  backgroundColor: '#1E1E24', // dark grey (Kiro-style, enough contrast)
  textColor: '#E7E3F4',

  // Ball
  ballRadius: 7,
  ballSpeed: 4,               // normal

  // Paddles
  paddleWidth: 10,            // normal
  paddleHeight: 80,           // normal
  paddleSpeed: 5,             // normal
  paddleMargin: 20,           // distance of paddle from the edge

  // AI
  aiDifficulty: 0.7,          // medium (0..1 smoothing factor)
};

// ----- State factory -----
export function createState(cfg = CONFIG, rng = Math.random) {
  const state = {
    ball: { x: cfg.width / 2, y: cfg.height / 2, dx: 0, dy: 0 },
    leftY: cfg.height / 2 - cfg.paddleHeight / 2,   // computer
    rightY: cfg.height / 2 - cfg.paddleHeight / 2,  // player
    score: { player: 0, computer: 0 },
    input: { up: false, down: false },
  };
  resetBall(state, cfg, rng);
  return state;
}

// Reset the ball to the center with a random direction (Requirement 2.3).
export function resetBall(state, cfg = CONFIG, rng = Math.random) {
  state.ball.x = cfg.width / 2;
  state.ball.y = cfg.height / 2;
  const dirX = rng() < 0.5 ? -1 : 1;
  // Angle between -30 and +30 degrees so it's never too vertical.
  const angle = (rng() - 0.5) * (Math.PI / 3);
  state.ball.dx = dirX * cfg.ballSpeed * Math.cos(angle);
  state.ball.dy = cfg.ballSpeed * Math.sin(angle);
  return state;
}

// Clamp a paddle's Y so it stays on screen (error handling: keep paddles on screen).
export function clampPaddle(y, cfg = CONFIG) {
  return Math.max(0, Math.min(cfg.height - cfg.paddleHeight, y));
}

// Does the ball overlap a paddle? paddleX is the left edge of the paddle.
function hitsPaddle(ball, paddleX, paddleY, cfg) {
  return (
    ball.x - cfg.ballRadius <= paddleX + cfg.paddleWidth &&
    ball.x + cfg.ballRadius >= paddleX &&
    ball.y >= paddleY &&
    ball.y <= paddleY + cfg.paddleHeight
  );
}

// Advance the game one tick. Returns the (mutated) state.
export function update(state, cfg = CONFIG, rng = Math.random) {
  const b = state.ball;

  // --- Player paddle (right) from input (Requirements 1.1, 1.2) ---
  if (state.input.up) state.rightY -= cfg.paddleSpeed;
  if (state.input.down) state.rightY += cfg.paddleSpeed;
  state.rightY = clampPaddle(state.rightY, cfg);

  // --- AI paddle (left) follows the ball with smoothing (Requirement 1.3) ---
  // Move a fraction of the way toward the ball each tick (fraction = difficulty),
  // capped by paddleSpeed so it stays beatable.
  const diff = b.y - (state.leftY + cfg.paddleHeight / 2);
  const step = Math.max(-cfg.paddleSpeed, Math.min(cfg.paddleSpeed, diff * cfg.aiDifficulty));
  state.leftY += step;
  state.leftY = clampPaddle(state.leftY, cfg);

  // --- Move the ball ---
  b.x += b.dx;
  b.y += b.dy;

  // --- Wall collisions: reverse vertical direction (Requirement 2.2) ---
  if (b.y - cfg.ballRadius <= 0) {
    b.y = cfg.ballRadius;
    b.dy = Math.abs(b.dy);
  } else if (b.y + cfg.ballRadius >= cfg.height) {
    b.y = cfg.height - cfg.ballRadius;
    b.dy = -Math.abs(b.dy);
  }

  // --- Paddle collisions: reverse horizontal direction (Requirement 2.1) ---
  const leftPaddleX = cfg.paddleMargin;
  const rightPaddleX = cfg.width - cfg.paddleMargin - cfg.paddleWidth;

  if (b.dx < 0 && hitsPaddle(b, leftPaddleX, state.leftY, cfg)) {
    b.x = leftPaddleX + cfg.paddleWidth + cfg.ballRadius;
    b.dx = Math.abs(b.dx);
  } else if (b.dx > 0 && hitsPaddle(b, rightPaddleX, state.rightY, cfg)) {
    b.x = rightPaddleX - cfg.ballRadius;
    b.dx = -Math.abs(b.dx);
  }

  // --- Off left/right edge: reset to center (Requirement 2.3) ---
  if (b.x + cfg.ballRadius < 0) {
    // Ball passed the computer's side -> player scores.
    state.score.player += 1;
    resetBall(state, cfg, rng);
  } else if (b.x - cfg.ballRadius > cfg.width) {
    // Ball passed the player's side -> computer scores.
    state.score.computer += 1;
    resetBall(state, cfg, rng);
  }

  return state;
}
