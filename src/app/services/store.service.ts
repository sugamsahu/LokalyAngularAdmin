import { AjaxService } from "./ajax.service";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { CommonService } from "src/app/services/common.service";

@Injectable({
  providedIn: "root",
})
export class StoreService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }

  role = this.commonService.getUserRoleName();

  getSubscriptionHistoryDetails(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/seller_subscriptions");
  }

  deleteSubscription(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/delete_subscription");
  }

  getStoreExistCustomerDetails(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/exist_customer_detail");
  }

  getSellerDetails(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/seller_details");
  }

  getOrderSettingsList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/platform_order_settings");
  }

  getsubscriptionsListRecord(data: any): Observable<any> {
    return this.ajaxService.post2(data, "user/subscriptions_list");
  }

  getPosterOrBannerPdfUrl(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/store_poster_banner");
  }

  addSeller(data: {}, label): Observable<any> {
    if (label == "add") {
      return this.ajaxService.formData2(data, "user/seller_web_registration");
    }
    if (label == "edit") {
      return this.ajaxService.formData(data, "admin/manage_seller");
    }
    if (label == "registration") {
      return this.ajaxService.formData2(data, "admin/full_registration");
    }
  }

  deleteSeller(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/delete_seller");
  }

  addSubscription(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/add_subscription");
  }

  checkSeller(data: {}): Observable<any> {
    return this.ajaxService.post(data, "user/check_duplicate_seller");
  }

  //store link generation
  getStoreUniqCode(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/generate_store_code");
  }

  manageStoreOrderLink(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/manage_store_link");
  }

  getPlatformUniqCode(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/generate_plaform_code");
  }

  managePlatformOrderLink(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/manage_platform_link");
  }

  getStoreDetails(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/store_details");
  }

  saveStoreDetails(data: {}, label): Observable<any> {
    if (label == "edit") {
      return this.ajaxService.formData(data, "store/manage_store");
    }
  }

  getStorePageDetails(data: {}): Observable<any> {
    return this.ajaxService.post(data, "customer/get_store_page_details");
  }

  getStorePhoneList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/store_mobiles_list");
  }
}