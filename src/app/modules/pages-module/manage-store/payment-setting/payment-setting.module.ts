import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { PaymentSettingComponent } from './payment-setting.component';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentSettingAddComponent } from './payment-setting-add/payment-setting-add.component';

@NgModule({
  declarations: [PaymentSettingComponent, PaymentSettingAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: PaymentSettingComponent },
      { path: "add", component: PaymentSettingAddComponent },
      { path: "edit", component: PaymentSettingAddComponent },

    ]),
    CommonApplicationModule,
    ReactiveFormsModule
  ]
})
export class PaymentSettingModule { }
