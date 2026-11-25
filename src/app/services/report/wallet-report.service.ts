import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class WalletReportService {
  constructor(private ajaxService: AjaxService) { }

  getCustomerList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/wallet_customers");
  }

  getWalletReportList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/wallet_report_lists");
  }

  getWalletReportDetailforParticular(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/wallet_report_detail");
  }
}