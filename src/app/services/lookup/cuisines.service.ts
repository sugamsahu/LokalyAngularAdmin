import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class CuisinesService {
  constructor( private ajaxService: AjaxService ) { }

  get(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/cuisines_list");
  }

  add(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "admin/manage_cuisines");
  }
}