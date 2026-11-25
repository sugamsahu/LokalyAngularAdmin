import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class TemplateService {
  constructor(private ajaxService: AjaxService) {}

  getCampaignTemplate(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/campaign_templates");
  }

  manageCampaignTemplate(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "admin/manage_compaign_templates");
  }
}