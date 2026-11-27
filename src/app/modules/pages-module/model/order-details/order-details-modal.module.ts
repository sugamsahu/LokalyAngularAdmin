import { NgModule } from "@angular/core";
import { GoogleMapsModule } from "@angular/google-maps";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { ModalCommonModule } from "../modal-common.module";
import { OrderDetailsModalComponent } from "./order-details.component";

// Order details pop-up. Kept out of pages.module so Firestore is only
// downloaded by the sections that open it.
@NgModule({
  imports: [ModalCommonModule, GoogleMapsModule, AngularFirestoreModule],
  declarations: [OrderDetailsModalComponent],
  exports: [OrderDetailsModalComponent],
})
export class OrderDetailsModalModule {}
