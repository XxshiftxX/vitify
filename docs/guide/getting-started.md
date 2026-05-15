# Getting Started

Install Vitify alongside Fastify and the Vite/React packages your app already
uses.

```sh
npm install vitify fastify vite react react-dom
```

Register the Fastify plugin from your API app and point it at the Vite web
project.

```ts
import Fastify from "fastify";
import { vitify } from "vitify";

const app = Fastify({ logger: true });

await app.register(vitify, {
  root: process.cwd(),
  webRoot: "apps/web",
  clientOutDir: "apps/web/dist/client",
  templatePath: "apps/web/index.html",
  isProduction: process.env.NODE_ENV === "production",
});

app.get("/dashboard", async (request, reply) => {
  return reply.vitify.render({
    url: request.url,
    pagePath: "apps/web/src/pages/dashboard",
    data: {
      viewer: { id: "user_123" },
    },
  });
});
```

Vitify expects each page directory to provide a server entry and a client entry
by convention.

```text
apps/web/
  index.html
  src/pages/dashboard/
    app.tsx
    entry-client.tsx
    entry-server.tsx
```

The default server entry is `entry-server.tsx`. It must export `render`.

```tsx
import { renderToString } from "react-dom/server";
import { App } from "./app";

export function render() {
  return {
    html: renderToString(<App />),
    head: "<title>Dashboard</title>",
  };
}
```

The default client entry is `entry-client.tsx`.

```tsx
import { hydrateRoot } from "react-dom/client";
import { App } from "./app";

hydrateRoot(document.getElementById("root")!, <App />);
```

Your Vite template needs the default Vitify slots.

```html
<!doctype html>
<html>
  <head>
    <!--app-head-->
    <!--app-data-->
  </head>
  <body>
    <div id="root"><!--app-html--></div>
    <!--app-entry-client-->
  </body>
</html>
```
