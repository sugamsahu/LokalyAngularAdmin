import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { GiftVoucherComponent } from "./gift-voucher.component";
import { SearchFilterGiftPipe } from "./searchFilterGift.pipe";

@NgModule({
  declarations: [GiftVoucherComponent, SearchFilterGiftPipe],
  imports: [
    RouterModule.forChild([{ path: "", component: GiftVoucherComponent }]),
    CommonApplicationModule,
  ],
})
export class GiftVoucherModule { }
