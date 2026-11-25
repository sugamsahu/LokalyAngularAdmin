import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { DamagedStockComponent } from "./damaged-stock.component";

@NgModule({
  declarations: [DamagedStockComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: DamagedStockComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class DamagedStockModule { }
