# Vitify

Vitify is a small Fastify-first toolkit for serving Vite SSR pages from an
existing Fastify API app.

It is not trying to become a full web framework. Your Fastify app keeps owning
server startup, API routes, authentication, logging, deployment, and application
state. Vitify focuses on the repeated SSR plumbing between Fastify, Vite, and
page components.

## What It Handles

- Loading an HTML template.
- Rendering a page component on the server.
- Rendering page HTML, head tags, status, and headers.
- Injecting SSR data into the template.
- Using `#root` as the default React mount point.
- Loading Vite manifest entries in production.
- Adding hydration and CSS tags to the response.
- Exposing a Fastify plugin and lower-level renderer.

## Current Status

Vitify is early. The user-facing documentation focuses on the intended app
experience first: route from Fastify, keep pages as components, and reach for
lower-level entries only when a page needs custom control.

Start with the [getting started guide](/guide/getting-started).

Read [Core And React](/guide/core-and-react) for the package split between the
framework-agnostic core and the React adapter.
