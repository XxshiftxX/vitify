import { describe, expect, it } from "vitest";
import {
  DEFAULT_TEMPLATE_SLOTS,
  applyTemplateSlots,
} from "../../src/renderer/template.js";

describe("renderer template", () => {
  it("replaces default template slots", () => {
    const template = [
      "<head>",
      DEFAULT_TEMPLATE_SLOTS.head,
      "</head>",
      "<body>",
      '<div id="root">',
      DEFAULT_TEMPLATE_SLOTS.html,
      "</div>",
      DEFAULT_TEMPLATE_SLOTS.data,
      DEFAULT_TEMPLATE_SLOTS.entry,
      "</body>",
    ].join("");

    expect(
      applyTemplateSlots(template, {
        head: "<title>Dashboard</title>",
        html: "<main>ok</main>",
        data: "<script></script>",
        entry: '<script type="module" src="/entry.js"></script>',
      }),
    ).toBe(
      '<head><title>Dashboard</title></head><body><div id="root"><main>ok</main></div><script></script><script type="module" src="/entry.js"></script></body>',
    );
  });

  it("supports custom template slots", () => {
    expect(
      applyTemplateSlots(
        "<html>{{head}}{{body}}</html>",
        { head: "<title>Custom</title>", html: "<main>Custom</main>" },
        {
          head: "{{head}}",
          html: "{{body}}",
          entry: "{{entry}}",
          data: "{{data}}",
        },
      ),
    ).toBe("<html><title>Custom</title><main>Custom</main></html>");
  });
});
