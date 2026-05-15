import path from "node:path";
import { pathToFileURL } from "node:url";

export interface ServerEntryRenderOptions {
  url: string;
  data?: unknown;
}

export interface ServerEntryResult {
  html: string;
  head?: string;
  status?: number;
  headers?: Record<string, string>;
}

export interface ServerEntry {
  render(options: ServerEntryRenderOptions): Promise<string | ServerEntryResult> | string | ServerEntryResult;
}

export interface ServerEntryModule {
  render?: ServerEntry["render"];
  default?: Partial<ServerEntry>;
}

export interface ViteDevServerLike {
  ssrLoadModule(id: string): Promise<ServerEntryModule>;
}

export interface LoadServerEntryOptions {
  pagePath: string;
  serverEntry?: string;
  viteDevServer?: ViteDevServerLike;
}

export async function loadServerEntry(
  options: LoadServerEntryOptions,
): Promise<ServerEntry> {
  const serverEntryPath = resolveServerEntryPath(options);
  const module = options.viteDevServer
    ? await options.viteDevServer.ssrLoadModule(serverEntryPath)
    : await import(pathToFileURL(serverEntryPath).href) as ServerEntryModule;

  const render = module.render ?? module.default?.render;

  if (!render) {
    throw new Error(`Server entry must export a render function: ${serverEntryPath}`);
  }

  return { render };
}

function resolveServerEntryPath(options: LoadServerEntryOptions): string {
  if (options.serverEntry) {
    return path.isAbsolute(options.serverEntry)
      ? options.serverEntry
      : path.resolve(options.pagePath, options.serverEntry);
  }

  return path.resolve(options.pagePath, "entry-server.tsx");
}
