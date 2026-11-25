import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreditWalletComponent } from './credit-wallet.component';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";

@NgModule({
  declarations: [
    CreditWalletComponent
  ],
  imports: [
    CommonModule, CommonApplicationModule,
    RouterModule.forChild([
      { path: "", component: CreditWalletComponent },
      { path: "add", component: CreditWalletComponent },
    ]),
  ]
})

export class CreditWalletModule { }
