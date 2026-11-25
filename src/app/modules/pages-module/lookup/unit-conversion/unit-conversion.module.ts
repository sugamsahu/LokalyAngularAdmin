import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { UnitConversionComponent } from "./unit-conversion.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { UnitConversionAddComponent } from "./unit-conversion-add/unit-conversion-add.component";

@NgModule({
  declarations: [UnitConversionComponent, UnitConversionAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: UnitConversionComponent },
      { path: "add", component: UnitConversionAddComponent },
      { path: "edit", component: UnitConversionAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class UnitConversionModule { }
