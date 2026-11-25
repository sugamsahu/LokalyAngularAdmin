import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { OrderSettingsService } from "src/app/services/configuration/order-settings.service";
import { environment } from "src/environments/environment";
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-order-settings-list',
  templateUrl: './order-settings-list.component.html',
  styleUrls: ['./order-settings-list.component.scss']
})

export class OrderSettingsListComponent implements OnInit {

  page: number = 1;
  total_count: number = 0;
  order_settings_list: any = [];
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search: any;
  no_data = true;

  admin_details = JSON.parse(localStorage.getItem("loginUser"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  sessionConfig = this.appComponent.sessionConfig();
  store_label = this.general_setting.store_label;

  main: any;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  searchText: string;

  constructor(
    private orderSettingsService: OrderSettingsService,
    private router: Router,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit() {
    this.main = this.appComponent.main;
    this.main.LoggedUserInfo = JSON.parse(this.sessionConfig.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;

    if (localStorage.getItem("orderSettingData") != null && localStorage.getItem("orderSettingData") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("orderSettingData"));
      localStorage.removeItem("orderSettingData");
    }
    if (filterObject) {
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search;
      this.searchText = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }

    this.GetOrderSettingsList(this.page);

    // server-side search
    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean),
          debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.GetOrderSettingsList(1);
          })
        )
        .subscribe();
  }

  GetOrderSettingsList(pageNo) {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = pageNo;
    this.page = pageNo;
    var data = {
      search_query: this.search,
      page: this.page,
    }
    this.orderSettingsService.getOrderSettingsList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.no_data = false;
          this.order_settings_list = response.data;
          this.total_count = response.count;
        }
        else {
          this.toastr.error(this.translate.instant(response.message));
          this.total_count = 0;
        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      }
    });
  }

  addOrderSettingsDetail() {
    this.sessionConfig.encryptIdValue(0, 'lookup_orderSetting_Id' + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
    this.router.navigate(['/order-settings']);
  }

  editOrderSettingsDetail(orderSettingId) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("orderSettingData", JSON.stringify(obj))

    this.sessionConfig.encryptIdValue(orderSettingId.toString(), 'lookup_orderSetting_Id' + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
    this.router.navigate(['/order-settings']);
  }
  /** Duplicate order setting list by using its orderSettingId  */
  duplicate(orderSettingId: any) {
    this.sessionConfig.encryptIdValue(orderSettingId.toString(), 'lookup_orderSetting_Id' + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
    this.router.navigate(['/order-settings']);
    localStorage.setItem('dupliacte_order', 'true');
  }

  deleteOrderSettings(id: any) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_ORDER_SETTING_RECORD"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteOrderSettingsConfirm(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  deleteOrderSettingsConfirm(orderSettingId: any) {
    var data = {
      user_id: this.admin_details.user_id,
      order_setting_id: orderSettingId,
    };
    this.orderSettingsService.deleteOrderSettings(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.GetOrderSettingsList(this.page);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {
        ;
      },
    });
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetOrderSettingsList(1);
    }
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetOrderSettingsList(this.page);
  }
}

