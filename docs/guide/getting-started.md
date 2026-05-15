# Getting Started

Vitify is for Fastify apps that already know how they want to route requests.
Fastify stays in charge of startup, middleware, auth, logging, API routes, and
deployment. Vitify only handles the repeated Vite SSR plumbing for a page:

- load the Vite HTML template
- render the page component on the server
- inject HTML, head tags, and SSR data
- hydrate the same component in the browser

## Install

Install Vitify with Fastify, Vite, and React.

```sh
npm install vitify fastify vite react react-dom
```

## Register Vitify

Register the React plugin once from your Fastify app. Point `webRoot` at the
Vite app.

```ts
import Fastify from "fastify";
import { vitifyReact } from "vitify/react";

const app = Fastify({ logger: true });

await app.register(vitifyReact, {
  webRoot: "apps/web",
});
```

`vitify/react` is the React adapter. The package root remains the lower-level
core for custom server and client entries.

By convention, Vitify can use:

- `apps/web/index.html` as the Vite template
- `apps/web/dist/client` as the production client build
- `process.env.NODE_ENV === "production"` to choose manifest mode

Use the full plugin options only when your project does not follow those paths.

## Render A Page

Fastify owns the route. The route chooses which page component should render.

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

## Add A Page

Each page directory can start with a single `App.tsx`.

```text
apps/web/
  index.html
  src/pages/dashboard/
    App.tsx
```

Export the page component. Vitify renders it on the server and hydrates it in
the browser.

```tsx
export default function DashboardPage() {
  return <main>Dashboard</main>;
}
```

You only add custom server or client entries when a page needs to take over the
default SSR or hydration behavior.

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
renders the component through Vite SSR conventions, and the browser hydrates the
same component.

## Pass Data When Needed

Routes can pass request-specific data to the page component.

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
type DashboardPageProps = {
  viewer: {
    id: string;
  };
};

export default function DashboardPage({ viewer }: DashboardPageProps) {
  return <main>Signed in as {viewer.id}</main>;
}
```

Use `data` for the things your Fastify route already knows: viewer state,
permissions, loaded records, feature flags, or anything else that belongs to the
request.

## Customize Entries

Most pages should not need entry files. Use them only when a page needs direct
control over SSR output, hydration, status codes, headers, or a non-standard
client boot process.

```text
apps/web/src/pages/dashboard/
  App.tsx
  entry-server.tsx
  entry-client.tsx
```

```ts
reply.vitify.render({
  url: request.url,
  pagePath: "apps/web/src/pages/dashboard",
  serverEntry: "apps/web/src/pages/dashboard/entry-server.tsx",
  clientEntry: "apps/web/src/pages/dashboard/entry-client.tsx",
});
```

## Customize Paths

Most apps should only need `webRoot`. Set explicit paths when your build layout
is different.

```ts
await app.register(vitifyReact, {
  root: process.cwd(),
  webRoot: "apps/web",
  templatePath: "apps/web/index.html",
  clientOutDir: "apps/web/dist/client",
  isProduction: process.env.NODE_ENV === "production",
});
```

Read the [Fastify Plugin](/guide/fastify-plugin) guide for every option, or the
[Core And React](/guide/core-and-react) guide for the adapter split. The
[Vite SSR Shape](/guide/vite-ssr-shape) guide covers the expected page
structure.
