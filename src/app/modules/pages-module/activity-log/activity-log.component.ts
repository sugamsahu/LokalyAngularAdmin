import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "src/environments/environment";
import { ActivityLogService } from "src/app/services/activity-log.service";
import { ActivitylogDetailsComponent } from "../model/activity-log-details/activity-log-details.component";
import { NgxSpinnerService } from "ngx-spinner";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-activity-log",
  templateUrl: "./activity-log.component.html",
  styleUrls: ["./activity-log.component.scss"],
})
export class ActivityLogComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  tableSize = 10;
  search: any;
  no_data = true;
  main: any;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  show_price_same_font = this.generalSetting.show_price_same_font;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  //activity
  selectedUserTypeItem: any;
  selectedUser: any;
  selectedLog: any;
  userTypeList: any = [];
  activityLogslist: any = [];
  originaluserlist: any = [];
  userList: any = [];
  activityLog = {
    user_id: "0",
    store_id: "0",
    type: 0,
  };
  logTypeList: any = [];
  selectedLogTypeItem: any;
  userid: any = 0;
  storeid: any = 0;
  usertype: any = 1;
  userLogList: any;
  moduleHide: any;
  business_model: any;
  removeLink: any;
  global_currency: any;
  global_timezone: any;
  platform_name: any;
  khata_label: any;
  allow_khata: any;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  seller_id: any;
  store_id: any;
  
  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private modalService: NgbModal,
    private ActivityLogService: ActivityLogService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private _helpService: BannerService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');

  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.generalCondition();
    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;

    if (
      localStorage.getItem("seller_Order_obj") != null &&
      localStorage.getItem("seller_Order_obj") != undefined
    ) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }

    if (filterObject) {
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.tableSize = 10;
    }
    this.getUserList(this.page);
    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean),
          debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.getUserList(1);
          })
        )
        .subscribe();
    this.cdr.detectChanges();
    this.getHelpDetails();
  }
  /** General setting method */
  generalCondition() {
    this.moduleHide =
      this.business_model == 1
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;

    this.removeLink =
      this.business_model == 1 && this.main.LoggedUserInfo.role_id == 1
        ? true
        : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : false;

    if (Number(this.moduleHide) == 0) {
    }
    this.generalSetting = JSON.parse(
      localStorage.getItem("LoggedUserSettings")
    );
    this.global_currency = this.generalSetting.currency_symbol;
    this.global_timezone = this.generalSetting.timezone;
    if (this.generalSetting) {
      this.platform_name = this.generalSetting.platform_name;
      this.khata_label = this.generalSetting.khata_label;
      this.allow_khata = parseInt(this.generalSetting.allow_khata);
    } else {
      this.platform_name = this.main.platform_name;
      this.khata_label = this.main.khata_label;
      this.allow_khata = parseInt(this.main.allow_khata);
    }
    //list for user
    if (this.allow_khata == 1) {
      this.translate.get(["BUSINESS"]).subscribe((translations) => {
        this.userTypeList = [
          {
            label: this.platform_name + " " + translations.BUSINESS,
            value: 1,
          },
          {
            label: this.platform_name + " " + this.khata_label,
            value: 2,
          },
        ];
        this.selectedUserTypeItem = this.userTypeList[0];
      });
    } else {
      this.translate.get(["BUSINESS"]).subscribe((translations) => {
        this.userTypeList = [
          {
            label: this.platform_name + " " + translations.BUSINESS,
            value: 1,
          },
        ];
        this.selectedUserTypeItem = this.userTypeList[0];
      });
    }
    this.translate
      .get(["ALL", "LOGGED_IN", "LOGGED_OUT", "OTHER"])
      .subscribe((translations) => {
        this.logTypeList = [
          {
            label: translations.ALL,
            value: 0,
          },
          {
            label: translations.LOGGED_IN,
            value: 1,
          },
          {
            label: translations.LOGGED_OUT,
            value: 2,
          },
          {
            label: translations.OTHER,
            value: 3,
          },
        ];
        this.selectedLogTypeItem = this.logTypeList[0];
      });
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getUserList(1);
    }
  }

  //get list
  async getUserList(page) {
    this.spinner.show()
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    if (parseInt(this.activityLog.user_id) > 0) {
      this.userid = parseInt(this.activityLog.user_id);
    }
    if (parseInt(this.activityLog.store_id) > 0) {
      this.storeid = parseInt(this.activityLog.store_id);
    }
    var log_type = this.selectedLogTypeItem?.value;

    this.usertype = this.selectedUserTypeItem?.value;

    this.page = page;
    var data = {};
    data = {
      user_id: this.userid,
      store_id: this.storeid,
      page: this.page,
      search_query: search,
      user_type: this.usertype,
      log_type: log_type > 0 ? log_type : "",
    };
    await this.ActivityLogService.getActivityLogsList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.activityLogslist = [];
          this.activityLogslist = response.data as any[];
          this.no_data = false;
          this.count = response.count;
          if (this.activityLogslist.length == 0) {
            this.no_data = true;
          }
          if (this.activityLogslist.length > 0) {
            this.spinner.hide();
            this.sellerListRecord();
          }
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.activityLogslist = [];
          this.spinner.hide();
        }
      },
      error: (error) => { },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  //seller list
  async sellerListRecord() {
    var data = {
      market_type: 2
    };
    await this.ActivityLogService.getSellerList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.userList = response.data;
        } else {
          this.toastr.error(response.message);
        }
        this.activityList();
      },
      error: (error) => { },
      complete: () => {
        ;
      },
    });
  }
  //get activity
  activityList() {
    var selectedUserTypeValue = this.selectedUserTypeItem?.value;
    var filtereddata = [];
    if (selectedUserTypeValue == 1) {
      this.userList.forEach((value) => {
        if (value.khata_user == 0) {
          filtereddata.push(value);
        }
      });
    } else {
      this.userList.forEach((value) => {
        if (value.khata_user == 1) {
          filtereddata.push(value);
        }
      });
    }
    this.userLogList = filtereddata;
    this.originaluserlist = filtereddata;
  }

  /** Change user type method */
  changeUserType(data1) {
    this.selectedUserTypeItem = data1;
    this.getUserList(this.page);
    var selectedUserTypeValue = this.selectedUserTypeItem?.value;
    var filtereddata = [];
    if (selectedUserTypeValue == 1) {
      this.userList.forEach((value) => {
        if (value.khata_user == 0) {
          filtereddata.push(value);
        }
      });
    } else {
      this.userList.forEach((value) => {
        if (value.khata_user == 1) {
          filtereddata.push(value);
        }
      });
    }
    this.userLogList = filtereddata;
    this.originaluserlist = filtereddata;
  }

  //change user
  changeActivityLog(data2) {
    if (data2.store_name != "") {
      this.selectedUser = data2.store_name + " (" + data2.manager_name + ")";
    }
    if (data2.store_name == "") {
      this.selectedUser = data2.manager_name;
    }
    this.activityLog.user_id = data2.user_id;
    this.activityLog.store_id = data2.store_id;
    this.getUserList(this.page);
  }

  //change logtype
  changeLogType(data3) {
    this.selectedLogTypeItem = data3;
    this.getUserList(this.page);
  }

  //opem modal
  viewActivityLogsDetail(item) {
    var global_timezone = this.generalSetting.timezone;
    var sessionconfig = this.appComponent.sessionConfig();
    const modalRef = this.modalService.open(ActivitylogDetailsComponent, {
      size: "lg",
    });
    modalRef.componentInstance.details = item;
    modalRef.componentInstance.timedetails = global_timezone;
    modalRef.componentInstance.linkdetail = this.removeLink;
    modalRef.componentInstance.sessionConfig = sessionconfig;
    modalRef.componentInstance.LoggedUserInfo =
      this.main.LoggedUserInfo.role_id;
    modalRef.componentInstance.Crypto = this.main.CryptoKey;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '76'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '10'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '10'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }
}
