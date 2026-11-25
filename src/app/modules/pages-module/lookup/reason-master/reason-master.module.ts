import { ReasonMasterComponent } from './reason-master.component';
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ReasonMasterAddComponent } from './reason-master-add/reason-master-add.component';

@NgModule({
  declarations: [ReasonMasterComponent, ReasonMasterAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: ReasonMasterComponent },
      { path: "add", component: ReasonMasterAddComponent },
      { path: "edit", component: ReasonMasterAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class ReasonMasterModule { }
