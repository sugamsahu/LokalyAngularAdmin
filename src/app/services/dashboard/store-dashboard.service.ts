import { Injectable } from "@angular/core";
import { AjaxService } from "../ajax.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class StoreDashboardService {
  constructor(private ajaxService: AjaxService) {}
  
  getStoreDashboard(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/dashboard_report");
  }

  getposDashboard(data: {}): Observable<any> {
    return this.ajaxService.post(data, "pos/dashboard_report");
  }
}