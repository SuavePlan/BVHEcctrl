# Joint Tracking & Event System - Usage Examples

Advanced limb tracking for accurate interactions, procedural audio, and immersive character behaviors.

## Table of Contents

- [Overview](#overview)
- [Basic Setup](#basic-setup)
- [Footstep System](#footstep-system)
- [Ladder Climbing](#ladder-climbing)
- [Procedural Audio](#procedural-audio)
- [Impact Detection](#impact-detection)
- [Advanced Patterns](#advanced-patterns)

---

## Overview

The Joint Tracker monitors character bone positions in real-time to:

✅ **Detect joint extension** - Know when limbs reach full extension
✅ **Trigger contextual events** - Fire events with velocity, frame, and position data
✅ **Enable procedural audio** - Dynamic sounds based on movement intensity
✅ **Accurate interactions** - Snap to ladder rungs, climbing holds, etc.
✅ **Impact detection** - Heavy/light footsteps, collision sounds

---

## Basic Setup

### Initialize Joint Tracking

```tsx
import { useJointTracker } from 'bvhecctrl';
import { useRef } from 'react';

function Character() {
  const characterRef = useRef<THREE.Group>(null);

  const tracker = useJointTracker(characterRef.current, {
    joints: [
      { name: "LeftFoot", maxExtension: 1.0 },
      { name: "RightFoot", maxExtension: 1.0 },
      { name: "LeftHand", maxExtension: 1.2 },
      { name: "RightHand", maxExtension: 1.2 }
    ],
    detectFootsteps: true,
    simulateBreathing: true,
    characterVelocity: currentVelocity // Pass from BVHEcctrl
  });

  return (
    <group ref={characterRef}>
      <YourCharacterModel />
    </group>
  );
}
```

### Find Bone Names in Your Model

```tsx
import { findBoneNames, COMMON_BONE_NAMES } from 'bvhecctrl';

// Auto-discover bone names
const boneNames = findBoneNames(characterModel);
console.log('Available bones:', boneNames);

// Use common naming patterns
const mixamoBones = COMMON_BONE_NAMES.mixamo; // LeftFoot, RightFoot, etc.
const rigifyBones = COMMON_BONE_NAMES.rigify; // foot.L, foot.R, etc.
```

---

## Footstep System

### Basic Footstep Sounds

```tsx
import { useJointTracker } from 'bvhecctrl';
import { Howl } from 'howler'; // Example audio library

function CharacterWithFootsteps() {
  const footstepSound = new Howl({
    src: ['/sounds/footstep.mp3'],
    volume: 0.5
  });

  const tracker = useJointTracker(characterRef.current, {
    joints: [
      { name: "LeftFoot" },
      { name: "RightFoot" }
    ],
    detectFootsteps: true
  });

  // Listen for footsteps
  tracker.onFootstep((event) => {
    // Volume based on impact force
    footstepSound.volume(event.impactForce);
    footstepSound.play();

    console.log(`${event.foot} foot impact: ${event.impactForce.toFixed(2)}`);
  });

  return <YourCharacter />;
}
```

### Material-Based Footsteps

```tsx
function AdvancedFootsteps() {
  const sounds = {
    grass: new Howl({ src: ['/sounds/footstep-grass.mp3'] }),
    concrete: new Howl({ src: ['/sounds/footstep-concrete.mp3'] }),
    metal: new Howl({ src: ['/sounds/footstep-metal.mp3'] }),
    wood: new Howl({ src: ['/sounds/footstep-wood.mp3'] })
  };

  const tracker = useJointTracker(characterRef.current, {
    joints: [{ name: "LeftFoot" }, { name: "RightFoot" }],
    detectFootsteps: true
  });

  tracker.onFootstep((event) => {
    // Raycast down from foot to detect ground material
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, -1, 0);
    raycaster.set(event.joint.position, direction);

    const intersects = raycaster.intersectObjects(groundObjects);
    if (intersects.length > 0) {
      const material = intersects[0].object.userData.material || 'concrete';

      // Play appropriate sound
      const sound = sounds[material] || sounds.concrete;
      sound.volume(event.impactForce * 0.8);
      sound.play();

      // Visual feedback
      spawnDustParticles(event.joint.position, material);
    }
  });
}
```

### Footstep Interval Timing

```tsx
function TimedFootsteps() {
  let lastFootstepTime = 0;
  const minInterval = 0.3; // Minimum 300ms between footsteps

  tracker.onFootstep((event) => {
    const currentTime = event.time;

    if (currentTime - lastFootstepTime > minInterval) {
      playFootstepSound(event);
      lastFootstepTime = currentTime;
    }
  });
}
```

---

## Ladder Climbing

### Snap Hands to Ladder Rungs

```tsx
function LadderClimbing() {
  const [isClimbing, setIsClimbing] = useState(false);
  const ladderRungs = useRef<THREE.Vector3[]>([]);

  const tracker = useJointTracker(characterRef.current, {
    joints: [
      { name: "LeftHand", maxExtension: 1.2 },
      { name: "RightHand", maxExtension: 1.2 }
    ]
  });

  // Track left hand reaching for rungs
  tracker.onJointExtension("LeftHand", (event) => {
    if (!isClimbing || !event.joint.isFullyExtended) return;

    // Find nearest rung
    const nearestRung = findNearestRung(event.joint.position, ladderRungs.current);

    if (nearestRung && nearestRung.distance < 0.3) {
      // Snap hand to rung
      snapHandToPosition(event.joint.name, nearestRung.position);

      // Play grab sound
      playSound('ladder-grab', {
        volume: event.joint.velocity / 10
      });

      // Trigger climbing animation
      setClimbingAnimation('reach-and-grab');
    }
  });

  // Same for right hand
  tracker.onJointExtension("RightHand", (event) => {
    // ... similar logic
  });
}

function findNearestRung(handPos: THREE.Vector3, rungs: THREE.Vector3[]) {
  let nearest = null;
  let minDistance = Infinity;

  for (const rung of rungs) {
    const distance = handPos.distanceTo(rung);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { position: rung, distance };
    }
  }

  return nearest;
}
```

### Foot Placement on Ladder

```tsx
function LadderFootPlacement() {
  tracker.onJointExtension("LeftFoot", (event) => {
    if (isClimbing && event.joint.velocity < 0.5) {
      // Foot is slowing down, snap to nearest rung
      const rung = findNearestRung(event.joint.position, ladderRungs.current);

      if (rung && rung.distance < 0.2) {
        snapFootToRung(rung.position);
        playSound('foot-placement');
      }
    }
  });
}
```

---

## Procedural Audio

### Breathing Based on Exertion

```tsx
function ProceduralBreathing() {
  const breathSounds = {
    idle: new Howl({ src: ['/sounds/breath-idle.mp3'] }),
    light: new Howl({ src: ['/sounds/breath-light.mp3'] }),
    heavy: new Howl({ src: ['/sounds/breath-heavy.mp3'] }),
    exhausted: new Howl({ src: ['/sounds/breath-exhausted.mp3'] })
  };

  const tracker = useJointTracker(characterRef.current, {
    joints: [{ name: "Spine" }],
    simulateBreathing: true
  });

  tracker.onBreathing((event) => {
    // Select sound based on intensity
    let sound;
    if (event.intensity < 0.3) {
      sound = breathSounds.idle;
    } else if (event.intensity < 0.6) {
      sound = breathSounds.light;
    } else if (event.intensity < 0.9) {
      sound = breathSounds.heavy;
    } else {
      sound = breathSounds.exhausted;
    }

    // Vary pitch based on exertion
    sound.rate(0.8 + event.exertion * 0.4); // 0.8x - 1.2x speed
    sound.volume(0.3 + event.intensity * 0.5);
    sound.play();

    // Visual feedback
    if (event.intensity > 0.7) {
      showBreathingParticles(characterPosition);
    }
  });
}
```

### Dynamic Grunts and Effort Sounds

```tsx
function EffortSounds() {
  const gruntSound = new Howl({ src: ['/sounds/grunt.mp3'] });

  tracker.onJointExtension("RightHand", (event) => {
    // Play grunt when reaching with high velocity
    if (event.joint.velocity > 3 && event.joint.extension > 80) {
      gruntSound.volume(event.joint.velocity / 5);
      gruntSound.play();
    }
  });
}
```

### Cloth Movement Sounds

```tsx
function ClothSounds() {
  const clothSound = new Howl({
    src: ['/sounds/cloth-rustle.mp3'],
    loop: true
  });

  let avgMovement = 0;

  tracker.onJointExtension("LeftHand", (event) => {
    avgMovement = (avgMovement + event.joint.velocity) / 2;

    // Cloth sound volume based on arm movement
    clothSound.volume(Math.min(1, avgMovement / 10));

    if (avgMovement > 0.5 && !clothSound.playing()) {
      clothSound.play();
    } else if (avgMovement < 0.1) {
      clothSound.fade(clothSound.volume(), 0, 500);
    }
  });
}
```

---

## Impact Detection

### Punch/Attack Impact

```tsx
function CombatImpacts() {
  const punchSounds = [
    new Howl({ src: ['/sounds/punch-light.mp3'] }),
    new Howl({ src: ['/sounds/punch-medium.mp3'] }),
    new Howl({ src: ['/sounds/punch-heavy.mp3'] })
  ];

  tracker.onJointExtension("RightHand", (event) => {
    // Detect if hand is moving fast (punch)
    if (event.joint.velocity > 5) {
      // Check for collision
      const hit = checkHandCollision(event.joint.position);

      if (hit) {
        // Impact force determines sound
        const force = Math.min(2, Math.floor(event.joint.velocity / 3));
        punchSounds[force].play();

        // Haptic feedback
        triggerHaptics(event.joint.velocity / 10);

        // Visual effect
        spawnImpactParticles(hit.point, event.joint.velocity);

        // Damage calculation
        dealDamage(hit.object, event.joint.velocity * 10);
      }
    }
  });
}
```

### Landing Impact

```tsx
function LandingImpact() {
  let wasInAir = false;

  tracker.onFootstep((event) => {
    // Detect landing vs normal footstep
    if (wasInAir && event.impactForce > 0.5) {
      // Heavy landing
      playSound('landing-heavy', {
        volume: event.impactForce,
        rate: 0.8 + event.impactForce * 0.4
      });

      // Camera shake
      cameraShake(event.impactForce * 0.5);

      // Dust particles
      spawnDustCloud(event.joint.position, event.impactForce);

    } else {
      // Normal footstep
      playSound('footstep-normal', { volume: event.impactForce * 0.6 });
    }
  });

  // Track if character is in air
  useFrame(() => {
    wasInAir = !isOnGround;
  });
}
```

---

## Advanced Patterns

### Stamina System

```tsx
function StaminaSystem() {
  const [stamina, setStamina] = useState(100);
  const [isExhausted, setIsExhausted] = useState(false);

  const tracker = useJointTracker(characterRef.current, {
    joints: [...],
    simulateBreathing: true
  });

  // Drain stamina based on exertion
  useFrame((_, delta) => {
    const drainRate = tracker.exertion * 5; // 0-5 per second
    const regenRate = isExhausted ? 2 : 8; // Slower regen when exhausted

    setStamina(prev => {
      const newStamina = Math.max(0, Math.min(100,
        prev - (drainRate * delta) + (regenRate * delta)
      ));

      setIsExhausted(newStamina < 20);
      return newStamina;
    });
  });

  // Heavy breathing when low stamina
  tracker.onBreathing((event) => {
    if (stamina < 30) {
      playSound('breath-exhausted', {
        volume: 1 - (stamina / 30),
        rate: 0.7 + (stamina / 100)
      });
    }
  });

  return <StaminaBar value={stamina} />;
}
```

### Climbing Detection & Auto-Grab

```tsx
function AutoClimbing() {
  const [climbPoints, setClimbPoints] = useState<THREE.Vector3[]>([]);

  const tracker = useJointTracker(characterRef.current, {
    joints: [
      { name: "LeftHand", maxExtension: 1.2 },
      { name: "RightHand", maxExtension: 1.2 }
    ]
  });

  // Detect when hands are near climbable surfaces
  tracker.onJointExtension("LeftHand", (event) => {
    if (!event.joint.isFullyExtended) return;

    // Find nearby climb points
    const nearby = climbPoints.filter(point =>
      point.distanceTo(event.joint.position) < 0.4
    );

    if (nearby.length > 0) {
      // Auto-grab nearest point
      const nearest = nearby.sort((a, b) =>
        a.distanceTo(event.joint.position) -
        b.distanceTo(event.joint.position)
      )[0];

      // Trigger grab
      attachHandToPoint("left", nearest);
      playSound('grab');

      // Enter climbing mode
      setClimbingMode(true);
    }
  });
}
```

### Context-Aware Animation Triggers

```tsx
function ContextualAnimations() {
  const tracker = useJointTracker(characterRef.current, {
    joints: [
      { name: "LeftHand" },
      { name: "RightHand" },
      { name: "Head" }
    ]
  });

  // Wave when hand is raised
  tracker.onJointExtension("RightHand", (event) => {
    if (event.joint.position.y > headHeight && event.joint.extension > 70) {
      if (event.joint.velocity < 0.5) {
        triggerAnimation('wave');
      }
    }
  });

  // Pointing gesture
  tracker.onJointExtension("RightHand", (event) => {
    const handState = tracker.getJointState("RightHand");
    const headState = tracker.getJointState("Head");

    if (handState && headState) {
      // Check if hand is extended forward from head
      const direction = new THREE.Vector3()
        .subVectors(handState.position, headState.position)
        .normalize();

      if (direction.z < -0.8 && handState.extension > 85) {
        triggerAnimation('point');
      }
    }
  });
}
```

---

## Performance Optimization

### Throttle Event Listeners

```tsx
function OptimizedTracking() {
  let lastEventTime = 0;
  const throttleMs = 50; // Max 20 events/second

  tracker.onFootstep((event) => {
    const now = performance.now();

    if (now - lastEventTime > throttleMs) {
      playFootstepSound(event);
      lastEventTime = now;
    }
  });
}
```

### Conditional Tracking

```tsx
function ConditionalTracking() {
  const [isPlayerNearby, setIsPlayerNearby] = useState(false);

  // Only track joints when player is close enough to hear
  const tracker = useJointTracker(
    isPlayerNearby ? characterRef.current : null,
    { joints: [...] }
  );

  // Enable/disable based on distance
  useFrame(() => {
    const distance = characterPos.distanceTo(playerPos);
    setIsPlayerNearby(distance < 50);
  });
}
```

---

## Testing & Debugging

```tsx
function DebugJointTracking() {
  const tracker = useJointTracker(characterRef.current, {
    joints: [{ name: "LeftHand" }, { name: "RightHand" }]
  });

  // Log all joint states
  tracker.onJointExtension("LeftHand", (event) => {
    console.log('Left Hand:', {
      extension: event.joint.extension,
      velocity: event.joint.velocity,
      position: event.joint.position,
      frame: event.frame
    });
  });

  // Visualize joint positions
  const allStates = tracker.getAllJointStates();
  return (
    <>
      {allStates.map(joint => (
        <mesh key={joint.name} position={joint.position}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color={joint.isFullyExtended ? 'red' : 'green'} />
        </mesh>
      ))}
    </>
  );
}
```

---

For more examples, see the [official documentation](https://github.com/pmndrs/BVHEcctrl).
