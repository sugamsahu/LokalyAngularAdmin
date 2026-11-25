import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { OrderSettingsComponent } from './order-settings.component';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [OrderSettingsComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: OrderSettingsComponent },

    ]),
    CommonApplicationModule,
    ReactiveFormsModule
  ]
})
export class OrderSettingsModule { }
