import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { OrdersComponent } from "./orders.component";
@NgModule({
  declarations: [OrdersComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: OrdersComponent }]),
    CommonApplicationModule,
  ],
})
export class OrdersModule { }
