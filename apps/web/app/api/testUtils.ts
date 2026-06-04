import { expect } from "vitest";

export function expectNoCoordinates(value: unknown) {
  expect(JSON.stringify(value)).not.toContain("latitude");
  expect(JSON.stringify(value)).not.toContain("longitude");
}
