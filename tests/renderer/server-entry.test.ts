import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadServerEntry } from "../../src/renderer/server-entry.js";

describe("renderer server entry", () => {
  it("loads a server entry render export", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "vitify-entry-"));
    await writeFile(
      path.join(directory, "entry-server.mjs"),
      "export function render({ data }) { return { html: '<main>' + data.message + '</main>', head: '<title>ok</title>' }; }",
      "utf8",
    );

    const entry = await loadServerEntry({
      pagePath: directory,
      serverEntry: "entry-server.mjs",
    });

    expect(await entry.render({ url: "/", data: { message: "ok" } }))
      .toEqual({ html: "<main>ok</main>", head: "<title>ok</title>" });
  });

  it("loads through Vite dev server when provided", async () => {
    const entry = await loadServerEntry({
      pagePath: "/project/src/pages/home",
      viteDevServer: {
        async ssrLoadModule(id) {
          expect(id).toBe("/project/src/pages/home/entry-server.tsx");
          return { render: () => "<main>dev</main>" };
        },
      },
    });

    expect(await entry.render({ url: "/" })).toBe("<main>dev</main>");
  });

  it("throws when a render export is missing", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "vitify-entry-"));
    await writeFile(path.join(directory, "entry-server.mjs"), "export const value = 1;", "utf8");

    await expect(loadServerEntry({ pagePath: directory, serverEntry: "entry-server.mjs" }))
      .rejects.toThrow("Server entry must export a render function");
  });
});
