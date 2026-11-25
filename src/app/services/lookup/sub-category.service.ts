import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";
import { CommonService } from "../common.service";

@Injectable({
  providedIn: "root",
})
export class SubCategoryService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) {}
  role = this.commonService.getUserRoleName();

  get(data: {}): Observable<any> {
    return this.ajaxService.post(data, this.role + "/sub_categories_list");
  }
}