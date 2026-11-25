import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { DeliveryBoyPayoutComponent } from "./delivery-boy-payout.component";
@NgModule({
  declarations: [DeliveryBoyPayoutComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: DeliveryBoyPayoutComponent }]),
    CommonApplicationModule,
  ],
})
export class DeliveryBoyPayoutModule { }
