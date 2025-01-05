import type { Codec, Primitive } from "./codec";

export class CodecMap<K, V> implements Map<K, V> {
  readonly #codec: Codec<K, Primitive>;
  readonly #data: Map<Primitive, V>;

  constructor(codec: Codec<K, Primitive>, entries?: Iterable<readonly [K, V]>) {
    this.#codec = codec;
    this.#data = new Map();
    if (entries) {
      for (const [k, v] of entries) {
        this.set(k, v);
      }
    }
  }

  clear(): void {
    this.#data.clear();
  }

  delete(key: K): boolean {
    return this.#data.delete(this.#codec.toId(key));
  }

  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: any,
  ): void {
    throw new Error("Method not implemented.");
  }

  get(key: K): V | undefined {
    return this.#data.get(this.#codec.toId(key));
  }

  has(key: K): boolean {
    return this.#data.has(this.#codec.toId(key));
  }

  set(key: K, value: V): this {
    this.#data.set(this.#codec.toId(key), value);
    return this;
  }

  get size(): number {
    return this.#data.size;
  }

  *entries(): MapIterator<[K, V]> {
    for (const [key, value] of this.#data.entries()) {
      yield [this.#codec.fromId(key), value];
    }
  }

  *keys(): MapIterator<K> {
    for (const key of this.#data.keys()) {
      yield this.#codec.fromId(key);
    }
  }

  values(): MapIterator<V> {
    return this.#data.values();
  }

  [Symbol.iterator](): MapIterator<[K, V]> {
    return this.entries();
  }

  get [Symbol.toStringTag](): string {
    return this.#data[Symbol.toStringTag];
  }
}
