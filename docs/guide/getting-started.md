# Getting Started

Vitify is for Fastify apps that already know how they want to route requests.
Fastify stays in charge of startup, middleware, auth, logging, API routes, and
deployment. Vitify only handles the repeated Vite SSR plumbing for a page:

- load the Vite HTML template
- run the page server entry
- inject HTML, head tags, and SSR data
- point the browser at the matching client entry

## Install

Install Vitify with Fastify and the Vite runtime your UI uses.

```sh
npm install vitify fastify vite
```

For the React example below, install React too.

```sh
npm install react react-dom
```

## Register Vitify

Register the plugin once from your Fastify app. Point `webRoot` at the Vite app.

```ts
import Fastify from "fastify";
import { vitify } from "vitify";

const app = Fastify({ logger: true });

await app.register(vitify, {
  webRoot: "apps/web",
});
```

By convention, Vitify can use:

- `apps/web/index.html` as the Vite template
- `apps/web/dist/client` as the production client build
- `process.env.NODE_ENV === "production"` to choose manifest mode

Use the full plugin options only when your project does not follow those paths.

## Render A Page

Fastify owns the route. The route chooses which page directory should render.

```ts
app.get("/dashboard", async (request, reply) => {
  return reply.vitify.render({
    url: request.url,
    pagePath: "apps/web/src/pages/dashboard",
  });
});
```

Vitify does not add a file-system router. A URL renders a page only when your
Fastify route asks it to.

## Add Page Entries

Each page directory has one server entry for SSR and one client entry for
hydration.

```text
apps/web/
  index.html
  src/pages/dashboard/
    App.tsx
    entry-server.tsx
    entry-client.tsx
```

The server entry renders HTML.

```tsx
import { renderToString } from "react-dom/server";
import { App } from "./App";

export function render() {
  return renderToString(<App />);
}
```

The client entry hydrates the same app in the browser.

```tsx
import { hydrateRoot } from "react-dom/client";
import { App } from "./App";

hydrateRoot(document.getElementById("root")!, <App />);
```

## Add Template Slots

Your Vite template needs the Vitify slots.

```html
<!doctype html>
<html>
  <head>
    <!--app-head-->
    <!--app-data-->
  </head>
  <body>
    <div id="root"><!--app-html--></div>
    <!--app-entry-client-->
  </body>
</html>
```

That is the full loop: Fastify receives the request, chooses the page, Vitify
renders it through Vite SSR conventions, and the browser hydrates the matching
client entry.

## Pass Data When Needed

Routes can pass request-specific data to the page server entry.

```ts
app.get("/dashboard", async (request, reply) => {
  return reply.vitify.render({
    url: request.url,
    pagePath: "apps/web/src/pages/dashboard",
    data: {
      viewer: { id: request.user.id },
    },
  });
});
```

```tsx
import { renderToString } from "react-dom/server";
import { App } from "./App";

export function render({ data }) {
  return {
    html: renderToString(<App viewer={data.viewer} />),
    head: "<title>Dashboard</title>",
  };
}
```

Use `data` for the things your Fastify route already knows: viewer state,
permissions, loaded records, feature flags, or anything else that belongs to the
request.

## Customize Paths

Most apps should only need `webRoot`. Set explicit paths when your build layout
is different.

```ts
await app.register(vitify, {
  root: process.cwd(),
  webRoot: "apps/web",
  templatePath: "apps/web/index.html",
  clientOutDir: "apps/web/dist/client",
  isProduction: process.env.NODE_ENV === "production",
});
```

Read the [Fastify Plugin](/guide/fastify-plugin) guide for every option, or the
[Vite SSR Shape](/guide/vite-ssr-shape) guide for the expected page structure.
