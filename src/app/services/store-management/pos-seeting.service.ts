import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
@Injectable({
  providedIn: "root",
})
export class PosSeetingService {
  constructor(private ajaxService: AjaxService) {}

  getPOSSettings(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/get_pos_settings");
  }

  savePOSSettings(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "store/manage_pos_setting");
  }
}