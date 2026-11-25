import { Injectable } from '@angular/core';
import { AjaxService } from '../ajax.service';
import { Observable } from 'rxjs';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root'
})
export class StoreOrderBalanceService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }
  role = this.commonService.getUserRoleName();

  getStoreDetailsByName(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/sellers_list")
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_store_order_balance")
  }
}