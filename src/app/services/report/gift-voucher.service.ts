import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
export class GiftVoucherService {
  constructor(private ajaxService: AjaxService) { }

  getGiftVoucherReportList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/gift_voucher_report");
  }
}