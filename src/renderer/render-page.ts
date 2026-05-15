import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  collectCssFiles,
  getManifestEntry,
  normalizeManifestKey,
  type ViteManifest,
} from "./manifest.js";
import { serializeSsrDataScript } from "./serialize-data.js";
import {
  DEFAULT_TEMPLATE_SLOTS,
  applyTemplateSlots,
  type TemplateSlots,
} from "./template.js";
import {
  loadServerEntry as defaultLoadServerEntry,
  type ServerEntry,
  type ServerEntryResult,
  type ViteDevServerLike,
} from "./server-entry.js";

export interface ViteDevServerForRender extends ViteDevServerLike {
  transformIndexHtml?(url: string, html: string): Promise<string> | string;
}

export interface RendererContext {
  root: string;
  webRoot: string;
  clientOutDir: string;
  templatePath: string;
  isProduction: boolean;
  templateSlots?: Partial<TemplateSlots>;
  manifest?: ViteManifest;
  viteDevServer?: ViteDevServerForRender;
  readFile?: (path: string, encoding: BufferEncoding) => Promise<string>;
  loadServerEntry?: (options: {
    pagePath: string;
    serverEntry?: string;
    viteDevServer?: ViteDevServerLike;
  }) => Promise<ServerEntry>;
}

export interface RenderPageOptions {
  url: string;
  pagePath: string;
  data?: unknown;
  clientEntry?: string;
  serverEntry?: string;
}

export interface RenderedPage {
  html: string;
  status: number;
  headers: Record<string, string>;
}

export async function renderPage(
  context: RendererContext,
  options: RenderPageOptions,
): Promise<RenderedPage> {
  const resolved = resolveRenderPaths(context, options);
  const template = await loadTemplate(context, options.url, resolved.templatePath);
  const loadServerEntry = context.loadServerEntry ?? defaultLoadServerEntry;
  const serverEntry = await loadServerEntry({
    pagePath: resolved.pagePath,
    ...(options.serverEntry ? { serverEntry: options.serverEntry } : {}),
    ...(context.viteDevServer ? { viteDevServer: context.viteDevServer } : {}),
  });

  const rendered = normalizeServerEntryResult(
    await serverEntry.render({ url: options.url, data: options.data }),
  );
  const entryTags = context.isProduction
    ? await renderProductionEntryTags(context, resolved.clientEntryPath)
    : renderDevelopmentEntryTag(resolved.webRoot, resolved.clientEntryPath);
  const dataTag = options.data === undefined
    ? ""
    : serializeSsrDataScript(options.data);
  const slots = { ...DEFAULT_TEMPLATE_SLOTS, ...context.templateSlots };

  return {
    html: applyTemplateSlots(template, {
      html: rendered.html,
      head: rendered.head ?? "",
      data: dataTag,
      entry: entryTags,
    }, slots),
    status: rendered.status ?? 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      ...rendered.headers,
    },
  };
}

function resolveRenderPaths(context: RendererContext, options: RenderPageOptions) {
  const root = path.resolve(context.root);
  const webRoot = resolveProjectPath(root, context.webRoot);
  const pagePath = resolveProjectPath(root, options.pagePath);
  const clientEntryPath = options.clientEntry
    ? resolveProjectPath(root, options.clientEntry)
    : path.join(pagePath, "entry-client.tsx");
  const templatePath = resolveProjectPath(root, context.templatePath);

  return { root, webRoot, pagePath, clientEntryPath, templatePath };
}

function resolveProjectPath(root: string, input: string): string {
  return path.isAbsolute(input) ? input : path.resolve(root, input);
}

async function loadTemplate(
  context: RendererContext,
  url: string,
  templatePath: string,
): Promise<string> {
  const fileReader = context.readFile ?? readFile;
  const rawTemplate = await fileReader(templatePath, "utf8");

  if (!context.isProduction && context.viteDevServer?.transformIndexHtml) {
    return context.viteDevServer.transformIndexHtml(url, rawTemplate);
  }

  return rawTemplate;
}

function normalizeServerEntryResult(
  result: string | ServerEntryResult,
): ServerEntryResult {
  if (typeof result === "string") {
    return { html: result };
  }

  return result;
}

function renderDevelopmentEntryTag(webRoot: string, clientEntryPath: string): string {
  const devEntryPath = normalizeManifestKey(path.relative(webRoot, clientEntryPath));

  return `<script type="module" src="/${devEntryPath}"></script>`;
}

async function renderProductionEntryTags(
  context: RendererContext,
  clientEntryPath: string,
): Promise<string> {
  const root = path.resolve(context.root);
  const webRoot = resolveProjectPath(root, context.webRoot);
  const clientOutDir = resolveProjectPath(root, context.clientOutDir);
  const manifest = context.manifest ?? await loadManifest(context, clientOutDir);
  const clientEntryKey = normalizeManifestKey(path.relative(webRoot, clientEntryPath));
  const entry = getManifestEntry(manifest, clientEntryKey);
  const tags: string[] = [];

  for (const cssFile of collectCssFiles(manifest, clientEntryKey)) {
    tags.push(`<link rel="stylesheet" href="/${cssFile}">`);
  }

  if (!entry.file) {
    throw new Error(`Vite manifest entry has no file: ${clientEntryKey}`);
  }

  tags.push(`<script type="module" src="/${entry.file}"></script>`);

  return tags.join("");
}

async function loadManifest(
  context: RendererContext,
  clientOutDir: string,
): Promise<ViteManifest> {
  const fileReader = context.readFile ?? readFile;
  const manifestPath = path.join(clientOutDir, ".vite", "manifest.json");
  const manifestJson = await fileReader(manifestPath, "utf8");

  return JSON.parse(manifestJson) as ViteManifest;
}
