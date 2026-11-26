import { OrderDetailsModalModule } from "src/app/modules/pages-module/model/order-details/order-details-modal.module";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { OrdersComponent } from "./orders.component";
@NgModule({
  declarations: [OrdersComponent],
  imports: [
    OrderDetailsModalModule,
    RouterModule.forChild([{ path: "", component: OrdersComponent }]),
    CommonApplicationModule,
  ],
})
export class OrdersModule { }
