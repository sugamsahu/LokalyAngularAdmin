import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class HomePagePortalService {
  constructor(private ajaxService: AjaxService) { }

  getHomeConfigurationSettings(data:{}):Observable<any> {
    return this.ajaxService.post2(data,'admin/home_configuration_settings');
  }
  
  manageHomeConfigurationSettings(data:{}):Observable<any> {
    return this.ajaxService.post2(data, 'admin/manage_home_configuration_settings');
  }
}