import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { StockReportService } from "src/app/services/report/stock-report.service";
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap } from "rxjs";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-notification-list",
  templateUrl: "./notification-list.component.html",
  styleUrls: ["./notification-list.component.scss"],
})
export class NotificationListComponent implements OnInit {
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef
  page: number = 1;
  count: number = 0;
  tableSize = environment.tableSize;
  search: any;
  no_data = true;
  main: any;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  show_price_same_font = this.generalSetting.show_price_same_font;
  sortKey: any = "";
  isOrderBy: boolean = true;
  notificationList: any = [];
  store_id: any;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private StockReportService: StockReportService,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getNotificationList(1);
        })
      )
      .subscribe();
    this.getNotificationList(1);
    this.getHelpDetails();
  }

  getNotificationList(page) {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data = {};
    data = {
      store_id: this.sellerDetails.store_id ? this.sellerDetails.store_id.toString() : '',
      page: this.page,
      limit: this.tableSize,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      user_id: this.main.LoggedUserInfo.user_id,
      search_query: search,
      communication_type: "3",
      is_notifications: 1

    };
    this.StockReportService.getNotificationList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.notificationList = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.notificationList = [];
        }
      },
      error: () => { },
      complete: () => { },
    });
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getNotificationList(1);
    }
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.getNotificationList(this.page);
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '66'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '66'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '66'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: () => {
        // handle error
      },
      complete: () => { },
    });
  }
}
