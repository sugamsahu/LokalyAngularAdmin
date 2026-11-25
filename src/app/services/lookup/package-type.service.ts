import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";
import { CommonService } from "../common.service";


@Injectable({
  providedIn: 'root'
})
export class PackageTypeService {
  constructor( 
    private ajaxService: AjaxService,
    public commonService:CommonService 
  ) { }

  role = this.commonService.getUserRoleName();

  get(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/packaging_list");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_packaging");
  }

  getById(data: {}): Observable<any> {
    return this.ajaxService.post2(data, this.role + "/packaging_by_id");
  }
}