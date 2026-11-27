import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ChangePasswordComponent } from "./change-password.component";
@NgModule({
  declarations: [ChangePasswordComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: ChangePasswordComponent }]),
    CommonApplicationModule,
  ],
})
export class ChangePasswordModule { }
