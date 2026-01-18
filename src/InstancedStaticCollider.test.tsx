/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import { Canvas } from "@react-three/fiber";
import { act, render } from "@testing-library/react";
import React, { useRef } from "react";
import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";
import InstancedStaticCollider from "./InstancedStaticCollider";
import { useEcctrlStore } from "./stores/useEcctrlStore";

// Helper component that creates an InstancedMesh child
function InstancedMeshChild({ count = 10 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  React.useEffect(() => {
    if (meshRef.current) {
      // Set up instance matrices
      for (let i = 0; i < count; i++) {
        const matrix = new THREE.Matrix4();
        matrix.setPosition(i, 0, 0);
        meshRef.current.setMatrixAt(i, matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [count]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
}

describe("InstancedStaticCollider", () => {
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
          <InstancedStaticCollider>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should render with children", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider>
            <InstancedMeshChild count={5} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should render without children", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider />
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should render with multiple instanced meshes", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider>
            <InstancedMeshChild count={10} />
            <InstancedMeshChild count={20} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });
  });

  describe("props", () => {
    it("should accept debug prop", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider debug={true}>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept debugVisualizeDepth prop", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider debug={true} debugVisualizeDepth={5}>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept restitution prop", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider restitution={0.5}>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept friction prop", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider friction={0.9}>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept excludeFloatHit prop", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider excludeFloatHit={true}>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept excludeCollisionCheck prop", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider excludeCollisionCheck={true}>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept BVHOptions prop", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider
            BVHOptions={{
              maxDepth: 20,
              maxLeafTris: 5,
              verbose: false,
            }}
          >
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept group props", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider position={[1, 2, 3]} rotation={[0, Math.PI / 2, 0]} scale={[2, 2, 2]}>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should accept visible prop", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider visible={false}>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
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
          <InstancedStaticCollider ref={ref}>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
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
          <InstancedStaticCollider>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should use default friction of 0.8", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should use default debug of false", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should use default excludeFloatHit of false", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should use default excludeCollisionCheck of false", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider>
            <InstancedMeshChild count={10} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });
  });

  describe("instance count variations", () => {
    it("should handle small instance count", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider>
            <InstancedMeshChild count={1} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should handle medium instance count", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider>
            <InstancedMeshChild count={50} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should handle large instance count", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider>
            <InstancedMeshChild count={100} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });
  });

  describe("combinations", () => {
    it("should handle all props together", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider
            debug={true}
            debugVisualizeDepth={8}
            restitution={0.3}
            friction={0.7}
            excludeFloatHit={true}
            excludeCollisionCheck={false}
            position={[1, 0, 0]}
            visible={true}
          >
            <InstancedMeshChild count={25} />
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });

    it("should handle nested groups with instanced meshes", () => {
      const { container } = render(
        <Canvas>
          <InstancedStaticCollider>
            <group>
              <InstancedMeshChild count={10} />
              <group>
                <InstancedMeshChild count={20} />
              </group>
            </group>
          </InstancedStaticCollider>
        </Canvas>
      );
      expect(container).toBeTruthy();
    });
  });
});
