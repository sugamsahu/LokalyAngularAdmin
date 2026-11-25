import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "src/environments/environment";
import { ManageUserService } from "src/app/services/manage-user.service";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-download-center",
  templateUrl: "./download-center.component.html",
  styleUrls: ["./download-center.component.scss"],
})
export class DownloadCenterComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search: any;
  download_list: [];
  no_data = true;
  main: any;
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  show_price_same_font = this.general_setting.show_price_same_font;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  is_superAdmin: boolean;
  delivery_model: any;
  business_model: any;
  deliveryboy_label = this.general_setting.deliveryboy_label;
  driver_module = this.general_setting.driver_module;
  store_label = this.general_setting.store_label;
  pos = this.general_setting.pos_module;
  dinein_module = this.general_setting.dinein_module;
  picker = this.general_setting.picker_module;

  role_id: any;
  pos_allowed: any;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private manageUserService: ManageUserService,
    private appComponent: AppComponent,
    private modalService: NgbModal,
    private _helpService: BannerService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main = this.appComponent.main;
    this.PlatformSetting =
      this.PlatformSetting == null
        ? this.main.platform_setting
        : this.PlatformSetting;
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.is_superAdmin = false;
    if (
      this.main.LoggedUserInfo.role_id == 6 ||
      this.main.LoggedUserInfo.role_id == 1
    ) {
      this.is_superAdmin = true;
    }
    this.main.LoggedUserStoreInfo = JSON.parse(
      session.getSessionLoginUserStore()
    );
    this.page = 1;
    this.search = "";
    this.count = 0;
    this.downloadList(this.page);

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
            this.downloadList(1);
          })
        )
        .subscribe();
    this.getHelpDetails();
  }

  downloadList(page): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    this.page = page;
    var data = {};
    if (this.is_superAdmin == false) {
      data = {
        page: this.page,
        search_query: this.search,
        limit: this.table_size,
        user_id: this.seller_details.user_id,
        role_id: this.role_id,
        store_id: this.seller_details.store_id
      };
    } else {
      data = {
        page: this.page,
        search_query: this.search,
        limit: this.table_size,
        sort_field: this.sortKey,
        sort_type: this.isOrderBy ? 1 : 2,
        user_id: this.main.LoggedUserInfo.user_id,
      };
    }

    this.manageUserService.getDownloadList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.download_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.download_list = [];
        }
      },
      error: (error) => { },
      complete: () => {

      },
    });
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.downloadList(1);
    }
  }

  onSearchChange(value) {
    this.search = value;
    this.page = 1;
    this.downloadList(1);
  }

  DownloadRecord(data) {
    window.open(data.filename)
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.downloadList(this.page);
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '64'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '64'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '131'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_details = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }
}
