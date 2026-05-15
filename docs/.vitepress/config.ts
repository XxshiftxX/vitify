import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Vitify",
  description: "Fastify-first Vite SSR utilities.",
  cleanUrls: true,
  base: process.env.DOCS_BASE ?? "/",
  vite: {
    server: {
      allowedHosts: ["shift-server"],
    },
  },
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API", link: "/api/" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Core And React", link: "/guide/core-and-react" },
          { text: "Fastify Plugin", link: "/guide/fastify-plugin" },
          { text: "Templates", link: "/guide/templates" },
          { text: "Vite SSR Shape", link: "/guide/vite-ssr-shape" },
        ],
      },
      {
        text: "API",
        items: [
          { text: "Overview", link: "/api/" },
          { text: "renderPage", link: "/api/render-page" },
        ],
      },
    ],
    socialLinks: [],
  },
});
