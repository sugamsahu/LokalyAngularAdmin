import { AjaxService } from "../ajax.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CommonService } from "../common.service";

@Injectable({
    providedIn: "root",
})

export class reasonMasterService {
    constructor(
        public commonService: CommonService,
        private ajaxService: AjaxService
    ) { }

    role = this.commonService.getUserRoleName();

    get(data: {}): Observable<any> {
        return this.ajaxService.post2(data, "admin/reasons_lists");
    }

    add(data: {}): Observable<any> {
        return this.ajaxService.post2(data, "admin/manage_reasons");
    }
}