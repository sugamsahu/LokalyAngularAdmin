import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { OrderAuthBlockComponent } from "./order-auth-block.component";
@NgModule({
  declarations: [OrderAuthBlockComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: OrderAuthBlockComponent }]),
    CommonApplicationModule,
  ],
})
export class OrderOutsideModule {}
