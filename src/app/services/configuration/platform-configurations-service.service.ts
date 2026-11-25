import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class PlatformConfigurationsServiceService {
  constructor(private ajaxService: AjaxService) { }

  getAllPlatformSettings(): Observable<any> {
    return this.ajaxService.get2("admin/platform_settings_options");
  }
 
  managePlatformSettings(data:{}): Observable<any> {
    return this.ajaxService.post2(data,"admin/manage_platform_settings");
  }
}