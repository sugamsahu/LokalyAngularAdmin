import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class ItemTagService {
  constructor( private ajaxService: AjaxService ) { }

  get(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/item_tags");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "admin/manage_item_tags");
  }

  getStoreTypeList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/store_types");
  }
}