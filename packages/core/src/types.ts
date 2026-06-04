export type WeatherHour = {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windGust: number;
  cloudCover: number;
};

export type MoonCondition = {
  illumination: number;
  altitudeDeg: number;
};

export type AreaCondition = {
  seasonScore: number;
  habitatScore: number;
  recentRainMm24h: number;
};

export type ScoreLabel = "とても低い" | "低い" | "普通" | "高い" | "とても高い";

export type ScoreReasonTone = "positive" | "negative" | "neutral";

export type ScoreReason = {
  text: string;
  tone: ScoreReasonTone;
};

export type TaxaScores = {
  moths: number;
  beetles: number;
  aquaticInsects: number;
};

export type HourlyScore = WeatherHour & {
  score: number;
  label: ScoreLabel;
  moonEffect: "small" | "medium" | "large";
};
