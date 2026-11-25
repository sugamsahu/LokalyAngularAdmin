import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class DemoStoreService {
  constructor(private ajaxService: AjaxService) {}
  
  getSellerListRecord(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/sellers_list");
  }

  getDemoStoreSellerListRecord(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/demoapp_user_stores");
  }
  
  editSubCategoryType(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/edit_app_userinfo");
  }
}
