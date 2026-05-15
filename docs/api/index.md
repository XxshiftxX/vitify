# API

Vitify exports the Fastify plugin and lower-level renderer utilities from the
package root.

```ts
import {
  vitify,
  renderPage,
  applyTemplateSlots,
  loadServerEntry,
} from "vitify";
```

Most applications should start with the Fastify plugin. Use `renderPage` when
you need to integrate Vitify into a custom server adapter or test rendering
without Fastify.

## Main Exports

- `vitify`: Fastify plugin.
- `renderPage`: Lower-level HTML renderer.
- `DEFAULT_TEMPLATE_SLOTS`: Default HTML slot markers.
- `applyTemplateSlots`: Template replacement helper.
- `loadServerEntry`: Loads a page server entry.
- `collectCssFiles`: Collects recursive CSS files from a Vite manifest entry.
- `serializeSsrDataScript`: Serializes SSR data for HTML injection.
