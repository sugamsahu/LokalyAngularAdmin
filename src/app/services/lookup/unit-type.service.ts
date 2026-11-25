import { AjaxService } from "../ajax.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CommonService } from "../common.service";

@Injectable({
  providedIn: "root",
})
export class UnitTypeService {
  constructor(
    public commonService: CommonService,
    private ajaxService: AjaxService
  ) {}

  role = this.commonService.getUserRoleName();

  get(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/item_unit_list");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_item_unit");
  }

  getById(data: {}): Observable<any> {
    return this.ajaxService.post2(data, this.role + "/item_unit_by_id");
  }
}