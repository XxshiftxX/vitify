# Vite SSR Shape

Vitify is designed for apps where Fastify owns the server and Vite owns the web
entry files.

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
          app.tsx
          entry-client.tsx
          entry-server.tsx
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

## Page Entries

Each page has a server entry used for SSR and a client entry used for hydration.

The server entry exports `render`. It may return a string or a render result.

```ts
type ServerEntryResult = {
  html: string;
  head?: string;
  status?: number;
  headers?: Record<string, string>;
};
```

The client entry path defaults to `entry-client.tsx` inside the page directory.
Override it when a page uses a different convention.

```ts
reply.vitify.render({
  url: request.url,
  pagePath: "apps/web/src/pages/dashboard",
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
