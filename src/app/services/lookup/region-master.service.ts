import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AjaxService } from "../ajax.service";

@Injectable({
    providedIn: 'root'
})
export class RegionMasterService {
    constructor(private ajaxService: AjaxService) { }

    getRegionList(data: {}): Observable<any> {
        return this.ajaxService.post2(data, "admin/region_lists");
    }

    manageRegion(data: {}): Observable<any> {
        return this.ajaxService.post2(data, "admin/manage_regions");
    }

    getCountryList(): Observable<any> {
        return this.ajaxService.get("user/countries_list");
    }
}