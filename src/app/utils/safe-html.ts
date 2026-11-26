import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import * as DOMPurifyModule from "dompurify";

// HTML from the API that has to keep its formatting (seller item
// descriptions, help text, sent emails) used to be passed straight to
// bypassSecurityTrustHtml, so a <script> or onerror= in it ran in the panel.
// DOMPurify removes scripts, event handlers and javascript: links but keeps
// styling, which Angular's own sanitizer would strip.

// The package's ES build has a default export while its types use `export =`;
// accept either shape.
const DOMPurify: DOMPurifyModule.DOMPurifyI =
  (DOMPurifyModule as any).default || (DOMPurifyModule as any);

// Links that open a new tab must not get a handle on the panel window.
DOMPurify.addHook("afterSanitizeAttributes", (node: Element) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

// Templates call these on every change detection, so results are cached.
const cache = new Map<string, SafeHtml>();

export function cleanHtml(value: any): string {
  const raw = value == null ? "" : String(value);
  return DOMPurify.sanitize(raw, { ADD_ATTR: ["target"] }) as string;
}

export function trustCleanHtml(sanitizer: DomSanitizer, value: any): SafeHtml {
  const raw = value == null ? "" : String(value);
  let safe = cache.get(raw);
  if (!safe) {
    if (cache.size > 300) {
      cache.clear();
    }
    safe = sanitizer.bypassSecurityTrustHtml(cleanHtml(raw));
    cache.set(raw, safe);
  }
  return safe;
}
