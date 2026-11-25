import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";
import { CommonService } from "../common.service";

@Injectable({
  providedIn: 'root'
})
export class CommonConfigurationService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }

  role = this.commonService.getUserRoleName();

  getCommonConfigurationDetails(): Observable<any> {
    var data = {}
    return this.ajaxService.post2(data,"user/global_settings");
  }

  getCurrencyList(): Observable<any> {
    return this.ajaxService.get2("admin/currency_list");
  }

  getPlatformSettings(): Observable<any> {
    return this.ajaxService.get2("admin/platform_settings");
  }

  getMasterLanguages(data: any): Observable<any> {
    return this.ajaxService.post(data, "user/master_languages");
  }

  getGlobalPaymentMethods(): Observable<any> {
    return this.ajaxService.get("admin/global_payment_methods");
  }

  downloadGlobalSetting(data:any): Observable<any> {
    return this.ajaxService.post(data,"admin/global_setting_download");
  }

  getStoreType(): Observable<any> {
    return this.ajaxService.get2("admin/store_types");
  }

  manageGlobalSettings(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "admin/manage_global_settings");
  }

  blockConfiguration(data:any): Observable<any> {
    return this.ajaxService.post(data,"admin/block_configuration");
  } 
  
  manageBlockConfiguration(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "admin/manage_block_configuration");
  }

  itemConfiguaration(data:any): Observable<any> {
    return this.ajaxService.post(data,"admin/item_configuration");
  }
  
  manageItemConfiguaration(data:any): Observable<any> {
    return this.ajaxService.formData2(data, "admin/manage_item_configuration");
  }

}
