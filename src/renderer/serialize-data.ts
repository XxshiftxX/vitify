const JSON_HTML_ESCAPE_PATTERN = /[<>&\u2028\u2029]/g;
const JSON_HTML_ESCAPE: Record<string, string> = {
  "<": "\\u003C",
  ">": "\\u003E",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

const HTML_ATTRIBUTE_ESCAPE_PATTERN = /[&<>"']/g;
const HTML_ATTRIBUTE_ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeJsonForHtml(json: string): string {
  return json.replace(
    JSON_HTML_ESCAPE_PATTERN,
    (character) => JSON_HTML_ESCAPE[character] ?? character,
  );
}

export function escapeHtmlAttribute(value: string): string {
  return value.replace(
    HTML_ATTRIBUTE_ESCAPE_PATTERN,
    (character) => HTML_ATTRIBUTE_ESCAPE[character] ?? character,
  );
}

export function serializeSsrDataScript(
  data: unknown,
  id = "__VITIFY_DATA__",
): string {
  const json = escapeJsonForHtml(JSON.stringify(data));
  const escapedId = escapeHtmlAttribute(id);

  return `<script type="application/json" id="${escapedId}">${json}</script>`;
}

export function serializeSsrDataAttribute(data: unknown): string {
  return escapeHtmlAttribute(JSON.stringify(data));
}
