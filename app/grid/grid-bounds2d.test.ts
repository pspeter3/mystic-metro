import { expect, test } from "vitest";
import { GridBounds2D } from "./grid-bounds2d";
import type { GridVector2DRecord } from "./grid-vector2d";

test("constructor", () => {
  const bounds = new GridBounds2D({ q: 0, r: 4 }, { q: 3, r: 0 });
  expect(bounds.min.q).toBe(0);
  expect(bounds.min.r).toBe(0);
  expect(bounds.max.q).toBe(3);
  expect(bounds.max.r).toBe(4);
});

test("cols", () => {
  const bounds = GridBounds2D.fromOrigin({ q: 3, r: 4 });
  expect(bounds.cols).toBe(3);
});

test("rows", () => {
  const bounds = GridBounds2D.fromOrigin({ q: 3, r: 4 });
  expect(bounds.rows).toBe(4);
});

test("includes", () => {
  const size: GridVector2DRecord = { q: 3, r: 4 };
  const bounds = GridBounds2D.fromOrigin(size);
  expect(bounds.includes({ q: -1, r: -1 })).toBe(false);
  expect(bounds.includes({ q: 0, r: 0 })).toBe(true);
  expect(bounds.includes(size)).toBe(false);
});
