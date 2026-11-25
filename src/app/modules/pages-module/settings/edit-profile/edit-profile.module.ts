import { AgmCoreModule } from "@agm/core";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { EditProfileComponent } from "./edit-profile.component";
@NgModule({
  declarations: [EditProfileComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: EditProfileComponent }]),
    CommonApplicationModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCgrh6LueaEKfpoobObglbr0X6vlXPhouw",
      libraries: ["places"],
    }),
  ],
})
export class EditProfileModule { }
