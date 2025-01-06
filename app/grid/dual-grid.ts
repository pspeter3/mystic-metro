import type { Brand } from "~/utils/brand";
import { GridBounds2D } from "./grid-bounds2d";
import {
  CardinalDirection,
  DiagonalDirection,
  toGridDelta,
  type GridDirection,
} from "./grid-direction";
import { GridVector2D, type GridVector2DRecord } from "./grid-vector2d";
import type { Codec } from "~/collections/codec";

export interface DualGridBounds {
  readonly tiles: GridBounds2D;
  readonly nodes: GridBounds2D;
}

export interface DualGridCodecs {
  readonly tiles: GridTile2DCodec;
  readonly nodes: GridNode2DCodec;
  readonly edges: GridEdge2DCodec;
}

export class DualGrid {
  readonly bounds: DualGridBounds;
  readonly codecs: DualGridCodecs;

  constructor(size: GridVector2DRecord) {
    this.bounds = {
      tiles: GridBounds2D.fromOrigin(size),
      nodes: GridBounds2D.fromOrigin({ q: size.q + 1, r: size.r + 1 }),
    };
    this.codecs = {
      tiles: new GridTile2DCodec(this.bounds.tiles),
      nodes: new GridNode2DCodec(this.bounds.nodes),
      edges: new GridEdge2DCodec(this.bounds.nodes),
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

export type GridTile2DId = Brand<number, "GridTile2DId">;
export type GridNode2DId = Brand<number, "GridNode2DId">;
export type GridEdge2DId = Brand<number, "GridEdge2DId">;

export class GridTile2DCodec implements Codec<GridTile2D, GridTile2DId> {
  readonly #bounds: GridBounds2D;

  constructor(bounds: GridBounds2D) {
    this.#bounds = bounds;
  }

  toId(tile: GridTile2D): GridTile2DId {
    this.#bounds.assert(tile);
    const { q, r } = this.#bounds.toLocal(tile);
    return (r * this.#bounds.cols + q) as GridTile2DId;
  }

  fromId(id: GridTile2DId): GridTile2D {
    const { cols } = this.#bounds;
    const q = id % cols;
    const r = Math.floor(id / cols);
    const result = GridTile2D.fromRecord(this.#bounds.toGlobal({ q, r }));
    this.#bounds.assert(result);
    return result;
  }
}

export class GridNode2DCodec implements Codec<GridNode2D, GridNode2DId> {
  readonly #bounds: GridBounds2D;

  constructor(bounds: GridBounds2D) {
    this.#bounds = bounds;
  }

  toId(node: GridNode2D): GridNode2DId {
    this.#bounds.assert(node);
    const { q, r } = this.#bounds.toLocal(node);
    return (r * this.#bounds.cols + q) as GridNode2DId;
  }

  fromId(id: GridNode2DId): GridNode2D {
    const { cols } = this.#bounds;
    const q = id % cols;
    const r = Math.floor(id / cols);
    const result = GridNode2D.fromRecord(this.#bounds.toGlobal({ q, r }));
    this.#bounds.assert(result);
    return result;
  }
}

export class GridEdge2DCodec implements Codec<GridEdge2D, GridEdge2DId> {
  readonly #bounds: GridBounds2D;

  constructor(bounds: GridBounds2D) {
    this.#bounds = bounds;
  }

  toId(edge: GridEdge2D): GridEdge2DId {
    this.#bounds.assert(edge);
    const offset = edge.d === CardinalDirection.North ? 0 : this.#bounds.size;
    const { q, r } = this.#bounds.toLocal(edge);
    return (r * this.#bounds.cols + q + offset) as GridEdge2DId;
  }

  fromId(id: GridEdge2DId): GridEdge2D {
    const { size, cols } = this.#bounds;
    const d =
      Math.floor(id / size) === 0
        ? CardinalDirection.North
        : CardinalDirection.West;
    const v = id % size;
    const q = v % cols;
    const r = Math.floor(v / cols);
    const result = GridNode2D.fromRecord(this.#bounds.toGlobal({ q, r }));
    this.#bounds.assert(result);
    return GridEdge2D.fromRecord(result, d);
  }
}
