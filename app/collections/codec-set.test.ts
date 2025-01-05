import { expect, test } from "vitest";
import type { Codec } from "./codec";
import { CodecSet } from "./codec-set";

class Box {
  readonly id: number;

  constructor(id: number) {
    this.id = id;
  }
}

const BoxCodec: Codec<Box, number> = {
  toId(item) {
    return item.id;
  },
  fromId(id) {
    return new Box(id);
  },
};

test("constructor", () => {
  const set = new CodecSet(BoxCodec, [new Box(0)]);
  expect(set.size).toBe(1);
});

test("clear", () => {
  const set = new CodecSet(BoxCodec, [new Box(0)]);
  expect(set.size).toBe(1);
  set.clear();
  expect(set.size).toBe(0);
});

test("delete", () => {
  const set = new CodecSet(BoxCodec, [new Box(0)]);
  expect(set.has(new Box(0))).toBe(true);
  set.delete(new Box(0));
  expect(set.has(new Box(0))).toBe(false);
});

test("values", () => {
  const set = new CodecSet(BoxCodec, [new Box(0)]);
  const result = [new Box(0)];
  expect(Array.from(set)).toEqual(result);
  expect(Array.from(set.keys())).toEqual(result);
});

test("entries", () => {
  const set = new CodecSet(BoxCodec, [new Box(0)]);
  expect(Array.from(set.entries())).toEqual([[new Box(0), new Box(0)]]);
});

test("toStringTag", () => {
  const set = new CodecSet<Box>(BoxCodec, [new Box(0)]);
  expect(set[Symbol.toStringTag]).toEqual("Set");
});

test("unimplemented", () => {
  const set = new CodecSet<Box>(BoxCodec, [new Box(0)]);
  const methods = [
    "union",
    "intersection",
    "difference",
    "symmetricDifference",
    "isSubsetOf",
    "isSupersetOf",
    "isDisjointFrom",
  ] as const;
  for (const method of methods) {
    expect(() => set[method](new Set())).toThrow("Method not implemented.");
  }
  expect(() => set.forEach(() => {})).toThrow("Method not implemented.");
});
