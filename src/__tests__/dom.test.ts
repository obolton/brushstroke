import { describe, expect, test, vi } from "vitest";
import { jsx } from "../jsx";
import type { JSX } from "../jsx";
import { render, hydrate } from "../dom";
import { BOOLEAN_STRING_ATTRIBUTES } from "../attributes";
import { reactive } from "carillon";
import type { Reactive } from "carillon";

class TestWidget extends HTMLElement {
  data: { id: string } | null = null;
}
customElements.define("test-widget", TestWidget);

declare global {
  interface HTMLElementTagNameMap {
    "test-widget": TestWidget;
  }
}

const HelloComponent = ({ name }: { name: string }) => jsx("span", { children: `Hello ${name}` });

describe("render", () => {
  test("creates an element with the given type", () => {
    const nodes = render(jsx("div", {}));
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toBeInstanceOf(HTMLElement);
    expect((nodes[0] as HTMLElement).tagName).toBe("DIV");
  });

  test("sets the attributes of the element", () => {
    const [element] = render(jsx("div", { id: "test-id", className: "test-class" })) as [
      HTMLElement,
    ];
    expect(element.id).toBe("test-id");
    expect(element.className).toBe("test-class");
  });

  test("sets the properties of the element", () => {
    const [element] = render(jsx("div", { $id: "test-id", $className: "test-class" })) as [
      HTMLElement,
    ];
    expect(element.id).toBe("test-id");
    expect(element.className).toBe("test-class");
  });

  test("assigns a property value as-is", () => {
    const data = { id: "a" };
    const [element] = render(jsx("test-widget", { $data: data })) as [TestWidget];

    // `$` assigns the value itself, with no unwrapping or subscription.
    expect(element.data).toBe(data);
  });

  test("binds a property to a reactive value and keeps it in sync", () => {
    const data = reactive<{ id: string } | null>({ id: "a" });
    const [element] = render(jsx("test-widget", { "bind:data": data })) as [TestWidget];

    expect(element.data).toEqual({ id: "a" });

    data.value = { id: "b" };

    expect(element.data).toEqual({ id: "b" });
  });

  describe("styles", () => {
    test("sets styles from an object", () => {
      const style = { backgroundColor: "red", padding: "0" };
      const [element] = render(jsx("div", { style })) as [HTMLElement];
      expect(element.style.backgroundColor).toBe("red");
      expect(element.style.padding).toBe("0px");
    });

    test("sets and updates styles from a reactive object", () => {
      const style = reactive({ backgroundColor: "red", padding: "0" });
      const [element] = render(jsx("div", { style })) as [HTMLElement];
      expect(element.style.backgroundColor).toBe("red");
      expect(element.style.padding).toBe("0px");
      style.value = { backgroundColor: "blue", padding: "0" };
      expect(element.style.backgroundColor).toBe("blue");
      expect(element.style.padding).toBe("0px");
    });

    test("clears styles with a reactive object", () => {
      const style = reactive<Record<string, string | undefined>>({
        backgroundColor: "red",
        padding: "0",
      });
      const [element] = render(jsx("div", { style })) as [HTMLElement];
      expect(element.style.backgroundColor).toBe("red");
      expect(element.style.padding).toBe("0px");
      style.value = { backgroundColor: undefined, padding: "0" };
      expect(element.style.backgroundColor).toBe("");
      expect(element.style.padding).toBe("0px");
    });
  });

  test("sets the style attribute from a string", () => {
    const [element] = render(jsx("div", { style: "background-color: red; padding: 0" })) as [
      HTMLElement,
    ];
    expect(element.style.backgroundColor).toBe("red");
    expect(element.style.padding).toBe("0px");
  });

  describe("boolean string attributes", () => {
    describe.for(Array.from(BOOLEAN_STRING_ATTRIBUTES))("%s", (attribute) => {
      test("truthy value", () => {
        const [element] = render(jsx("div", { [attribute]: 1 })) as [HTMLElement];
        expect(element.getAttribute(attribute)).toBe("true");
      });

      test("falsy value", () => {
        const [element] = render(jsx("div", { [attribute]: 0 })) as [HTMLElement];
        expect(element.getAttribute(attribute)).toBe("false");
      });

      test("false", () => {
        const [element] = render(jsx("div", { [attribute]: "false" })) as [HTMLElement];
        expect(element.getAttribute(attribute)).toBe("false");
      });

      test("string value", () => {
        const [element] = render(jsx("div", { [attribute]: "page" })) as [HTMLElement];
        expect(element.getAttribute(attribute)).toBe("page");
      });
    });
  });

  test("sets an event listener", () => {
    const onclick = vi.fn();
    const [element] = render(jsx("div", { "on:click": onclick })) as [HTMLElement];
    element.click();
    expect(onclick).toHaveBeenCalled();
  });

  test("adds a child element", () => {
    const [element] = render(jsx("div", { children: jsx("span", {}) })) as [HTMLElement];
    expect(element.childNodes).toHaveLength(1);
    expect(element.children[0]?.tagName).toBe("SPAN");
  });

  test("adds a child component", () => {
    const [element] = render(jsx("div", { children: jsx(HelloComponent, { name: "Test" }) })) as [
      HTMLElement,
    ];
    expect(element.childNodes).toHaveLength(1);
    expect(element.children[0]?.tagName).toBe("SPAN");
    expect(element.children[0]?.textContent).toBe("Hello Test");
  });

  test("adds multiple children", () => {
    const [element] = render(jsx("div", { children: [jsx("span", {}), jsx("p", {})] })) as [
      HTMLElement,
    ];
    expect(element.childNodes).toHaveLength(2);
    expect(element.children[0]?.tagName).toBe("SPAN");
    expect(element.children[1]?.tagName).toBe("P");
  });

  test("adds a text child node", () => {
    const [element] = render(jsx("div", { children: "Hello World" })) as [HTMLElement];
    expect(element.childNodes).toHaveLength(1);
    expect(element.childNodes[0]?.nodeType).toBe(Node.TEXT_NODE);
    expect(element.childNodes[0]?.textContent).toBe("Hello World");
  });

  test("adds a numberic child node", () => {
    const [element] = render(jsx("div", { children: 2 })) as [HTMLElement];
    expect(element.childNodes).toHaveLength(1);
    expect(element.childNodes[0]?.nodeType).toBe(Node.TEXT_NODE);
    expect(element.childNodes[0]?.textContent).toBe("2");
  });

  test("adds a numberic child node with value 0", () => {
    const [element] = render(jsx("div", { children: 0 })) as [HTMLElement];
    expect(element.childNodes).toHaveLength(1);
    expect(element.childNodes[0]?.nodeType).toBe(Node.TEXT_NODE);
    expect(element.childNodes[0]?.textContent).toBe("0");
  });

  test("ignores a boolean child node", () => {
    const [element] = render(jsx("div", { children: [true] })) as [HTMLElement];
    expect(element.childNodes).toHaveLength(0);
  });

  test("ignores a null child node", () => {
    const [element] = render(jsx("div", { children: [null] })) as [HTMLElement];
    expect(element.childNodes).toHaveLength(0);
  });

  test("ignores an undefined child node", () => {
    const [element] = render(jsx("div", { children: [undefined] })) as [HTMLElement];
    expect(element.childNodes).toHaveLength(0);
  });

  test("throws for an invalid child node", () => {
    // @ts-expect-error Intentionally invalid children
    expect(() => render(jsx("div", { children: { foo: "bar" } }))).toThrow("Invalid node");
  });

  test("renders a class component", () => {
    class Component {
      name: string;

      constructor({ name }: { name: string }) {
        this.name = name;
      }

      render() {
        return jsx("span", { children: `Hello ${this.name}` });
      }
    }
    const [element] = render(jsx(Component, { name: "Test" })) as [HTMLElement];
    expect(element.tagName).toBe("SPAN");
    expect(element.textContent).toBe("Hello Test");
  });

  test("ignores a property that does not exist on the element", () => {
    const [element] = render(jsx("div", { $unknown: "value" } as JSX.Properties<"div">)) as [
      HTMLElement,
    ];
    expect("unknown" in element).toBe(false);
  });

  test("binds a property to a plain value", () => {
    const [element] = render(jsx("test-widget", { "bind:data": { id: "a" } })) as [TestWidget];
    expect(element.data).toEqual({ id: "a" });
  });

  test("sets properties after children are appended", () => {
    const [element] = render(
      jsx("select", {
        "bind:value": reactive("b"),
        children: [jsx("option", { value: "a" }), jsx("option", { value: "b" })],
      }),
    ) as [HTMLSelectElement];
    expect(element.value).toBe("b");
  });

  test("ignores a binding for a property that does not exist on the element", () => {
    const properties = { "bind:unknown": reactive("value") } as JSX.Properties<"div">;
    const [element] = render(jsx("div", properties)) as [HTMLElement];
    expect("unknown" in element).toBe(false);
  });

  describe("attribute values", () => {
    test("sets a numeric attribute", () => {
      const [element] = render(jsx("div", { tabindex: 2 })) as [HTMLElement];
      expect(element.getAttribute("tabindex")).toBe("2");
    });

    test("sets a bigint attribute", () => {
      const [element] = render(jsx("div", { "data-count": 10n as unknown as number })) as [
        HTMLElement,
      ];
      expect(element.getAttribute("data-count")).toBe("10");
    });

    test("sets an empty attribute for true", () => {
      const [element] = render(jsx("button", { disabled: true })) as [HTMLElement];
      expect(element.getAttribute("disabled")).toBe("");
    });

    test("omits an attribute for false", () => {
      const [element] = render(jsx("button", { disabled: false })) as [HTMLElement];
      expect(element.hasAttribute("disabled")).toBe(false);
    });

    test("omits an attribute for undefined", () => {
      const [element] = render(jsx("div", { id: undefined })) as [HTMLElement];
      expect(element.hasAttribute("id")).toBe(false);
    });

    test("removes an attribute when a reactive value becomes null", () => {
      const id = reactive<string | null>("test-id");
      const [element] = render(jsx("div", { id: id as Reactive<string> })) as [HTMLElement];
      expect(element.getAttribute("id")).toBe("test-id");

      id.value = null;

      expect(element.hasAttribute("id")).toBe(false);
    });

    test("does not set the signal passed to components as an attribute", () => {
      const { signal } = new AbortController();
      const properties = { signal } as JSX.Properties<"div">;
      const [element] = render(jsx("div", properties)) as [HTMLElement];
      expect(element.hasAttribute("signal")).toBe(false);
    });

    test("throws for an invalid attribute value", () => {
      const properties = { id: Symbol("id") } as unknown as JSX.Properties<"div">;
      expect(() => render(jsx("div", properties))).toThrow(
        'Invalid attribute value for "id": symbol',
      );
    });
  });

  test("sets classes from a class list", () => {
    const [element] = render(jsx("div", { classList: { a: true, b: false } })) as [HTMLElement];
    expect(element.className).toBe("a");
  });

  test("sets styles from an object on an SVG element", () => {
    const [element] = render(jsx("svg", { style: { color: "red" } })) as [SVGElement];
    expect(element.style.color).toBe("red");
  });

  test("sets an event listener from an on-prefixed handler", () => {
    const onclick = vi.fn();
    const properties = { onclick } as JSX.Properties<"div">;
    const [element] = render(jsx("div", properties)) as [HTMLElement];
    element.click();
    expect(onclick).toHaveBeenCalledTimes(1);
  });

  test("removes event listeners when the signal aborts", () => {
    const onclick = vi.fn();
    const controller = new AbortController();
    const [element] = render(jsx("div", { "on:click": onclick }), {
      signal: controller.signal,
    }) as [HTMLElement];

    controller.abort();
    element.click();

    expect(onclick).not.toHaveBeenCalled();
  });

  test("calls the ref callback with the element", () => {
    const ref = vi.fn();
    const [element] = render(jsx("div", { ref }));
    expect(ref).toHaveBeenCalledWith(element);
  });

  test("creates MathML elements in the MathML namespace", () => {
    const [element] = render(jsx("math", {})) as [Element];
    expect(element.namespaceURI).toBe("http://www.w3.org/1998/Math/MathML");
  });

  describe("reactive nodes", () => {
    test("replaces every node in the range when the value changes", () => {
      const value = reactive<JSX.Node>([jsx("span", { children: "a" }), jsx("span", {})]);
      const container = document.createElement("div");
      container.append(...render([value, jsx("p", {})]));

      value.value = jsx("b", {});

      expect(container.innerHTML).toBe("<b></b><p></p>");
    });

    test("tolerates nodes in the range being removed externally", () => {
      const value = reactive<JSX.Node>([jsx("span", {}), jsx("span", {})]);
      const container = document.createElement("div");
      container.append(...render(value));
      container.lastChild?.remove();

      value.value = jsx("b", {});

      expect(container.innerHTML).toBe("<b></b>");
    });

    test("stops updating when the signal aborts", () => {
      const value = reactive<JSX.Node>("a");
      const controller = new AbortController();
      const container = document.createElement("div");
      container.append(...render(value, { signal: controller.signal }));

      controller.abort();
      value.value = "b";

      expect(container.textContent).toBe("a");
    });
  });
});

