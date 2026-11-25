import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryBoyPayoutService {
  constructor(private ajaxService: AjaxService) { }

  deliveryBoyPayout(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role = userData.role_id == 1 ? "admin" : userData.role_id == 6 ? "admin" : "store";
    return this.ajaxService.post2(data, role + "/deliveryboy_payout");
  }

  orderDeliveryBoys(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role = userData.role_id == 1 ? "admin" : userData.role_id == 6 ? "admin" : "store";
    return this.ajaxService.post2(data, role + "/order_deliveryboys");
  }
}