# Runner Game

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Side-scrolling infinite runner game
- Welcome/start screen showing "মোহাম্মদ আব্দুল্লাহ ইসলাম"
- Player character that can jump over obstacles
- Obstacles spawning from the right side
- Score counter that increases over time
- Game over screen with restart option
- Keyboard (Space/ArrowUp) and touch controls for jumping
- Increasing difficulty over time (faster obstacles, higher spawn rate)
- Polished visuals: scrolling ground, sky background, styled character and obstacles

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Build the full game in a React component using Canvas API
2. Game states: welcome, playing, game-over
3. Welcome screen with player name and Start button
4. Game loop using requestAnimationFrame
5. Player physics: gravity, jump velocity
6. Obstacle spawning with increasing difficulty
7. Collision detection
8. Score display during play
9. Game over screen with final score and restart
10. Touch + keyboard input support
