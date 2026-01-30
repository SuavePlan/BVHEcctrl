/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Joint extension data - tracks how far a limb is extended
 */
export interface JointExtension {
  /** Joint name (e.g., "LeftHand", "RightFoot") */
  name: string;
  /** Current extension percentage (0-100%) */
  extension: number;
  /** Velocity of extension change (units/second) */
  velocity: number;
  /** Whether joint is at maximum extension */
  isFullyExtended: boolean;
  /** Current world position */
  position: THREE.Vector3;
  /** Distance from rest position */
  distanceFromRest: number;
}

/**
 * Event data passed to listeners
 */
export interface JointEvent {
  /** Joint that triggered the event */
  joint: JointExtension;
  /** Animation frame number */
  frame: number;
  /** Time in seconds since animation start */
  time: number;
  /** Delta time since last frame */
  delta: number;
  /** Character velocity */
  characterVelocity: THREE.Vector3;
}

/**
 * Footstep event with impact force
 */
export interface FootstepEvent extends JointEvent {
  /** Impact force (0-1, based on velocity) */
  impactForce: number;
  /** Which foot ("left" | "right") */
  foot: "left" | "right";
  /** Ground material (if available) */
  groundMaterial?: string;
}

/**
 * Breathing event based on movement intensity
 */
export interface BreathingEvent {
  /** Breathing intensity (0-1) */
  intensity: number;
  /** Current stamina/exertion level */
  exertion: number;
  /** Time since last breath */
  timeSinceLastBreath: number;
}

/**
 * Impact event when hitting something
 */
export interface ImpactEvent extends JointEvent {
  /** Impact velocity magnitude */
  impactVelocity: number;
  /** Normal of the surface hit */
  normal?: THREE.Vector3;
  /** Object that was hit */
  object?: THREE.Object3D;
}

/**
 * Joint configuration for tracking
 */
export interface JointConfig {
  /** Name of the bone/joint to track */
  name: string;
  /** Rest position (default pose) */
  restPosition?: THREE.Vector3;
  /** Maximum extension distance from rest */
  maxExtension?: number;
  /** Minimum velocity to trigger events */
  velocityThreshold?: number;
}

/**
 * Event listener type
 */
export type JointEventListener = (event: JointEvent) => void;
export type FootstepEventListener = (event: FootstepEvent) => void;
export type BreathingEventListener = (event: BreathingEvent) => void;
export type ImpactEventListener = (event: ImpactEvent) => void;

/**
 * Joint Tracker - Monitor limb positions and trigger events
 *
 * Use this to:
 * - Detect when hands reach for ladder rungs
 * - Trigger footstep sounds with accurate timing
 * - Monitor breathing based on exertion
 * - Detect impacts for collision sounds
 *
 * @example
 * const tracker = useJointTracker(characterModel, {
 *   joints: [
 *     { name: "LeftFoot", maxExtension: 1.0 },
 *     { name: "RightFoot", maxExtension: 1.0 },
 *     { name: "LeftHand", maxExtension: 1.2 },
 *     { name: "RightHand", maxExtension: 1.2 }
 *   ]
 * });
 *
 * // Listen for footsteps
 * tracker.onFootstep((event) => {
 *   playSound('footstep', { volume: event.impactForce });
 * });
 *
 * // Listen for ladder climbing
 * tracker.onJointExtension("LeftHand", (event) => {
 *   if (event.joint.isFullyExtended && nearLadder) {
 *     snapToLadderRung(event.joint.position);
 *   }
 * });
 */
