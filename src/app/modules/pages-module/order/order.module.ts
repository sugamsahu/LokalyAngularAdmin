import { ItemPickerModalsModule } from "src/app/modules/pages-module/model/add-select-item/item-picker-modals.module";
import { OrderDetailsModalModule } from "src/app/modules/pages-module/model/order-details/order-details-modal.module";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { SellerOrderListComponent } from './seller-order-list/seller-order-list.component';
import { SellerProcessOrderComponent } from './seller-process-order/seller-process-order.component';
import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // a plugin!
import { Search } from './seller-process-order/search';
import { AgmCoreModule } from "@agm/core";

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin
]);

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
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCgrh6LueaEKfpoobObglbr0X6vlXPhouw",
      libraries: ["places"],
    }),],
})
export class OrderModule { }
