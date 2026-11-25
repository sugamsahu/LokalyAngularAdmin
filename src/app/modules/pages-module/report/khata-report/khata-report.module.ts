import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { KhataReportComponent } from "./khata-report.component";
@NgModule({
  declarations: [KhataReportComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: KhataReportComponent }]),
    CommonApplicationModule,
  ],
})
export class KhataReportModule { }
