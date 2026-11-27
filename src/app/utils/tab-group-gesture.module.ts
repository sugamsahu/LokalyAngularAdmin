import { Directive, NgModule } from "@angular/core";
import { MatTabGroup } from "@angular/material/tabs";
import { MatLegacyTabGroup } from "@angular/material/legacy-tabs";
import { MatTabGroupGestureModule } from "@angular-material-gesture/mat-tab-group-gesture";

/**
 * The swipe-tabs library (@angular-material-gesture/mat-tab-group-gesture)
 * injects MatTabGroup. Since Angular 15 the app uses the legacy tab group
 * (MatLegacyTabGroup), so that injection failed with a NullInjectorError.
 * This directive sits on the same <mat-tab-group matTabGroupGesture> elements
 * and provides the legacy tab group under the MatTabGroup token. The library
 * only uses selectedIndex, _tabs and _elementRef, which both classes share.
 *
 * Remove this when the tabs move to the MDC MatTabGroup.
 */
@Directive({
  selector: "mat-tab-group[matTabGroupGesture]",
  providers: [{ provide: MatTabGroup, useExisting: MatLegacyTabGroup }],
})
export class LegacyTabGroupGestureAdapterDirective {}

/** Use this instead of MatTabGroupGestureModule. */
@NgModule({
  imports: [MatTabGroupGestureModule],
  declarations: [LegacyTabGroupGestureAdapterDirective],
  exports: [MatTabGroupGestureModule, LegacyTabGroupGestureAdapterDirective],
})
export class TabGroupGestureModule {}
