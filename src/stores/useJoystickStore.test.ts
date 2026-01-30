/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useJoystickStore } from "./useJoystickStore";

describe("useJoystickStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useJoystickStore.getState().resetJoystick();
    });
  });

  describe("initial state", () => {
    it("should have joystickActive as false initially", () => {
      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(false);
    });

    it("should have joystickX as 0 initially", () => {
      const state = useJoystickStore.getState();
      expect(state.joystickX).toBe(0);
    });

    it("should have joystickY as 0 initially", () => {
      const state = useJoystickStore.getState();
      expect(state.joystickY).toBe(0);
    });

    it("should have setJoystick function", () => {
      const state = useJoystickStore.getState();
      expect(typeof state.setJoystick).toBe("function");
    });

    it("should have resetJoystick function", () => {
      const state = useJoystickStore.getState();
      expect(typeof state.resetJoystick).toBe("function");
    });
  });

  describe("setJoystick", () => {
    it("should set joystick values and activate when moving", () => {
      act(() => {
        useJoystickStore.getState().setJoystick(0.5, 0.7);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(true);
      expect(state.joystickX).toBe(0.5);
      expect(state.joystickY).toBe(0.7);
    });

    it("should handle negative values", () => {
      act(() => {
        useJoystickStore.getState().setJoystick(-0.3, -0.8);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(true);
      expect(state.joystickX).toBe(-0.3);
      expect(state.joystickY).toBe(-0.8);
    });

    it("should handle maximum values (1, 1)", () => {
      act(() => {
        useJoystickStore.getState().setJoystick(1, 1);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(true);
      expect(state.joystickX).toBe(1);
      expect(state.joystickY).toBe(1);
    });

    it("should handle minimum values (-1, -1)", () => {
      act(() => {
        useJoystickStore.getState().setJoystick(-1, -1);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(true);
      expect(state.joystickX).toBe(-1);
      expect(state.joystickY).toBe(-1);
    });

    it("should set joystickActive to false when both values are zero", () => {
      // First set some values
      act(() => {
        useJoystickStore.getState().setJoystick(0.5, 0.5);
      });
      expect(useJoystickStore.getState().joystickActive).toBe(true);

      // Then set to zero
      act(() => {
        useJoystickStore.getState().setJoystick(0, 0);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(false);
      expect(state.joystickX).toBe(0);
      expect(state.joystickY).toBe(0);
    });

    it("should be active when only X is non-zero", () => {
      act(() => {
        useJoystickStore.getState().setJoystick(0.5, 0);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(true);
      expect(state.joystickX).toBe(0.5);
      expect(state.joystickY).toBe(0);
    });

    it("should be active when only Y is non-zero", () => {
      act(() => {
        useJoystickStore.getState().setJoystick(0, 0.7);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(true);
      expect(state.joystickX).toBe(0);
      expect(state.joystickY).toBe(0.7);
    });

    it("should update values on consecutive calls", () => {
      act(() => {
        useJoystickStore.getState().setJoystick(0.2, 0.3);
      });
      expect(useJoystickStore.getState().joystickX).toBe(0.2);
      expect(useJoystickStore.getState().joystickY).toBe(0.3);

      act(() => {
        useJoystickStore.getState().setJoystick(0.8, 0.9);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickX).toBe(0.8);
      expect(state.joystickY).toBe(0.9);
    });
  });

  describe("resetJoystick", () => {
    it("should reset all joystick values to initial state", () => {
      // First set some values
      act(() => {
        useJoystickStore.getState().setJoystick(0.8, 0.9);
      });
      expect(useJoystickStore.getState().joystickActive).toBe(true);

      // Then reset
      act(() => {
        useJoystickStore.getState().resetJoystick();
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(false);
      expect(state.joystickX).toBe(0);
      expect(state.joystickY).toBe(0);
    });

    it("should be idempotent (calling multiple times has same effect)", () => {
      act(() => {
        useJoystickStore.getState().setJoystick(0.5, 0.5);
      });

      act(() => {
        useJoystickStore.getState().resetJoystick();
        useJoystickStore.getState().resetJoystick();
        useJoystickStore.getState().resetJoystick();
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(false);
      expect(state.joystickX).toBe(0);
      expect(state.joystickY).toBe(0);
    });

    it("should work when called on already reset state", () => {
      act(() => {
        useJoystickStore.getState().resetJoystick();
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(false);
      expect(state.joystickX).toBe(0);
      expect(state.joystickY).toBe(0);
    });
  });

  describe("integration scenarios", () => {
    it("should handle rapid value changes", () => {
      const values = [
        [0.1, 0.2],
        [0.3, 0.4],
        [0.5, 0.6],
        [0.7, 0.8],
        [0.9, 1.0],
      ];

      act(() => {
        for (const [x, y] of values) {
          useJoystickStore.getState().setJoystick(x, y);
        }
      });

      const state = useJoystickStore.getState();
      expect(state.joystickX).toBe(0.9);
      expect(state.joystickY).toBe(1.0);
      expect(state.joystickActive).toBe(true);
    });

    it("should handle set/reset/set sequence", () => {
      act(() => {
        useJoystickStore.getState().setJoystick(0.5, 0.5);
      });
      expect(useJoystickStore.getState().joystickActive).toBe(true);

      act(() => {
        useJoystickStore.getState().resetJoystick();
      });
      expect(useJoystickStore.getState().joystickActive).toBe(false);

      act(() => {
        useJoystickStore.getState().setJoystick(0.3, 0.7);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(true);
      expect(state.joystickX).toBe(0.3);
      expect(state.joystickY).toBe(0.7);
    });

    it("should handle floating point precision", () => {
      act(() => {
        useJoystickStore.getState().setJoystick(0.1 + 0.2, 0.7 - 0.3);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickX).toBeCloseTo(0.3, 10);
      expect(state.joystickY).toBeCloseTo(0.4, 10);
    });
  });

  describe("edge cases", () => {
    it("should handle very small non-zero values", () => {
      act(() => {
        useJoystickStore.getState().setJoystick(0.0001, 0.0001);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(true);
      expect(state.joystickX).toBe(0.0001);
      expect(state.joystickY).toBe(0.0001);
    });

    it("should handle values beyond normal range", () => {
      act(() => {
        useJoystickStore.getState().setJoystick(2.5, -3.7);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(true);
      expect(state.joystickX).toBe(2.5);
      expect(state.joystickY).toBe(-3.7);
    });
  });
});
