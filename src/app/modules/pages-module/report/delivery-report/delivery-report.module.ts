import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { DeliveryReportComponent } from "./delivery-report.component";
@NgModule({
  declarations: [DeliveryReportComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: DeliveryReportComponent }]),
    CommonApplicationModule,
  ],
})
export class DeliveryReportModule {}
