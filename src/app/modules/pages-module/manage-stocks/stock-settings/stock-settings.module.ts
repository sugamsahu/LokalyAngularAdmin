import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { StockSettingsComponent } from "./stock-settings.component";

@NgModule({
  declarations: [StockSettingsComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: StockSettingsComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class StockSettingsModule {}