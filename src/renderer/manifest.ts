export interface ViteManifestEntry {
  file?: string;
  src?: string;
  css?: string[];
  assets?: string[];
  imports?: string[];
  dynamicImports?: string[];
  isEntry?: boolean;
}

export type ViteManifest = Record<string, ViteManifestEntry>;

export function normalizeManifestKey(path: string): string {
  return path.replaceAll("\\", "/").replace(/^\.\//, "");
}

export function getManifestEntry(
  manifest: ViteManifest,
  entryKey: string,
): ViteManifestEntry {
  const normalizedEntryKey = normalizeManifestKey(entryKey);
  const entry = manifest[normalizedEntryKey] ?? manifest[entryKey];

  if (!entry) {
    throw new Error(`Vite manifest entry not found: ${entryKey}`);
  }

  return entry;
}

export function collectCssFiles(
  manifest: ViteManifest,
  entryKey: string,
): string[] {
  const cssFiles = new Set<string>();
  const visited = new Set<string>();

  const visit = (key: string) => {
    const normalizedKey = normalizeManifestKey(key);

    if (visited.has(normalizedKey)) {
      return;
    }

    visited.add(normalizedKey);

    const entry = getManifestEntry(manifest, normalizedKey);

    for (const cssFile of entry.css ?? []) {
      cssFiles.add(cssFile);
    }

    for (const importedKey of entry.imports ?? []) {
      visit(importedKey);
    }
  };

  visit(entryKey);

  return [...cssFiles];
}
