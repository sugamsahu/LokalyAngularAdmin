import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class DeliveryReportService {
  constructor(private ajaxService: AjaxService) { }

  getDeliveryBoyList(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role =
      userData.role_id == 1
        ? "admin"
        : userData.role_id == 6
          ? "admin"
          : "store";
    return this.ajaxService.post2(data, role + "/order_deliveryboys");
  }

  getDeliveryReportItemsList(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role =
      userData.role_id == 1
        ? "admin"
        : userData.role_id == 6
          ? "admin"
          : "store";
    return this.ajaxService.post2(data, role + "/store_order_deliveries");
  }
}