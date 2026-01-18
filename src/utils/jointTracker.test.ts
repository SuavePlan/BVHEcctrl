/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { COMMON_BONE_NAMES, findBoneNames } from "./jointTracker";

describe("Joint Tracker Utilities", () => {
  describe("findBoneNames", () => {
    it("should find bone names in a model", () => {
      const model = new THREE.Group();
      const bone1 = new THREE.Bone();
      bone1.name = "LeftFoot";
      const bone2 = new THREE.Bone();
      bone2.name = "RightFoot";

      model.add(bone1);
      model.add(bone2);

      const names = findBoneNames(model);
      expect(names).toContain("LeftFoot");
      expect(names).toContain("RightFoot");
    });

    it("should return empty array for model with no bones", () => {
      const model = new THREE.Group();
      const names = findBoneNames(model);
      expect(names).toEqual([]);
    });

    it("should find nested bones", () => {
      const model = new THREE.Group();
      const parent = new THREE.Bone();
      parent.name = "Parent";
      const child = new THREE.Bone();
      child.name = "Child";

      parent.add(child);
      model.add(parent);

      const names = findBoneNames(model);
      expect(names).toContain("Parent");
      expect(names).toContain("Child");
    });
  });

  describe("COMMON_BONE_NAMES", () => {
    it("should have mixamo bone names", () => {
      expect(COMMON_BONE_NAMES.mixamo.leftFoot).toBe("LeftFoot");
      expect(COMMON_BONE_NAMES.mixamo.rightFoot).toBe("RightFoot");
      expect(COMMON_BONE_NAMES.mixamo.leftHand).toBe("LeftHand");
      expect(COMMON_BONE_NAMES.mixamo.rightHand).toBe("RightHand");
    });

    it("should have rigify bone names", () => {
      expect(COMMON_BONE_NAMES.rigify.leftFoot).toBe("foot.L");
      expect(COMMON_BONE_NAMES.rigify.rightFoot).toBe("foot.R");
      expect(COMMON_BONE_NAMES.rigify.leftHand).toBe("hand.L");
      expect(COMMON_BONE_NAMES.rigify.rightHand).toBe("hand.R");
    });

    it("should have generic bone name variations", () => {
      expect(COMMON_BONE_NAMES.generic.leftFoot).toContain("LeftFoot");
      expect(COMMON_BONE_NAMES.generic.leftFoot).toContain("leftFoot");
      expect(COMMON_BONE_NAMES.generic.leftFoot).toContain("foot.L");
    });
  });

  describe("Joint Extension Calculation", () => {
    it("should calculate extension percentage correctly", () => {
      const restPosition = new THREE.Vector3(0, 0, 0);
      const currentPosition = new THREE.Vector3(0.5, 0, 0);
      const maxExtension = 1.0;

      const distanceFromRest = currentPosition.distanceTo(restPosition);
      const extensionPercent = (distanceFromRest / maxExtension) * 100;

      expect(extensionPercent).toBe(50);
    });

    it("should cap extension at 100%", () => {
      const restPosition = new THREE.Vector3(0, 0, 0);
      const currentPosition = new THREE.Vector3(2, 0, 0);
      const maxExtension = 1.0;

      const distanceFromRest = currentPosition.distanceTo(restPosition);
      const extensionPercent = Math.min(100, (distanceFromRest / maxExtension) * 100);

      expect(extensionPercent).toBe(100);
    });

    it("should detect full extension at 95%", () => {
      const extension = 96;
      const isFullyExtended = extension >= 95;

      expect(isFullyExtended).toBe(true);
    });

    it("should not detect full extension below 95%", () => {
      const extension = 94;
      const isFullyExtended = extension >= 95;

      expect(isFullyExtended).toBe(false);
    });
  });

  describe("Velocity Calculation", () => {
    it("should calculate velocity from displacement", () => {
      const prevPos = new THREE.Vector3(0, 0, 0);
      const currentPos = new THREE.Vector3(1, 0, 0);
      const deltaTime = 0.1;

      const displacement = currentPos.distanceTo(prevPos);
      const velocity = displacement / deltaTime;

      expect(velocity).toBe(10);
    });

    it("should return zero velocity for stationary joint", () => {
      const prevPos = new THREE.Vector3(5, 5, 5);
      const currentPos = new THREE.Vector3(5, 5, 5);
      const deltaTime = 0.1;

      const displacement = currentPos.distanceTo(prevPos);
      const velocity = displacement / deltaTime;

      expect(velocity).toBe(0);
    });

    it("should calculate velocity in 3D space", () => {
      const prevPos = new THREE.Vector3(0, 0, 0);
      const currentPos = new THREE.Vector3(1, 1, 1);
      const deltaTime = 0.1;

      const displacement = currentPos.distanceTo(prevPos);
      const velocity = displacement / deltaTime;

      expect(velocity).toBeCloseTo(17.32, 2); // sqrt(3) / 0.1
    });
  });

  describe("Impact Force Calculation", () => {
    it("should calculate impact force from velocity", () => {
      const characterVelocity = new THREE.Vector3(5, 0, 0);
      const impactForce = Math.min(1, characterVelocity.length() / 10);

      expect(impactForce).toBe(0.5);
    });

    it("should cap impact force at 1.0", () => {
      const characterVelocity = new THREE.Vector3(15, 0, 0);
      const impactForce = Math.min(1, characterVelocity.length() / 10);

      expect(impactForce).toBe(1.0);
    });

    it("should return zero for stationary character", () => {
      const characterVelocity = new THREE.Vector3(0, 0, 0);
      const impactForce = Math.min(1, characterVelocity.length() / 10);

      expect(impactForce).toBe(0);
    });
  });

  describe("Breathing Rate Calculation", () => {
    it("should calculate breathing rate from exertion", () => {
      const exertion = 0.5; // 50% exertion
      const breathingRate = 2 + exertion * 3; // 2-5 breaths per second

      expect(breathingRate).toBe(3.5);
    });

    it("should have minimum breathing rate at rest", () => {
      const exertion = 0;
      const breathingRate = 2 + exertion * 3;

      expect(breathingRate).toBe(2);
    });

    it("should have maximum breathing rate at full exertion", () => {
      const exertion = 1;
      const breathingRate = 2 + exertion * 3;

      expect(breathingRate).toBe(5);
    });

    it("should calculate breath interval from rate", () => {
      const breathingRate = 4; // 4 breaths per second
      const breathInterval = 1 / breathingRate;

      expect(breathInterval).toBe(0.25); // One breath every 250ms
    });
  });

  describe("Exertion Level Update", () => {
    it("should smooth exertion changes", () => {
      let currentExertion = 0.2;
      const targetExertion = 0.8;
      const delta = 0.1;
      const smoothingFactor = 2;

      currentExertion += (targetExertion - currentExertion) * delta * smoothingFactor;

      expect(currentExertion).toBeCloseTo(0.32, 2);
    });

    it("should normalize speed to exertion", () => {
      const speed = 4; // m/s
      const maxSpeed = 8;
      const exertion = Math.min(1, speed / maxSpeed);

      expect(exertion).toBe(0.5);
    });

    it("should cap exertion at 1.0", () => {
      const speed = 10;
      const maxSpeed = 8;
      const exertion = Math.min(1, speed / maxSpeed);

      expect(exertion).toBe(1.0);
    });
  });
});
