import "src/app/utils/highcharts-global"; // see the file: fixes empty pie charts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerComponent } from './customer.component';
import { RouterModule } from '@angular/router';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { HighlightPipe } from './highlight.pipe';
import { ChartModule } from "angular-highcharts";
import { HighchartsChartModule } from 'highcharts-angular';


@NgModule({
  declarations: [CustomerComponent,HighlightPipe],
  imports: [
    RouterModule.forChild([
      { path: "", component: CustomerComponent },
    ]),
    CommonApplicationModule,
    ChartModule,
    HighchartsChartModule
  ],
})
export class CustomerModule { }
