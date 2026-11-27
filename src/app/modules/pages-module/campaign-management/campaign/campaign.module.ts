import { NgModule } from "@angular/core";
import { CommonApplicationModule } from "src/app/common-application.module";
import { RouterModule } from "@angular/router";
import { CampaignComponent } from "./campaign.component";
import { AddCampaignComponent } from "./add-campaign/add-campaign.component";

@NgModule({
  declarations: [CampaignComponent, AddCampaignComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: CampaignComponent },
      { path: "add", component: AddCampaignComponent },
      { path: "edit", component: AddCampaignComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class CampaignModule { }
