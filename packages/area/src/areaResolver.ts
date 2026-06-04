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
