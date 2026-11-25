import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";
import { CommonService } from "../common.service";

@Injectable({
  providedIn: 'root'
})
export class SubCategoryTypeService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }
  role = this.commonService.getUserRoleName();

  get(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/store_sub_categories");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_sub_categories");
  }

  getById(data: {}): Observable<any> {
    return this.ajaxService.post2(data, this.role + "/store_sub_categories");
  }

  getParentCategoryList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/store_parent_categories");
  }
}