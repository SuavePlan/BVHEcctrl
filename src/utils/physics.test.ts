/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import { describe, expect, it } from "vitest";
import {
  calculateAcceleration,
  calculateDampingForce,
  calculateFallVelocity,
  calculateFrictionForce,
  calculateJumpPeakTime,
  calculateJumpVelocity,
  calculateMaxJumpHeight,
  calculateSpringForce,
  clamp,
  degToRad,
  isWalkableSlope,
  lerp,
  radToDeg,
  smoothStep,
} from "./physics";

describe("Physics Utilities", () => {
  describe("calculateJumpVelocity", () => {
    it("should calculate correct jump velocity for 2m height", () => {
      const velocity = calculateJumpVelocity(2, 9.81);
      expect(velocity).toBeCloseTo(6.26, 2);
    });

    it("should return 0 for zero height", () => {
      expect(calculateJumpVelocity(0, 9.81)).toBe(0);
    });

    it("should return 0 for negative height", () => {
      expect(calculateJumpVelocity(-1, 9.81)).toBe(0);
    });

    it("should work with custom gravity", () => {
      const velocity = calculateJumpVelocity(2, 15);
      expect(velocity).toBeCloseTo(7.75, 2);
    });
  });

  describe("calculateMaxJumpHeight", () => {
    it("should calculate correct height from velocity", () => {
      const height = calculateMaxJumpHeight(6.26, 9.81);
      expect(height).toBeCloseTo(2.0, 1);
    });

    it("should return 0 for zero velocity", () => {
      expect(calculateMaxJumpHeight(0, 9.81)).toBe(0);
    });

    it("should return 0 for negative velocity", () => {
      expect(calculateMaxJumpHeight(-1, 9.81)).toBe(0);
    });

    it("should return 0 for zero gravity", () => {
      expect(calculateMaxJumpHeight(5, 0)).toBe(0);
    });
  });

  describe("calculateJumpPeakTime", () => {
    it("should calculate time to reach peak", () => {
      const time = calculateJumpPeakTime(6.26, 9.81);
      expect(time).toBeCloseTo(0.64, 2);
    });

    it("should return 0 for zero velocity", () => {
      expect(calculateJumpPeakTime(0, 9.81)).toBe(0);
    });

    it("should return 0 for zero gravity", () => {
      expect(calculateJumpPeakTime(5, 0)).toBe(0);
    });
  });

  describe("calculateFallVelocity", () => {
    it("should calculate velocity after 1 second of falling", () => {
      const velocity = calculateFallVelocity(0, 9.81, 1);
      expect(velocity).toBeCloseTo(9.81, 2);
    });

    it("should account for initial velocity", () => {
      const velocity = calculateFallVelocity(5, 9.81, 1);
      expect(velocity).toBeCloseTo(14.81, 2);
    });

    it("should work with different time values", () => {
      const velocity = calculateFallVelocity(0, 9.81, 0.5);
      expect(velocity).toBeCloseTo(4.905, 2);
    });
  });

  describe("clamp", () => {
    it("should clamp value to min", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("should clamp value to max", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("should not clamp value within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it("should handle edge cases", () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe("lerp", () => {
    it("should interpolate at t=0", () => {
      expect(lerp(0, 10, 0)).toBe(0);
    });

    it("should interpolate at t=1", () => {
      expect(lerp(0, 10, 1)).toBe(10);
    });

    it("should interpolate at t=0.5", () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
    });

    it("should clamp t values outside [0,1]", () => {
      expect(lerp(0, 10, -0.5)).toBe(0);
      expect(lerp(0, 10, 1.5)).toBe(10);
    });
  });

  describe("smoothStep", () => {
    it("should return 0 at lower edge", () => {
      expect(smoothStep(0, 1, 0)).toBe(0);
    });

    it("should return 1 at upper edge", () => {
      expect(smoothStep(0, 1, 1)).toBe(1);
    });

    it("should smooth interpolate in middle", () => {
      const result = smoothStep(0, 1, 0.5);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
      expect(result).toBeCloseTo(0.5, 1);
    });

    it("should clamp values outside range", () => {
      expect(smoothStep(0, 1, -0.5)).toBe(0);
      expect(smoothStep(0, 1, 1.5)).toBe(1);
    });
  });

  describe("calculateSpringForce", () => {
    it("should calculate restoring force when below target", () => {
      const force = calculateSpringForce(0, 10, 2);
      expect(force).toBe(20);
    });

    it("should calculate restoring force when above target", () => {
      const force = calculateSpringForce(10, 0, 2);
      expect(force).toBe(-20);
    });

    it("should return 0 when at target", () => {
      const force = calculateSpringForce(5, 5, 2);
      expect(Math.abs(force)).toBe(0);
    });
  });

  describe("calculateDampingForce", () => {
    it("should calculate damping force opposite to velocity", () => {
      const force = calculateDampingForce(10, 0.5);
      expect(force).toBe(-5);
    });

    it("should return 0 for zero velocity", () => {
      const force = calculateDampingForce(0, 0.5);
      expect(Math.abs(force)).toBe(0);
    });

    it("should work with negative velocity", () => {
      const force = calculateDampingForce(-10, 0.5);
      expect(force).toBe(5);
    });
  });

  describe("radToDeg", () => {
    it("should convert PI to 180", () => {
      expect(radToDeg(Math.PI)).toBeCloseTo(180, 5);
    });

    it("should convert PI/2 to 90", () => {
      expect(radToDeg(Math.PI / 2)).toBeCloseTo(90, 5);
    });

    it("should convert 0 to 0", () => {
      expect(radToDeg(0)).toBe(0);
    });
  });

  describe("degToRad", () => {
    it("should convert 180 to PI", () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI, 5);
    });

    it("should convert 90 to PI/2", () => {
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2, 5);
    });

    it("should convert 0 to 0", () => {
      expect(degToRad(0)).toBe(0);
    });
  });

  describe("isWalkableSlope", () => {
    it("should return true for shallow slopes", () => {
      expect(isWalkableSlope(0.1, Math.PI / 4)).toBe(true);
    });

    it("should return false for steep slopes", () => {
      expect(isWalkableSlope(Math.PI / 3, Math.PI / 4)).toBe(false);
    });

    it("should return true when equal to max slope", () => {
      expect(isWalkableSlope(Math.PI / 4, Math.PI / 4)).toBe(true);
    });
  });

  describe("calculateFrictionForce", () => {
    it("should calculate friction force", () => {
      const force = calculateFrictionForce(100, 0.5);
      expect(force).toBe(50);
    });

    it("should clamp friction coefficient to [0,1]", () => {
      expect(calculateFrictionForce(100, 1.5)).toBe(100);
      expect(calculateFrictionForce(100, -0.5)).toBe(0);
    });

    it("should return 0 for zero normal force", () => {
      expect(Math.abs(calculateFrictionForce(0, 0.5))).toBe(0);
    });
  });

  describe("calculateAcceleration", () => {
    it("should calculate full acceleration at zero speed", () => {
      const accel = calculateAcceleration(1, 30, 0, 10);
      expect(accel).toBe(30);
    });

    it("should reduce acceleration near max speed", () => {
      const accel = calculateAcceleration(1, 30, 9, 10);
      expect(accel).toBeCloseTo(3, 1);
    });

    it("should return 0 at max speed", () => {
      const accel = calculateAcceleration(1, 30, 10, 10);
      expect(Math.abs(accel)).toBe(0);
    });

    it("should scale with input strength", () => {
      const accel = calculateAcceleration(0.5, 30, 0, 10);
      expect(accel).toBe(15);
    });
  });
});
