import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class AuditLogReportService {
  constructor(private ajaxService: AjaxService) { }

  auditLogTableList(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role = userData.role_id == 1 ? "admin" : userData.role_id == 6 ? "admin" : "store";
    return this.ajaxService.post2(data, role + "/audit_log_report_list");
  }

  auditLogSummary(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role = userData.role_id == 1 ? "admin" : userData.role_id == 6 ? "admin" : "store";
    return this.ajaxService.post2(data, role + "/audit_log_report");
  }
}