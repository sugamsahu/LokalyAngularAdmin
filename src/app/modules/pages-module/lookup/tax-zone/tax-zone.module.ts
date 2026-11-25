import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { TaxZoneComponent } from "./tax-zone.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { TaxZoneAddComponent } from "./tax-zone-add/tax-zone-add.component";
@NgModule({
  declarations: [TaxZoneComponent, TaxZoneAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: TaxZoneComponent },
      { path: "add", component: TaxZoneAddComponent },
      { path: "edit", component: TaxZoneAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class TaxZoneModule { }
