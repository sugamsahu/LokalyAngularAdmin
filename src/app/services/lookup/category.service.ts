import { AjaxService } from "../ajax.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CategoryService {
  constructor(private ajaxService: AjaxService) {}

  get(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role = userData.role_id == 1 ? "admin": userData.role_id == 6 ? "admin": "store";
    return this.ajaxService.post2(data, role + "/categories_list");
  }

  getStoreCategories(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/categories_list");
  }
}