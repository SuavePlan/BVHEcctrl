/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useButtonStore } from "./useButtonStore";

describe("useButtonStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useButtonStore.getState().resetAllButtons();
    });
  });

  describe("initial state", () => {
    it("should have empty buttons object initially", () => {
      const state = useButtonStore.getState();
      expect(state.buttons).toEqual({});
    });

    it("should have setButtonActive function", () => {
      const state = useButtonStore.getState();
      expect(typeof state.setButtonActive).toBe("function");
    });

    it("should have resetAllButtons function", () => {
      const state = useButtonStore.getState();
      expect(typeof state.resetAllButtons).toBe("function");
    });
  });

  describe("setButtonActive", () => {
    it("should set a button to active", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("jump", true);
      });

      const state = useButtonStore.getState();
      expect(state.buttons.jump).toBe(true);
    });

    it("should set a button to inactive", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("jump", true);
        useButtonStore.getState().setButtonActive("jump", false);
      });

      const state = useButtonStore.getState();
      expect(state.buttons.jump).toBe(false);
    });

    it("should handle multiple buttons independently", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("jump", true);
        useButtonStore.getState().setButtonActive("run", false);
        useButtonStore.getState().setButtonActive("crouch", true);
      });

      const state = useButtonStore.getState();
      expect(state.buttons.jump).toBe(true);
      expect(state.buttons.run).toBe(false);
      expect(state.buttons.crouch).toBe(true);
    });

    it("should overwrite previous value for same button", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("jump", true);
      });
      expect(useButtonStore.getState().buttons.jump).toBe(true);

      act(() => {
        useButtonStore.getState().setButtonActive("jump", false);
      });
      expect(useButtonStore.getState().buttons.jump).toBe(false);

      act(() => {
        useButtonStore.getState().setButtonActive("jump", true);
      });
      expect(useButtonStore.getState().buttons.jump).toBe(true);
    });

    it("should handle button IDs with special characters", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("button-1", true);
        useButtonStore.getState().setButtonActive("button_2", true);
        useButtonStore.getState().setButtonActive("button.3", true);
      });

      const state = useButtonStore.getState();
      expect(state.buttons["button-1"]).toBe(true);
      expect(state.buttons.button_2).toBe(true);
      expect(state.buttons["button.3"]).toBe(true);
    });

    it("should handle empty string as button ID", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("", true);
      });

      const state = useButtonStore.getState();
      expect(state.buttons[""]).toBe(true);
    });

    it("should preserve other buttons when setting one", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("button1", true);
        useButtonStore.getState().setButtonActive("button2", false);
      });

      act(() => {
        useButtonStore.getState().setButtonActive("button3", true);
      });

      const state = useButtonStore.getState();
      expect(state.buttons.button1).toBe(true);
      expect(state.buttons.button2).toBe(false);
      expect(state.buttons.button3).toBe(true);
    });
  });

  describe("resetAllButtons", () => {
    it("should clear all buttons", () => {
      // First set some buttons
      act(() => {
        useButtonStore.getState().setButtonActive("jump", true);
        useButtonStore.getState().setButtonActive("run", false);
        useButtonStore.getState().setButtonActive("crouch", true);
      });
      expect(Object.keys(useButtonStore.getState().buttons)).toHaveLength(3);

      // Then reset
      act(() => {
        useButtonStore.getState().resetAllButtons();
      });

      const state = useButtonStore.getState();
      expect(state.buttons).toEqual({});
      expect(Object.keys(state.buttons)).toHaveLength(0);
    });

    it("should be idempotent", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("jump", true);
      });

      act(() => {
        useButtonStore.getState().resetAllButtons();
        useButtonStore.getState().resetAllButtons();
        useButtonStore.getState().resetAllButtons();
      });

      const state = useButtonStore.getState();
      expect(state.buttons).toEqual({});
    });

    it("should work when called on already empty state", () => {
      act(() => {
        useButtonStore.getState().resetAllButtons();
      });

      const state = useButtonStore.getState();
      expect(state.buttons).toEqual({});
    });

    it("should allow setting buttons after reset", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("button1", true);
        useButtonStore.getState().resetAllButtons();
        useButtonStore.getState().setButtonActive("button2", true);
      });

      const state = useButtonStore.getState();
      expect(state.buttons).toEqual({ button2: true });
      expect(state.buttons.button1).toBeUndefined();
    });
  });

  describe("integration scenarios", () => {
    it("should handle rapid button state changes", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("jump", true);
        useButtonStore.getState().setButtonActive("jump", false);
        useButtonStore.getState().setButtonActive("jump", true);
        useButtonStore.getState().setButtonActive("jump", false);
        useButtonStore.getState().setButtonActive("jump", true);
      });

      const state = useButtonStore.getState();
      expect(state.buttons.jump).toBe(true);
    });

    it("should handle multiple buttons with alternating states", () => {
      act(() => {
        for (let i = 0; i < 10; i++) {
          useButtonStore.getState().setButtonActive(`button${i}`, i % 2 === 0);
        }
      });

      const state = useButtonStore.getState();
      expect(state.buttons.button0).toBe(true);
      expect(state.buttons.button1).toBe(false);
      expect(state.buttons.button2).toBe(true);
      expect(state.buttons.button3).toBe(false);
      expect(Object.keys(state.buttons)).toHaveLength(10);
    });

    it("should handle set/reset/set sequence", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("jump", true);
        useButtonStore.getState().setButtonActive("run", true);
      });
      expect(Object.keys(useButtonStore.getState().buttons)).toHaveLength(2);

      act(() => {
        useButtonStore.getState().resetAllButtons();
      });
      expect(Object.keys(useButtonStore.getState().buttons)).toHaveLength(0);

      act(() => {
        useButtonStore.getState().setButtonActive("crouch", true);
      });

      const state = useButtonStore.getState();
      expect(state.buttons.crouch).toBe(true);
      expect(state.buttons.jump).toBeUndefined();
      expect(state.buttons.run).toBeUndefined();
    });

    it("should handle large number of buttons", () => {
      act(() => {
        for (let i = 0; i < 100; i++) {
          useButtonStore.getState().setButtonActive(`button${i}`, true);
        }
      });

      const state = useButtonStore.getState();
      expect(Object.keys(state.buttons)).toHaveLength(100);
      expect(state.buttons.button0).toBe(true);
      expect(state.buttons.button99).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle button IDs with unicode characters", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("button_🎮", true);
        useButtonStore.getState().setButtonActive("按钮", false);
      });

      const state = useButtonStore.getState();
      expect(state.buttons["button_🎮"]).toBe(true);
      expect(state.buttons.按钮).toBe(false);
    });

    it("should handle very long button IDs", () => {
      const longId = "a".repeat(1000);
      act(() => {
        useButtonStore.getState().setButtonActive(longId, true);
      });

      const state = useButtonStore.getState();
      expect(state.buttons[longId]).toBe(true);
    });

    it("should differentiate between similar button IDs", () => {
      act(() => {
        useButtonStore.getState().setButtonActive("button", true);
        useButtonStore.getState().setButtonActive("Button", false);
        useButtonStore.getState().setButtonActive("BUTTON", true);
      });

      const state = useButtonStore.getState();
      expect(state.buttons.button).toBe(true);
      expect(state.buttons.Button).toBe(false);
      expect(state.buttons.BUTTON).toBe(true);
    });
  });
});
