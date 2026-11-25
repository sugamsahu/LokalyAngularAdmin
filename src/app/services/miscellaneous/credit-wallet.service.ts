import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";
import { CommonService } from "../common.service";

@Injectable({
  providedIn: 'root'
})
export class CreditWalletService {
  constructor(
    private ajaxService: AjaxService,
    public commonService:CommonService
  ) { }

  role=this.commonService.getUserRoleName();
  
  add(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/credit_customer_wallet");
  }
  
  getById(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/customer_by_mobile");
  }
}