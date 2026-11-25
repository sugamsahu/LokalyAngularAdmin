import { AgmCoreModule } from "@agm/core";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ManageSubscriptionComponent } from "./manage-subscription.component";
@NgModule({
  declarations: [ManageSubscriptionComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: ManageSubscriptionComponent },
    ]),
    CommonApplicationModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCgrh6LueaEKfpoobObglbr0X6vlXPhouw",
      libraries: ["places"],
    }),
  ],
})
export class ManageSubscriptionModule { }
