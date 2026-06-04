import SunCalc from "suncalc";

export type AstroCondition = {
  illumination: number;
  phase: number;
  altitudeDeg: number;
};

export function moonConditionAt(
  date: Date,
  latitude: number,
  longitude: number,
): AstroCondition {
  const moonIllumination = SunCalc.getMoonIllumination(date);
  const position = SunCalc.getMoonPosition(date, latitude, longitude);

  return {
    illumination: moonIllumination.fraction,
    phase: moonIllumination.phase,
    altitudeDeg: radiansToDegrees(position.altitude),
  };
}

function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI;
}