describe("hydrate", () => {
  test("inserts a disconnected DOM node", () => {
    const container = document.createElement("div");
    const node = document.createElement("span");
    hydrate(node, container);
    expect(node.parentNode).toEqual(container);
  });

  test("reuses an existing matching element", () => {
    const container = document.createElement("div");
    const existing = document.createElement("span");
    container.appendChild(existing);
    hydrate(jsx("span", {}), container);
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(existing);
  });

  test("handles a camelCase tag name", () => {
    const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const existing = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    container.appendChild(existing);
    hydrate(jsx("linearGradient", {}), container);
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(existing);
  });

  test("replaces an existing element when the tag does not match", () => {
    const container = document.createElement("div");
    const existing = document.createElement("span");
    container.appendChild(existing);
    hydrate(jsx("p", {}), container);
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild?.tagName).toBe("P");
    expect(container.firstElementChild).not.toBe(existing);
  });

  test("creates an element when the container is empty", () => {
    const container = document.createElement("div");
    hydrate(jsx("span", {}), container);
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });

  test("sets properties after children are appended to a created element", () => {
    const container = document.createElement("div");
    hydrate(
      jsx("select", {
        $value: "b",
        children: [jsx("option", { value: "a" }), jsx("option", { value: "b" })],
      }),
      container,
    );
    expect(container.querySelector("select")?.value).toBe("b");
  });

  test("sets properties after children are hydrated in an existing element", () => {
    const container = document.createElement("div");
    const existing = document.createElement("select");
    container.appendChild(existing);
    hydrate(
      jsx("select", {
        $value: "b",
        children: [jsx("option", { value: "a" }), jsx("option", { value: "b" })],
      }),
      container,
    );
    expect(existing.value).toBe("b");
  });

  test("sets attributes on the hydrated element", () => {
    const container = document.createElement("div");
    const existing = document.createElement("span");
    container.appendChild(existing);
    hydrate(jsx("span", { id: "test", className: "foo" }), container);
    expect(existing.id).toBe("test");
    expect(existing.className).toBe("foo");
  });

  test("calls the ref callback for the hydrated element", () => {
    const container = document.createElement("div");
    const existing = document.createElement("span");
    container.appendChild(existing);
    const ref = vi.fn();
    hydrate(jsx("span", { ref }), container);
    expect(ref).toHaveBeenCalledWith(existing);
  });

  test("reuses a matching text node", () => {
    const container = document.createElement("div");
    const span = document.createElement("span");
    const text = document.createTextNode("hello");
    span.appendChild(text);
    container.appendChild(span);
    hydrate(jsx("span", { children: "hello" }), container);
    expect(span.firstChild).toBe(text);
    expect(text.nodeValue).toBe("hello");
  });

  test("updates a text node when the content differs", () => {
    const container = document.createElement("div");
    const span = document.createElement("span");
    const text = document.createTextNode("old");
    span.appendChild(text);
    container.appendChild(span);
    hydrate(jsx("span", { children: "new" }), container);
    expect(span.firstChild).toBe(text);
    expect(text.nodeValue).toBe("new");
  });

  test("splits a merged text node into adjacent children", () => {
    const container = document.createElement("div");
    const span = document.createElement("span");
    span.appendChild(document.createTextNode("hello world"));
    container.appendChild(span);
    hydrate(jsx("span", { children: ["hello ", "world"] }), container);
    expect(span.childNodes).toHaveLength(2);
    expect(span.childNodes[0]?.nodeValue).toBe("hello ");
    expect(span.childNodes[1]?.nodeValue).toBe("world");
  });

  test("hydrates a function component", () => {
    const container = document.createElement("div");
    const span = document.createElement("span");
    span.appendChild(document.createTextNode("Hello"));
    container.appendChild(span);
    hydrate(jsx(HelloComponent, { name: "World" }), container);
    expect(container.firstElementChild).toBe(span);
    expect(span.firstChild?.nodeValue).toBe("Hello World");
  });

  test("hydrates a class component", () => {
    const container = document.createElement("div");
    const span = document.createElement("span");
    span.appendChild(document.createTextNode("Hello"));
    container.appendChild(span);
    class Component {
      name: string;
      constructor({ name }: { name: string }) {
        this.name = name;
      }
      render() {
        return jsx("span", { children: `Hello ${this.name}` });
      }
    }
    hydrate(jsx(Component, { name: "World" }), container);
    expect(container.firstElementChild).toBe(span);
    expect(span.firstChild?.nodeValue).toBe("Hello World");
  });

  test("uses the custom hydrate method on a class component", () => {
    const container = document.createElement("div");
    const existing = document.createElement("span");
    container.appendChild(existing);
    const customHydrate = vi.fn((_target: Element, _index: number) => [existing as Node]);
    class Component {
      hydrate(target: Element, index: number) {
        return customHydrate(target, index);
      }
      render() {
        return jsx("span", {});
      }
    }
    hydrate(jsx(Component, {}), container);
    expect(customHydrate).toHaveBeenCalledWith(container, 0);
  });

  test("hydrates an array of children", () => {
    const container = document.createElement("div");
    const existingSpan = document.createElement("span");
    existingSpan.appendChild(document.createTextNode("a"));
    const existingP = document.createElement("p");
    existingP.appendChild(document.createTextNode("b"));
    container.append(existingSpan, existingP);
    hydrate([jsx("span", { children: "a" }), jsx("p", { children: "b" })], container);
    expect(container.children).toHaveLength(2);
    expect(container.children[0]).toBe(existingSpan);
    expect(container.children[1]).toBe(existingP);
  });

  test("hydrates the initial value of a reactive node", () => {
    const container = document.createElement("div");
    const span = document.createElement("span");
    span.appendChild(document.createTextNode("a"));
    container.appendChild(span);
    const value = reactive<JSX.Node>(jsx("span", { children: "a" }));
    hydrate(value, container);
    expect(container.firstElementChild).toBe(span);
    expect(span.firstChild?.nodeValue).toBe("a");
  });

  test("re-renders when the reactive value changes", () => {
    const container = document.createElement("div");
    const span = document.createElement("span");
    span.appendChild(document.createTextNode("a"));
    container.appendChild(span);
    const value = reactive<JSX.Node>(jsx("span", { children: "a" }));
    hydrate(value, container);
    value.value = jsx("p", { children: "b" });
    expect(container.firstElementChild?.tagName).toBe("P");
    expect(container.firstElementChild?.firstChild?.nodeValue).toBe("b");
  });

  test("leaves a DOM node that is already in the container in place", () => {
    const container = document.createElement("div");
    const node = document.createElement("span");
    container.append(document.createElement("p"), node);
    hydrate([jsx("p", {}), node], container);
    expect(container.lastChild).toBe(node);
    expect(container.childNodes).toHaveLength(2);
  });

  test("creates an element with a ref when the container is empty", () => {
    const container = document.createElement("div");
    const ref = vi.fn();
    hydrate(jsx("span", { ref }), container);
    expect(ref).toHaveBeenCalledWith(container.firstElementChild);
  });

  test("creates a text node when the container is empty", () => {
    const container = document.createElement("div");
    hydrate("hello", container);
    expect(container.childNodes).toHaveLength(1);
    expect(container.firstChild?.nodeValue).toBe("hello");
  });

  test("replaces an existing element with a text node", () => {
    const container = document.createElement("div");
    container.appendChild(document.createElement("span"));
    hydrate("hello", container);
    expect(container.childNodes).toHaveLength(1);
    expect(container.firstChild).toBeInstanceOf(Text);
    expect(container.firstChild?.nodeValue).toBe("hello");
  });

  test("ignores an empty node", () => {
    const container = document.createElement("div");
    hydrate(null, container);
    expect(container.childNodes).toHaveLength(0);
  });

  test("throws for an invalid node", () => {
    const container = document.createElement("div");
    // @ts-expect-error Intentionally invalid node
    expect(() => hydrate({ foo: "bar" }, container)).toThrow("Hydration error: invalid node");
  });

  test("inserts a placeholder for an empty reactive node", () => {
    const container = document.createElement("div");
    const value = reactive<JSX.Node>(null);
    hydrate(value, container);
    expect(container.childNodes).toHaveLength(1);
    expect(container.firstChild).toBeInstanceOf(Comment);

    value.value = jsx("span", {});

    expect(container.innerHTML).toBe("<span></span>");
  });

  test("inserts the placeholder for an empty reactive node before later siblings", () => {
    const container = document.createElement("div");
    const paragraph = document.createElement("p");
    container.appendChild(paragraph);
    const value = reactive<JSX.Node>(null);
    hydrate([value, jsx("p", {})], container);
    expect(container.firstChild).toBeInstanceOf(Comment);
    expect(container.lastChild).toBe(paragraph);

    value.value = jsx("span", {});

    expect(container.innerHTML).toBe("<span></span><p></p>");
  });

  describe("namespaces", () => {
    const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
    const XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

    test("creates SVG elements in the SVG namespace", () => {
      const container = document.createElement("div");
      hydrate(jsx("svg", {}), container);
      expect(container.firstElementChild?.namespaceURI).toBe(SVG_NAMESPACE);
    });

    test("inherits the SVG namespace when replacing a mismatched child", () => {
      const container = document.createElement("div");
      const svg = document.createElementNS(SVG_NAMESPACE, "svg");
      svg.appendChild(document.createElementNS(SVG_NAMESPACE, "rect"));
      container.appendChild(svg);
      hydrate(jsx("svg", { children: jsx("circle", {}) }), container);
      const child = svg.firstElementChild;
      expect(child?.tagName.toLowerCase()).toBe("circle");
      expect(child?.namespaceURI).toBe(SVG_NAMESPACE);
    });

    test("uses the XHTML namespace for foreignObject children", () => {
      const container = document.createElement("div");
      hydrate(
        jsx("svg", {
          children: jsx("foreignObject", {
            children: jsx("div", {}),
          }),
        }),
        container,
      );
      expect(container.querySelector("div")?.namespaceURI).toBe(XHTML_NAMESPACE);
    });

    test("uses the XHTML namespace when hydrating existing foreignObject children", () => {
      const container = document.createElement("div");
      const svg = document.createElementNS(SVG_NAMESPACE, "svg");
      const foreignObject = document.createElementNS(SVG_NAMESPACE, "foreignObject");
      svg.appendChild(foreignObject);
      container.appendChild(svg);
      hydrate(
        jsx("svg", {
          children: jsx("foreignObject", {
            children: jsx("div", {}),
          }),
        }),
        container,
      );
      expect(svg.firstElementChild).toBe(foreignObject);
      expect(container.querySelector("div")?.namespaceURI).toBe(XHTML_NAMESPACE);
    });
  });
});
