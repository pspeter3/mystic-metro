export interface GridVector2DRecord {
  readonly q: number;
  readonly r: number;
}

export type GridVector2DTuple = [q: number, r: number];

export class GridVector2D implements GridVector2DRecord {
  static readonly ORIGIN = new GridVector2D(0, 0);

  readonly q: number;
  readonly r: number;

  constructor(q: number, r: number) {
    this.q = q;
    this.r = r;
  }

  add({ q, r }: GridVector2DRecord): GridVector2D {
    return new GridVector2D(this.q + q, this.r + r);
  }
}
