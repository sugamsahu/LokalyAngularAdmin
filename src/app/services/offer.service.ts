import { AjaxService } from "./ajax.service";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { CommonService } from "src/app/services/common.service";

@Injectable({
  providedIn: "root",
})
export class OfferService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }

  role = this.commonService.getUserRoleName();

  getStoreOffers(data: {}): Observable<any> {
      return this.ajaxService.post2(data, "store/offers_list");
  }

  getDefaultOfferType(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/default_offers");
  }

  getOfferDetailsById(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/offers_details");
  }

  saveOffer(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "store/manage_offers");
  }

  deleteStoreOffer(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/delete_offer");
  }

  getOfferCode(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/generate_offer_code");
  }

  getPaymentMethods(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/get_delivery_settings");
  }

  getCustomerOrderList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/customer_detail");
  }

  getPlatformPaymentMethods(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/platform_payment_methods");
  }

  getCustomerListForOffers(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/offers_customer_list");
  }
  
  getOfferTimePeriods(): Observable<any> {
    return this.ajaxService.get2("store/get_time_periods");
  }

  getUserStoreRoles(userDeta: {}): Observable<any> {
    var role = this.commonService.getUserRoleName();
    return this.ajaxService.post(userDeta, role + "/user_store_roles");
  }

  getSellerList(data: {}): Observable<any> {
    var role = this.commonService.getUserRoleName();
    return this.ajaxService.post2(data, role + "/sellers_list");
  }
}