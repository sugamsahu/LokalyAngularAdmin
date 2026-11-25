import { AjaxService } from "./ajax.service";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { CommonService } from "src/app/services/common.service";

@Injectable({
  providedIn: "root",
})
export class OrderService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }

  role = this.commonService.getUserRoleName();
  userData = JSON.parse(localStorage.getItem("loginUser"));

  getOrderList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/orders_list");
  }

  getOrderDetails(data: {}): Observable<any> {
    return this.ajaxService.post(data, this.role + "/order_details");
  }

  getOrderListPicker(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "picker/orders_list");
  }

  getPickerOrderDetails(data: {}): Observable<any> {
    return this.ajaxService.post(data, "picker/order_details");
  }

  startPick(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "picker/start_pick");
  }

  getRejectResonList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/reason_list_new");
  }

  getCancellationResonList(): Observable<any> {
    return this.ajaxService.get("store/order_cancellation_reasons?is_store=1");
  }

  getDineInSettings(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/get_dine_in_settings");
  }

  getDeliveryBoyList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/order_deliveryboys");
  }

  getValidOfferCode(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "customer/validate_coupon");
  }

  getDeliveryLocationList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "user/delivery_location_lists");
  }

  manageOrderStatus(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "store/manage_orders");
  }

  updateOrderStatus(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "store/order_status");
  }

  get_order_status(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/get_order_status");
  }

  manageOrderStatuspicker(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "picker/manage_orders");
  }

  getOrderHistory(data: {}): Observable<any> {
    return this.ajaxService.post(data, this.role + "/order_history_details");
  }

  exportOrderList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/order_list_export");
  }

  getPOSSavedOrder(data: {}): Observable<any> {
    return this.ajaxService.post(data, "pos/save_cart_lists");
  }

  deletePOSSavedOrder(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "customer/empty_cart");
  }

  addCart(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "customer/add_cart");
  }

  cartDetails(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "customer/cart_details");
  }

  getTransactionId(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "customer/get_transaction_id");
  }

  getDeliveryBoyOrderList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "delivery_boy/orders_list");
  }
}