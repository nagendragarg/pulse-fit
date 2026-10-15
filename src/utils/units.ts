/**
 * Biometric unit conversion utilities
 */

export interface FeetAndInches {
  feet: number;
  inches: number;
  totalInches: number;
}

/**
 * Convert centimeters to feet and inches, as well as total inches
 */
export function cmToFeetAndInches(cm: number): FeetAndInches {
  const totalInchesRaw = cm / 2.54;
  const totalInches = Number(totalInchesRaw.toFixed(1));
  let feet = Math.floor(totalInchesRaw / 12);
  let inches = Math.round(totalInchesRaw - feet * 12);

  if (inches >= 12) {
    feet += 1;
    inches = 0;
  }

  return {
    feet,
    inches,
    totalInches,
  };
}

/**
 * Format height as a readable string with cm and imperial (ft'in" / total inches)
 */
export function formatHeightWithInches(cm: number): string {
  if (!cm || isNaN(cm)) return '0 cm';
  const { feet, inches, totalInches } = cmToFeetAndInches(cm);
  return `${cm} cm (${feet}'${inches}" / ${totalInches}")`;
}

/**
 * Convert feet and inches to centimeters (rounded to nearest integer)
 */
export function feetAndInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return Math.max(50, Math.min(250, Math.round(totalInches * 2.54)));
}

/**
 * Convert total inches to centimeters
 */
export function inchesToCm(inches: number): number {
  return Math.max(50, Math.min(250, Math.round(inches * 2.54)));
}

/**
 * Convert kg to lbs
 */
export function kgToLbs(kg: number): number {
  return Number((kg * 2.20462).toFixed(1));
}

/**
 * Convert lbs to kg
 */
export function lbsToKg(lbs: number): number {
  return Number((lbs / 2.20462).toFixed(1));
}
