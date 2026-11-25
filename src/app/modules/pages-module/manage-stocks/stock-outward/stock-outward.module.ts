import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { StockOutwardComponent } from "./stock-outward.component";

@NgModule({
  declarations: [StockOutwardComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: StockOutwardComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class StockOutwardModule {}