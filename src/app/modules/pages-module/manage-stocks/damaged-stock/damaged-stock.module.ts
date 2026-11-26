import { ItemPickerModalsModule } from "src/app/modules/pages-module/model/add-select-item/item-picker-modals.module";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { DamagedStockComponent } from "./damaged-stock.component";

@NgModule({
  declarations: [DamagedStockComponent],
  imports: [
    ItemPickerModalsModule,
    RouterModule.forChild([
      { path: "", component: DamagedStockComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class DamagedStockModule { }
