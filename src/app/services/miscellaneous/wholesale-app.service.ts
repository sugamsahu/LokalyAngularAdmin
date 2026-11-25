import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";
import { CommonService } from "../common.service";

@Injectable({
  providedIn: 'root'
})
export class WholesaleAppService {
  constructor(
    private ajaxService: AjaxService,
    public commonService:CommonService
  ) { }

  role=this.commonService.getUserRoleName();

  get(data:{}):Observable<any>{
    return this.ajaxService.post2(data,  "admin/customer_business_details");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_customer_business_detail");
  }

  getById(data: {}): Observable<any> {
    return this.ajaxService.post2(data, this.role + "/customer_business_details");
  }
}