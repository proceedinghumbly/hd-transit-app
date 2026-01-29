/**
 * Astronomy Engine wrapper for Human Design calculations
 */

import * as Astronomy from 'astronomy-engine';
import { calculateActivation, oppositeGate, type PlanetaryTransits, type HDActivation } from './hdCalculations';

/**
 * Calculate Human Design transits for a specific date/time
 * @param date JavaScript Date object
 * @returns PlanetaryTransits
 */
export function getTransitsForDate(date: Date): PlanetaryTransits {
  // Get ecliptic longitudes for all planets
  const sun = Astronomy.EclipticGeoMoon(date);
  const sunLon = Astronomy.SunPosition(date).elon;
  const moonLon = Astronomy.EclipticGeoMoon(date).lon;
  
  // For other planets, we need their heliocentric positions converted to geocentric ecliptic
  const mercuryLon = getEclipticLongitude(Astronomy.Body.Mercury, date);
  const venusLon = getEclipticLongitude(Astronomy.Body.Venus, date);
  const marsLon = getEclipticLongitude(Astronomy.Body.Mars, date);
  const jupiterLon = getEclipticLongitude(Astronomy.Body.Jupiter, date);
  const saturnLon = getEclipticLongitude(Astronomy.Body.Saturn, date);
  const uranusLon = getEclipticLongitude(Astronomy.Body.Uranus, date);
  const neptuneLon = getEclipticLongitude(Astronomy.Body.Neptune, date);
  const plutoLon = getEclipticLongitude(Astronomy.Body.Pluto, date);
  const northNodeLon = getMoonNodeLongitude(date);

  // Convert to HD activations
  const sunActivation = calculateActivation(sunLon);
  const moonActivation = calculateActivation(moonLon);
  const northNodeActivation = calculateActivation(northNodeLon);
  const mercuryActivation = calculateActivation(mercuryLon);
  const venusActivation = calculateActivation(venusLon);
  const marsActivation = calculateActivation(marsLon);
  const jupiterActivation = calculateActivation(jupiterLon);
  const saturnActivation = calculateActivation(saturnLon);
  const uranusActivation = calculateActivation(uranusLon);
  const neptuneActivation = calculateActivation(neptuneLon);
  const plutoActivation = calculateActivation(plutoLon);

  // Calculate Earth and South Node (opposite points)
  const earthActivation: HDActivation = {
    gate: oppositeGate(sunActivation.gate),
    line: sunActivation.line,
    color: sunActivation.color,
    tone: sunActivation.tone,
    base: sunActivation.base
  };

  const southNodeActivation: HDActivation = {
    gate: oppositeGate(northNodeActivation.gate),
    line: northNodeActivation.line,
    color: northNodeActivation.color,
    tone: northNodeActivation.tone,
    base: northNodeActivation.base
  };

  return {
    sun: sunActivation,
    earth: earthActivation,
    moon: moonActivation,
    northNode: northNodeActivation,
    southNode: southNodeActivation,
    mercury: mercuryActivation,
    venus: venusActivation,
    mars: marsActivation,
    jupiter: jupiterActivation,
    saturn: saturnActivation,
    uranus: uranusActivation,
    neptune: neptuneActivation,
    pluto: plutoActivation
  };
}

/**
 * Get ecliptic longitude for a planet
 * @param bodyName Planet name
 * @param date Date
 * @returns Longitude in degrees (0-360)
 */
function getEclipticLongitude(bodyName: Astronomy.Body, date: Date): number {
  const ecliptic = Astronomy.Ecliptic(
    Astronomy.GeoVector(bodyName, date, false)
  );
  return ecliptic.elon;
}

/**
 * Get Moon's North Node longitude
 * @param date Date
 * @returns Longitude in degrees (0-360)
 */
function getMoonNodeLongitude(date: Date): number {
  // Calculate Moon's mean node (simplified - true node calculation is more complex)
  // The Moon's node regresses about 19.3 degrees per year
  const epochYear = 2000;
  const yearsSinceEpoch = (date.getFullYear() - epochYear) + 
    (date.getMonth() / 12) + 
    (date.getDate() / 365.25);
  
  // Mean node longitude at epoch J2000.0 was approximately 125.04°
  const meanNodeAtEpoch = 125.04;
  const regressionPerYear = 19.3356;
  
  let nodeLon = meanNodeAtEpoch - (regressionPerYear * yearsSinceEpoch);
  
  // Normalize to 0-360
  while (nodeLon < 0) nodeLon += 360;
  while (nodeLon >= 360) nodeLon -= 360;
  
  return nodeLon;
}

/**
 * Get current transits (real-time)
 * @returns Current PlanetaryTransits
 */
export function getCurrentTransits(): PlanetaryTransits {
  return getTransitsForDate(new Date());
}
