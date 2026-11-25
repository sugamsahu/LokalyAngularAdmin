import { Injectable } from "@angular/core";
import { AjaxService } from "./ajax.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AddOrderService {
  constructor(private ajaxService: AjaxService) { }

  getOrderSettings(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/get_delivery_settings");
  }

  getDeliverySlot(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "customer/cart_checkout");
  }

  getCustomerAddressList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/customer_addresses");
  }

  getDeliveryCharges(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "customer/get_delivery_charges");
  }

  getVariantWiseTaxes(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "customer/get_variant_wise_taxes");
  }

  getOnGoingStoreOffersList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "customer/ongoing_store_offers");
  }

  getCustomerWalletBalance(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "customer/my_wallet");
  }

  addSellerCustomerOrder(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "store/manage_customer_orders");
  }

  orderChatCreate(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "customer/order_chat_create");
  }
}