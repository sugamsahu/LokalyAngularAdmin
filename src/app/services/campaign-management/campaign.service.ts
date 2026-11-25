import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
@Injectable({
  providedIn: "root",
})
export class CampaignService {
  constructor(private ajaxService: AjaxService) {}

  getCampaignList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/campaigns");
  }

  manageCampaigns(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "admin/manage_compaigns");
  }
}