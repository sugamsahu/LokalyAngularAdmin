import { ItemPickerModalsModule } from "src/app/modules/pages-module/model/add-select-item/item-picker-modals.module";
import { OrderDetailsModalModule } from "src/app/modules/pages-module/model/order-details/order-details-modal.module";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { SellerOrderListComponent } from './seller-order-list/seller-order-list.component';
import { SellerProcessOrderComponent } from './seller-process-order/seller-process-order.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Search } from './seller-process-order/search';
import { GoogleMapsModule } from "@angular/google-maps";

@NgModule({
  declarations: [
    SellerOrderListComponent,
    SellerProcessOrderComponent,
    Search
  ],
  imports: [
    ItemPickerModalsModule,
    OrderDetailsModalModule,
    RouterModule.forChild([{ path: "", component: SellerOrderListComponent }]),
    RouterModule.forChild([{ path: "selller-process-order", component: SellerProcessOrderComponent }]),
    CommonApplicationModule,
    CommonModule, FullCalendarModule,
    GoogleMapsModule,],
})
export class OrderModule { }
