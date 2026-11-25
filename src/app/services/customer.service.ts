import { AjaxService } from "./ajax.service";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { CommonService } from "src/app/services/common.service";

@Injectable({
  providedIn: "root",
})
export class CustomerService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }

  role = this.commonService.getUserRoleName();

  getStoreCustomerList(data: {}, superadmin): Observable<any> {
    if (superadmin == false) {
      return this.ajaxService.post2(data, "store/customer_list");
    } else {
      return this.ajaxService.post2(data, "admin/customer_user_list");
    }
  }

  getSendToList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/all_users");
  }

  getStoreSellerList(data: {}, superadmin): Observable<any> {
    if (superadmin == false) {
      return this.ajaxService.post2(data, "store/user_store_roles");
    } else {;
      return this.ajaxService.post2(data, "admin/sellers_list");
    }
  }

  getStoreCustomerDetails(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/customer_detail");
  }

  getCampaignLog(data: any): Observable<any> {
    return this.ajaxService.post2(data, "admin/campaign_logs");
  }

  campaignLogDownload(data: any): Observable<any> {
    return this.ajaxService.post2(data, "admin/campaign_content_logs");
  }

  addEditCustomer(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "store/manage_customer");
  }

  deleteStoreCustomer(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/delete_customer");
  }

  getUserAddress(data: any): Observable<any> {
    return this.ajaxService.post2(data, "customer/customer_addresses");
  }

  managecustomeraddrs(data: any): Observable<any> {
    return this.ajaxService.formData2(data, "customer/manage_customer_addresses");
  }
}