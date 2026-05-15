# Core And React

Vitify is split into a small core and framework adapters.

The package root stays framework-agnostic:

```ts
import { vitify, renderPage } from "vitify";
```

Use the core when you want explicit server and client entries, or when you are
building another framework adapter.

The React adapter owns the common React page experience:

```ts
import { vitifyReact } from "vitify/react";
```

Use `vitify/react` when page directories should stay as `App.tsx` components and
Vitify should provide the repeated React SSR and hydration wiring.

## Why Split Them

The core should not know about React. It handles the shared SSR mechanics:

- resolving project paths
- loading the HTML template
- applying template slots
- serializing SSR data
- reading the Vite manifest
- rendering explicit server and client entries

The React adapter handles React-specific defaults:

- loading `App.tsx` from a page directory
- rendering the component on the server
- passing route `data` as component props
- hydrating the same component in the browser
- generating or resolving the client entry needed by Vite

This keeps the default React workflow small without turning the core package into
a React-only renderer.

## Default React Shape

Most React pages should only need a component.

```text
apps/web/src/pages/dashboard/
  App.tsx
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

Fastify still chooses the route and passes request data.

```ts
app.get("/dashboard", async (request, reply) => {
  return reply.vitify.render({
    url: request.url,
    pagePath: "apps/web/src/pages/dashboard",
    data: {
      viewer: request.user,
    },
  });
});
```

## Core Escape Hatch

Use custom entries when a page needs direct control over SSR output, hydration,
status codes, headers, or a non-standard browser boot process.

```ts
import { vitify } from "vitify";

await app.register(vitify, {
  webRoot: "apps/web",
});
```

```ts
reply.vitify.render({
  url: request.url,
  pagePath: "apps/web/src/pages/dashboard",
  serverEntry: "apps/web/src/pages/dashboard/entry-server.tsx",
  clientEntry: "apps/web/src/pages/dashboard/entry-client.tsx",
});
```

That escape hatch is intentionally lower level. The everyday React path should
stay focused on routes and page components.
