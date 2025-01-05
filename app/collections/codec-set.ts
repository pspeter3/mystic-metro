import type { Codec, Primitive } from "./codec";

export class CodecSet<T> implements Set<T> {
  readonly #codec: Codec<T, Primitive>;
  readonly #data: Set<Primitive>;

  constructor(codec: Codec<T, Primitive>, items?: Iterable<T>) {
    this.#codec = codec;
    this.#data = new Set();
    if (items) {
      for (const item of items) {
        this.add(item);
      }
    }
  }

  add(value: T): this {
    this.#data.add(this.#codec.toId(value));
    return this;
  }

  clear(): void {
    this.#data.clear();
  }

  delete(value: T): boolean {
    return this.#data.delete(this.#codec.toId(value));
  }

  forEach(
    callbackfn: (value: T, value2: T, set: Set<T>) => void,
    thisArg?: any,
  ): void {
    throw new Error("Method not implemented.");
  }

  has(value: T): boolean {
    return this.#data.has(this.#codec.toId(value));
  }

  get size(): number {
    return this.#data.size;
  }

  *entries(): SetIterator<[T, T]> {
    for (const item of this.values()) {
      yield [item, item];
    }
  }

  keys(): SetIterator<T> {
    return this.values();
  }

  *values(): SetIterator<T> {
    for (const id of this.#data) {
      yield this.#codec.fromId(id);
    }
  }

  union<U>(other: ReadonlySetLike<U>): Set<T | U> {
    throw new Error("Method not implemented.");
  }

  intersection<U>(other: ReadonlySetLike<U>): Set<T & U> {
    throw new Error("Method not implemented.");
  }

  difference<U>(other: ReadonlySetLike<U>): Set<T> {
    throw new Error("Method not implemented.");
  }

  symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U> {
    throw new Error("Method not implemented.");
  }

  isSubsetOf(other: ReadonlySetLike<unknown>): boolean {
    throw new Error("Method not implemented.");
  }

  isSupersetOf(other: ReadonlySetLike<unknown>): boolean {
    throw new Error("Method not implemented.");
  }

  isDisjointFrom(other: ReadonlySetLike<unknown>): boolean {
    throw new Error("Method not implemented.");
  }

  [Symbol.iterator](): SetIterator<T> {
    return this.values();
  }

  get [Symbol.toStringTag](): string {
    return this.#data[Symbol.toStringTag];
  }
}
