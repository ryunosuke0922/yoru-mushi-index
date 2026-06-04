import type { ScoreLabel } from "./types";

const scoreBands: Array<{
  min: number;
  label: ScoreLabel;
  probabilityBand: string;
}> = [
  { min: 85, label: "とても高い", probabilityBand: "70-90%" },
  { min: 70, label: "高い", probabilityBand: "55-75%" },
  { min: 50, label: "普通", probabilityBand: "35-60%" },
  { min: 30, label: "低い", probabilityBand: "15-40%" },
  { min: 0, label: "とても低い", probabilityBand: "0-20%" },
];

export function scoreLabel(score: number): ScoreLabel {
  return scoreBand(score).label;
}

export function probabilityBand(score: number): string {
  return scoreBand(score).probabilityBand;
}

function scoreBand(score: number) {
  return scoreBands.find((band) => score >= band.min) ?? scoreBands.at(-1)!;
}
