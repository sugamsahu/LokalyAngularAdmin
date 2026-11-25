import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class ItemAttributeService {
  constructor( private ajaxService: AjaxService ) { }

  get(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/item_attributes");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "admin/manage_item_attributes");
  }

  getStoreTypeList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/store_types");
  }
  
  getCategoryList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/store_parent_categories");
  }

  getSubCategoryList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/store_sub_categories");
  }
}