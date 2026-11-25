import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class ChoicesService {
  constructor(private ajaxService: AjaxService) {}

  get(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/master_choices_list");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/manage_choices");
  }

  getChoicesDetails(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/master_choices_list");
  }
}