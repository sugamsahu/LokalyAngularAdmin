import { AjaxService } from "./ajax.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { CommonService } from "src/app/services/common.service";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }

  getUserStoreRoles(userDeta: {}): Observable<any> {
    var role = this.commonService.getUserRoleName();
    return this.ajaxService.post(userDeta, role + "/user_store_roles");
  }

  getStoreSubscriptionDetails(userDeta: {}): Observable<any> {
    return this.ajaxService.post(userDeta, "store/store_subscription_details");
  }

  updateFirstTimeLoginConfirm(userDeta: {}): Observable<any> {
    return this.ajaxService.formData(userDeta, "store/manage_store");
  }

  getCommonConfigurationDetails(): Observable<any> {
    var data = {}
    return this.ajaxService.post2(data,"user/global_settings");
  }

  forgotPassword(user: {}): Observable<any> {
    return this.ajaxService.post(user, "user/forgotpassword");
  }

  resetPassword(user: {}): Observable<any> {
    return this.ajaxService.post(user, "user/reset_password");
  }
  
  verificationOTP(user: {}): Observable<any> {
    return this.ajaxService.post(user, "user/verification_otp");
  }

  changePassword(user: {}): Observable<any> {
    return this.ajaxService.post(user, "user/change_password");
  }

  getStoreServiceDetails(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/service_details");
  };

  submitStoreServiceDetails(data:{}): Observable<any> {
    return this.ajaxService.post2(data, "store/manage_order_service");
  };
}