import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "./ajax.service";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  constructor(private ajaxService: AjaxService) {}

  getLanguageList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "user/master_languages");
  }

  getProfileDetails(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "user/profile_details");
  }

  addEditProfile(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "user/manage_profile");
  }

  deleteaccount(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/delete_account");
  }
}