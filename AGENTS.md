# Linocut

Linocut is a JSX runtime for TypeScript that renders to the DOM and to HTML strings, with reactive updates driven by `carillon`. It is published to npm as `linocut`.

## Workflow

- Use `pnpm` for dependencies and scripts. Do not use `npm` or `npx`.
- After making changes, run `pnpm check` (types, linting, formatting and tests with coverage), then `pnpm build`. Fix any failures and re-run until both pass.
- Formatting failures can be auto-fixed with `pnpm format`.

## Dependencies

- `carillon` is a peer dependency, as reactives are identified with `instanceof` and must come from the application's copy of the library.
- `entities` is the only runtime dependency. Do not add others.
- `oxlint` and `oxlint-tsgolint` must be upgraded together.

## Coding Style

- Comments should be terse and used sparingly.
- Avoid type assertions (e.g. the `!` operator and `as type`) in favor of more type-safe options where possible.
- The library runs in Node 22+ and modern browsers. Do not add polyfills, Node-only APIs or bundler-specific features such as `import.meta.env`. Use `isServer()` from `src/environment.ts` to detect an environment without a DOM.
- Add `| undefined` to optional properties in public types where `undefined` is an accepted value.
- The public API is what the entry points in `src` export (`index.ts`, `server.ts`, `jsx-runtime.ts` and `jsx-dev-runtime.ts`). Update `src/__tests__/exports.test.ts` when it changes.

## Testing

- Colocate tests with code in `__tests__` directories, as `*.test.ts` files, or `*.test.tsx` for tests written with JSX.
- Use `describe` blocks for each function being tested.
- To test server behavior, remove the DOM with `vi.stubGlobal("document", undefined)` and restore it with `vi.unstubAllGlobals()`.
- Coverage is enforced at 100% by `pnpm check`. New code must be fully covered by tests.

## Publishing

- To release: bump `version` in `package.json`, commit, then create a GitHub release tagged `v<version>`. The `Publish` workflow stages the release on npm.
