import { afterEach, describe, expect, test, vi } from "vitest";
import { hydrate, render } from "../dom";
import { renderToString } from "../render-to-string";
import { reactive } from "carillon";
import { Each } from "../each";

describe("Each", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("initial render", () => {
    test("renders an element for each item in order", () => {
      const items = reactive(["a", "b", "c"]);
      const container = document.createElement("div");
      const nodes = render(<Each items={items}>{(item) => <span>{item}</span>}</Each>);
      container.append(...nodes);
      expect(container.children).toHaveLength(3);
      expect(container.children[0]?.textContent).toBe("a");
      expect(container.children[1]?.textContent).toBe("b");
      expect(container.children[2]?.textContent).toBe("c");
    });

    test("passes the item and index to the renderer", () => {
      const items = reactive(["a", "b", "c"]);
      const renderer = vi.fn((item: string, index: number) => (
        <span>
          {index}:{item}
        </span>
      ));
      render(<Each items={items}>{renderer}</Each>);
      expect(renderer).toHaveBeenCalledTimes(3);
      expect(renderer).toHaveBeenNthCalledWith(1, "a", 0);
      expect(renderer).toHaveBeenNthCalledWith(2, "b", 1);
      expect(renderer).toHaveBeenNthCalledWith(3, "c", 2);
    });

    test("renders nothing when items is empty", () => {
      const items = reactive<string[]>([]);
      const container = document.createElement("div");
      const nodes = render(<Each items={items}>{(item) => <span>{item}</span>}</Each>);
      container.append(...nodes);
      expect(container.children).toHaveLength(0);
    });
  });

  describe("reactive updates", () => {
    test("appends new items", () => {
      const items = reactive(["a", "b"]);
      const container = document.createElement("div");
      const nodes = render(<Each items={items}>{(item) => <span>{item}</span>}</Each>);
      container.append(...nodes);

      items.value = ["a", "b", "c"];
      expect(container.children).toHaveLength(3);
      expect(container.children[2]?.textContent).toBe("c");
    });

    test("prepends new items", () => {
      const items = reactive(["b", "c"]);
      const container = document.createElement("div");
      const nodes = render(<Each items={items}>{(item) => <span>{item}</span>}</Each>);
      container.append(...nodes);

      items.value = ["a", "b", "c"];
      expect(container.children).toHaveLength(3);
      expect(container.children[0]?.textContent).toBe("a");
      expect(container.children[1]?.textContent).toBe("b");
      expect(container.children[2]?.textContent).toBe("c");
    });

    test("removes items that are no longer in the list", () => {
      const items = reactive(["a", "b", "c"]);
      const container = document.createElement("div");
      const nodes = render(<Each items={items}>{(item) => <span>{item}</span>}</Each>);
      container.append(...nodes);

      items.value = ["a", "c"];
      expect(container.children).toHaveLength(2);
      expect(container.children[0]?.textContent).toBe("a");
      expect(container.children[1]?.textContent).toBe("c");
    });

    test("preserves DOM nodes for items that move", () => {
      const items = reactive(["a", "b", "c"]);
      const container = document.createElement("div");
      const nodes = render(<Each items={items}>{(item) => <span>{item}</span>}</Each>);
      container.append(...nodes);
      const originalA = container.children[0];
      const originalB = container.children[1];
      const originalC = container.children[2];

      items.value = ["c", "a", "b"];
      expect(container.children[0]).toBe(originalC);
      expect(container.children[1]).toBe(originalA);
      expect(container.children[2]).toBe(originalB);
    });

    test("does not re-invoke the renderer for items that already rendered", () => {
      const items = reactive(["a", "b"]);
      const renderer = vi.fn((item: string) => <span>{item}</span>);
      const container = document.createElement("div");
      const nodes = render(<Each items={items}>{renderer}</Each>);
      container.append(...nodes);
      expect(renderer).toHaveBeenCalledTimes(2);

      items.value = ["b", "a"];
      expect(renderer).toHaveBeenCalledTimes(2);

      items.value = ["a", "b", "c"];
      expect(renderer).toHaveBeenCalledTimes(3);
      expect(renderer).toHaveBeenLastCalledWith("c", 2);
    });

    test("renders new items after starting empty", () => {
      const items = reactive<string[]>([]);
      const container = document.createElement("div");
      const nodes = render(<Each items={items}>{(item) => <span>{item}</span>}</Each>);
      container.append(...nodes);
      expect(container.children).toHaveLength(0);

      items.value = ["a", "b"];
      expect(container.children).toHaveLength(2);
      expect(container.children[0]?.textContent).toBe("a");
      expect(container.children[1]?.textContent).toBe("b");
    });

    test("removes all items when emptied", () => {
      const items = reactive(["a", "b"]);
      const container = document.createElement("div");
      const nodes = render(<Each items={items}>{(item) => <span>{item}</span>}</Each>);
      container.append(...nodes);

      items.value = [];
      expect(container.children).toHaveLength(0);
    });

    test("keeps its position among siblings after being emptied and refilled", () => {
      const items = reactive(["a", "b"]);
      const container = document.createElement("ul");
      container.append(
        ...render(
          <>
            <li>header</li>
            <Each items={items}>{(item) => <li>{item}</li>}</Each>
            <li>footer</li>
          </>,
        ),
      );

      items.value = [];
      expect(container.textContent).toBe("headerfooter");

      items.value = ["c"];
      expect(container.textContent).toBe("headercfooter");
    });

    test("stops updating when the signal aborts", () => {
      const items = reactive(["a"]);
      const controller = new AbortController();
      const container = document.createElement("div");
      container.append(
        ...render(<Each items={items}>{(item) => <span>{item}</span>}</Each>, {
          signal: controller.signal,
        }),
      );

      controller.abort();
      items.value = ["a", "b"];

      expect(container.children).toHaveLength(1);
    });

    test("throws when items change before rendering", () => {
      const items = reactive(["a"]);
      const each = new Each({ items, children: (item) => item });

      expect(() => {
        items.value = ["b"];
      }).toThrow("No anchor element");
      expect(each.items).toBe(items);
    });

    test("throws when items change while disconnected", () => {
      const items = reactive(["a"]);
      render(<Each items={items}>{(item) => <span>{item}</span>}</Each>);

      expect(() => {
        items.value = ["b"];
      }).toThrow("Anchor element is disconnected");
    });

    test("throws when items change on the server", () => {
      const items = reactive(["a"]);
      const container = document.createElement("div");
      container.append(...render(<Each items={items}>{(item) => <span>{item}</span>}</Each>));
      vi.stubGlobal("document", undefined);

      expect(() => {
        items.value = ["b"];
      }).toThrow("Requires browser environment");
    });
  });

  describe("hydrate", () => {
    test("reuses the existing elements for each item", () => {
      const items = reactive(["a", "b"]);
      const container = document.createElement("ul");
      container.innerHTML = "<li>a</li><li>b</li>";
      const [first, second] = container.children;

      hydrate(<Each items={items}>{(item) => <li>{item}</li>}</Each>, container);

      expect(container.children).toHaveLength(2);
      expect(container.children[0]).toBe(first);
      expect(container.children[1]).toBe(second);
    });

    test("updates hydrated items when the list changes", () => {
      const items = reactive(["a", "b"]);
      const container = document.createElement("ul");
      container.innerHTML = "<li>a</li><li>b</li>";
      const second = container.children[1];
      hydrate(<Each items={items}>{(item) => <li>{item}</li>}</Each>, container);

      items.value = ["b", "c"];

      expect(container.innerHTML).toBe("<li>b</li><li>c</li>");
      expect(container.children[0]).toBe(second);
    });

    test("inserts a placeholder for an empty list", () => {
      const items = reactive<string[]>([]);
      const container = document.createElement("ul");
      hydrate(<Each items={items}>{(item) => <li>{item}</li>}</Each>, container);
      expect(container.childNodes).toHaveLength(1);
      expect(container.firstChild).toBeInstanceOf(Comment);

      items.value = ["a"];

      expect(container.textContent).toBe("a");
    });

    test("inserts the placeholder for an empty list before later siblings", () => {
      const items = reactive<string[]>([]);
      const container = document.createElement("ul");
      container.innerHTML = "<li>footer</li>";
      hydrate(
        <>
          <Each items={items}>{(item) => <li>{item}</li>}</Each>
          <li>footer</li>
        </>,
        container,
      );
      expect(container.firstChild).toBeInstanceOf(Comment);

      items.value = ["a"];

      expect(container.textContent).toBe("afooter");
    });

    test("throws on the server", () => {
      const container = document.createElement("ul");
      const each = new Each({ items: reactive<string[]>([]), children: (item) => item });
      vi.stubGlobal("document", undefined);

      expect(() => each.hydrate(container, 0)).toThrow("Requires browser environment");
    });
  });

  describe("renderToString", () => {
    test("renders an element for each item", () => {
      vi.stubGlobal("document", undefined);
      const items = reactive(["a", "b", "c"]);
      const html = renderToString(<Each items={items}>{(item) => <span>{item}</span>}</Each>);
      expect(html).toBe("<span>a</span><span>b</span><span>c</span>");
    });

    test("renders nothing for an empty list", () => {
      vi.stubGlobal("document", undefined);
      const items = reactive<string[]>([]);
      const html = renderToString(<Each items={items}>{(item) => <span>{item}</span>}</Each>);
      expect(html).toBe("");
    });
  });
});
