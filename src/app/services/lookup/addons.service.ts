import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class AddonsService {
  constructor(private ajaxService: AjaxService) {}

  manageAddons(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_addons");
  }

  getAddonsList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/master_addons_list");
  }
}