import { GridVector2D, type GridVector2DRecord } from "./grid-vector2d";

export class GridBounds2D {
  readonly min: GridVector2D;
  readonly max: GridVector2D;

  static fromOrigin(size: GridVector2DRecord): GridBounds2D {
    return new GridBounds2D(GridVector2D.ORIGIN, size);
  }

  constructor(a: GridVector2DRecord, b: GridVector2DRecord) {
    this.min = new GridVector2D(Math.min(a.q, b.q), Math.min(a.r, b.r));
    this.max = new GridVector2D(Math.max(a.q, b.q), Math.max(a.r, b.r));
  }

  get cols(): number {
    return this.max.q - this.min.q;
  }

  get rows(): number {
    return this.max.r - this.min.r;
  }

  includes({ q, r }: GridVector2DRecord): boolean {
    return (
      q >= this.min.q && q < this.max.q && r >= this.min.r && r < this.max.r
    );
  }
}
