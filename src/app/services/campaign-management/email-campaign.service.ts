import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class EmailCampaignService {
  constructor(private ajaxService: AjaxService) {}

  getCampaignDetail(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/compaign_details");
  }

  getCampaingnListById(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/get_campaign_by_id");
  }

  sendCampaignEmail(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "admin/send_email");
  }

  getEmailDetailList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/email_details");
  }

  editCampaignEmail(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "admin/unsend_mail_details_update");
  }
}