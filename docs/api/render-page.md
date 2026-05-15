# renderPage

`renderPage` is the lower-level renderer used by the Fastify plugin.

```ts
import { renderPage } from "vitify";

const page = await renderPage(
  {
    root: process.cwd(),
    webRoot: "apps/web",
    clientOutDir: "apps/web/dist/client",
    templatePath: "apps/web/index.html",
    isProduction: true,
  },
  {
    url: "/dashboard",
    pagePath: "apps/web/src/pages/dashboard",
    data: { viewerId: "user_123" },
  },
);

console.log(page.html);
```

## Context

```ts
interface RendererContext {
  root: string;
  webRoot: string;
  clientOutDir: string;
  templatePath: string;
  isProduction: boolean;
  templateSlots?: Partial<TemplateSlots>;
  manifest?: ViteManifest;
  viteDevServer?: ViteDevServerForRender;
}
```

## Options

```ts
interface RenderPageOptions {
  url: string;
  pagePath: string;
  data?: unknown;
  clientEntry?: string;
  serverEntry?: string;
}
```

`pagePath` points to the page directory. By default Vitify loads
`entry-server.tsx` and `entry-client.tsx` from that directory.

Use `clientEntry` or `serverEntry` when a page does not follow the default file
names.

## Result

```ts
interface RenderedPage {
  html: string;
  status: number;
  headers: Record<string, string>;
}
```

The default content type is `text/html; charset=utf-8`. Page server entries can
return extra headers and status codes.
