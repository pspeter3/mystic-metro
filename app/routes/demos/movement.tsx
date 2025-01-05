import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Movement" }];

export default function MovementRoute() {
  return <h1>Movement</h1>;
}
