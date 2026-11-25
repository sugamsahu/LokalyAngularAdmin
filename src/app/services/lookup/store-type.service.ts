import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class StoreTypeService {
  constructor( private ajaxService: AjaxService ) { }

  get(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/store_types");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "admin/manage_store_types");
  }

  getById(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/store_type_by_id");
  }
}