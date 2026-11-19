import { describe, expect, test } from "vitest";
import * as main from "../index";
import * as server from "../server";
import * as runtime from "../jsx-runtime";
import * as devRuntime from "../jsx-dev-runtime";

describe("package entry points", () => {
  test("linocut", () => {
    expect(Object.keys(main).sort()).toEqual([
      "Case",
      "Default",
      "Each",
      "If",
      "Portal",
      "Switch",
      "hydrate",
      "moveBefore",
      "render",
      "serializeStyles",
    ]);
  });

  test("linocut/server", () => {
    expect(Object.keys(server).sort()).toEqual([
      "closeTag",
      "escapeTagContents",
      "openTag",
      "renderToString",
      "tag",
    ]);
  });

  test("linocut/jsx-runtime", () => {
    expect(Object.keys(runtime).sort()).toEqual(["Fragment", "jsx", "jsxs"]);
  });

  test("linocut/jsx-dev-runtime", () => {
    expect(Object.keys(devRuntime).sort()).toEqual(["Fragment", "jsx", "jsxDEV", "jsxs"]);
  });
});
