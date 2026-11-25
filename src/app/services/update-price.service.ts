import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AjaxService } from './ajax.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class UpdatePriceService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }
  role = this.commonService.getUserRoleName();

  getItemsList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/item_search");
  }

  updateStoreItemPrices(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/update_store_item_prices");
  }
}