export type Primitive = string | number;

export interface Codec<T, P extends Primitive> {
  toId(item: T): P;
  fromId(id: P): T;
}
