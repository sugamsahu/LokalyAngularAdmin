import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  constructor(private ajaxService: AjaxService) { }

  getWalletSetting(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/wallet_settings");
  }

  manageWallet(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "admin/manage_wallet");
  }

  getUserStoreRoles(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/user_store_roles");
  }
}