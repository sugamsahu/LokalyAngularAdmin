import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { AuditLogReportComponent } from "./audit-log-report.component";

@NgModule({
  declarations: [AuditLogReportComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: AuditLogReportComponent }]),
    CommonApplicationModule
  ],
})
export class AuditLogReportModule { }
