/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

/**
 * Performance statistics for character controller
 */
export interface PerformanceStats {
  /** Frames per second */
  fps: number;
  /** Average frame time in milliseconds */
  frameTime: number;
  /** Maximum frame time in the last second */
  maxFrameTime: number;
  /** Minimum frame time in the last second */
  minFrameTime: number;
  /** Number of performance warnings triggered */
  warnings: number;
}

/**
 * Options for performance monitoring
 */
export interface PerformanceMonitorOptions {
  /** Enable console warnings when frame time exceeds threshold */
  warnOnSlowFrames?: boolean;
  /** Frame time threshold in ms (default: 16.67ms = 60fps) */
  warningThreshold?: number;
  /** Sample size for averaging (default: 60 frames) */
  sampleSize?: number;
  /** Callback when performance degrades */
  onWarning?: (stats: PerformanceStats) => void;
}

/**
 * Hook to monitor character controller performance
 *
 * Tracks FPS, frame times, and detects performance issues
 *
 * @example
 * function MyScene() {
 *   const stats = usePerformanceMonitor({
 *     warnOnSlowFrames: true,
 *     warningThreshold: 20, // Warn if frame takes >20ms
 *     onWarning: (stats) => {
 *       console.warn('Performance issue:', stats);
 *     }
 *   });
 *
 *   return (
 *     <>
 *       <BVHEcctrl>...</BVHEcctrl>
 *       <PerformanceOverlay stats={stats} />
 *     </>
 *   );
 * }
 */
export function usePerformanceMonitor(
  options: PerformanceMonitorOptions = {}
): PerformanceStats {
  const {
    warnOnSlowFrames = false,
    warningThreshold = 16.67,
    sampleSize = 60,
    onWarning,
  } = options;

  const frameTimesRef = useRef<number[]>([]);
  const warningCountRef = useRef(0);
  const statsRef = useRef<PerformanceStats>({
    fps: 60,
    frameTime: 16.67,
    maxFrameTime: 16.67,
    minFrameTime: 16.67,
    warnings: 0,
  });

  useFrame((_, delta) => {
    const frameTimeMs = delta * 1000;

    // Add to sample buffer
    frameTimesRef.current.push(frameTimeMs);
    if (frameTimesRef.current.length > sampleSize) {
      frameTimesRef.current.shift();
    }

    // Calculate statistics
    const avgFrameTime =
      frameTimesRef.current.reduce((a, b) => a + b, 0) /
      frameTimesRef.current.length;
    const maxFrameTime = Math.max(...frameTimesRef.current);
    const minFrameTime = Math.min(...frameTimesRef.current);
    const fps = 1000 / avgFrameTime;

    // Update stats
    statsRef.current = {
      fps,
      frameTime: avgFrameTime,
      maxFrameTime,
      minFrameTime,
      warnings: warningCountRef.current,
    };

    // Check for performance warnings
    if (warnOnSlowFrames && frameTimeMs > warningThreshold) {
      warningCountRef.current++;
      if (onWarning) {
        onWarning(statsRef.current);
      }
      console.warn(
        `Performance degradation detected: ${frameTimeMs.toFixed(2)}ms/frame (${fps.toFixed(1)} FPS)`
      );
    }
  });

  return statsRef.current;
}

/**
 * Calculate memory usage statistics (if available)
 *
 * @returns Memory statistics or null if not supported
 */
export function getMemoryStats(): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
} | null {
  if ("memory" in performance && (performance as any).memory) {
    const mem = (performance as any).memory;
    return {
      usedJSHeapSize: mem.usedJSHeapSize,
      totalJSHeapSize: mem.totalJSHeapSize,
      jsHeapSizeLimit: mem.jsHeapSizeLimit,
    };
  }
  return null;
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}
