import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class CostomerService {
  constructor(private ajaxService: AjaxService) { }

  getCustomerReportItemsList(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role =
      userData.role_id == 1
        ? "admin"
        : userData.role_id == 6
          ? "admin"
          : "store";
    return this.ajaxService.post2(data, role + "/customer_report");
  }
}