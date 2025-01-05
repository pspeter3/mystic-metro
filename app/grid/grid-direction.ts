import { GridVector2D } from "./grid-vector2d";

export enum CardinalDirection {
  North = 0,
  East = 1,
  South = 2,
  West = 3,
}

export enum DiagonalDirection {
  NorthEast = 4,
  SouthEast = 5,
  SouthWest = 6,
  NorthWest = 7,
}

export type GridDirection = CardinalDirection | DiagonalDirection;

export function isCardinalDirection(d: GridDirection): d is CardinalDirection {
  return d < 4;
}

export function isDiagonalDirection(d: GridDirection): d is DiagonalDirection {
  return !isCardinalDirection(d);
}

export function* cardinalDirections(): Generator<CardinalDirection> {
  for (let i = 0; i < 4; i++) {
    yield i;
  }
}

export function* diagonalDirections(): Generator<DiagonalDirection> {
  for (let i = 4; i < 8; i++) {
    yield i;
  }
}

export function* gridDirections(): Generator<GridDirection> {
  for (let i = 0; i < 4; i++) {
    yield i;
    yield i + 4;
  }
}

export type GridDirectionEntry<D extends GridDirection, T> = readonly [
  direction: D,
  value: T,
];

const DELTAS: ReadonlyArray<GridVector2D> = [
  new GridVector2D(0, -1),
  new GridVector2D(1, 0),
  new GridVector2D(0, 1),
  new GridVector2D(-1, 0),
  new GridVector2D(1, -1),
  new GridVector2D(1, 1),
  new GridVector2D(-1, 1),
  new GridVector2D(-1, -1),
];

export function toGridDelta(direction: GridDirection): GridVector2D {
  return DELTAS[direction];
}
