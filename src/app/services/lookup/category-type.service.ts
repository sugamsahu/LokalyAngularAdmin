import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";
import { CommonService } from "../common.service";

@Injectable({
  providedIn: 'root'
})
export class CategoryTypeService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }

  role = this.commonService.getUserRoleName();

  getStoreParentCategories(data: any = {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/store_parent_categories");
  }

  manageStoreCategories(data: any = {}): Observable<any> {
    return this.ajaxService.formData2(data, "admin/manage_store_categories");
  }

  getById(data: any = {}): Observable<any> {
    return this.ajaxService.post2(data, this.role + "/get_parent_category_details_by_id");
  }

  getStoreTypeList(): Observable<any> {
    return this.ajaxService.get2("admin/store_types");
  }
}