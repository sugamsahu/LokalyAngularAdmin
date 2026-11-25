import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class NotificationTemplateService {
  constructor(private ajaxService: AjaxService) {}

  getSMSNotificationsList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/sms_notifications_list");
  }

  manageSMSNotification(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "admin/manage_sms_notifications");
  }
}