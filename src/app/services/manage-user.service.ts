import { Injectable } from "@angular/core";
import { AjaxService } from "./ajax.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ManageUserService {
  constructor(private ajaxService: AjaxService) {}

  getStorePOS(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/users_lists");
  }

  getDownloadList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/download_list"); 
  }

  deleteStoreUser(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/delete_users");
  }

  addDeliveryBoy(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "store/manage_store_manager");
  }

  addStoreManager(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "store/manage_deliveryboy");
  }

  addpos(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "store/manage_user");
  }
}