import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { AjaxService } from "src/app/services/ajax.service";

@Injectable({
  providedIn: "root",
})
export class IpWhitelistService {
  constructor(private http: HttpClient, private ajaxService: AjaxService) {}

  getIpWhitelist(IpAddress: any): Observable<any> {
    return this.ajaxService.getById(IpAddress, "get_ip_whitelist");
  }

  public getIPAddress() {
    return this.http.get("https://geolocation-db.com/json/");
  }
}