import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { CommunicationLogReportComponent } from "./communication-log-report.component";

@NgModule({
  declarations: [CommunicationLogReportComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: CommunicationLogReportComponent }]),
    CommonApplicationModule
  ],
})
export class CommunicationLogReportModule { }
