import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
  providedIn: "root",
})
@Injectable({
  providedIn: "root",
})
export class OrdersService {
  constructor(private ajaxService: AjaxService) {}

  getOrderList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/store_orders_list");
  }
}