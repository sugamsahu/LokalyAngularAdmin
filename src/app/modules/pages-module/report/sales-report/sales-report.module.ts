import { OrderDetailsModalModule } from "src/app/modules/pages-module/model/order-details/order-details-modal.module";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { SalesReportComponent } from "./sales-report.component";
@NgModule({
  declarations: [SalesReportComponent],
  imports: [
    OrderDetailsModalModule,
    RouterModule.forChild([{ path: "", component: SalesReportComponent }]),
    CommonApplicationModule,
  ],
})
export class SalesReportModule { }
