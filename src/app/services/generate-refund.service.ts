import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AjaxService } from "./ajax.service";
import { CommonService } from "./common.service";

@Injectable({
  providedIn: 'root'
})
export class GenerateRefundService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }

  role = this.commonService.getUserRoleName();

  getRefundData(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/order_refunds");
  }

  getOrderList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/refund_orders_list");
  }

  orderDetails(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/order_details");
  }

  getOrderDetails(data: {}): Observable<any> {
    return this.ajaxService.post(data,this.role + "/order_details");
  }

  getRefundOrderDetails(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/refund_details");
  }
  
  updateRefund(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "store/manage_order_refund");
  }
}