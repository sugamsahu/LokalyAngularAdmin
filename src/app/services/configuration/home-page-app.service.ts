import { Injectable } from '@angular/core';
import { AjaxService } from '../ajax.service';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HomePageAppService {
  constructor(private ajaxService: AjaxService) { }

  getHomeConfigurationSettings(data:{}):Observable<any> {
    return this.ajaxService.post2(data,'admin/home_configuration_settings');
  }

  manageHomeConfigurationSettings(data:{}):Observable<any> {
    return this.ajaxService.post2(data, 'admin/manage_home_configuration_settings');
  }

}
