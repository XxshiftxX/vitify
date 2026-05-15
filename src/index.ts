export type {
  ViteManifest,
  ViteManifestEntry,
} from "./renderer/manifest.js";
export {
  collectCssFiles,
  getManifestEntry,
  normalizeManifestKey,
} from "./renderer/manifest.js";
export {
  escapeHtmlAttribute,
  escapeJsonForHtml,
  serializeSsrDataAttribute,
  serializeSsrDataScript,
} from "./renderer/serialize-data.js";
export {
  DEFAULT_TEMPLATE_SLOTS,
  applyTemplateSlots,
} from "./renderer/template.js";
