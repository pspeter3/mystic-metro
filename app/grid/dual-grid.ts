import { GridBounds2D } from "./grid-bounds2d";
import {
  CardinalDirection,
  DiagonalDirection,
  toGridDelta,
  type GridDirection,
  type GridDirectionEntry,
} from "./grid-direction";
import { GridVector2D, type GridVector2DRecord } from "./grid-vector2d";

export interface DualGridBounds {
  readonly tiles: GridBounds2D;
  readonly nodes: GridBounds2D;
}

export class DualGrid {
  readonly bounds: DualGridBounds;

  constructor(size: GridVector2DRecord) {
    this.bounds = {
      tiles: GridBounds2D.fromOrigin(size),
      nodes: GridBounds2D.fromOrigin({ q: size.q + 1, r: size.r + 1 }),
    };
  }
}

export class GridTile2D implements GridVector2DRecord {
  readonly q: number;
  readonly r: number;

  static fromRecord({ q, r }: GridVector2DRecord): GridTile2D {
    return new GridTile2D(q, r);
  }

  private static borders: ReadonlyMap<CardinalDirection, GridVector2D> =
    new Map([
      [CardinalDirection.North, new GridVector2D(0, 0)],
      [CardinalDirection.East, new GridVector2D(1, 0)],
      [CardinalDirection.South, new GridVector2D(0, 1)],
      [CardinalDirection.West, new GridVector2D(0, 0)],
    ]);

  private static corners: ReadonlyMap<DiagonalDirection, GridVector2D> =
    new Map([
      [DiagonalDirection.NorthEast, new GridVector2D(1, 0)],
      [DiagonalDirection.SouthEast, new GridVector2D(1, 1)],
      [DiagonalDirection.SouthWest, new GridVector2D(0, 1)],
      [DiagonalDirection.NorthWest, new GridVector2D(0, 0)],
    ]);

  private static toGridEdgeDirection(d: CardinalDirection): GridEdgeDirection {
    return d % 2 === 0 ? CardinalDirection.North : CardinalDirection.West;
  }

  constructor(q: number, r: number) {
    this.q = q;
    this.r = r;
  }

  neighbor(d: GridDirection): GridTile2D {
    return GridTile2D.fromRecord(toGridDelta(d).add(this));
  }

  border(d: CardinalDirection): GridEdge2D {
    return GridEdge2D.fromRecord(
      GridTile2D.borders.get(d)!.add(this),
      GridTile2D.toGridEdgeDirection(d),
    );
  }

  corner(d: DiagonalDirection): GridNode2D {
    return GridNode2D.fromRecord(GridTile2D.corners.get(d)!.add(this));
  }
}

export class GridNode2D implements GridVector2DRecord {
  readonly q: number;
  readonly r: number;

  static fromRecord({ q, r }: GridVector2DRecord): GridNode2D {
    return new GridNode2D(q, r);
  }

  private static touches: ReadonlyMap<DiagonalDirection, GridVector2D> =
    new Map([
      [DiagonalDirection.NorthEast, new GridVector2D(0, -1)],
      [DiagonalDirection.SouthEast, new GridVector2D(0, 0)],
      [DiagonalDirection.SouthWest, new GridVector2D(-1, 0)],
      [DiagonalDirection.NorthWest, new GridVector2D(-1, -1)],
    ]);

  private static protrudes: ReadonlyMap<CardinalDirection, GridVector2D> =
    new Map([
      [CardinalDirection.North, new GridVector2D(0, -1)],
      [CardinalDirection.East, new GridVector2D(0, 0)],
      [CardinalDirection.South, new GridVector2D(0, 0)],
      [CardinalDirection.West, new GridVector2D(-1, 0)],
    ]);

  private static toGridEdgeDirection(d: CardinalDirection): GridEdgeDirection {
    return d % 2 === 0 ? CardinalDirection.West : CardinalDirection.North;
  }

  constructor(q: number, r: number) {
    this.q = q;
    this.r = r;
  }

  neighbor(d: GridDirection): GridNode2D {
    return GridNode2D.fromRecord(toGridDelta(d).add(this));
  }

  touch(d: DiagonalDirection): GridTile2D {
    return GridTile2D.fromRecord(GridNode2D.touches.get(d)!.add(this));
  }

  protrude(d: CardinalDirection): GridEdge2D {
    return GridEdge2D.fromRecord(
      GridNode2D.protrudes.get(d)!.add(this),
      GridNode2D.toGridEdgeDirection(d),
    );
  }
}

export type GridEdgeDirection =
  | CardinalDirection.North
  | CardinalDirection.West;

export class GridEdge2D implements GridVector2DRecord {
  readonly q: number;
  readonly r: number;
  readonly d: GridEdgeDirection;

  static fromRecord(
    { q, r }: GridVector2DRecord,
    d: GridEdgeDirection,
  ): GridEdge2D {
    return new GridEdge2D(q, r, d);
  }

  constructor(q: number, r: number, d: GridEdgeDirection) {
    this.q = q;
    this.r = r;
    this.d = d;
  }
}
