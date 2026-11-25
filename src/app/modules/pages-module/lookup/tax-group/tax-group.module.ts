import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { TaxGroupComponent } from "./tax-group.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { TaxGroupAddComponent } from "./tax-group-add/tax-group-add.component";

@NgModule({
  declarations: [TaxGroupComponent, TaxGroupAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: TaxGroupComponent },
      { path: "add", component: TaxGroupAddComponent },
      { path: "edit", component: TaxGroupAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class TaxGroupModule { }
