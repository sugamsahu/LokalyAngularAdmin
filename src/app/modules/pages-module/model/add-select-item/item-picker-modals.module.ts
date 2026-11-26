import { NgModule } from "@angular/core";
import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { BarcodeScannerLivestreamModule } from "ngx-barcode-scanner";
import { CarouselModule } from "ngx-owl-carousel-o";
import { NgImageSliderModule } from "ng-image-slider";
import { MatTabGroupGestureModule } from "@angular-material-gesture/mat-tab-group-gesture";
import { ModalCommonModule } from "../modal-common.module";
import { AddSelectItemComponent } from "./add-select-item.component";
import { ItemFilterComponent } from "../item-filter/item-filter.component";
import { WebCamComponent } from "../web-cam/web-cam.component";
import { ViewMultipleImageComponent } from "../view-multiple-image/view-multiple-image.component";
import { SelectItemsComponent } from "../select-items/select-items.component";
import { PosViewBillComponent } from "../pos-view-bill/pos-view-bill.component";

// Item picking pop-ups (add/select item, item filter, barcode webcam, image
// viewer, select items, POS bill). Kept out of pages.module so the slider,
// barcode scanner, carousel and image slider libraries are only downloaded by
// the sections that open them.
const COMPONENTS = [
  AddSelectItemComponent,
  ItemFilterComponent,
  WebCamComponent,
  ViewMultipleImageComponent,
  SelectItemsComponent,
  PosViewBillComponent,
];

@NgModule({
  imports: [
    ModalCommonModule,
    NgxSliderModule,
    BarcodeScannerLivestreamModule,
    CarouselModule,
    NgImageSliderModule,
    MatTabGroupGestureModule,
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class ItemPickerModalsModule {}
