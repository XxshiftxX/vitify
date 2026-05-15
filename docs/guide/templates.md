# Templates

Vitify needs a few insertion points in the HTML response: page HTML, head tags,
SSR data, and the browser hydration script. React apps should not need to manage
those insertion points manually.

## React Defaults

With `vitify/react`, the Vite template only needs a root element.

```html
<!doctype html>
<html>
  <head></head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

The React adapter uses these defaults:

- render page HTML inside `#root`
- insert page head tags before `</head>`
- insert SSR data before `</body>`
- insert the hydration script before `</body>`

That keeps the common template shape close to a normal Vite app.

## Root Selector

Use `rootSelector` when an existing app mounts somewhere other than `#root`.

```ts
await app.register(vitifyReact, {
  webRoot: "apps/web",
  rootSelector: "#app",
});
```

```html
<div id="app"></div>
```

## Template Insertion

Use explicit template insertion options when an existing HTML shell needs more
control over where Vitify writes output.

```ts
await app.register(vitifyReact, {
  webRoot: "apps/web",
  template: {
    rootSelector: "#app",
    head: "head:end",
    data: "body:end",
    client: "body:end",
  },
});
```

The default placement should be enough for most pages. Reach for explicit
template insertion only when the app shell already has strict ordering
requirements.

## Core Slots

The package root exposes lower-level slot control for adapters and advanced
integrations.

```html
<!--app-head-->
<!--app-data-->
<div id="root"><!--app-html--></div>
<!--app-entry-client-->
```

```ts
import { vitify } from "vitify";

await app.register(vitify, {
  webRoot: "apps/web",
  templateSlots: {
    html: "<!--app-html-->",
    head: "<!--app-head-->",
    data: "<!--app-data-->",
    entry: "<!--app-entry-client-->",
  },
});
```

Prefer `vitify/react` template options for React apps. Use `templateSlots` when
you are working at the core layer or building another adapter.
