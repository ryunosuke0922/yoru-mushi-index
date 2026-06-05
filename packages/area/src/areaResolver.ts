import { areaFixtures } from "./areaFixtures";
import type { CoarseArea } from "./types";

export function searchAreas(query: string): CoarseArea[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("ja-JP");

  if (!normalizedQuery) {
    return areaFixtures;
  }

  return areaFixtures.filter((area) => {
    const names = [
      area.region,
      area.prefecture,
      area.name,
      ...area.aliases,
    ].map((name) => name.toLocaleLowerCase("ja-JP"));
    return names.some((name) => name.includes(normalizedQuery));
  });
}

export function findAreaById(areaId: string): CoarseArea | undefined {
  return areaFixtures.find((area) => area.id === areaId);
}

export function findNearbyAreas(
  areaId: string,
  limit = 3,
  areas: CoarseArea[] = areaFixtures,
): CoarseArea[] {
  const currentArea = areas.find((area) => area.id === areaId);

  if (!currentArea) {
    return [];
  }

  return areas
    .filter((area) => area.id !== areaId)
    .map((area) => ({
      area,
      distance: distanceKm(currentArea, area),
    }))
    .sort((left, right) => left.distance - right.distance)
    .slice(0, limit)
    .map(({ area }) => area);
}

export function groupAreasByRegionAndPrefecture(
  areas: CoarseArea[] = areaFixtures,
) {
  return areas.reduce<Record<string, Record<string, CoarseArea[]>>>(
    (groups, area) => {
      groups[area.region] = {
        ...(groups[area.region] ?? {}),
        [area.prefecture]: [
          ...(groups[area.region]?.[area.prefecture] ?? []),
          area,
        ],
      };

      return groups;
    },
    {},
  );
}

export function publicArea(area: CoarseArea) {
  return {
    id: area.id,
    name: area.name,
    region: area.region,
    prefecture: area.prefecture,
    precision: area.precision,
    precisionKm: area.precisionKm,
    locationPolicy: area.locationPolicy,
  };
}

function distanceKm(from: CoarseArea, to: CoarseArea): number {
  const earthRadiusKm = 6371;
  const fromLatitude = degreesToRadians(from.latitude);
  const toLatitude = degreesToRadians(to.latitude);
  const latitudeDelta = degreesToRadians(to.latitude - from.latitude);
  const longitudeDelta = degreesToRadians(to.longitude - from.longitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    earthRadiusKm *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
