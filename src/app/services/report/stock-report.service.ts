import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class StockReportService {
  constructor(private ajaxService: AjaxService) { }

  getStockList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/stock_report_list");
  }

  getNotificationList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/communication_log_report");
  }

  getStockReportDetail(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/stock_report_detail");
  }
}