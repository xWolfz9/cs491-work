// Property-based tests for the paddle-ball game core logic.
// Uses Node's built-in test runner + fast-check (design.md testing strategy).
// 100 iterations per property.
//
// Tag format: 'Feature: paddle-ball-game, Property {number}: {property_text}'

import test from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { CONFIG, createState, update, resetBall, clampPaddle } from './game.js';

const RUNS = 100;

// Feature: paddle-ball-game, Property 1: For any ball hitting a paddle, the ball should reverse horizontal direction
test('Property 1: ball bounces off paddles', () => {
  fc.assert(
    fc.property(
      // y position aligned with the paddle so a hit is guaranteed
      fc.integer({ min: 0, max: CONFIG.paddleHeight }),
      fc.constantFrom('left', 'right'),
      (offset, side) => {
        const state = createState(CONFIG, () => 0.25); // deterministic
        const b = state.ball;

        if (side === 'left') {
          // Place ball just right of the left paddle, moving left into it.
          state.leftY = 100;
          b.y = state.leftY + offset;
          b.x = CONFIG.paddleMargin + CONFIG.paddleWidth + CONFIG.ballRadius - 1;
          b.dx = -CONFIG.ballSpeed;
          b.dy = 0;
        } else {
          const rightX = CONFIG.width - CONFIG.paddleMargin - CONFIG.paddleWidth;
          state.rightY = 100;
          b.y = state.rightY + offset;
          b.x = rightX - CONFIG.ballRadius + 1;
          b.dx = CONFIG.ballSpeed;
          b.dy = 0;
        }

        const before = Math.sign(b.dx);
        update(state, CONFIG, () => 0.25);
        return Math.sign(state.ball.dx) === -before;
      }
    ),
    { numRuns: RUNS }
  );
});

// Feature: paddle-ball-game, Property 2: For any ball hitting top or bottom wall, the ball should reverse vertical direction
test('Property 2: ball bounces off walls', () => {
  fc.assert(
    fc.property(fc.constantFrom('top', 'bottom'), (wall) => {
      const state = createState(CONFIG, () => 0.25);
      const b = state.ball;
      // Keep it horizontally safe (away from paddles/edges).
      b.x = CONFIG.width / 2;
      b.dx = CONFIG.ballSpeed;

      if (wall === 'top') {
        b.y = CONFIG.ballRadius + 1;
        b.dy = -CONFIG.ballSpeed;
      } else {
        b.y = CONFIG.height - CONFIG.ballRadius - 1;
        b.dy = CONFIG.ballSpeed;
      }

      const before = Math.sign(b.dy);
      update(state, CONFIG, () => 0.25);
      return Math.sign(state.ball.dy) === -before;
    }),
    { numRuns: RUNS }
  );
});

// Feature: paddle-ball-game, Property 3: For any ball going off left or right edge, the ball should return to center
test('Property 3: ball resets when off screen', () => {
  fc.assert(
    fc.property(fc.constantFrom('left', 'right'), (edge) => {
      const state = createState(CONFIG, () => 0.5);
      const b = state.ball;
      b.y = CONFIG.height / 2;

      if (edge === 'left') {
        b.x = -CONFIG.ballRadius - 1; // already off the left edge
        b.dx = -CONFIG.ballSpeed;
      } else {
        b.x = CONFIG.width + CONFIG.ballRadius + 1; // off the right edge
        b.dx = CONFIG.ballSpeed;
      }

      update(state, CONFIG, () => 0.5);
      // Ball must be back at center.
      return state.ball.x === CONFIG.width / 2 && state.ball.y === CONFIG.height / 2;
    }),
    { numRuns: RUNS }
  );
});

// Extra invariant: paddles always stay on screen.
test('Invariant: paddles stay within canvas bounds', () => {
  fc.assert(
    fc.property(fc.integer({ min: -500, max: 500 }), (y) => {
      const clamped = clampPaddle(y, CONFIG);
      return clamped >= 0 && clamped <= CONFIG.height - CONFIG.paddleHeight;
    }),
    { numRuns: RUNS }
  );
});
