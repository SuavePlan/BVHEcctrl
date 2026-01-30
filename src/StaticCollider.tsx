/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import { useHelper } from "@react-three/drei";
import React, { useEffect, useRef, type ReactNode, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import {
  MeshBVHHelper,
  SAH,
  type SplitStrategy,
  StaticGeometryGenerator,
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from "three-mesh-bvh";
import { useEcctrlStore } from "./stores/useEcctrlStore";

export interface StaticColliderProps extends Omit<React.ComponentProps<"group">, "ref"> {
  children?: ReactNode;
  debug?: boolean;
  debugVisualizeDepth?: number;
  bvhName?: string;
  restitution?: number;
  friction?: number;
  excludeFloatHit?: boolean;
  excludeCollisionCheck?: boolean;
  BVHOptions?: {
    strategy?: SplitStrategy;
    verbose?: boolean;
    setBoundingBox?: boolean;
    maxDepth?: number;
    maxLeafTris?: number;
    indirect?: boolean;
  };
}

const StaticCollider = forwardRef<THREE.Group, StaticColliderProps>(
  (
    {
      children,
      debug = false,
      debugVisualizeDepth = 10,
      bvhName = "",
      restitution = 0.05,
      friction = 0.8,
      excludeFloatHit = false,
      excludeCollisionCheck = false,
      BVHOptions = {
        strategy: SAH,
        verbose: false,
        setBoundingBox: true,
        maxDepth: 40,
        maxLeafTris: 10,
        indirect: false,
      },
      ...props
    },
    ref
  ) => {
    /**
     * Initialize setups
     */
    const mergedMesh = useRef<THREE.Mesh | null>(null);
    // const colliderRef = (ref as RefObject<THREE.Group>) ?? useRef<THREE.Group | null>(null);
    const colliderRef = useRef<THREE.Group | null>(null);
    useImperativeHandle(ref, () => colliderRef.current as THREE.Group, []);

    /**
     * Generate merged static geometry and BVH tree for collision detection
     */
    useEffect(() => {
      // Exit if colliderRef.current if not ready
      if (!colliderRef.current) return;
      // Recalculate the world matrix of the object and descendants on the current frame
      colliderRef.current.updateMatrixWorld(true);

      // Retrieve meshes from colliderRef.current
      const meshes: THREE.Mesh[] = [];
      // colliderRef.current.traverse(obj => { if ((obj as THREE.Mesh).isMesh) meshes.push(obj as THREE.Mesh); });
      colliderRef.current.traverse((obj) => {
        if (!("isMesh" in obj && (obj as THREE.Mesh).isMesh)) return;
        const mesh = obj as THREE.Mesh;
        const geometry = mesh.geometry;

        // Skip if missing required attributes
        const position = geometry.getAttribute("position");
        const normal = geometry.getAttribute("normal");
        if (!position || !normal) return;
        // Clone and convert to non-indexed
        const geom = geometry.index ? geometry.toNonIndexed() : geometry.clone();

        // Strip everything except position and normal and apply matrix transform
        const cleanGeom = new THREE.BufferGeometry();
        cleanGeom.setAttribute("position", geom.getAttribute("position").clone());
        cleanGeom.setAttribute("normal", geom.getAttribute("normal").clone());
        cleanGeom.applyMatrix4(mesh.matrixWorld);

        meshes.push(new THREE.Mesh(cleanGeom));
      });

      // Early exit if no compatible meshes
      if (meshes.length === 0) {
        console.warn("No compatible meshes found for static geometry generation.");
        return;
      }

      // Generate static geometry from mesh array
      const staticGenerator = new StaticGeometryGenerator(meshes);
      staticGenerator.attributes = ["position", "normal"];
      const mergedGeometry = staticGenerator.generate();

      // Create boundsTree and mesh from static geometry
      (mergedGeometry as unknown as {computeBoundsTree: typeof computeBoundsTree; disposeBoundsTree: typeof disposeBoundsTree}).computeBoundsTree = computeBoundsTree;
      (mergedGeometry as unknown as {computeBoundsTree: typeof computeBoundsTree; disposeBoundsTree: typeof disposeBoundsTree}).disposeBoundsTree = disposeBoundsTree;
      (mergedGeometry as unknown as {computeBoundsTree: typeof computeBoundsTree}).computeBoundsTree(BVHOptions);
      mergedMesh.current = new THREE.Mesh(mergedGeometry);
      mergedMesh.current.raycast = acceleratedRaycast;
      // Preset merged mesh user data
      mergedMesh.current.name = bvhName;
      mergedMesh.current.userData = { restitution, friction, excludeFloatHit, excludeCollisionCheck, type: "STATIC" };

      // Save the merged mesh to globle store
      // Character can retrieve and collider with merged mesh later
      useEcctrlStore.getState().setColliderMeshesArray(mergedMesh.current);

      // Clean up geometry/boundsTree/mesh/bvhHelper
      return () => {
        if (mergedMesh.current) {
          useEcctrlStore.getState().removeColliderMesh(mergedMesh.current);
          mergedMesh.current.geometry.disposeBoundsTree?.();
          mergedMesh.current.geometry.dispose();
          if (Array.isArray(mergedMesh.current.material)) {
            for (const mat of mergedMesh.current.material) {
              mat.dispose();
            }
          } else {
            mergedMesh.current.material.dispose();
          }
          mergedMesh.current.raycast = THREE.Mesh.prototype.raycast;
        }
        for (const m of meshes) {
          m.raycast = THREE.Mesh.prototype.raycast;
          m.geometry.dispose();
          if (Array.isArray(m.material)) {
            for (const mat of m.material) {
              mat.dispose();
            }
          } else {
            m.material.dispose();
          }
        }
      };
    }, [BVHOptions, bvhName, restitution, friction, excludeFloatHit, excludeCollisionCheck]);

    /**
     * Update merged mesh properties and user data
     */
    useEffect(() => {
      if (mergedMesh.current) {
        mergedMesh.current.visible = props.visible ?? true;
        mergedMesh.current.name = bvhName;
        mergedMesh.current.userData.friction = friction;
        mergedMesh.current.userData.restitution = restitution;
        mergedMesh.current.userData.excludeFloatHit = excludeFloatHit;
        mergedMesh.current.userData.excludeCollisionCheck = excludeCollisionCheck;
      }
    }, [props.visible, bvhName, friction, restitution, excludeFloatHit, excludeCollisionCheck]);

    /**
     * Update BVH debug helper
     */
    // @ts-expect-error - MeshBVHHelper type incompatibility with drei's useHelper
    useHelper(debug && (mergedMesh as React.MutableRefObject<THREE.Object3D>), MeshBVHHelper);

    return (
      <group ref={colliderRef} {...props} dispose={null}>
        {/* Static collider model */}
        {children}
      </group>
    );
  }
);

export default React.memo(StaticCollider);
