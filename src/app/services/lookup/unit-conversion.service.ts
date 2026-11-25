import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";
import { CommonService } from "../common.service";

@Injectable({
  providedIn: "root",
})
export class UnitConversionService {
  constructor(private ajaxService: AjaxService) {}

  get(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/item_unit_conversion_list");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/manage_item_unit_conversion");
  }

  getItemUnitList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/item_unit_list");
  }
}