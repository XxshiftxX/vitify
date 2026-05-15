import { describe, expect, it } from "vitest";
import {
  escapeHtmlAttribute,
  escapeJsonForHtml,
  serializeSsrDataAttribute,
  serializeSsrDataScript,
} from "../../src/renderer/serialize-data.js";

describe("renderer serialize data", () => {
  it("escapes JSON characters that can break HTML script context", () => {
    expect(escapeJsonForHtml(JSON.stringify({ value: "</script>&" })))
      .toBe('{"value":"\\u003C/script\\u003E\\u0026"}');
  });

  it("escapes HTML attribute values for legacy data-ssr usage", () => {
    expect(escapeHtmlAttribute(`"'><&`)).toBe("&quot;&#39;&gt;&lt;&amp;");
  });

  it("serializes SSR data into an application/json script tag", () => {
    expect(serializeSsrDataScript({ value: "</script>" }))
      .toBe(
        '<script type="application/json" id="__VITIFY_DATA__">{"value":"\\u003C/script\\u003E"}</script>',
      );
  });

  it("serializes SSR data for a data attribute", () => {
    expect(serializeSsrDataAttribute({ quote: '"' }))
      .toBe("{&quot;quote&quot;:&quot;\\&quot;&quot;}");
  });
});
