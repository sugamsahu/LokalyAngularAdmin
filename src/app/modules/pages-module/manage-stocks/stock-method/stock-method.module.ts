import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { StockMethodComponent } from "./stock-method.component";

@NgModule({
  declarations: [StockMethodComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: StockMethodComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class StockMethodModule { }