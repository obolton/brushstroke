import type { Reactive } from "carillon";
import type { JSX } from "./jsx";

export interface IfProps {
  condition: Reactive<unknown>;
  children: JSX.Node;
}

export function If({ condition, children }: IfProps) {
  return condition.derive((value) => (value ? children : null));
}
