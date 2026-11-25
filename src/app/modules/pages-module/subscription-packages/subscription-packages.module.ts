import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SubscriptionPackagesComponent } from "./subscription-packages.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { DatePipe } from "@angular/common";
import { EditSubscriptionPackagesComponent } from "./edit-subscription-packages/edit-subscription-packages.component";
import { SearchFilterPipe } from "./search-filter.pipe";

@NgModule({
  declarations: [
    SubscriptionPackagesComponent,
    EditSubscriptionPackagesComponent,
    SearchFilterPipe,
  ],
  imports: [
    CommonApplicationModule,
    RouterModule.forChild([
      { path: "", component: SubscriptionPackagesComponent },
      { path: "edit", component: EditSubscriptionPackagesComponent },
    ]),
  ],
  providers: [DatePipe],
})
export class SubscriptionPackagesModule {}
