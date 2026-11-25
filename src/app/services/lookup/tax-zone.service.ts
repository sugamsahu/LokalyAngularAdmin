import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class TaxZoneService {
  constructor(private ajaxService: AjaxService) {}

  get(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/tax_zones");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "admin/manage_tax_zone");
  }

  getDetailsTax(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/tax_zone_details");
  }
}