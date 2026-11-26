import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { NgxPaginationModule } from "ngx-pagination";
import { NgxSpinnerModule } from "ngx-spinner";
import { ChartModule } from "angular-highcharts";
import "src/app/utils/highcharts-global"; // see the file: fixes empty pie charts
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { MaterialModule } from "src/app/material/material/material.module";
import { ComponentsModule } from "src/app/components/components.module";
import { DashComponent } from "./dash.component";
import { DashboardComponent } from "../dashboard/dashboard.component";
import { StoreDashboardComponent } from "../store-dashboard/store-dashboard.component";
import { PosDashboardComponent } from "../pos-dashboard/pos-dashboard.component";
import { DashboardSearch } from "../dashboard-search/dashboard-search";

// The /dashboard page (admin, store and POS dashboards), lazy-loaded so that
// Highcharts and the date range picker are only downloaded for this page
// instead of with every page of the panel.
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: "", component: DashComponent }]),
    NgbModule,
    NgSelectModule,
    TranslateModule,
    NgxPaginationModule,
    NgxSpinnerModule,
    MaterialModule,
    ComponentsModule,
    ChartModule,
    NgxDaterangepickerMd.forRoot(),
  ],
  declarations: [
    DashComponent,
    DashboardComponent,
    StoreDashboardComponent,
    PosDashboardComponent,
    DashboardSearch,
  ],
})
export class DashboardModule {}
