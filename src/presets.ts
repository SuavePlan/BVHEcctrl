/*!
 * BVHEcctrl
 * https://github.com/pmndrs/BVHEcctrl
 * (c) 2025 @ErdongChen-Andrew
 * Released under the MIT License.
 */

import type { EcctrlProps } from "./BVHEcctrl";

/**
 * Predefined configuration presets for common game types
 * These presets provide optimized settings for different gameplay styles
 *
 * @example
 * import { PRESETS } from 'bvhecctrl';
 *
 * <BVHEcctrl {...PRESETS.FPS_SHOOTER}>
 *   <YourCharacter />
 * </BVHEcctrl>
 */

/**
 * First-Person Shooter preset
 * - Fast movement and quick turning
 * - Low jump height for tactical gameplay
 * - Responsive controls for competitive play
 */
export const FPS_SHOOTER: Partial<EcctrlProps> = {
  maxWalkSpeed: 5,
  maxRunSpeed: 7,
  turnSpeed: 20,
  jumpVel: 4,
  acceleration: 40,
  deceleration: 25,
  gravity: 9.81,
} as const;

/**
 * Third-Person Action/Adventure preset
 * - Moderate movement speed
 * - Smooth character rotation
 * - Balanced for exploration and combat
 */
export const ACTION_ADVENTURE: Partial<EcctrlProps> = {
  maxWalkSpeed: 3.5,
  maxRunSpeed: 5.5,
  turnSpeed: 15,
  jumpVel: 5,
  acceleration: 30,
  deceleration: 20,
  gravity: 9.81,
} as const;

/**
 * Platformer preset
 * - Precise movement control
 * - High jump for platforming
 * - Increased gravity for responsive falling
 */
export const PLATFORMER: Partial<EcctrlProps> = {
  maxWalkSpeed: 4,
  maxRunSpeed: 6,
  turnSpeed: 25,
  jumpVel: 8,
  acceleration: 35,
  deceleration: 30,
  gravity: 15,
  fallGravityFactor: 5,
  maxFallSpeed: 60,
} as const;

/**
 * RPG/Open World preset
 * - Slower, more deliberate movement
 * - Smooth controls
 * - Emphasis on immersion over responsiveness
 */
export const RPG: Partial<EcctrlProps> = {
  maxWalkSpeed: 2.5,
  maxRunSpeed: 4.5,
  turnSpeed: 10,
  jumpVel: 4.5,
  acceleration: 20,
  deceleration: 15,
  gravity: 9.81,
} as const;

/**
 * Survival/Horror preset
 * - Slow, tense movement
 * - Limited mobility for atmosphere
 * - Heavy feel for tension
 */
export const SURVIVAL_HORROR: Partial<EcctrlProps> = {
  maxWalkSpeed: 2,
  maxRunSpeed: 3.5,
  turnSpeed: 8,
  jumpVel: 3,
  acceleration: 15,
  deceleration: 12,
  gravity: 9.81,
} as const;

/**
 * Racing/Sports preset
 * - Very fast movement
 * - Quick directional changes
 * - Minimal jump (if needed)
 */
export const RACING: Partial<EcctrlProps> = {
  maxWalkSpeed: 8,
  maxRunSpeed: 12,
  turnSpeed: 30,
  jumpVel: 2,
  acceleration: 50,
  deceleration: 35,
  gravity: 9.81,
} as const;

/**
 * Stealth preset
 * - Very slow movement
 * - Precise control for sneaking
 * - Low acceleration for careful positioning
 */
export const STEALTH: Partial<EcctrlProps> = {
  maxWalkSpeed: 1.5,
  maxRunSpeed: 3,
  turnSpeed: 12,
  jumpVel: 3.5,
  acceleration: 18,
  deceleration: 20,
  gravity: 9.81,
} as const;

/**
 * All available presets in a single object for easy access
 */
export const PRESETS = {
  FPS_SHOOTER,
  ACTION_ADVENTURE,
  PLATFORMER,
  RPG,
  SURVIVAL_HORROR,
  RACING,
  STEALTH,
} as const;

/**
 * Helper function to merge a preset with custom overrides
 *
 * @example
 * const customConfig = mergePreset(PRESETS.FPS_SHOOTER, {
 *   maxRunSpeed: 10, // Override specific values
 *   gravity: 15
 * });
 *
 * <BVHEcctrl {...customConfig}>
 *   <YourCharacter />
 * </BVHEcctrl>
 */
export function mergePreset(
  preset: Partial<EcctrlProps>,
  overrides: Partial<EcctrlProps>
): Partial<EcctrlProps> {
  return { ...preset, ...overrides };
}
