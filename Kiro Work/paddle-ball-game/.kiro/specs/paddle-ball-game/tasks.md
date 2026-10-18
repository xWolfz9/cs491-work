# Implementation Plan

## 🎮 Customization Section
*Preferences for this project:*

### Game Appearance
- **Ball Color**: Purple (`#9B6DFF`)
- **Paddle Color**: Black (`#0D0D0D`)
- **Background Color**: Dark grey (`#1E1E24`) — enough contrast to clearly show paddles and ball (Kiro-style palette)

### Game Difficulty
- **AI Difficulty**: medium (0.7)
- **Ball Speed**: normal (4)
- **Paddle Speed**: normal (5)

### Paddle Customization
- **Paddle Width**: normal (10)
- **Paddle Height**: normal (80)

### Scoreboard Design

- [x] **Simple Score Display**
  - Style: "Player: 0 | Computer: 0"
  - Position: top-center

### Extra Features (Optional)
*None selected — using defaults.*

---

- [x] 1. Create basic HTML structure with canvas
  - Create single HTML file with canvas element
  - Set canvas size to 600x300 pixels
  - Add basic styling for dark grey background
  - _Requirements: 3.3_

- [x] 2. Set up game variables and initialization
  - Define ball position (x, y) and speed (dx, dy) variables
  - Define paddle positions (leftY, rightY) variables
  - Initialize ball at center with random direction
  - _Requirements: 2.3_

- [x] 3. Implement basic drawing functions
  - Create draw() function to clear canvas
  - Draw ball as purple circle
  - Draw paddles as black rectangles
  - _Requirements: 3.1, 3.2_

- [x] 4. Add ball movement and collision detection
  - Move ball by adding dx/dy to x/y position
  - Detect collision with top/bottom walls and reverse dy
  - Detect collision with paddles and reverse dx
  - Reset ball to center when it goes off left/right edges
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. Add player input handling
  - Listen for keydown/keyup events for arrow keys
  - Move right paddle up/down based on arrow key presses
  - Keep paddle within canvas bounds
  - **Important**: Prevent default browser behavior (use `event.preventDefault()`) so arrow keys don't scroll the page
  - _Requirements: 1.1, 1.2_

- [x] 6. Implement simple AI for left paddle
  - Make left paddle follow ball's Y position
  - Add slight delay/smoothing (difficulty 0.7) to make it beatable
  - _Requirements: 1.3_

- [x] 7. Create game loop
  - Use setInterval to call update and draw functions repeatedly
  - Set to run at 60 FPS (16ms intervals)
  - _Requirements: 3.4_

- [x] 8. Apply your customizations
  - Ball: purple (`#9B6DFF`); Paddle: black (`#0D0D0D`); Background: dark grey (`#1E1E24`)
  - AI difficulty 0.7, ball speed 4, paddle speed 5
  - Paddle width 10, height 80
  - Simple scoreboard "Player: 0 | Computer: 0", top-center

- [x] 9. Final testing and polish
  - Test game runs smoothly in browser
  - Verify all requirements are met
  - Test your customizations work properly
