# Vitify

Vitify is a small Fastify-first toolkit for serving Vite SSR pages from an
existing Fastify API app.

It is not trying to become a full web framework. Your Fastify app keeps owning
server startup, API routes, authentication, logging, deployment, and application
state. Vitify focuses on the repeated SSR plumbing between Fastify, Vite, and
page server/client entries.

## What It Handles

- Loading an HTML template.
- Loading a page server entry.
- Rendering page HTML, head tags, status, and headers.
- Injecting SSR data into the template.
- Loading Vite manifest entries in production.
- Adding client entry and CSS tags to the response.
- Exposing a Fastify plugin and lower-level renderer.

## Current Status

Vitify is early. The current package exposes the renderer primitives and a
Fastify plugin surface. The user-facing documentation focuses on the APIs that
exist now and the project shape they support.

Start with the [getting started guide](/guide/getting-started).
