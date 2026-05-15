import { describe, expect, it } from "vitest";
import { renderPage, type RendererContext } from "../../src/renderer/render-page.js";

function createContext(overrides: Partial<RendererContext> = {}): RendererContext {
  return {
    root: "/repo/apps/api",
    webRoot: "../web",
    clientOutDir: "../web/dist/client",
    templatePath: "../web/index.html",
    isProduction: false,
    async readFile(filePath) {
      expect(filePath).toBe("/repo/apps/web/index.html");
      return "<html><head><!--app-head--></head><body><div id=\"root\"><!--app-html--></div><!--app-data--><!--app-entry-client--></body></html>";
    },
    async loadServerEntry({ pagePath }) {
      expect(pagePath).toBe("/repo/apps/web/src/pages/dashboard");
      return {
        render({ data }) {
          return {
            html: `<main>${(data as { title?: string } | undefined)?.title ?? "ok"}</main>`,
            head: "<title>Dashboard</title>",
            status: 201,
            headers: { "x-page": "dashboard" },
          };
        },
      };
    },
    ...overrides,
  };
}

describe("renderer render page", () => {
  it("renders a development page with transformed template and SSR data", async () => {
    const page = await renderPage(createContext({
      viteDevServer: {
        async ssrLoadModule() {
          throw new Error("loadServerEntry override should be used");
        },
        transformIndexHtml(url, html) {
          expect(url).toBe("/dashboard");
          return html.replace("</head>", '<script type="module" src="/@vite/client"></script></head>');
        },
      },
    }), {
      url: "/dashboard",
      pagePath: "../web/src/pages/dashboard",
      data: { title: "Vitify" },
    });

    expect(page.status).toBe(201);
    expect(page.headers).toEqual({
      "content-type": "text/html; charset=utf-8",
      "x-page": "dashboard",
    });
    expect(page.html).toContain('<script type="module" src="/@vite/client"></script>');
    expect(page.html).toContain("<title>Dashboard</title>");
    expect(page.html).toContain("<main>Vitify</main>");
    expect(page.html).toContain('<script type="application/json" id="__VITIFY_DATA__">{"title":"Vitify"}</script>');
    expect(page.html).toContain('<script type="module" src="/src/pages/dashboard/entry-client.tsx"></script>');
  });

  it("renders production asset tags from the Vite manifest", async () => {
    const page = await renderPage(createContext({
      isProduction: true,
      manifest: {
        "src/pages/dashboard/entry-client.tsx": {
          file: "assets/dashboard.js",
          css: ["assets/dashboard.css"],
          imports: ["src/pages/common/layout.tsx"],
        },
        "src/pages/common/layout.tsx": {
          file: "assets/layout.js",
          css: ["assets/layout.css"],
        },
      },
    }), {
      url: "/dashboard",
      pagePath: "../web/src/pages/dashboard",
    });

    expect(page.html).toContain('<link rel="stylesheet" href="/assets/dashboard.css">');
    expect(page.html).toContain('<link rel="stylesheet" href="/assets/layout.css">');
    expect(page.html).toContain('<script type="module" src="/assets/dashboard.js"></script>');
  });
});
