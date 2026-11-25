import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";
import { CommonService } from "../common.service";

@Injectable({
  providedIn: "root",
})
export class PaymentMethodService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }
  role = this.commonService.getUserRoleName();

  get(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/payment_methods_lists");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_payment_methods");
  }
}
