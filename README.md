# Linocut

A small, fast JSX-based UI library for JavaScript/TypeScript, without a virtual DOM.

Components are plain functions that run once. Pass a [carillon](https://github.com/obolton/carillon) reactive value as a child or an attribute, and Linocut updates only that part of the DOM when the value changes.

```tsx
import { reactive } from "carillon";
import { render } from "linocut";

const count = reactive(0);

function Counter() {
  return (
    <button type="button" on:click={() => count.value++}>
      Count: {count}
    </button>
  );
}

document.body.append(...render(<Counter />));
```

- Fine-grained updates to elements and attributes.
- Server rendering and hydration are built in.
- Works out of the box with TypeScript, with no compiler plugin needed.
- Typed HTML, SVG and MathML attributes.
- ESM only, with TypeScript types included.

## Installation

```sh
npm install linocut carillon
```

Linocut targets ES2025. It runs on Node 22 or later and in current browsers.

Set Linocut as the JSX import source in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "linocut"
  }
}
```

## Usage

### Attributes and properties

```tsx
const selected = reactive(false);
const width = reactive(100);
const name = reactive("");

<input
  type="text"
  classList={{ field: true, selected }}
  style={{ width: width.derive((value) => `${value}px`) }}
  disabled={selected}
  bind:value={name}
  $tabIndex={1}
  on:input={(event) => console.log(event)}
  ref={(element) => element.focus()}
/>;
```

| Syntax           | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| `name={value}`   | Sets an attribute. Accepts a reactive.                           |
| `classList={{}}` | Toggles classes from an object of booleans or reactives.         |
| `style={{}}`     | Sets styles from an object of values or reactives.               |
| `$name={value}`  | Assigns a DOM property.                                          |
| `bind:name={r}`  | Assigns a DOM property and updates it when the reactive changes. |
| `on:event={fn}`  | Adds an event listener.                                          |
| `ref={fn}`       | Calls the function with the element.                             |

### Control flow

`If`, `Each` and `Switch` take a reactive value and update when it changes. `Portal` renders its children into another element.

```tsx
import { array, reactive } from "carillon";
import { Case, Default, Each, If, Portal, Switch } from "linocut";

const items = array(["a", "b"]);
const open = reactive(false);
const status = reactive<"loading" | "ready">("loading");

<>
  <If condition={open}>
    <p>Open</p>
  </If>

  <ul>
    <Each items={items}>{(item) => <li>{item}</li>}</Each>
  </ul>

  <Switch value={status}>
    <Case value="loading">Loading…</Case>
    <Default>Ready</Default>
  </Switch>

  <Portal>
    <dialog />
  </Portal>
</>;
```

### Server rendering and hydration

Render to an HTML string on the server:

```tsx
import { renderToString } from "linocut/server";

const html = renderToString(<App />);
```

Then attach to the existing DOM in the browser:

```tsx
import { hydrate } from "linocut";

hydrate(<App />, document.body);
```

## Development

```sh
pnpm install
pnpm check # typecheck, lint, format check and test
pnpm build # bundle to dist/
pnpm dev # rebuild on changes
```

## License

[MIT](./LICENSE)
