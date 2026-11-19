/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, test, vi } from "vitest";
import { moveBefore } from "../move-before";

describe("moveBefore", () => {
  test("calls Element.moveBefore if the method is defined", () => {
    const parent = document.createElement("div");
    parent.moveBefore = vi.fn();
    const node = document.createElement("div");
    const referenceNode = document.createElement("div");
    parent.appendChild(referenceNode);
    moveBefore(parent, node, referenceNode);
    expect(parent.moveBefore).toHaveBeenCalledWith(node, referenceNode);
  });

  test("calls Element.insertBefore if Element.moveBefore is not defined", () => {
    const parent = document.createElement("div");
    Object.assign(parent, { moveBefore: undefined });
    parent.insertBefore = vi.fn();
    const node = document.createElement("div");
    const referenceNode = document.createElement("div");
    parent.appendChild(referenceNode);
    moveBefore(parent, node, referenceNode);
    expect(parent.insertBefore).toHaveBeenCalledWith(node, referenceNode);
  });

  test("restores focus within the moved node when falling back to insertBefore", () => {
    const parent = document.createElement("div");
    Object.assign(parent, { moveBefore: undefined });
    const node = document.createElement("div");
    const input = document.createElement("input");
    const referenceNode = document.createElement("div");
    node.appendChild(input);
    parent.append(referenceNode, node);
    document.body.appendChild(parent);
    input.focus();
    const focus = vi.spyOn(input, "focus");

    moveBefore(parent, node, referenceNode);

    expect(parent.firstChild).toBe(node);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    parent.remove();
  });
});
