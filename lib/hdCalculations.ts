/**
 * Human Design Transit Calculations
 * Based on hdkit by Jonah Dempcy (MIT License)
 * Ported to TypeScript for use with Swiss Ephemeris
 */

// The 64 gates in their specific order (starting at 02° Aquarius)
const GATES = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8,
  20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6,
  46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
];

export interface HDActivation {
  gate: number;
  line: number;
  color: number;
  tone: number;
  base: number;
}

export interface PlanetaryTransits {
  sun: HDActivation;
  earth: HDActivation;
  moon: HDActivation;
  northNode: HDActivation;
  southNode: HDActivation;
  mercury: HDActivation;
  venus: HDActivation;
  mars: HDActivation;
  jupiter: HDActivation;
  saturn: HDActivation;
  uranus: HDActivation;
  neptune: HDActivation;
  pluto: HDActivation;
}

/**
 * Convert celestial position (0-360°) to Human Design activation
 * @param position Celestial longitude in degrees (0-360)
 * @returns HDActivation with gate, line, color, tone, and base
 */
export function calculateActivation(position: number): HDActivation {
  // Human Design gates start at Gate 41 at 02°00'00" Aquarius
  // We need to adjust from 00°00'00" Aries (standard zodiac)
  // The distance is 58°00'00" exactly
  let adjustedPosition = position + 58;
  if (adjustedPosition > 360) {
    adjustedPosition -= 360;
  }

  // Calculate percentage through the wheel
  const percentage = adjustedPosition / 360.0;

  // Gate (64 total)
  const gateIndex = Math.floor(percentage * 64);
  const gate = GATES[gateIndex];

  // Line (6 per gate = 384 total)
  const exactLine = 384 * percentage;
  const line = Math.floor(exactLine % 6) + 1;

  // Color (6 per line = 2,304 total)
  const exactColor = 2304 * percentage;
  const color = Math.floor(exactColor % 6) + 1;

  // Tone (6 per color = 13,824 total)
  const exactTone = 13824 * percentage;
  const tone = Math.floor(exactTone % 6) + 1;

  // Base (5 per tone = 69,120 total)
  const exactBase = 69120 * percentage;
  const base = Math.floor(exactBase % 5) + 1;

  return { gate, line, color, tone, base };
}

/**
 * Get the opposite gate (180° across the wheel)
 * @param gate Gate number (1-64)
 * @returns Opposite gate number
 */
export function oppositeGate(gate: number): number {
  const index = GATES.indexOf(gate);
  const oppositeIndex = (index + 32) % GATES.length;
  return GATES[oppositeIndex];
}

/**
 * Format an activation as a string (e.g., "41.3.2.4.1")
 * @param activation HDActivation object
 * @param depth How deep to show (gate=1, line=2, color=3, tone=4, base=5)
 * @returns Formatted string
 */
export function formatActivation(activation: HDActivation, depth: number = 2): string {
  const parts = [
    activation.gate,
    activation.line,
    activation.color,
    activation.tone,
    activation.base
  ];
  return parts.slice(0, depth).join('.');
}

/**
 * Get planet name for display
 */
export function getPlanetName(key: keyof PlanetaryTransits): string {
  const names: Record<keyof PlanetaryTransits, string> = {
    sun: 'Sun',
    earth: 'Earth',
    moon: 'Moon',
    northNode: 'North Node',
    southNode: 'South Node',
    mercury: 'Mercury',
    venus: 'Venus',
    mars: 'Mars',
    jupiter: 'Jupiter',
    saturn: 'Saturn',
    uranus: 'Uranus',
    neptune: 'Neptune',
    pluto: 'Pluto'
  };
  return names[key];
}
