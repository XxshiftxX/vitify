# Fastify Plugin

Vitify plugins decorate the Fastify instance and reply object. Most React apps
should use the React plugin so page directories can stay as `App.tsx`
components.

```ts
import { vitifyReact } from "vitify/react";

await app.register(vitifyReact, {
  webRoot: "apps/web",
});
```

The lower-level `vitify` plugin from the package root is available when you want
to provide custom server and client entries yourself.

## Options

```ts
interface VitifyPluginOptions {
  webRoot: string;
  root?: string;
  clientOutDir?: string;
  templatePath?: string;
  isProduction?: boolean;
  decorateName?: string;
  templateSlots?: Partial<TemplateSlots>;
  manifest?: ViteManifest;
  viteDevServer?: ViteDevServerForRender;
}
```

`root` is the base directory used to resolve relative paths. The default is
`process.cwd()`.

`webRoot` is the Vite project root that contains the template and page
components.

`clientOutDir` points to the Vite client build output. In production Vitify reads
`.vite/manifest.json` from this directory. The default is `dist/client` inside
`webRoot`.

`templatePath` points to the HTML file that contains the Vitify slots. The
default is `index.html` inside `webRoot`.

`isProduction` controls whether Vitify reads the Vite manifest or emits a
development hydration script. The default follows `process.env.NODE_ENV`.

`decorateName` changes the Fastify decoration name. The default is `vitify`.

## Reply Helper

Use `reply.vitify.render()` when a route should directly send the rendered HTML
response.

```ts
app.get("/dashboard", async (request, reply) => {
  return reply.vitify.render({
    url: request.url,
    pagePath: "apps/web/src/pages/dashboard",
    data: { viewerId: "user_123" },
  });
});
```

The helper applies the rendered status, headers, content type, and HTML body.

## Instance Helper

Use `app.vitify.renderPage()` when a route needs to inspect or modify the HTML
before sending it.

```ts
app.get("/dashboard", async (request, reply) => {
  const html = await app.vitify.renderPage({
    url: request.url,
    pagePath: "apps/web/src/pages/dashboard",
  });

  return reply.type("text/html").send(html);
});
```
