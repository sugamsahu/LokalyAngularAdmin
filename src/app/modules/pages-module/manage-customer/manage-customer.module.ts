import { TrackByKeyDirective } from '../../../utils/track-by-key.directive';
import { CustomerDetailsModalModule } from "src/app/modules/pages-module/model/customer-details/customer-details-modal.module";
import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ManageCustomerAddComponent } from './manage-customer-add/manage-customer-add.component';
import { ManageCustomerComponent } from './manage-customer.component';

@NgModule({
  declarations: [
    ManageCustomerComponent, ManageCustomerAddComponent
  ],
  imports: [
    TrackByKeyDirective,
    CustomerDetailsModalModule,
    RouterModule.forChild([
      { path: "", component: ManageCustomerComponent },
      { path: "add", component: ManageCustomerAddComponent },
      { path: "edit", component: ManageCustomerAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class ManageCustomerModule { }
