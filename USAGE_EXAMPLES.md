# BVHEcctrl Usage Examples

Comprehensive examples showing how to use advanced features of BVHEcctrl.

## Table of Contents

- [Configuration Presets](#configuration-presets)
- [Performance Monitoring](#performance-monitoring)
- [Physics Utilities](#physics-utilities)
- [Custom Configurations](#custom-configurations)
- [Advanced Patterns](#advanced-patterns)

---

## Configuration Presets

BVHEcctrl includes predefined configurations for common game types.

### Basic Usage

```tsx
import BVHEcctrl, { PRESETS } from 'bvhecctrl';

function FPSGame() {
  return (
    <BVHEcctrl {...PRESETS.FPS_SHOOTER}>
      <YourCharacterModel />
    </BVHEcctrl>
  );
}
```

### Available Presets

```tsx
// First-Person Shooter - Fast, responsive controls
<BVHEcctrl {...PRESETS.FPS_SHOOTER}>

// Action/Adventure - Balanced movement
<BVHEcctrl {...PRESETS.ACTION_ADVENTURE}>

// Platformer - High jumps, precise control
<BVHEcctrl {...PRESETS.PLATFORMER}>

// RPG - Slower, deliberate movement
<BVHEcctrl {...PRESETS.RPG}>

// Survival Horror - Slow, tense atmosphere
<BVHEcctrl {...PRESETS.SURVIVAL_HORROR}>

// Racing - Very fast movement
<BVHEcctrl {...PRESETS.RACING}>

// Stealth - Precise, slow movement
<BVHEcctrl {...PRESETS.STEALTH}>
```

### Customizing Presets

```tsx
import { mergePreset, PRESETS } from 'bvhecctrl';

// Start with FPS preset but customize gravity
const customConfig = mergePreset(PRESETS.FPS_SHOOTER, {
  gravity: 15,
  jumpVel: 6,
  maxRunSpeed: 10
});

function Game() {
  return (
    <BVHEcctrl {...customConfig}>
      <Character />
    </BVHEcctrl>
  );
}
```

---

## Performance Monitoring

Track FPS and detect performance issues in real-time.

### Basic Performance Monitoring

```tsx
import { usePerformanceMonitor } from 'bvhecctrl';

function Game() {
  const stats = usePerformanceMonitor({
    warnOnSlowFrames: true,
    warningThreshold: 20, // Warn if frame takes >20ms
    onWarning: (stats) => {
      console.warn('Performance issue detected:', stats);
    }
  });

  return (
    <>
      <BVHEcctrl>
        <Character />
      </BVHEcctrl>

      {/* Display stats overlay */}
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white' }}>
        <div>FPS: {stats.fps.toFixed(1)}</div>
        <div>Frame Time: {stats.frameTime.toFixed(2)}ms</div>
        <div>Max: {stats.maxFrameTime.toFixed(2)}ms</div>
      </div>
    </>
  );
}
```

### Advanced Performance Tracking

```tsx
import { usePerformanceMonitor, getMemoryStats, formatBytes } from 'bvhecctrl';
import { useEffect, useState } from 'react';

function PerformanceOverlay() {
  const stats = usePerformanceMonitor({ sampleSize: 120 }); // 2-second average
  const [memory, setMemory] = useState(getMemoryStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setMemory(getMemoryStats());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', padding: 10 }}>
      <h3>Performance</h3>
      <div>FPS: {stats.fps.toFixed(1)}</div>
      <div>Frame: {stats.frameTime.toFixed(2)}ms</div>
      <div>Min/Max: {stats.minFrameTime.toFixed(1)}/{stats.maxFrameTime.toFixed(1)}ms</div>
      {memory && (
        <>
          <h4>Memory</h4>
          <div>Used: {formatBytes(memory.usedJSHeapSize)}</div>
          <div>Limit: {formatBytes(memory.jsHeapSizeLimit)}</div>
        </>
      )}
    </div>
  );
}
```

---

## Physics Utilities

Testable physics functions for custom character controllers.

### Calculate Jump Parameters

```tsx
import { calculateJumpVelocity, calculateMaxJumpHeight } from 'bvhecctrl';

// Calculate velocity needed to jump 3 meters
const jumpVel = calculateJumpVelocity(3, 9.81);
console.log('Jump velocity:', jumpVel); // ~7.67 m/s

// Or go the other way - how high will we jump?
const maxHeight = calculateMaxJumpHeight(8, 9.81);
console.log('Max height:', maxHeight); // ~3.26 meters
```

### Custom Movement with Physics

```tsx
import {
  calculateAcceleration,
  calculateDampingForce,
  lerp,
  smoothStep
} from 'bvhecctrl';

function CustomCharacterController() {
  const [velocity, setVelocity] = useState(0);
  const [position, setPosition] = useState(0);

  useFrame((_, delta) => {
    // Calculate acceleration from input
    const input = keys.forward ? 1 : 0;
    const accel = calculateAcceleration(input, 30, velocity, 10);

    // Apply damping when no input
    const damping = input === 0 ? calculateDampingForce(velocity, 0.5) : 0;

    // Update velocity
    const newVel = velocity + (accel + damping) * delta;
    setVelocity(newVel);

    // Smooth camera follow
    const targetPos = position + newVel * delta;
    const smoothPos = lerp(position, targetPos, smoothStep(0, 1, delta * 5));
    setPosition(smoothPos);
  });

  return <mesh position={[position, 0, 0]}>...</mesh>;
}
```

### Slope Detection

```tsx
import { isWalkableSlope, radToDeg, degToRad } from 'bvhecctrl';

// Check if a 30-degree slope is walkable (max slope: 45°)
const slopeAngle = degToRad(30);
const maxSlope = degToRad(45);

if (isWalkableSlope(slopeAngle, maxSlope)) {
  console.log('Can walk on this slope');
} else {
  console.log('Too steep!');
}
```

---

## Custom Configurations

### Building Your Own Preset

```tsx
import type { EcctrlProps } from 'bvhecctrl';

// Define your own game-specific preset
export const SPACE_GAME: Partial<EcctrlProps> = {
  gravity: 3, // Low gravity for space
  maxWalkSpeed: 6,
  maxRunSpeed: 10,
  jumpVel: 12, // High jumps in low gravity
  turnSpeed: 30,
  mode: "CameraBasedMovement",
};

// Use it
<BVHEcctrl {...SPACE_GAME}>
  <Astronaut />
</BVHEcctrl>
```

### Dynamic Configuration

```tsx
function AdaptiveController() {
  const [config, setConfig] = useState(PRESETS.ACTION_ADVENTURE);

  // Switch to different presets based on game state
  const enterCombat = () => setConfig(PRESETS.FPS_SHOOTER);
  const enterStealth = () => setConfig(PRESETS.STEALTH);
  const enterExploration = () => setConfig(PRESETS.ACTION_ADVENTURE);

  return (
    <BVHEcctrl {...config}>
      <Character />
    </BVHEcctrl>
  );
}
```

---

## Advanced Patterns

### Multiplayer with Performance Monitoring

```tsx
function MultiplayerGame() {
  const stats = usePerformanceMonitor({
    warnOnSlowFrames: true,
    onWarning: (stats) => {
      // Reduce quality when performance drops
      if (stats.fps < 30) {
        setGraphicsQuality('low');
      }
    }
  });

  return (
    <>
      <BVHEcctrl {...PRESETS.FPS_SHOOTER}>
        <LocalPlayer />
      </BVHEcctrl>

      {remotePlayers.map(player => (
        <RemotePlayer key={player.id} data={player} />
      ))}

      <PerformanceOverlay stats={stats} />
    </>
  );
}
```

### Adaptive Difficulty

```tsx
import { calculateJumpVelocity } from 'bvhecctrl';

function AdaptiveGame() {
  const [difficulty, setDifficulty] = useState('normal');

  const config = useMemo(() => {
    const base = PRESETS.PLATFORMER;

    switch (difficulty) {
      case 'easy':
        return mergePreset(base, {
          jumpVel: calculateJumpVelocity(3, base.gravity), // Higher jumps
          maxRunSpeed: 7, // Faster movement
        });
      case 'hard':
        return mergePreset(base, {
          jumpVel: calculateJumpVelocity(1.5, base.gravity), // Lower jumps
          maxRunSpeed: 4, // Slower movement
        });
      default:
        return base;
    }
  }, [difficulty]);

  return (
    <BVHEcctrl {...config}>
      <Player />
    </BVHEcctrl>
  );
}
```

### Physics-Based Puzzles

```tsx
import { calculateMaxJumpHeight, isWalkableSlope } from 'bvhecctrl';

function PuzzleValidator() {
  const jumpVel = 8;
  const gravity = 9.81;
  const maxHeight = calculateMaxJumpHeight(jumpVel, gravity);

  // Can the player reach that platform?
  const platformHeight = 3;
  const canReach = platformHeight <= maxHeight;

  // Can they walk up that ramp?
  const rampAngle = Math.PI / 3; // 60 degrees
  const maxSlope = Math.PI / 4; // 45 degrees
  const canClimb = isWalkableSlope(rampAngle, maxSlope);

  return (
    <>
      {!canReach && <HelpText>Platform too high!</HelpText>}
      {!canClimb && <HelpText>Ramp too steep!</HelpText>}
    </>
  );
}
```

---

## Testing Your Configuration

```tsx
import { calculateJumpVelocity, calculateMaxJumpHeight } from 'bvhecctrl';
import { describe, it, expect } from 'vitest';

describe('Custom Game Physics', () => {
  it('should jump exactly 2.5 meters', () => {
    const config = CUSTOM_PRESET;
    const actualHeight = calculateMaxJumpHeight(config.jumpVel, config.gravity);
    expect(actualHeight).toBeCloseTo(2.5, 1);
  });

  it('should reach max speed in 1 second', () => {
    const config = CUSTOM_PRESET;
    const timeToMaxSpeed = config.maxRunSpeed / config.acceleration;
    expect(timeToMaxSpeed).toBeLessThan(1);
  });
});
```

---

## Best Practices

1. **Start with a preset** - Don't configure from scratch
2. **Use physics utilities** - Calculate jump heights instead of guessing
3. **Monitor performance** - Especially important for web games
4. **Test your configuration** - Use the physics utilities to validate
5. **Extract constants** - Make presets reusable across your game

---

## Quick Reference

```tsx
// Presets
import { PRESETS, mergePreset } from 'bvhecctrl';
<BVHEcctrl {...PRESETS.FPS_SHOOTER} />
<BVHEcctrl {...mergePreset(PRESETS.RPG, { maxRunSpeed: 6 })} />

// Performance
import { usePerformanceMonitor } from 'bvhecctrl';
const stats = usePerformanceMonitor({ warnOnSlowFrames: true });

// Physics
import { calculateJumpVelocity, isWalkableSlope } from 'bvhecctrl';
const jumpVel = calculateJumpVelocity(2, 9.81);
const walkable = isWalkableSlope(angle, maxSlope);
```

---

For more examples, check the [official documentation](https://github.com/pmndrs/BVHEcctrl).
