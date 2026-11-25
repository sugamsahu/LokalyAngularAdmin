import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AddonsComponent } from "./addons.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { AddonsAddComponent } from "./addons-add/addons-add.component";

@NgModule({
  declarations: [AddonsComponent, AddonsAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: AddonsComponent },
      { path: "add", component: AddonsAddComponent },
      { path: "edit", component: AddonsAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class AddonsModule { }
