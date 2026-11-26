import { ItemPickerModalsModule } from "src/app/modules/pages-module/model/add-select-item/item-picker-modals.module";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { StockInwardComponent } from "./stock-inward.component";

@NgModule({
  declarations: [StockInwardComponent],
  imports: [
    ItemPickerModalsModule,
    RouterModule.forChild([
      { path: "", component: StockInwardComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class StockInwardModule { }
