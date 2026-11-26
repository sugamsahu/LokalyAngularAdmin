import { ItemPickerModalsModule } from "src/app/modules/pages-module/model/add-select-item/item-picker-modals.module";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { StockOutwardComponent } from "./stock-outward.component";

@NgModule({
  declarations: [StockOutwardComponent],
  imports: [
    ItemPickerModalsModule,
    RouterModule.forChild([
      { path: "", component: StockOutwardComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class StockOutwardModule {}