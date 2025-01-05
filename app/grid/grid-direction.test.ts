import { expect, test } from "vitest";
import {
  cardinalDirections,
  DiagonalDirection,
  diagonalDirections,
  gridDirections,
  isCardinalDirection,
  isDiagonalDirection,
  toGridDelta,
} from "./grid-direction";
import { GridVector2D } from "./grid-vector2d";

test("cardinalDirections", () => {
  expect(Array.from(cardinalDirections())).toEqual([0, 1, 2, 3]);
});

test("diagonalDirections", () => {
  expect(Array.from(diagonalDirections())).toEqual([4, 5, 6, 7]);
});

test("gridDirections", () => {
  expect(Array.from(gridDirections())).toEqual([0, 4, 1, 5, 2, 6, 3, 7]);
});

test("isCardinalDirection", () => {
  for (const d of cardinalDirections()) {
    expect(isCardinalDirection(d)).toBe(true);
  }
  for (const d of diagonalDirections()) {
    expect(isCardinalDirection(d)).toBe(false);
  }
});

test("isDiagonalDirection", () => {
  for (const d of cardinalDirections()) {
    expect(isDiagonalDirection(d)).toBe(false);
  }
  for (const d of diagonalDirections()) {
    expect(isDiagonalDirection(d)).toBe(true);
  }
});

test("toGridDelta", () => {
  for (const d of gridDirections()) {
    const rotate = (d + 2) % 4;
    const mirror = isCardinalDirection(d) ? rotate : rotate + 4;
    expect(
      GridVector2D.ORIGIN.add(toGridDelta(d)).add(toGridDelta(mirror)),
    ).toStrictEqual(GridVector2D.ORIGIN);
  }
});
