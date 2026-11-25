import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionReportService {

  constructor(private ajaxService: AjaxService) { }

  subscriptionReport(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role = userData.role_id == 1 ? "admin": userData.role_id == 6 ? "admin": "store";
    return this.ajaxService.post(data, role + "/subscription_report");
  }

  viewSubscriptionDetails(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role = userData.role_id == 1 ? "admin": userData.role_id == 6 ? "admin": "store";
    return this.ajaxService.post(data, role + "/view_subscription_details");
  }
}