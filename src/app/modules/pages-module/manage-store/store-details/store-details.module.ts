import { ReviewModalsModule } from "src/app/modules/pages-module/model/reveiw-rating/review-modals.module";
import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { StoreDetailsComponent } from './store-details.component';

@NgModule({
  declarations: [StoreDetailsComponent],
  imports: [
    ReviewModalsModule,
    RouterModule.forChild([
      { path: "", component: StoreDetailsComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class StoreDetailsModule { }
