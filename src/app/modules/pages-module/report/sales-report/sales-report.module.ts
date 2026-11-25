import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { SalesReportComponent } from "./sales-report.component";
@NgModule({
  declarations: [SalesReportComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: SalesReportComponent }]),
    CommonApplicationModule,
  ],
})
export class SalesReportModule { }
