import { Injectable } from "@angular/core";
import { AjaxService } from "../ajax.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AdminDashboardService {
  constructor(private ajaxService: AjaxService) {}
  
  getAdminDashboard(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/dashboard_report");
  }
}