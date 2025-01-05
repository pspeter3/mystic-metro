import { expect, test } from "vitest";
import { GridVector2D } from "./grid-vector2d";

test("add", () => {
  expect(new GridVector2D(1, 1).add({ q: 3, r: 4 })).toEqual({ q: 4, r: 5 });
});
