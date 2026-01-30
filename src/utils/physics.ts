/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

/**
 * Physics utility functions for character movement and collision
 *
 * These functions are extracted for testability and reusability
 */

/**
 * Calculate jump velocity required to reach a specific height
 *
 * Uses the physics formula: v = √(2 * g * h)
 *
 * @param jumpHeight - Desired jump height in world units
 * @param gravity - Gravity acceleration (default: 9.81)
 * @returns Initial velocity needed for jump
 *
 * @example
 * const jumpVel = calculateJumpVelocity(2, 9.81); // ~6.26 m/s
 */
export function calculateJumpVelocity(
  jumpHeight: number,
  gravity: number = 9.81
): number {
  if (jumpHeight <= 0) return 0;
  return Math.sqrt(2 * gravity * jumpHeight);
}

/**
 * Calculate maximum jump height from initial velocity
 *
 * Uses the physics formula: h = v² / (2 * g)
 *
 * @param jumpVelocity - Initial jump velocity
 * @param gravity - Gravity acceleration (default: 9.81)
 * @returns Maximum height reached
 *
 * @example
 * const maxHeight = calculateMaxJumpHeight(6.26, 9.81); // ~2.0 meters
 */
export function calculateMaxJumpHeight(
  jumpVelocity: number,
  gravity: number = 9.81
): number {
  if (jumpVelocity <= 0 || gravity <= 0) return 0;
  return (jumpVelocity * jumpVelocity) / (2 * gravity);
}

/**
 * Calculate time to reach peak of jump
 *
 * Uses the physics formula: t = v / g
 *
 * @param jumpVelocity - Initial jump velocity
 * @param gravity - Gravity acceleration
 * @returns Time to reach peak in seconds
 */
export function calculateJumpPeakTime(
  jumpVelocity: number,
  gravity: number = 9.81
): number {
  if (jumpVelocity <= 0 || gravity <= 0) return 0;
  return jumpVelocity / gravity;
}

/**
 * Calculate velocity after falling for a given time
 *
 * Uses the physics formula: v = v₀ + g * t
 *
 * @param initialVelocity - Initial velocity (usually 0 for free fall)
 * @param gravity - Gravity acceleration
 * @param time - Time spent falling
 * @returns Final velocity
 */
export function calculateFallVelocity(
  initialVelocity: number,
  gravity: number,
  time: number
): number {
  return initialVelocity + gravity * time;
}

/**
 * Clamp a value between min and max
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 *
 * @param start - Start value
 * @param end - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Smooth step interpolation (ease in/out)
 *
 * @param edge0 - Lower edge
 * @param edge1 - Upper edge
 * @param x - Value to interpolate
 * @returns Smoothed value
 */
export function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Calculate spring force for character movement
 *
 * Uses Hooke's Law: F = -k(x - x₀)
 *
 * @param currentPosition - Current position
 * @param targetPosition - Target position
 * @param springConstant - Spring stiffness (k)
 * @returns Spring force
 */
export function calculateSpringForce(
  currentPosition: number,
  targetPosition: number,
  springConstant: number
): number {
  return -springConstant * (currentPosition - targetPosition);
}

/**
 * Calculate damping force for smooth stopping
 *
 * Uses: F = -c * v
 *
 * @param velocity - Current velocity
 * @param dampingCoefficient - Damping coefficient (c)
 * @returns Damping force
 */
export function calculateDampingForce(
  velocity: number,
  dampingCoefficient: number
): number {
  return -dampingCoefficient * velocity;
}

/**
 * Convert angle from radians to degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Convert angle from degrees to radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a slope angle is walkable
 *
 * @param slopeAngle - Slope angle in radians
 * @param maxSlope - Maximum walkable slope in radians
 * @returns True if slope is walkable
 */
export function isWalkableSlope(
  slopeAngle: number,
  maxSlope: number
): boolean {
  return slopeAngle <= maxSlope;
}

/**
 * Calculate friction force based on normal force
 *
 * @param normalForce - Force perpendicular to surface
 * @param frictionCoefficient - Coefficient of friction (0-1)
 * @returns Friction force
 */
export function calculateFrictionForce(
  normalForce: number,
  frictionCoefficient: number
): number {
  return normalForce * clamp(frictionCoefficient, 0, 1);
}

/**
 * Calculate character acceleration from input
 *
 * @param inputStrength - Input strength (0-1)
 * @param maxAcceleration - Maximum acceleration
 * @param currentSpeed - Current movement speed
 * @param maxSpeed - Maximum allowed speed
 * @returns Acceleration value
 */
export function calculateAcceleration(
  inputStrength: number,
  maxAcceleration: number,
  currentSpeed: number,
  maxSpeed: number
): number {
  // Reduce acceleration as we approach max speed
  const speedRatio = currentSpeed / maxSpeed;
  const accelerationMultiplier = Math.max(0, 1 - speedRatio);
  return inputStrength * maxAcceleration * accelerationMultiplier;
}

/**
 * Apply velocity damping (for smooth deceleration)
 *
 * @param velocity - Current velocity
 * @param damping - Damping factor (0-1, where 1 = instant stop)
 * @param deltaTime - Time step
 * @returns Damped velocity
 */
export function applyVelocityDamping(
  velocity: number,
  damping: number,
  deltaTime: number
): number {
  const dampingFactor = 1 - clamp(damping, 0, 1);
  return velocity * dampingFactor ** deltaTime;
}
