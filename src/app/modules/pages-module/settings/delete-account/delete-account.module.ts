import { AgmCoreModule } from "@agm/core";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { DeleteAccountComponent } from "./delete-account.component";
@NgModule({
  declarations: [DeleteAccountComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: DeleteAccountComponent }]),
    CommonApplicationModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCgrh6LueaEKfpoobObglbr0X6vlXPhouw",
      libraries: ["places"],
    }),
  ],
})
export class DeleteAccountModule { }
