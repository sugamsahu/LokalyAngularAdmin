import { NgModule } from "@angular/core";
import { ManageUserComponent } from "./manage-user.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { RouterModule } from "@angular/router";
import { ManageUserAddComponent } from "./manage-user-add/manage-user-add.component";
@NgModule({
  declarations: [ManageUserComponent, ManageUserAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: ManageUserComponent },
      { path: "add", component: ManageUserAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class ManageUserModule { }
