import { expect, test } from "vitest";
import type { Codec } from "./codec";
import { CodecMap } from "./codec-map";

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
  const map = new CodecMap<Box, string>(BoxCodec, [[new Box(0), "a"]]);
  expect(map.size).toBe(1);
});

test("clear", () => {
  const map = new CodecMap<Box, string>(BoxCodec, [[new Box(0), "a"]]);
  expect(map.size).toBe(1);
  map.clear();
  expect(map.size).toBe(0);
});

test("delete", () => {
  const map = new CodecMap<Box, string>(BoxCodec, [[new Box(0), "a"]]);
  expect(map.has(new Box(0))).toBe(true);
  map.delete(new Box(0));
  expect(map.has(new Box(0))).toBe(false);
});

test("forEach", () => {
  const map = new CodecMap<Box, unknown>(BoxCodec);
  expect(() => map.forEach(() => {})).toThrow();
});

test("get", () => {
  const map = new CodecMap<Box, string>(BoxCodec, [[new Box(0), "a"]]);
  expect(map.get(new Box(0))).toBe("a");
});

test("has", () => {
  const map = new CodecMap<Box, string>(BoxCodec, [[new Box(0), "a"]]);
  expect(map.has(new Box(0))).toBe(true);
});

test("set", () => {
  const map = new CodecMap<Box, string>(BoxCodec, [[new Box(0), "a"]]);
  expect(map.set(new Box(0), "b")).toBeInstanceOf(CodecMap);
});

test("entries", () => {
  const map = new CodecMap<Box, string>(BoxCodec, [[new Box(0), "a"]]);
  expect(Array.from(map)).toEqual([[new Box(0), "a"]]);
});

test("keys", () => {
  const map = new CodecMap<Box, string>(BoxCodec, [[new Box(0), "a"]]);
  expect(Array.from(map.keys())).toEqual([new Box(0)]);
});

test("values", () => {
  const map = new CodecMap<Box, string>(BoxCodec, [[new Box(0), "a"]]);
  expect(Array.from(map.values())).toEqual(["a"]);
});

test("toStringTag", () => {
  const map = new CodecMap<Box, string>(BoxCodec, [[new Box(0), "a"]]);
  expect(map[Symbol.toStringTag]).toEqual("Map");
});
