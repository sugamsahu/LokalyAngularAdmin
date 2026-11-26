import { ItemPickerModalsModule } from "src/app/modules/pages-module/model/add-select-item/item-picker-modals.module";
import { CustomerDetailsModalModule } from "src/app/modules/pages-module/model/customer-details/customer-details-modal.module";
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
    ItemPickerModalsModule,
    CustomerDetailsModalModule,
    RouterModule.forChild([
      { path: "", component: ManageOfferComponent },
      { path: "add", component: ManageOfferAddComponent },
      { path: "edit", component: ManageOfferAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class ManageOfferModule { }
