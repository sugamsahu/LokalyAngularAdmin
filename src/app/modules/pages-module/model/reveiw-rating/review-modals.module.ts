import { NgModule } from "@angular/core";
import { ModalCommonModule } from "../modal-common.module";
import { ReveiwRatingComponent } from "./reveiw-rating.component";
import { CustomerReviewdetailsComponent } from "../customer-review-details/customer-review-details.component";
import { ItemDescriptionComponent } from "../item-description-model/item-description-model.component";

// Review pop-ups and the item description pop-up that opens them. Kept out of
// pages.module so moment-timezone is only downloaded by the sections using them.
const COMPONENTS = [ReveiwRatingComponent, CustomerReviewdetailsComponent, ItemDescriptionComponent];

@NgModule({
  imports: [ModalCommonModule],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class ReviewModalsModule {}
