import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { PickOrderProcessComponent } from "../pick-order-process/pick-order-process.component";
import { PickOrderComponent } from "./pick-order.component";
@NgModule({
  declarations: [PickOrderComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: PickOrderComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class PickOrderModule { }
