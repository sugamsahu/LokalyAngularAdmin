import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { StockInwardComponent } from "./stock-inward.component";

@NgModule({
  declarations: [StockInwardComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: StockInwardComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class StockInwardModule { }
