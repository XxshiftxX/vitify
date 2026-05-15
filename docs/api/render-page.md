# renderPage

`renderPage` is the lower-level renderer used by the core Fastify plugin and
framework adapters. React applications should start with `vitify/react`, which
can render a page component directly. Use `renderPage` when you need custom
server or client entries, or when you are building another adapter.

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
  rootSelector?: string;
  template?: TemplateInsertionOptions;
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

`pagePath` points to the page directory. At this level, Vitify can load explicit
server and client entries for advanced pages.

Use `clientEntry` or `serverEntry` when a page needs a custom SSR or hydration
entry.

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
