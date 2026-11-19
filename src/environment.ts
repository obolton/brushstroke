/**
 * Whether the code is running outside a browser, where there is no DOM to render to.
 */
export function isServer(): boolean {
  return typeof document === "undefined";
}
