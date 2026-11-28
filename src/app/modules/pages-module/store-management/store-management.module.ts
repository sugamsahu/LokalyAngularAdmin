import { TrackByKeyDirective } from '../../../utils/track-by-key.directive';
import { ReviewModalsModule } from "src/app/modules/pages-module/model/reveiw-rating/review-modals.module";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { StoreManagementComponent } from "./store-management.component";
import { StoreManagementAddComponent } from "./store-management-add/store-management-add.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { DatePipe } from "@angular/common";

@NgModule({
  declarations: [StoreManagementComponent, StoreManagementAddComponent],
  imports: [
    TrackByKeyDirective,
    ReviewModalsModule,
    CommonApplicationModule,
    RouterModule.forChild([
      { path: "", component: StoreManagementComponent },
      { path: "add", component: StoreManagementAddComponent },
      { path: "edit", component: StoreManagementAddComponent },
    ]),
  ],
  providers:[DatePipe]
})
export class StoreManagementModule {}
