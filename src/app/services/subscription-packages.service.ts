import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "./ajax.service";
import { CommonService } from "./common.service";

@Injectable({
  providedIn: "root",
})
export class SubscriptionPackagesService {
  constructor(private ajaxService: AjaxService) {}

  getSubscriptionList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "user/subscriptions_list");
  }

  manageSubscriptions(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_subscriptions");
  }
}