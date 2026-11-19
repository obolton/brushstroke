export type { JSX } from "./jsx";
export type * from "./html-attributes";
export { render, hydrate, type RenderContext } from "./dom";
export { If, type IfProps } from "./if";
export { Each, type EachProps } from "./each";
export {
  Switch,
  Case,
  Default,
  type SwitchProps,
  type CaseProps,
  type DefaultProps,
} from "./switch";
export { Portal, type PortalProps } from "./portal";
export { serializeStyles } from "./attributes";
export { moveBefore } from "./move-before";
