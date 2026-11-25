import { AgmCoreModule } from "@agm/core";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ChangePasswordComponent } from "./change-password.component";
@NgModule({
  declarations: [ChangePasswordComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: ChangePasswordComponent }]),
    CommonApplicationModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCgrh6LueaEKfpoobObglbr0X6vlXPhouw",
      libraries: ["places"],
    }),
  ],
})
export class ChangePasswordModule { }
