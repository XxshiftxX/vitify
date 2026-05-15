# Fastify Plugin

The `vitify` plugin decorates the Fastify instance and reply object.

```ts
import { vitify } from "vitify";

await app.register(vitify, {
  root: process.cwd(),
  webRoot: "apps/web",
  clientOutDir: "apps/web/dist/client",
  templatePath: "apps/web/index.html",
  isProduction: process.env.NODE_ENV === "production",
});
```

## Options

```ts
interface VitifyPluginOptions {
  root: string;
  webRoot: string;
  clientOutDir: string;
  templatePath: string;
  isProduction: boolean;
  decorateName?: string;
  templateSlots?: Partial<TemplateSlots>;
  manifest?: ViteManifest;
  viteDevServer?: ViteDevServerForRender;
}
```

`root` is the base directory used to resolve relative paths.

`webRoot` is the Vite project root that contains the template and page entries.

`clientOutDir` points to the Vite client build output. In production Vitify reads
`.vite/manifest.json` from this directory.

`templatePath` points to the HTML file that contains the Vitify slots.

`isProduction` controls whether Vitify reads the Vite manifest or emits a direct
development entry script.

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
