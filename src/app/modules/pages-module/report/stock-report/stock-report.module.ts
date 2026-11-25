import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { StockReportComponent } from "./stock-report.component";
import { ViewStockReportComponent } from "./view-stock-report/view-stock-report.component";
@NgModule({
  declarations: [StockReportComponent, ViewStockReportComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: StockReportComponent },
      { path: "view-stock-report", component: ViewStockReportComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class StockReportModule { }
