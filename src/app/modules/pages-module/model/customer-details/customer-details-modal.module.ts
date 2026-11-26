import { NgModule } from "@angular/core";
import { ModalCommonModule } from "../modal-common.module";
import { OrderDetailsModalModule } from "../order-details/order-details-modal.module";
import { customerDetailComponent } from "./customer-details.component";

// Customer details pop-up; it opens the order details pop-up.
@NgModule({
  imports: [ModalCommonModule, OrderDetailsModalModule],
  declarations: [customerDetailComponent],
  exports: [customerDetailComponent],
})
export class CustomerDetailsModalModule {}
