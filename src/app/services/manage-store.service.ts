import { AjaxService } from "./ajax.service";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { CommonService } from "src/app/services/common.service";

@Injectable({
  providedIn: "root",
})
export class ManageStoreService {
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }

  role = this.commonService.getUserRoleName();

  deleteStoreOffer(data: { store_id: any; }) {
    throw new Error("Method not implemented.");
  }
  getById(data: { unit_id: any; }) {
    throw new Error("Method not implemented.");
  }

  getStoreKhataSettings(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/khata_setting_detail");
  }

  saveStoreKhataSettings(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/khata_setting");
  }

  getStoreSettings(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/store_settings");
  }

  saveStoreSettings(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/manage_store_setting");
  }

  storeTableLists(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/store_table_lists");
  }

  deleteStoreTables(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/delete_store_tables");
  }

  tableGetById(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/store_table_lists");
  }

  manageStoreTables(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/manage_store_tables");
  }

  getStorePaymentTypeList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/store_payment_types");
  }

  deletePaymentstoreType(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/delete_store_payment_types");
  }

  paymentTableGetById(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/store_payment_types");
  }

  saveStorePaymentType(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "store/manage_store_payment_types");
  }

  getUserPaymentTypeList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "user/payment_types");
  }

  getStoreBanners(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/store_banners");
  }

  addEditStoreBanner(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "store/manage_banners");
  }

  deleteStoreBanner(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/delete_banner");
  }

  reOrderStoreBanner(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "store/reorder_banner_display");
  }

  getStoreHolidayList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/store_holidays");
  }

  saveStoreHoliday(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "store/manage_holidays");
  }

  deleteStoreHoliday(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/delete_holidays");
  }
  
  getDeliverySettings(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "store/get_delivery_settings");
  };

  getDeliveryChargeType(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "user/delivery_charge_types");
  };

  getPlatformPaymentMethods(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/platform_payment_methods");
  };

  editOrderSettings(data: {}) {
    return this.ajaxService.formData2(data, "admin/get_platform_order_settings");
  };

  saveAdminDeliverySettings(data: {}) {
    return this.ajaxService.formData2(data, "admin/manage_platform_order_settings");
  };

  saveDeliverySettings(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "store/manage_delivery_settings");
  };

  manageStoreDeliveryArea(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "store/manage_delivery_areas");
  };

  getStoreDeliveryAreaList(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, "store/store_delivery_areas");
  };
}