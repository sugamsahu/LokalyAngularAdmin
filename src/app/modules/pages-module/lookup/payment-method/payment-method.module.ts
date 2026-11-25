import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { PaymentMethodComponent } from "./payment-method.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { PaymentMethodAddComponent } from "./payment-method-add/payment-method-add.component";

@NgModule({
  declarations: [PaymentMethodComponent, PaymentMethodAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: PaymentMethodComponent },
      { path: "add", component: PaymentMethodAddComponent },
      { path: "edit", component: PaymentMethodAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class PaymentMethodModule { }
