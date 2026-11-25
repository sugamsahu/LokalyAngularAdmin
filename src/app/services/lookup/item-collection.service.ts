import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class ItemCollectionService {
  constructor(private ajaxService: AjaxService) { }

  get(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/master_item_collections");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "admin/manage_master_item_collection");
  }

  getStoreTypeList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/store_types");
  }

  collectionDetails(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/master_collection_details");
  }

  getItemTagList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/item_tags");
  }

  getItemCategory(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/store_parent_categories");
  }

  getItemSubCategory(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/store_sub_categories");
  }

  deleteItemCollection(data:{}):Observable<any> {
    return this.ajaxService.post(data, 'admin/delete_master_item_collection')
  }
}