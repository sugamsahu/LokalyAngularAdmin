import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "./ajax.service";
import { CommonService } from "./common.service";

@Injectable({
  providedIn: "root",
})
export class SellerService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) {}

  role = this.commonService.getUserRoleName();

  getSellerList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, this.role + "/sellers_list");
  }
}