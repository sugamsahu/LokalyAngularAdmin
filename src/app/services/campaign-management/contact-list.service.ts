import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class ContactListService {
  constructor(private ajaxService: AjaxService) {}

  getContactList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/compaign_contacts");
  }

  check_compaign_contacts_exits(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/check_compaign_contacts_exits");
  }

  manageCampaignContacts(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "admin/manage_compaign_contacts");
  }

  duplicateCampaignContacts(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "admin/campaign_duplicate_contact");
  }

  getCampaignUserList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/users_list_for_campaign");
  }

  deleteCampaignContacts(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "admin/campaign_contacts_delete");
  }
}