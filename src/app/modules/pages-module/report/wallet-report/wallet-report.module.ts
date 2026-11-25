import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { WalletReportComponent } from "./wallet-report.component";
@NgModule({
  declarations: [WalletReportComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: WalletReportComponent }]),
    CommonApplicationModule,
  ],
})
export class WalletReportModule { }
