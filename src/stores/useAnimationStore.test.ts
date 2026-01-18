/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { CharacterAnimationStatus } from "..";
import { useAnimationStore } from "./useAnimationStore";

describe("useAnimationStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useAnimationStore.setState({ animationStatus: "IDLE" });
    });
  });

  describe("initial state", () => {
    it("should have IDLE as initial animation status", () => {
      const state = useAnimationStore.getState();
      expect(state.animationStatus).toBe("IDLE");
    });

    it("should have setAnimationStatus function", () => {
      const state = useAnimationStore.getState();
      expect(typeof state.setAnimationStatus).toBe("function");
    });
  });

  describe("setAnimationStatus", () => {
    const allStatuses: CharacterAnimationStatus[] = [
      "IDLE",
      "WALK",
      "RUN",
      "JUMP_START",
      "JUMP_IDLE",
      "JUMP_FALL",
      "JUMP_LAND",
    ];

    for (const status of allStatuses) {
      it(`should set animation status to ${status}`, () => {
        act(() => {
          useAnimationStore.getState().setAnimationStatus(status);
        });

        const state = useAnimationStore.getState();
        expect(state.animationStatus).toBe(status);
      });
    }

    it("should update from IDLE to WALK", () => {
      act(() => {
        useAnimationStore.getState().setAnimationStatus("WALK");
      });

      const state = useAnimationStore.getState();
      expect(state.animationStatus).toBe("WALK");
    });

    it("should update from WALK to RUN", () => {
      act(() => {
        useAnimationStore.getState().setAnimationStatus("WALK");
        useAnimationStore.getState().setAnimationStatus("RUN");
      });

      const state = useAnimationStore.getState();
      expect(state.animationStatus).toBe("RUN");
    });

    it("should handle jump sequence: IDLE -> JUMP_START -> JUMP_IDLE -> JUMP_FALL -> JUMP_LAND -> IDLE", () => {
      const sequence: CharacterAnimationStatus[] = [
        "IDLE",
        "JUMP_START",
        "JUMP_IDLE",
        "JUMP_FALL",
        "JUMP_LAND",
        "IDLE",
      ];

      for (const status of sequence) {
        act(() => {
          useAnimationStore.getState().setAnimationStatus(status);
        });
        expect(useAnimationStore.getState().animationStatus).toBe(status);
      }
    });

    it("should handle rapid state changes", () => {
      act(() => {
        useAnimationStore.getState().setAnimationStatus("WALK");
        useAnimationStore.getState().setAnimationStatus("RUN");
        useAnimationStore.getState().setAnimationStatus("WALK");
        useAnimationStore.getState().setAnimationStatus("IDLE");
      });

      const state = useAnimationStore.getState();
      expect(state.animationStatus).toBe("IDLE");
    });

    it("should allow setting same status multiple times", () => {
      act(() => {
        useAnimationStore.getState().setAnimationStatus("WALK");
        useAnimationStore.getState().setAnimationStatus("WALK");
        useAnimationStore.getState().setAnimationStatus("WALK");
      });

      const state = useAnimationStore.getState();
      expect(state.animationStatus).toBe("WALK");
    });
  });

  describe("integration scenarios", () => {
    it("should handle walk/run transitions", () => {
      act(() => {
        useAnimationStore.getState().setAnimationStatus("WALK");
      });
      expect(useAnimationStore.getState().animationStatus).toBe("WALK");

      act(() => {
        useAnimationStore.getState().setAnimationStatus("RUN");
      });
      expect(useAnimationStore.getState().animationStatus).toBe("RUN");

      act(() => {
        useAnimationStore.getState().setAnimationStatus("WALK");
      });
      expect(useAnimationStore.getState().animationStatus).toBe("WALK");

      act(() => {
        useAnimationStore.getState().setAnimationStatus("IDLE");
      });
      expect(useAnimationStore.getState().animationStatus).toBe("IDLE");
    });

    it("should handle jump while running", () => {
      act(() => {
        useAnimationStore.getState().setAnimationStatus("RUN");
        useAnimationStore.getState().setAnimationStatus("JUMP_START");
        useAnimationStore.getState().setAnimationStatus("JUMP_IDLE");
        useAnimationStore.getState().setAnimationStatus("JUMP_FALL");
        useAnimationStore.getState().setAnimationStatus("JUMP_LAND");
        useAnimationStore.getState().setAnimationStatus("RUN");
      });

      const state = useAnimationStore.getState();
      expect(state.animationStatus).toBe("RUN");
    });

    it("should handle complex movement sequence", () => {
      const sequence: CharacterAnimationStatus[] = [
        "IDLE",
        "WALK",
        "RUN",
        "JUMP_START",
        "JUMP_IDLE",
        "JUMP_FALL",
        "JUMP_LAND",
        "WALK",
        "IDLE",
      ];

      for (const status of sequence) {
        act(() => {
          useAnimationStore.getState().setAnimationStatus(status);
        });

        const state = useAnimationStore.getState();
        expect(state.animationStatus).toBe(status);
      }
    });

    it("should handle jump from idle", () => {
      act(() => {
        useAnimationStore.getState().setAnimationStatus("IDLE");
        useAnimationStore.getState().setAnimationStatus("JUMP_START");
      });
      expect(useAnimationStore.getState().animationStatus).toBe("JUMP_START");

      act(() => {
        useAnimationStore.getState().setAnimationStatus("JUMP_IDLE");
      });
      expect(useAnimationStore.getState().animationStatus).toBe("JUMP_IDLE");

      act(() => {
        useAnimationStore.getState().setAnimationStatus("JUMP_FALL");
      });
      expect(useAnimationStore.getState().animationStatus).toBe("JUMP_FALL");

      act(() => {
        useAnimationStore.getState().setAnimationStatus("JUMP_LAND");
      });
      expect(useAnimationStore.getState().animationStatus).toBe("JUMP_LAND");

      act(() => {
        useAnimationStore.getState().setAnimationStatus("IDLE");
      });
      expect(useAnimationStore.getState().animationStatus).toBe("IDLE");
    });

    it("should handle continuous jumping", () => {
      for (let i = 0; i < 3; i++) {
        act(() => {
          useAnimationStore.getState().setAnimationStatus("JUMP_START");
          useAnimationStore.getState().setAnimationStatus("JUMP_IDLE");
          useAnimationStore.getState().setAnimationStatus("JUMP_FALL");
          useAnimationStore.getState().setAnimationStatus("JUMP_LAND");
        });
      }

      const state = useAnimationStore.getState();
      expect(state.animationStatus).toBe("JUMP_LAND");
    });
  });

  describe("state persistence", () => {
    it("should maintain state across multiple reads", () => {
      act(() => {
        useAnimationStore.getState().setAnimationStatus("RUN");
      });

      const state1 = useAnimationStore.getState();
      const state2 = useAnimationStore.getState();
      const state3 = useAnimationStore.getState();

      expect(state1.animationStatus).toBe("RUN");
      expect(state2.animationStatus).toBe("RUN");
      expect(state3.animationStatus).toBe("RUN");
    });

    it("should reflect latest state after multiple updates", () => {
      const updates: CharacterAnimationStatus[] = ["WALK", "RUN", "JUMP_START", "JUMP_IDLE"];

      for (const status of updates) {
        act(() => {
          useAnimationStore.getState().setAnimationStatus(status);
        });
      }

      const state = useAnimationStore.getState();
      expect(state.animationStatus).toBe("JUMP_IDLE");
    });
  });

  describe("all animation states coverage", () => {
    it("should support all defined animation states", () => {
      const states: CharacterAnimationStatus[] = [
        "IDLE",
        "WALK",
        "RUN",
        "JUMP_START",
        "JUMP_IDLE",
        "JUMP_FALL",
        "JUMP_LAND",
      ];

      for (const status of states) {
        act(() => {
          useAnimationStore.getState().setAnimationStatus(status);
        });
        expect(useAnimationStore.getState().animationStatus).toBe(status);
      }
    });
  });
});
