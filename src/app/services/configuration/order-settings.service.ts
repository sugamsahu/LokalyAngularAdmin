import { Injectable } from "@angular/core";
import { AjaxService } from "../ajax.service";
import { Observable, of } from "rxjs";
import { CommonService } from "src/app/services/common.service";

@Injectable({
  providedIn: 'root'
})
export class OrderSettingsService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }

  addOrderSettings(data:{}) {
      return this.ajaxService.formData(data, "admin/manage_item_unit");
  };

  // edit
  editOrderSettings(data:{}) {
      return this.ajaxService.formData2(data, "admin/get_platform_order_settings");
  };

  // get list
  getOrderSettingsList(data:{}):Observable<[]> {
      return this.ajaxService.formData2(data, "admin/platform_order_settings");
  };

  // get single record
  getOrderSettingsDetails(data:{}) {
      return this.ajaxService.post(data, "admin/item_unit_by_id");
  };

  // delete single record
  deleteOrderSettings(data:{}) {
      return this.ajaxService.post2(data, "admin/delete_platform_order_settings");
  };
}