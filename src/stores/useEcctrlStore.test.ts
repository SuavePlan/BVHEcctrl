/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import { act } from "@testing-library/react";
import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";
import { useEcctrlStore } from "./useEcctrlStore";

describe("useEcctrlStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useEcctrlStore.setState({ colliderMeshesArray: [] });
    });
  });

  describe("initial state", () => {
    it("should have empty colliderMeshesArray initially", () => {
      const state = useEcctrlStore.getState();
      expect(state.colliderMeshesArray).toEqual([]);
    });

    it("should have setColliderMeshesArray function", () => {
      const state = useEcctrlStore.getState();
      expect(typeof state.setColliderMeshesArray).toBe("function");
    });

    it("should have removeColliderMesh function", () => {
      const state = useEcctrlStore.getState();
      expect(typeof state.removeColliderMesh).toBe("function");
    });
  });

  describe("setColliderMeshesArray", () => {
    it("should add a mesh to the array", () => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());

      act(() => {
        useEcctrlStore.getState().setColliderMeshesArray(mesh);
      });

      const state = useEcctrlStore.getState();
      expect(state.colliderMeshesArray).toHaveLength(1);
      expect(state.colliderMeshesArray[0]).toBe(mesh);
    });

    it("should add multiple different meshes", () => {
      const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
      const mesh2 = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());

      act(() => {
        useEcctrlStore.getState().setColliderMeshesArray(mesh1);
        useEcctrlStore.getState().setColliderMeshesArray(mesh2);
      });

      const state = useEcctrlStore.getState();
      expect(state.colliderMeshesArray).toHaveLength(2);
      expect(state.colliderMeshesArray[0]).toBe(mesh1);
      expect(state.colliderMeshesArray[1]).toBe(mesh2);
    });

    it("should not add duplicate meshes", () => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());

      act(() => {
        useEcctrlStore.getState().setColliderMeshesArray(mesh);
        useEcctrlStore.getState().setColliderMeshesArray(mesh); // Try to add same mesh again
      });

      const state = useEcctrlStore.getState();
      expect(state.colliderMeshesArray).toHaveLength(1);
      expect(state.colliderMeshesArray[0]).toBe(mesh);
    });

    it("should maintain array order when adding meshes", () => {
      const mesh1 = new THREE.Mesh();
      const mesh2 = new THREE.Mesh();
      const mesh3 = new THREE.Mesh();

      act(() => {
        useEcctrlStore.getState().setColliderMeshesArray(mesh1);
        useEcctrlStore.getState().setColliderMeshesArray(mesh2);
        useEcctrlStore.getState().setColliderMeshesArray(mesh3);
      });

      const state = useEcctrlStore.getState();
      expect(state.colliderMeshesArray).toEqual([mesh1, mesh2, mesh3]);
    });
  });

  describe("removeColliderMesh", () => {
    it("should remove a mesh from the array", () => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());

      act(() => {
        useEcctrlStore.getState().setColliderMeshesArray(mesh);
      });

      expect(useEcctrlStore.getState().colliderMeshesArray).toHaveLength(1);

      act(() => {
        useEcctrlStore.getState().removeColliderMesh(mesh);
      });

      const state = useEcctrlStore.getState();
      expect(state.colliderMeshesArray).toHaveLength(0);
    });

    it("should remove only the specified mesh", () => {
      const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
      const mesh2 = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
      const mesh3 = new THREE.Mesh(new THREE.CylinderGeometry(), new THREE.MeshBasicMaterial());

      act(() => {
        useEcctrlStore.getState().setColliderMeshesArray(mesh1);
        useEcctrlStore.getState().setColliderMeshesArray(mesh2);
        useEcctrlStore.getState().setColliderMeshesArray(mesh3);
      });

      act(() => {
        useEcctrlStore.getState().removeColliderMesh(mesh2);
      });

      const state = useEcctrlStore.getState();
      expect(state.colliderMeshesArray).toHaveLength(2);
      expect(state.colliderMeshesArray).toContain(mesh1);
      expect(state.colliderMeshesArray).toContain(mesh3);
      expect(state.colliderMeshesArray).not.toContain(mesh2);
    });

    it("should handle removing a mesh that doesn't exist", () => {
      const mesh1 = new THREE.Mesh();
      const mesh2 = new THREE.Mesh();

      act(() => {
        useEcctrlStore.getState().setColliderMeshesArray(mesh1);
      });

      act(() => {
        useEcctrlStore.getState().removeColliderMesh(mesh2); // Remove mesh that was never added
      });

      const state = useEcctrlStore.getState();
      expect(state.colliderMeshesArray).toHaveLength(1);
      expect(state.colliderMeshesArray[0]).toBe(mesh1);
    });

    it("should handle removing from empty array", () => {
      const mesh = new THREE.Mesh();

      act(() => {
        useEcctrlStore.getState().removeColliderMesh(mesh);
      });

      const state = useEcctrlStore.getState();
      expect(state.colliderMeshesArray).toHaveLength(0);
    });
  });

  describe("integration scenarios", () => {
    it("should handle add/remove/add sequence correctly", () => {
      const mesh = new THREE.Mesh();

      act(() => {
        useEcctrlStore.getState().setColliderMeshesArray(mesh);
      });
      expect(useEcctrlStore.getState().colliderMeshesArray).toHaveLength(1);

      act(() => {
        useEcctrlStore.getState().removeColliderMesh(mesh);
      });
      expect(useEcctrlStore.getState().colliderMeshesArray).toHaveLength(0);

      act(() => {
        useEcctrlStore.getState().setColliderMeshesArray(mesh);
      });
      expect(useEcctrlStore.getState().colliderMeshesArray).toHaveLength(1);
    });

    it("should handle multiple operations in batch", () => {
      const meshes = [new THREE.Mesh(), new THREE.Mesh(), new THREE.Mesh(), new THREE.Mesh()];

      act(() => {
        for (const mesh of meshes) {
          useEcctrlStore.getState().setColliderMeshesArray(mesh);
        }
      });
      expect(useEcctrlStore.getState().colliderMeshesArray).toHaveLength(4);

      act(() => {
        useEcctrlStore.getState().removeColliderMesh(meshes[1]);
        useEcctrlStore.getState().removeColliderMesh(meshes[3]);
      });

      const state = useEcctrlStore.getState();
      expect(state.colliderMeshesArray).toHaveLength(2);
      expect(state.colliderMeshesArray).toContain(meshes[0]);
      expect(state.colliderMeshesArray).toContain(meshes[2]);
    });
  });
});
