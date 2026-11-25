import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ItemWiseOrderComponent } from "./item-wise-order.component";
@NgModule({
  declarations: [ItemWiseOrderComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: ItemWiseOrderComponent }]),
    CommonApplicationModule,
  ],
})
export class ItemWiseOrderModule { }