export function useJointTracker(
  characterModel: THREE.Object3D | null,
  config: {
    joints: JointConfig[];
    /** Enable automatic footstep detection */
    detectFootsteps?: boolean;
    /** Enable breathing simulation */
    simulateBreathing?: boolean;
    /** Character velocity vector (from parent) */
    characterVelocity?: THREE.Vector3;
  }
) {
  const { joints, detectFootsteps = true, simulateBreathing = true, characterVelocity } = config;

  // Track joint states
  const jointStates = useRef<Map<string, JointExtension>>(new Map());
  const previousPositions = useRef<Map<string, THREE.Vector3>>(new Map());
  const frameCount = useRef(0);
  const startTime = useRef(0);

  // Event listeners
  const jointListeners = useRef<Map<string, JointEventListener[]>>(new Map());
  const footstepListeners = useRef<FootstepEventListener[]>([]);
  const breathingListeners = useRef<BreathingEventListener[]>([]);
  const impactListeners = useRef<ImpactEventListener[]>([]);

  // Breathing state
  const lastBreathTime = useRef(0);
  const exertionLevel = useRef(0);

  // Initialize joint tracking
  useEffect(() => {
    if (!characterModel) return;

    for (const joint of joints) {
      const bone = characterModel.getObjectByName(joint.name);
      if (bone) {
        const worldPos = new THREE.Vector3();
        bone.getWorldPosition(worldPos);

        jointStates.current.set(joint.name, {
          name: joint.name,
          extension: 0,
          velocity: 0,
          isFullyExtended: false,
          position: worldPos.clone(),
          distanceFromRest: 0,
        });

        previousPositions.current.set(joint.name, worldPos.clone());
      }
    }

    startTime.current = performance.now() / 1000;
  }, [characterModel, joints]);

  // Update joint tracking every frame
  useFrame((_, delta) => {
    if (!characterModel) return;

    frameCount.current++;
    const currentTime = performance.now() / 1000 - startTime.current;

    for (const jointConfig of joints) {
      const bone = characterModel.getObjectByName(jointConfig.name);
      if (!bone) continue;

      const state = jointStates.current.get(jointConfig.name);
      const prevPos = previousPositions.current.get(jointConfig.name);
      if (!state || !prevPos) continue;

      // Update position
      const worldPos = new THREE.Vector3();
      bone.getWorldPosition(worldPos);
      state.position.copy(worldPos);

      // Calculate velocity
      const displacement = worldPos.distanceTo(prevPos);
      state.velocity = displacement / delta;
      prevPos.copy(worldPos);

      // Calculate extension
      if (jointConfig.restPosition) {
        state.distanceFromRest = worldPos.distanceTo(jointConfig.restPosition);
        if (jointConfig.maxExtension) {
          state.extension = Math.min(100, (state.distanceFromRest / jointConfig.maxExtension) * 100);
          state.isFullyExtended = state.extension >= 95;
        }
      }

      // Trigger joint extension events
      const listeners = jointListeners.current.get(jointConfig.name);
      if (listeners && listeners.length > 0) {
        const event: JointEvent = {
          joint: { ...state },
          frame: frameCount.current,
          time: currentTime,
          delta,
          characterVelocity: characterVelocity || new THREE.Vector3(),
        };

        for (const listener of listeners) {
          listener(event);
        }
      }
    }

    // Detect footsteps
    if (detectFootsteps) {
      detectFootstepEvents(delta, currentTime, characterVelocity);
    }

    // Simulate breathing
    if (simulateBreathing) {
      updateBreathing(delta, currentTime, characterVelocity);
    }
  });

  /**
   * Detect footstep events based on foot velocity changes
   */
  function detectFootstepEvents(delta: number, time: number, velocity?: THREE.Vector3) {
    const leftFoot = jointStates.current.get("LeftFoot") || jointStates.current.get("leftFoot");
    const rightFoot = jointStates.current.get("RightFoot") || jointStates.current.get("rightFoot");

    const charVel = velocity || new THREE.Vector3();

    // Detect left foot impact
    if (leftFoot && leftFoot.velocity < 0.1 && leftFoot.position.y < 0.2) {
      const impactForce = Math.min(1, charVel.length() / 10);

      const event: FootstepEvent = {
        joint: { ...leftFoot },
        frame: frameCount.current,
        time,
        delta,
        characterVelocity: charVel.clone(),
        impactForce,
        foot: "left",
      };

      for (const listener of footstepListeners.current) {
        listener(event);
      }
    }

    // Detect right foot impact
    if (rightFoot && rightFoot.velocity < 0.1 && rightFoot.position.y < 0.2) {
      const impactForce = Math.min(1, charVel.length() / 10);

      const event: FootstepEvent = {
        joint: { ...rightFoot },
        frame: frameCount.current,
        time,
        delta,
        characterVelocity: charVel.clone(),
        impactForce,
        foot: "right",
      };

      for (const listener of footstepListeners.current) {
        listener(event);
      }
    }
  }

  /**
   * Update breathing simulation based on movement
   */
  function updateBreathing(delta: number, time: number, velocity?: THREE.Vector3) {
    const charVel = velocity || new THREE.Vector3();
    const speed = charVel.length();

    // Update exertion based on speed
    const targetExertion = Math.min(1, speed / 8); // Normalize to 0-1
    exertionLevel.current += (targetExertion - exertionLevel.current) * delta * 2;

    // Breathing rate based on exertion
    const breathingRate = 2 + exertionLevel.current * 3; // 2-5 breaths per second
    const breathInterval = 1 / breathingRate;

    if (time - lastBreathTime.current > breathInterval) {
      const event: BreathingEvent = {
        intensity: exertionLevel.current,
        exertion: exertionLevel.current,
        timeSinceLastBreath: time - lastBreathTime.current,
      };

      for (const listener of breathingListeners.current) {
        listener(event);
      }

      lastBreathTime.current = time;
    }
  }

  /**
   * Listen for specific joint extension events
   */
  function onJointExtension(jointName: string, listener: JointEventListener) {
    const listeners = jointListeners.current.get(jointName) || [];
    listeners.push(listener);
    jointListeners.current.set(jointName, listeners);

    // Return cleanup function
    return () => {
      const currentListeners = jointListeners.current.get(jointName) || [];
      const index = currentListeners.indexOf(listener);
      if (index > -1) {
        currentListeners.splice(index, 1);
      }
    };
  }

  /**
   * Listen for footstep events
   */
  function onFootstep(listener: FootstepEventListener) {
    footstepListeners.current.push(listener);

    return () => {
      const index = footstepListeners.current.indexOf(listener);
      if (index > -1) {
        footstepListeners.current.splice(index, 1);
      }
    };
  }

  /**
   * Listen for breathing events
   */
  function onBreathing(listener: BreathingEventListener) {
    breathingListeners.current.push(listener);

    return () => {
      const index = breathingListeners.current.indexOf(listener);
      if (index > -1) {
        breathingListeners.current.splice(index, 1);
      }
    };
  }

  /**
   * Listen for impact events
   */
  function onImpact(listener: ImpactEventListener) {
    impactListeners.current.push(listener);

    return () => {
      const index = impactListeners.current.indexOf(listener);
      if (index > -1) {
        impactListeners.current.splice(index, 1);
      }
    };
  }

  /**
   * Get current state of a specific joint
   */
  function getJointState(jointName: string): JointExtension | undefined {
    return jointStates.current.get(jointName);
  }

  /**
   * Get all joint states
   */
  function getAllJointStates(): JointExtension[] {
    return Array.from(jointStates.current.values());
  }

  return {
    onJointExtension,
    onFootstep,
    onBreathing,
    onImpact,
    getJointState,
    getAllJointStates,
    /** Current exertion level (0-1) */
    get exertion() {
      return exertionLevel.current;
    },
  };
}

/**
 * Helper to find common bone names in a model
 */
export function findBoneNames(model: THREE.Object3D): string[] {
  const names: string[] = [];
  model.traverse((obj) => {
    if (obj.type === "Bone" || obj.type === "Object3D") {
      names.push(obj.name);
    }
  });
  return names;
}

/**
 * Common bone name patterns for different model types
 */
export const COMMON_BONE_NAMES = {
  mixamo: {
    leftFoot: "LeftFoot",
    rightFoot: "RightFoot",
    leftHand: "LeftHand",
    rightHand: "RightHand",
    head: "Head",
    spine: "Spine",
  },
  rigify: {
    leftFoot: "foot.L",
    rightFoot: "foot.R",
    leftHand: "hand.L",
    rightHand: "hand.R",
    head: "head",
    spine: "spine",
  },
  generic: {
    leftFoot: ["LeftFoot", "leftFoot", "L_Foot", "foot_l", "foot.L"],
    rightFoot: ["RightFoot", "rightFoot", "R_Foot", "foot_r", "foot.R"],
    leftHand: ["LeftHand", "leftHand", "L_Hand", "hand_l", "hand.L"],
    rightHand: ["RightHand", "rightHand", "R_Hand", "hand_r", "hand.R"],
  },
};
