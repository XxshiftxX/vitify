import { describe, expect, it } from "vitest";
import {
  collectCssFiles,
  getManifestEntry,
  type ViteManifest,
} from "../../src/renderer/manifest.js";

describe("renderer manifest", () => {
  it("finds entries with normalized path separators", () => {
    const manifest: ViteManifest = {
      "src/pages/dashboard/entry-client.tsx": {
        file: "assets/dashboard.js",
      },
    };

    expect(
      getManifestEntry(manifest, "src\\pages\\dashboard\\entry-client.tsx"),
    ).toEqual({ file: "assets/dashboard.js" });
  });

  it("collects CSS from an entry and recursive imports without duplicates", () => {
    const manifest: ViteManifest = {
      "src/pages/dashboard/entry-client.tsx": {
        file: "assets/dashboard.js",
        css: ["assets/dashboard.css"],
        imports: ["src/pages/common/layout.tsx", "src/pages/common/button.tsx"],
      },
      "src/pages/common/layout.tsx": {
        file: "assets/layout.js",
        css: ["assets/layout.css", "assets/shared.css"],
        imports: ["src/pages/common/button.tsx"],
      },
      "src/pages/common/button.tsx": {
        file: "assets/button.js",
        css: ["assets/shared.css", "assets/button.css"],
      },
    };

    expect(
      collectCssFiles(manifest, "src/pages/dashboard/entry-client.tsx"),
    ).toEqual([
      "assets/dashboard.css",
      "assets/layout.css",
      "assets/shared.css",
      "assets/button.css",
    ]);
  });

  it("throws when the manifest entry is missing", () => {
    expect(() => getManifestEntry({}, "src/pages/missing/entry-client.tsx"))
      .toThrow("Vite manifest entry not found");
  });
});
