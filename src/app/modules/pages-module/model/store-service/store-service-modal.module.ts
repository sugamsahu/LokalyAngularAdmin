import { NgModule } from "@angular/core";
import { ModalCommonModule } from "../modal-common.module";
import { StoreServiceModelComponent } from "./store-service.component";

// Store service pop-up, opened from the navbar. The navbar loads this file with
// a dynamic import() when the pop-up is opened, so moment-timezone is not part
// of the main pages bundle.
@NgModule({
  imports: [ModalCommonModule],
  declarations: [StoreServiceModelComponent],
  exports: [StoreServiceModelComponent],
})
export class StoreServiceModalModule {}

export { StoreServiceModelComponent };
