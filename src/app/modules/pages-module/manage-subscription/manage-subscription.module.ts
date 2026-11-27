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
  ],
})
export class ManageSubscriptionModule { }
