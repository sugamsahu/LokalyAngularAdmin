import { NgModule } from "@angular/core";
import { unitTypeComponent } from "./unit-type.component";
import { UnitTypeAddComponent } from "./unit-type-add/unit-type-add.component";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";

@NgModule({
  declarations: [unitTypeComponent, UnitTypeAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: unitTypeComponent },
      { path: "add", component: UnitTypeAddComponent },
      { path: "edit", component: UnitTypeAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class UnitTypeModule { }
