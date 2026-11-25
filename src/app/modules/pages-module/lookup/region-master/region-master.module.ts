import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { RegionMasterComponent } from "./region-master.component";
import { RegionMasterAddComponent } from './region-master-add/region-master-add.component';

@NgModule({
  declarations: [RegionMasterComponent, RegionMasterAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: RegionMasterComponent },
      { path: "add", component: RegionMasterAddComponent },
      { path: "edit", component: RegionMasterAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class RegionMasterModule { }
