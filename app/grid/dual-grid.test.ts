import { describe, expect, test } from "vitest";
import { DualGrid, GridEdge2D, GridNode2D, GridTile2D } from "./dual-grid";
import { GridVector2D } from "./grid-vector2d";
import {
  CardinalDirection,
  DiagonalDirection,
  gridDirections,
  toGridDelta,
} from "./grid-direction";

describe("DualGrid", () => {
  test("constructor", () => {
    const grid = new DualGrid({ q: 25, r: 25 });
    expect(grid.bounds.tiles.max).toEqual({ q: 25, r: 25 });
    expect(grid.bounds.nodes.max).toEqual({ q: 26, r: 26 });
  });
});

describe("GridTile2D", () => {
  test("fromRecord", () => {
    expect(GridTile2D.fromRecord(GridVector2D.ORIGIN)).toBeInstanceOf(
      GridTile2D,
    );
  });

  test("neighbor", () => {
    const tile = new GridTile2D(0, 0);
    for (const d of gridDirections()) {
      expect(tile.neighbor(d)).toEqual(toGridDelta(d));
    }
  });

  test("border", () => {
    const tile = new GridTile2D(0, 0);
    expect(tile.border(CardinalDirection.North)).toStrictEqual(
      new GridEdge2D(0, 0, CardinalDirection.North),
    );
    expect(tile.border(CardinalDirection.West)).toStrictEqual(
      new GridEdge2D(0, 0, CardinalDirection.West),
    );
  });

  test("corner", () => {
    const tile = new GridTile2D(0, 0);
    expect(tile.corner(DiagonalDirection.NorthWest)).toStrictEqual(
      new GridNode2D(0, 0),
    );
    expect(tile.corner(DiagonalDirection.SouthEast)).toStrictEqual(
      new GridNode2D(1, 1),
    );
  });
});

describe("GridNode2D", () => {
  test("fromRecord", () => {
    expect(GridNode2D.fromRecord(GridVector2D.ORIGIN)).toBeInstanceOf(
      GridNode2D,
    );
  });

  test("neighbor", () => {
    const node = new GridNode2D(0, 0);
    for (const d of gridDirections()) {
      expect(node.neighbor(d)).toEqual(toGridDelta(d));
    }
  });

  test("touch", () => {
    const node = new GridNode2D(0, 0);
    expect(node.touch(DiagonalDirection.NorthWest)).toStrictEqual(
      new GridTile2D(-1, -1),
    );
    expect(node.touch(DiagonalDirection.SouthEast)).toStrictEqual(
      new GridTile2D(0, 0),
    );
  });

  test("protrude", () => {
    const node = new GridNode2D(0, 0);
    expect(node.protrude(CardinalDirection.East)).toStrictEqual(
      new GridEdge2D(0, 0, CardinalDirection.North),
    );
    expect(node.protrude(CardinalDirection.South)).toStrictEqual(
      new GridEdge2D(0, 0, CardinalDirection.West),
    );
  });
});
