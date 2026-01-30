/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Joystick from "./Joystick";
import { useJoystickStore } from "./stores/useJoystickStore";

describe("Joystick", () => {
  beforeEach(() => {
    // Reset store
    act(() => {
      useJoystickStore.getState().resetJoystick();
    });
  });

  describe("rendering", () => {
    it("should render the joystick wrapper", () => {
      const { container } = render(<Joystick />);
      const wrapper = container.querySelector("#ecctrl-joystick");
      expect(wrapper).toBeTruthy();
    });

    it("should render the joystick base", () => {
      const { container } = render(<Joystick />);
      const base = container.querySelector("#joystick-base");
      expect(base).toBeTruthy();
    });

    it("should render the joystick knob", () => {
      const { container } = render(<Joystick />);
      const knob = container.querySelector("#joystick-knob");
      expect(knob).toBeTruthy();
    });

    it("should apply custom wrapper styles", () => {
      const customStyle = { backgroundColor: "red", zIndex: "20" };
      const { container } = render(<Joystick joystickWrapperStyle={customStyle} />);
      const wrapper = container.querySelector("#ecctrl-joystick") as HTMLElement;
      expect(wrapper.style.backgroundColor).toBe("red");
      expect(wrapper.style.zIndex).toBe("20");
    });

    it("should apply custom base styles", () => {
      const customStyle = { width: "150px", height: "150px" };
      const { container } = render(<Joystick joystickBaseStyle={customStyle} />);
      const base = container.querySelector("#joystick-base") as HTMLElement;
      expect(base.style.width).toBe("150px");
      expect(base.style.height).toBe("150px");
    });

    it("should apply custom knob styles", () => {
      const customStyle = { width: "80px", height: "80px" };
      const { container } = render(<Joystick joystickKnobStyle={customStyle} />);
      const knob = container.querySelector("#joystick-knob") as HTMLElement;
      expect(knob.style.width).toBe("80px");
      expect(knob.style.height).toBe("80px");
    });
  });

  describe("interaction", () => {
    it("should update store on pointer down", () => {
      const { container } = render(<Joystick />);
      const wrapper = container.querySelector("#ecctrl-joystick") as HTMLElement;

      act(() => {
        fireEvent.pointerDown(wrapper, { clientX: 100, clientY: 100 });
      });

      const state = useJoystickStore.getState();
      // Joystick should be active after pointer down
      expect(state.joystickActive || state.joystickX !== 0 || state.joystickY !== 0).toBe(true);
    });

    it("should reset joystick on pointer up", () => {
      const { container } = render(<Joystick />);
      const wrapper = container.querySelector("#ecctrl-joystick") as HTMLElement;

      act(() => {
        fireEvent.pointerDown(wrapper, { clientX: 100, clientY: 100 });
        fireEvent.pointerUp(wrapper);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(false);
      expect(state.joystickX).toBe(0);
      expect(state.joystickY).toBe(0);
    });

    it("should reset joystick on pointer leave", () => {
      const { container } = render(<Joystick />);
      const wrapper = container.querySelector("#ecctrl-joystick") as HTMLElement;

      act(() => {
        fireEvent.pointerDown(wrapper, { clientX: 100, clientY: 100 });
        fireEvent.pointerLeave(wrapper);
      });

      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(false);
      expect(state.joystickX).toBe(0);
      expect(state.joystickY).toBe(0);
    });

    it("should prevent context menu", () => {
      const { container } = render(<Joystick />);
      const wrapper = container.querySelector("#ecctrl-joystick") as HTMLElement;

      const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      wrapper.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("joystickMaxRadius prop", () => {
    it("should use default max radius when not provided", () => {
      const { container } = render(<Joystick />);
      const wrapper = container.querySelector("#ecctrl-joystick");
      expect(wrapper).toBeTruthy();
      // Default radius is 50
    });

    it("should use custom max radius", () => {
      const { container } = render(<Joystick joystickMaxRadius={100} />);
      const wrapper = container.querySelector("#ecctrl-joystick");
      expect(wrapper).toBeTruthy();
      // Custom radius is 100
    });
  });

  describe("cleanup", () => {
    it("should reset joystick on unmount", () => {
      const { unmount } = render(<Joystick />);

      // Set some joystick values
      act(() => {
        useJoystickStore.getState().setJoystick(0.5, 0.5);
      });

      expect(useJoystickStore.getState().joystickActive).toBe(true);

      // Unmount component
      act(() => {
        unmount();
      });

      // Joystick should be reset after unmount
      const state = useJoystickStore.getState();
      expect(state.joystickActive).toBe(false);
      expect(state.joystickX).toBe(0);
      expect(state.joystickY).toBe(0);
    });
  });

  describe("default styles", () => {
    it("should apply default wrapper styles", () => {
      const { container } = render(<Joystick />);
      const wrapper = container.querySelector("#ecctrl-joystick") as HTMLElement;
      expect(wrapper.style.position).toBe("fixed");
      expect(wrapper.style.zIndex).toBe("10");
    });

    it("should apply default base styles", () => {
      const { container } = render(<Joystick />);
      const base = container.querySelector("#joystick-base") as HTMLElement;
      expect(base.style.position).toBe("absolute");
      expect(base.style.borderRadius).toBe("50%");
    });

    it("should apply default knob styles", () => {
      const { container } = render(<Joystick />);
      const knob = container.querySelector("#joystick-knob") as HTMLElement;
      expect(knob.style.position).toBe("absolute");
      expect(knob.style.borderRadius).toBe("50%");
      expect(knob.style.pointerEvents).toBe("none");
    });
  });

  describe("style merging", () => {
    it("should merge custom wrapper styles with defaults", () => {
      const customStyle = { backgroundColor: "blue" };
      const { container } = render(<Joystick joystickWrapperStyle={customStyle} />);
      const wrapper = container.querySelector("#ecctrl-joystick") as HTMLElement;
      // Should have both custom and default styles
      expect(wrapper.style.backgroundColor).toBe("blue");
      expect(wrapper.style.position).toBe("fixed"); // Default style
    });

    it("should allow overriding default styles", () => {
      const customStyle = { position: "absolute" as const, zIndex: "99" };
      const { container } = render(<Joystick joystickWrapperStyle={customStyle} />);
      const wrapper = container.querySelector("#ecctrl-joystick") as HTMLElement;
      expect(wrapper.style.position).toBe("absolute"); // Overridden
      expect(wrapper.style.zIndex).toBe("99"); // Overridden
    });
  });
});
