import { ItemPickerModalsModule } from "src/app/modules/pages-module/model/add-select-item/item-picker-modals.module";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { PickOrderProcessComponent } from "./pick-order-process.component";
import { pickersearch } from "./searchorder";
@NgModule({
  declarations: [PickOrderProcessComponent, pickersearch],
  imports: [
    ItemPickerModalsModule,
    RouterModule.forChild([{ path: "", component: PickOrderProcessComponent }]),
    CommonApplicationModule,
  ],
})
export class PickOrderProcessModule { }
