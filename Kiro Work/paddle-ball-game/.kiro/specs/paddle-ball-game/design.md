# Design Document

## Overview

A simple paddle ball game implemented in a single HTML file with JavaScript. The game features two paddles, a bouncing ball, and intuitive controls for an engaging gaming experience.

## Architecture

- Single HTML file with embedded JavaScript
- HTML5 Canvas for drawing
- Simple game loop using setInterval
- Basic collision detection

## Components and Interfaces

### Game Elements
- Canvas: 600x300 pixels
- Ball: Circle that moves and bounces
- Left paddle: Computer controlled
- Right paddle: Player controlled with arrow keys

### Core Functions
- `draw()`: Draws everything on canvas
- `update()`: Moves ball and paddles
- `gameLoop()`: Calls update and draw repeatedly

## Data Models

Simple variables:
- Ball: x, y position and dx, dy speed
- Paddles: leftY, rightY positions
- Canvas: 600x300 pixels

## Visual / Customization Settings

These values are chosen for this project and should be used in the implementation:

| Setting | Value |
|---|---|
| Ball color | Purple (`#9B6DFF`) |
| Paddle color | Black (`#0D0D0D`) |
| Background color | Dark grey (`#1E1E24`) |
| AI difficulty | medium (0.7) |
| Ball speed | normal (4) |
| Paddle speed | normal (5) |
| Paddle width | 10 |
| Paddle height | 80 |
| Scoreboard | Simple — "Player: 0 \| Computer: 0", top-center |

The dark grey background (`#1E1E24`) provides enough contrast to clearly show the black paddles and purple ball, consistent with a Kiro-style palette.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Ball bounces off paddles
*For any* ball hitting a paddle, the ball should reverse horizontal direction
**Validates: Requirements 2.1**

Property 2: Ball bounces off walls  
*For any* ball hitting top or bottom wall, the ball should reverse vertical direction
**Validates: Requirements 2.2**

Property 3: Ball resets when off screen
*For any* ball going off left or right edge, the ball should return to center
**Validates: Requirements 2.3**

## Error Handling

Keep it simple:
- Check canvas exists
- Keep paddles on screen

## Testing Strategy

### Unit Testing
- Test ball bouncing
- Test paddle movement

### Property-Based Testing
- Use fast-check for JavaScript
- Test with random positions
- Run 100 iterations per test
- Tag format: '**Feature: paddle-ball-game, Property {number}: {property_text}**'

> Note: Property-based testing with fast-check implies the core game logic (movement, collision, reset) should be extractable into a testable JavaScript module, while the game remains playable from the single HTML file. This can be resolved during the implementation phase.
