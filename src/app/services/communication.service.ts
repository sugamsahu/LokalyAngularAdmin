import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "./ajax.service";

@Injectable({
  providedIn: "root",
})
export class CommunicationService {
  constructor(private ajaxService: AjaxService) { }

  getSMSTemplateList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/sms_list");
  }

  getSMSTemplate(id: {}): Observable<any> {
    return this.ajaxService.post2(id, "admin/get_sms");
  }

  editSMSTemplate(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_sms");
  }

  getEmailTemplateList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/email_templates");
  }

  getEmailTemplate(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/get_email_template");
  }

  editEmailTemplate(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_email_template");
  }

  getModuleCategoryTypeList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/module_category_type");
  }

  getNotificationTemplateList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/master_notifications");
  }

  getNotificationTemplate(id: {}): Observable<any> {
    return this.ajaxService.post2(id, "admin/get_notification_by_id");
  }

  editNotificationTemplate(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_notifications");
  }

  getModuleLinktoList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/link_to_type");
  }

  getCommunicationLogReport(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/communication_log_report");
  }
}