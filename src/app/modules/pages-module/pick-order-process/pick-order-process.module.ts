import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { PickOrderProcessComponent } from "./pick-order-process.component";
import { pickersearch } from "./searchorder";
@NgModule({
  declarations: [PickOrderProcessComponent, pickersearch],
  imports: [
    RouterModule.forChild([{ path: "", component: PickOrderProcessComponent }]),
    CommonApplicationModule,
  ],
})
export class PickOrderProcessModule { }
