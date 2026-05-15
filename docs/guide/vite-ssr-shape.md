# Vite SSR Shape

Vitify is designed for apps where Fastify owns the server and Vite owns the web
page components.

```text
repo/
  apps/
    api/
      src/app.ts
      package.json
    web/
      index.html
      vite.config.ts
      src/pages/
        dashboard/
          App.tsx
```

The Fastify app registers API routes and chooses which URL should render which
page. Vitify does not discover routes or impose a file-system router.

```ts
app.get("/dashboard", async (request, reply) => {
  return reply.vitify.render({
    url: request.url,
    pagePath: "apps/web/src/pages/dashboard",
  });
});
```

## Page Components

With `vitify/react`, each page can be a single `App.tsx` component.

```tsx
type DashboardPageProps = {
  viewer?: {
    id: string;
  };
};

export default function DashboardPage({ viewer }: DashboardPageProps) {
  return <main>{viewer ? `Hello ${viewer.id}` : "Dashboard"}</main>;
}
```

Route `data` is passed to the component as props.

```ts
reply.vitify.render({
  url: request.url,
  pagePath: "apps/web/src/pages/dashboard",
  data: {
    viewer: request.user,
  },
});
```

## Custom Entries

Custom entries are an escape hatch, not the default page shape. Use them when a
page needs direct control over SSR output, hydration, status codes, headers, or a
non-standard client boot process.

Custom entries belong to the lower-level core path. React pages should start
with `App.tsx` and add entries only when the adapter defaults are not enough.

The server entry exports `render`. It may return a string or a render result.

```ts
type ServerEntryResult = {
  html: string;
  head?: string;
  status?: number;
  headers?: Record<string, string>;
};
```

The client entry hydrates the page in the browser. Pass explicit entry paths
when a page uses custom entries.

```ts
reply.vitify.render({
  url: request.url,
  pagePath: "apps/web/src/pages/dashboard",
  serverEntry: "apps/web/src/pages/dashboard/entry-server.tsx",
  clientEntry: "apps/web/src/client/dashboard.tsx",
});
```

## Template Slots

Vitify replaces four slots in the HTML template.

```html
<!--app-html-->
<!--app-head-->
<!--app-data-->
<!--app-entry-client-->
```

You can override slot strings through `templateSlots` if your existing template
already uses different markers.
