import { render } from "./dom";
import { isServer } from "./environment";
import type { JSX } from "./jsx";

export interface PortalProps {
  children: JSX.Node;
  element?: Element | string;
  signal?: AbortSignal | undefined;
}

function resolveElement(element?: Element | string): Element {
  if (typeof element === "string") {
    const resolved = document.getElementById(element);
    if (!resolved) {
      throw new Error(`Element with ID "${element}" not found`);
    }
    return resolved;
  }
  return element ?? document.body;
}

export function Portal({ children, element, signal }: PortalProps) {
  if (isServer()) {
    return null;
  }

  const nodes = render(children, { signal });
  const parent = resolveElement(element);
  parent.append(...nodes);

  signal?.addEventListener(
    "abort",
    () => {
      for (const node of nodes) {
        parent.removeChild(node);
      }
    },
    { once: true },
  );

  return null;
}
