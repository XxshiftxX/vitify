export interface TemplateSlots {
  html: string;
  head: string;
  entry: string;
  data: string;
}

export interface TemplateSlotValues {
  html?: string;
  head?: string;
  entry?: string;
  data?: string;
}

export const DEFAULT_TEMPLATE_SLOTS: TemplateSlots = {
  html: "<!--app-html-->",
  head: "<!--app-head-->",
  entry: "<!--app-entry-client-->",
  data: "<!--app-data-->",
};

export function applyTemplateSlots(
  template: string,
  values: TemplateSlotValues,
  slots: TemplateSlots = DEFAULT_TEMPLATE_SLOTS,
): string {
  return replaceSlot(
    replaceSlot(
      replaceSlot(
        replaceSlot(template, slots.html, values.html ?? ""),
        slots.head,
        values.head ?? "",
      ),
      slots.entry,
      values.entry ?? "",
    ),
    slots.data,
    values.data ?? "",
  );
}

function replaceSlot(template: string, slot: string, value: string): string {
  return template.split(slot).join(value);
}
