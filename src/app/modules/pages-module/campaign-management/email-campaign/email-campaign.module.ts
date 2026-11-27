import { NgModule } from "@angular/core";
import { CommonApplicationModule } from "src/app/common-application.module";
import { RouterModule } from "@angular/router";
import { EmailCampaigComponent } from "./email-campaig.component";
import { AddEmaiCampaignComponent } from "./add-emai-campaign/add-emai-campaign.component";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { CampaignSearch } from "./campaignsearch";
@NgModule({
  declarations: [
    EmailCampaigComponent,
    AddEmaiCampaignComponent,
    CampaignSearch,
  ],
  imports: [
    RouterModule.forChild([
      { path: "", component: EmailCampaigComponent },
      { path: "add", component: AddEmaiCampaignComponent },
      { path: "edit", component: AddEmaiCampaignComponent },
    ]),
    CommonApplicationModule,
    AngularEditorModule,
  ],
})
export class EmailCampaignModule { }
