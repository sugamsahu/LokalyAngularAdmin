import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
@Injectable({
  providedIn: "root",
})
export class BusinessHoursService {
  constructor(private ajaxService: AjaxService) {}

  getBusinessHourDetails(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/business_hours_list");
  }
  
  saveBusinessHourDetails(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "store/manage_business_hours");
  }
}