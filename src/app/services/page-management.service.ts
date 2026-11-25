import { Injectable } from "@angular/core";
import { CommonService } from "./common.service";
import { AjaxService } from "./ajax.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PageManagementService {
  constructor(
    public commonService: CommonService,
    private ajaxService: AjaxService
  ) {}

  role = this.commonService.getUserRoleName();

  get(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/content_listing");
  }

  getById(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/content_details");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "admin/manage_content");
  }

  reorderPages(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/reorder_page_contents");
  }

  deleteContent(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/delete_content");
  }

  deleteHelp(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/delete_helps");
  }
}