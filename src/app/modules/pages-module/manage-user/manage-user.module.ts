import { NgModule } from "@angular/core";
import { ManageUserComponent } from "./manage-user.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { RouterModule } from "@angular/router";
import { AgmCoreModule } from "@agm/core";
import { ManageUserAddComponent } from "./manage-user-add/manage-user-add.component";
@NgModule({
  declarations: [ManageUserComponent, ManageUserAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: ManageUserComponent },
      { path: "add", component: ManageUserAddComponent },
    ]),
    CommonApplicationModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCgrh6LueaEKfpoobObglbr0X6vlXPhouw",
      libraries: ["places"],
    }),
  ],
})
export class ManageUserModule { }
