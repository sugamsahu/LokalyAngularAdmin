import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class DineInService {
  constructor(private ajaxService: AjaxService) {}

  getDineInSettings(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/get_dine_in_settings");
  }

  saveDine_InSettings(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "store/manage_dine_in_setting");
  }
}