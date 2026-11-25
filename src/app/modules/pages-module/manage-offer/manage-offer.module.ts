import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ManageOfferAddComponent } from './manage-offer-add/manage-offer-add.component';
import { ManageOfferComponent } from './manage-offer.component';

@NgModule({
  declarations: [
    ManageOfferComponent, ManageOfferAddComponent
  ],
  imports: [
    RouterModule.forChild([
      { path: "", component: ManageOfferComponent },
      { path: "add", component: ManageOfferAddComponent },
      { path: "edit", component: ManageOfferAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class ManageOfferModule { }
