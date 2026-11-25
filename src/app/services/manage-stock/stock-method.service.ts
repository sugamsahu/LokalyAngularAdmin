import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class StockMethodService {
  constructor(private ajaxService: AjaxService) { }

  getItemList(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role = userData.role_id == 1 ? "admin": userData.role_id == 6 ? "admin": "store";
    return this.ajaxService.post(data, role + '/items_lists_for_stock');
  }

  post(data:{}):Observable<any> {
    return this.ajaxService.post2(data, 'store/multiple_item_stock')
  }
}