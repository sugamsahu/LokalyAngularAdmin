import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class KhataService {
  constructor(private ajaxService: AjaxService) { }

  getKhataList(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role =
      userData.role_id == 1
        ? "admin"
        : userData.role_id == 6
          ? "admin"
          : "store";
    return this.ajaxService.post2(data, role + "/khata_report");
  }

  getCustomerList(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role =
      userData.role_id == 1
        ? "admin"
        : userData.role_id == 6
          ? "admin"
          : "store";
    return this.ajaxService.post(data, role + "/get_customers_by_store");
  }
}