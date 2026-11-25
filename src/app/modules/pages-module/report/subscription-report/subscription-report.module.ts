import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { SubscriptionReportComponent } from "./subscription-report.component";
@NgModule({
  declarations: [SubscriptionReportComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: SubscriptionReportComponent }]),
    CommonApplicationModule,
  ],
})
export class SubscriptionReportModule { }
