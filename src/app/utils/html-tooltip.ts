import { LegacyTooltipComponent as TooltipComponent } from "@angular/material/legacy-tooltip";

// Material tooltips show plain text. The order screens build a small HTML
// tooltip for the tax and packaging breakdown, so they used to patch
// TooltipComponent to write every tooltip message as innerHTML. That patch
// applied to every tooltip in the app once one of those screens had opened,
// so any tooltip showing customer or seller text could inject HTML.
//
// Now only strings passed through trustedTooltipHtml() (built in code from
// numbers and platform labels) are rendered as HTML; everything else is shown
// as text.

const trusted = new Set<string>();
let installed = false;

export function trustedTooltipHtml(html: string): string {
  if (trusted.size > 200) {
    trusted.clear();
  }
  trusted.add(html);
  return html;
}

export function installHtmlTooltips(): void {
  if (installed) {
    return;
  }
  installed = true;
  Object.defineProperty(TooltipComponent.prototype, "message", {
    configurable: true,
    set(value: any) {
      const tooltips = document.querySelectorAll(".mat-tooltip");
      if (!tooltips.length) {
        return;
      }
      const el = tooltips[tooltips.length - 1] as HTMLElement;
      if (typeof value === "string" && trusted.has(value)) {
        el.innerHTML = value;
      } else {
        el.textContent = value == null ? "" : String(value);
      }
    },
  });
}
