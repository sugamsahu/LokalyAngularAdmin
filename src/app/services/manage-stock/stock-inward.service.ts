import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class StockInwardService {
  constructor(private _ajaxService: AjaxService) { }

  getStoreList(data: {}): Observable<any>{
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role =
      userData.role_id == 1
        ? "admin"
        : userData.role_id == 6
        ? "admin"
        : "store";
    return this._ajaxService.post(data, role+'/user_store_roles')
  }

  getItemsListForStock(data: {}): Observable<any>{
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role = userData.role_id == 1 ? "admin": userData.role_id == 6 ? "admin": "store";
    return this._ajaxService.post(data, role + '/items_lists_for_stock')
  }
  
  manageStock(data: {}): Observable<any>{
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role = userData.role_id == 1 ? "admin": userData.role_id == 6 ? "admin": "store";
    return this._ajaxService.formData2(data, role + '/manage_stock')
  }
}