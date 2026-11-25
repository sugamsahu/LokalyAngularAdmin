import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class TaxGroupService {
  constructor(private ajaxService: AjaxService) {}

  get(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/tax_groups");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_tax_groups");
  }

  getTaxzoneList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/tax_zones");
  }
  
  getDetailsTax(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/tax_group_details");
  }
}