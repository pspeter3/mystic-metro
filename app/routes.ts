import { type RouteConfig, prefix, route } from "@react-router/dev/routes";

export default [
  ...prefix("demos", [route("movement", "routes/demos/movement.tsx")]),
] satisfies RouteConfig;
