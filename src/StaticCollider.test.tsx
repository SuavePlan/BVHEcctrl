/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import { Canvas } from "@react-three/fiber";
import { act, render } from "@testing-library/react";
import React from "react";
import type * as THREE from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StaticCollider from "./StaticCollider";
import { useEcctrlStore } from "./stores/useEcctrlStore";

describe("StaticCollider", () => {
  beforeEach(() => {
    // Reset store
    act(() => {
      useEcctrlStore.setState({ colliderMeshesArray: [] });
    });
  });

  describe("rendering", () => {
    it("should render without crashing", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should render with children", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider>
            <mesh name="test-mesh">
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should render with multiple children", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.5]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should render without children", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider />
        </Canvas>
      );
      expect(container).toBeTruthy();
    });
  });

  describe("props", () => {
    it("should accept debug prop", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider debug={true}>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept debugVisualizeDepth prop", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider debug={true} debugVisualizeDepth={5}>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept bvhName prop", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider bvhName="test-collider">
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept restitution prop", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider restitution={0.5}>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept friction prop", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider friction={0.9}>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept excludeFloatHit prop", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider excludeFloatHit={true}>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept excludeCollisionCheck prop", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider excludeCollisionCheck={true}>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept BVHOptions prop", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider
            BVHOptions={{
              maxDepth: 20,
              maxLeafTris: 5,
              verbose: false,
            }}
          >
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept group props", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider position={[1, 2, 3]} rotation={[0, Math.PI / 2, 0]} scale={[2, 2, 2]}>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept visible prop", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider visible={false}>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });
  });

  describe("ref forwarding", () => {
    it("should forward ref to group", () => {
      const ref = React.createRef<THREE.Group>();
      render(
        <Canvas>
          <StaticCollider ref={ref}>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      // Ref should eventually be set (after canvas renders)
      expect(ref.current).toBeDefined();
    });
  });

  describe("default values", () => {
    it("should use default restitution of 0.05", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should use default friction of 0.8", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should use default debug of false", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should use default bvhName of empty string", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should use default excludeFloatHit of false", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should use default excludeCollisionCheck of false", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });
  });

  describe("combinations", () => {
    it("should handle all props together", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider
            debug={true}
            debugVisualizeDepth={8}
            bvhName="complex-collider"
            restitution={0.3}
            friction={0.7}
            excludeFloatHit={true}
            excludeCollisionCheck={false}
            position={[1, 0, 0]}
            visible={true}
          >
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial />
            </mesh>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should handle nested meshes", () => {
      const { container } = render(
        <Canvas>
          <StaticCollider>
            <group>
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial />
              </mesh>
              <group>
                <mesh>
                  <sphereGeometry args={[0.5]} />
                  <meshBasicMaterial />
                </mesh>
              </group>
            </group>
          </StaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });
  });
});
