export interface GridVector2DRecord {
  readonly q: number;
  readonly r: number;
}

export type GridVector2DTuple = [q: number, r: number];

export class GridVector2D implements GridVector2DRecord {
  readonly q: number;
  readonly r: number;

  constructor(q: number, r: number) {
    this.q = q;
    this.r = r;
  }
}
