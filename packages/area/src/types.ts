export type CoarseArea = {
  id: string;
  name: string;
  region: string;
  prefecture: string;
  aliases: string[];
  latitude: number;
  longitude: number;
  precision: "coarse_area";
  precisionKm: number;
  locationPolicy: "no_points";
  seasonScore: number;
  habitatScore: number;
};
