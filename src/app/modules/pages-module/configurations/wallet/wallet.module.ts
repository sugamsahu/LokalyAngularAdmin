import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { WalletComponent } from "./wallet.component";

@NgModule({
  declarations: [WalletComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: WalletComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class WalletModule { }
