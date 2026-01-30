/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import { act, fireEvent, render } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VirtualButton from "./VirtualButton";
import { useButtonStore } from "./stores/useButtonStore";

describe("VirtualButton", () => {
  beforeEach(() => {
    // Reset store
    act(() => {
      useButtonStore.getState().resetAllButtons();
    });
  });

  describe("rendering", () => {
    it("should render the button wrapper", () => {
      const { container } = render(<VirtualButton id="jump" />);
      const wrapper = container.querySelector("#ecctrl-virtual-button");
      expect(wrapper).toBeTruthy();
    });

    it("should render the button cap", () => {
      const { container } = render(<VirtualButton id="jump" />);
      const cap = container.querySelector("#virtual-button-cap");
      expect(cap).toBeTruthy();
    });

    it("should display label text", () => {
      const { container } = render(<VirtualButton id="jump" label="JUMP" />);
      const cap = container.querySelector("#virtual-button-cap");
      expect(cap?.textContent).toBe("JUMP");
    });

    it("should render without label", () => {
      const { container } = render(<VirtualButton id="jump" />);
      const cap = container.querySelector("#virtual-button-cap");
      expect(cap?.textContent).toBe("");
    });

    it("should apply custom wrapper styles", () => {
      const customStyle = { backgroundColor: "red", width: "80px" };
      const { container } = render(<VirtualButton id="jump" buttonWrapperStyle={customStyle} />);
      const wrapper = container.querySelector("#ecctrl-virtual-button") as HTMLElement;
      expect(wrapper.style.backgroundColor).toBe("red");
      expect(wrapper.style.width).toBe("80px");
    });

    it("should apply custom cap styles", () => {
      const customStyle = { backgroundColor: "blue", width: "50px" };
      const { container } = render(<VirtualButton id="jump" buttonCapStyle={customStyle} />);
      const cap = container.querySelector("#virtual-button-cap") as HTMLElement;
      expect(cap.style.backgroundColor).toBe("blue");
      expect(cap.style.width).toBe("50px");
    });
  });

  describe("interaction", () => {
    it("should activate button on pointer down", () => {
      const { container } = render(<VirtualButton id="jump" />);
      const wrapper = container.querySelector("#ecctrl-virtual-button") as HTMLElement;

      act(() => {
        fireEvent.pointerDown(wrapper, { clientX: 100, clientY: 100 });
      });

      const state = useButtonStore.getState();
      expect(state.buttons.jump).toBe(true);
    });

    it("should deactivate button on pointer up", () => {
      const { container } = render(<VirtualButton id="jump" />);
      const wrapper = container.querySelector("#ecctrl-virtual-button") as HTMLElement;

      act(() => {
        fireEvent.pointerDown(wrapper);
        fireEvent.pointerUp(wrapper);
      });

      const state = useButtonStore.getState();
      expect(state.buttons.jump).toBe(false);
    });

    it("should deactivate button on pointer leave", () => {
      const { container } = render(<VirtualButton id="jump" />);
      const wrapper = container.querySelector("#ecctrl-virtual-button") as HTMLElement;

      act(() => {
        fireEvent.pointerDown(wrapper);
        fireEvent.pointerLeave(wrapper);
      });

      const state = useButtonStore.getState();
      expect(state.buttons.jump).toBe(false);
    });

    it("should prevent context menu", () => {
      const { container } = render(<VirtualButton id="jump" />);
      const wrapper = container.querySelector("#ecctrl-virtual-button") as HTMLElement;

      const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      wrapper.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should handle multiple pointer down/up cycles", () => {
      const { container } = render(<VirtualButton id="jump" />);
      const wrapper = container.querySelector("#ecctrl-virtual-button") as HTMLElement;

      act(() => {
        fireEvent.pointerDown(wrapper);
        fireEvent.pointerUp(wrapper);
        fireEvent.pointerDown(wrapper);
        fireEvent.pointerUp(wrapper);
        fireEvent.pointerDown(wrapper);
      });

      const state = useButtonStore.getState();
      expect(state.buttons.jump).toBe(true);
    });
  });

  describe("multiple buttons", () => {
    it("should handle multiple buttons independently", () => {
      const { container: container1 } = render(<VirtualButton id="jump" />);
      const { container: container2 } = render(<VirtualButton id="run" />);

      const jumpButton = container1.querySelector("#ecctrl-virtual-button") as HTMLElement;
      const runButton = container2.querySelector("#ecctrl-virtual-button") as HTMLElement;

      act(() => {
        fireEvent.pointerDown(jumpButton);
        fireEvent.pointerDown(runButton);
      });

      const state = useButtonStore.getState();
      expect(state.buttons.jump).toBe(true);
      expect(state.buttons.run).toBe(true);

      act(() => {
        fireEvent.pointerUp(jumpButton);
      });

      const state2 = useButtonStore.getState();
      expect(state2.buttons.jump).toBe(false);
      expect(state2.buttons.run).toBe(true);
    });

    it("should handle same button ID in multiple instances", () => {
      const { container: container1 } = render(<VirtualButton id="jump" />);
      const { container: container2 } = render(<VirtualButton id="jump" />);

      const button1 = container1.querySelector("#ecctrl-virtual-button") as HTMLElement;
      const button2 = container2.querySelector("#ecctrl-virtual-button") as HTMLElement;

      act(() => {
        fireEvent.pointerDown(button1);
      });

      expect(useButtonStore.getState().buttons.jump).toBe(true);

      act(() => {
        fireEvent.pointerDown(button2);
      });

      expect(useButtonStore.getState().buttons.jump).toBe(true);
    });
  });

  describe("cleanup", () => {
    it("should reset all buttons on unmount", () => {
      const { unmount } = render(<VirtualButton id="jump" />);

      // Set button active
      act(() => {
        useButtonStore.getState().setButtonActive("jump", true);
        useButtonStore.getState().setButtonActive("run", true);
      });

      expect(Object.keys(useButtonStore.getState().buttons)).toHaveLength(2);

      // Unmount component
      act(() => {
        unmount();
      });

      // All buttons should be reset
      const state = useButtonStore.getState();
      expect(state.buttons).toEqual({});
    });
  });

  describe("default styles", () => {
    it("should apply default wrapper styles", () => {
      const { container } = render(<VirtualButton id="jump" />);
      const wrapper = container.querySelector("#ecctrl-virtual-button") as HTMLElement;
      expect(wrapper.style.position).toBe("fixed");
      expect(wrapper.style.zIndex).toBe("10");
      expect(wrapper.style.borderRadius).toBe("50%");
    });

    it("should apply default cap styles", () => {
      const { container } = render(<VirtualButton id="jump" />);
      const cap = container.querySelector("#virtual-button-cap") as HTMLElement;
      expect(cap.style.position).toBe("absolute");
      expect(cap.style.borderRadius).toBe("50%");
      expect(cap.style.pointerEvents).toBe("none");
    });
  });

  describe("style merging", () => {
    it("should merge custom wrapper styles with defaults", () => {
      const customStyle = { backgroundColor: "green" };
      const { container } = render(<VirtualButton id="jump" buttonWrapperStyle={customStyle} />);
      const wrapper = container.querySelector("#ecctrl-virtual-button") as HTMLElement;
      expect(wrapper.style.backgroundColor).toBe("green");
      expect(wrapper.style.position).toBe("fixed"); // Default
    });

    it("should allow overriding default styles", () => {
      const customStyle = { position: "absolute" as const, zIndex: "99" };
      const { container } = render(<VirtualButton id="jump" buttonWrapperStyle={customStyle} />);
      const wrapper = container.querySelector("#ecctrl-virtual-button") as HTMLElement;
      expect(wrapper.style.position).toBe("absolute"); // Overridden
      expect(wrapper.style.zIndex).toBe("99"); // Overridden
    });
  });

  describe("button IDs", () => {
    it("should handle different button IDs", () => {
      const ids = ["jump", "run", "crouch", "attack", "defend"];

      for (const id of ids) {
        const { container } = render(<VirtualButton id={id} />);
        const wrapper = container.querySelector("#ecctrl-virtual-button") as HTMLElement;

        act(() => {
          fireEvent.pointerDown(wrapper);
        });

        expect(useButtonStore.getState().buttons[id]).toBe(true);
      }
    });

    it("should handle button IDs with special characters", () => {
      const { container } = render(<VirtualButton id="button-1" />);
      const wrapper = container.querySelector("#ecctrl-virtual-button") as HTMLElement;

      act(() => {
        fireEvent.pointerDown(wrapper);
      });

      expect(useButtonStore.getState().buttons["button-1"]).toBe(true);
    });
  });

  describe("event propagation", () => {
    it("should stop propagation on pointer down", () => {
      const { container } = render(<VirtualButton id="jump" />);
      const wrapper = container.querySelector("#ecctrl-virtual-button") as HTMLElement;

      const event = new PointerEvent("pointerdown", { bubbles: true, cancelable: true });
      const stopPropagationSpy = vi.spyOn(event, "stopPropagation");
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      wrapper.dispatchEvent(event);
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});
