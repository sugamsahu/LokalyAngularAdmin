import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class KhataService {
  constructor(private ajaxService: AjaxService) { }

  getKhataUsers(data:{}):Observable<any> {
    return this.ajaxService.post(data,'admin/khata_users');
  }
}