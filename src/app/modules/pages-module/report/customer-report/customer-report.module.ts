import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { CustomerReportComponent } from "./customer-report.component";
@NgModule({
  declarations: [CustomerReportComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: CustomerReportComponent }]),
    CommonApplicationModule,
  ],
})
export class CustomerReportModule { }
