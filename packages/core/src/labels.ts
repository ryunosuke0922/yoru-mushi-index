import type { ScoreLabel } from "./types";

const scoreBands: Array<{
  min: number;
  label: ScoreLabel;
}> = [
  { min: 85, label: "とても高い" },
  { min: 70, label: "高い" },
  { min: 50, label: "普通" },
  { min: 30, label: "低い" },
  { min: 0, label: "とても低い" },
];

export function scoreLabel(score: number): ScoreLabel {
  return scoreBand(score).label;
}

function scoreBand(score: number) {
  return scoreBands.find((band) => score >= band.min) ?? scoreBands.at(-1)!;
}
