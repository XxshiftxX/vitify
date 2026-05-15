# API

Vitify exports the framework-agnostic core from the package root.

```ts
import {
  vitify,
  renderPage,
  applyTemplateSlots,
  loadServerEntry,
} from "vitify";
```

React applications should start with the React adapter.

```ts
import { vitifyReact } from "vitify/react";
```

Use the core exports when you need to integrate Vitify into a custom server
adapter, test rendering without Fastify, take direct control of custom page
entries, or build another framework adapter.

## Main Exports

- `vitify`: Core Fastify plugin for explicit server and client entries.
- `renderPage`: Core HTML renderer.
- `DEFAULT_TEMPLATE_SLOTS`: Default HTML slot markers.
- `applyTemplateSlots`: Template replacement helper.
- `loadServerEntry`: Loads a custom page server entry.
- `collectCssFiles`: Collects recursive CSS files from a Vite manifest entry.
- `serializeSsrDataScript`: Serializes SSR data for HTML injection.

## React Adapter

- `vitifyReact`: Fastify plugin for React page components.

The React adapter builds on the core renderer but owns the React-specific
defaults for `App.tsx`, server rendering, prop passing, hydration, and client
entry generation.
