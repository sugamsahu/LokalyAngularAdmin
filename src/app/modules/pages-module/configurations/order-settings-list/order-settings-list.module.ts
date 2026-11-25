import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderSettingsListComponent } from './order-settings-list.component';
import { RouterModule } from '@angular/router';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { Search } from './searchOrderSetting';

@NgModule({
  declarations: [
    OrderSettingsListComponent,
    Search
  ],
  imports: [
    RouterModule.forChild([
      { path: "", component: OrderSettingsListComponent },
    ]),
    CommonApplicationModule,
    CommonModule
  ],
})
export class OrderSettingsListModule { }
