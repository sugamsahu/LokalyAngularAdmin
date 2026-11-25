import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class EasyScriptService {
  constructor(private _ajaxService: AjaxService) { }

  manageEasyScript(data: {}): Observable<any> {
    return this._ajaxService.formData2(data, 'admin/store_easy_scripts');
  }

  generateEasyScript(data: {}): Observable<any> {
    return this._ajaxService.post(data, "easyScriptService/generate_site_map");
  }

}
