import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { vitify } from "../../src/plugin/fastify.js";

async function createFixture() {
  const root = await mkdtemp(path.join(tmpdir(), "vitify-fastify-"));
  const apiRoot = path.join(root, "apps", "api");
  const pageRoot = path.join(root, "apps", "web", "src", "pages", "home");

  await mkdir(apiRoot, { recursive: true });
  await mkdir(pageRoot, { recursive: true });
  await writeFile(
    path.join(root, "apps", "web", "index.html"),
    '<html><head><!--app-head--></head><body><div id="root"><!--app-html--></div><!--app-data--><!--app-entry-client--></body></html>',
    "utf8",
  );
  await writeFile(
    path.join(pageRoot, "entry-server.mjs"),
    "export function render({ data }) { return { html: '<main>' + data.title + '</main>', head: '<title>' + data.title + '</title>', status: 202, headers: { 'x-vitify-page': data.title } }; }",
    "utf8",
  );

  return { apiRoot };
}

describe("fastify vitify plugin", () => {
  it("decorates app.vitify.renderPage", async () => {
    const { apiRoot } = await createFixture();
    const app = Fastify();

    await app.register(vitify, {
      root: apiRoot,
      webRoot: "../web",
      clientOutDir: "../web/dist/client",
      templatePath: "../web/index.html",
      isProduction: false,
    });
    await app.ready();

    await expect(app.vitify.renderPage({
      url: "/home",
      pagePath: "../web/src/pages/home",
      serverEntry: "entry-server.mjs",
      data: { title: "Home" },
    })).resolves.toContain("<main>Home</main>");

    await app.close();
  });

  it("decorates reply.vitify.render", async () => {
    const { apiRoot } = await createFixture();
    const app = Fastify();

    await app.register(vitify, {
      root: apiRoot,
      webRoot: "../web",
      clientOutDir: "../web/dist/client",
      templatePath: "../web/index.html",
      isProduction: false,
    });
    app.get("/home", async (request, reply) => {
      return reply.vitify.render({
        url: request.url,
        pagePath: "../web/src/pages/home",
        serverEntry: "entry-server.mjs",
        data: { title: "Home" },
      });
    });

    const response = await app.inject("/home");

    expect(response.statusCode).toBe(202);
    expect(response.headers["content-type"]).toContain("text/html; charset=utf-8");
    expect(response.headers["x-vitify-page"]).toBe("Home");
    expect(response.body).toContain("<main>Home</main>");
    expect(response.body).toContain('<script type="module" src="/src/pages/home/entry-client.tsx"></script>');

    await app.close();
  });
});
