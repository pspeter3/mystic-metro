import { expect, test } from "vitest";
import { GridVector2D } from "./grid-vector2d";

test("GridVector2D", () => {
  const q = 1;
  const r = 2;
  const vector = new GridVector2D(q, r);
  expect(vector.q).toBe(q);
  expect(vector.r).toBe(r);
});
