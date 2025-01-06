import { describe, expect, test } from "vitest";
import {
  DualGrid,
  GridEdge2D,
  GridEdge2DCodec,
  GridNode2D,
  GridNode2DCodec,
  GridTile2D,
  GridTile2DCodec,
  type GridEdge2DId,
  type GridNode2DId,
  type GridTile2DId,
} from "./dual-grid";
import { GridVector2D } from "./grid-vector2d";
import {
  CardinalDirection,
  DiagonalDirection,
  gridDirections,
  toGridDelta,
} from "./grid-direction";
import { GridBounds2D } from "./grid-bounds2d";

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

describe("codecs", () => {
  describe("GridTile2DCodec", () => {
    test("toId", () => {
      const bounds = GridBounds2D.fromOrigin({ q: 3, r: 3 });
      const codec = new GridTile2DCodec(bounds);
      expect(codec.toId(new GridTile2D(1, 1))).toBe(4);
    });

    test("fromId", () => {
      const bounds = GridBounds2D.fromOrigin({ q: 3, r: 3 });
      const codec = new GridTile2DCodec(bounds);
      expect(codec.fromId(4 as GridTile2DId)).toStrictEqual(
        new GridTile2D(1, 1),
      );
    });
  });

  describe("GridNode2DCodec", () => {
    test("toId", () => {
      const bounds = GridBounds2D.fromOrigin({ q: 3, r: 3 });
      const codec = new GridNode2DCodec(bounds);
      expect(codec.toId(new GridNode2D(1, 1))).toBe(4);
    });

    test("fromId", () => {
      const bounds = GridBounds2D.fromOrigin({ q: 3, r: 3 });
      const codec = new GridNode2DCodec(bounds);
      expect(codec.fromId(4 as GridNode2DId)).toStrictEqual(
        new GridNode2D(1, 1),
      );
    });
  });

  describe("GridEdge2DCodec", () => {
    test("toId", () => {
      const bounds = GridBounds2D.fromOrigin({ q: 3, r: 3 });
      const codec = new GridEdge2DCodec(bounds);
      expect(codec.toId(new GridEdge2D(1, 1, CardinalDirection.North))).toBe(4);
      expect(codec.toId(new GridEdge2D(1, 1, CardinalDirection.West))).toBe(13);
    });

    test("fromId", () => {
      const bounds = GridBounds2D.fromOrigin({ q: 3, r: 3 });
      const codec = new GridEdge2DCodec(bounds);
      expect(codec.fromId(4 as GridEdge2DId)).toStrictEqual(
        new GridEdge2D(1, 1, CardinalDirection.North),
      );
      expect(codec.fromId(13 as GridEdge2DId)).toStrictEqual(
        new GridEdge2D(1, 1, CardinalDirection.West),
      );
    });
  });
});
