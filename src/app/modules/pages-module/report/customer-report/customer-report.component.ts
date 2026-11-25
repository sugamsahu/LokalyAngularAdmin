import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { CostomerService } from "src/app/services/report/costomer.service";
import { DemoStoreService } from "src/app/services/configuration/demo-store.service";
import { StockInwardService } from "src/app/services/manage-stock/stock-inward.service";
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from "rxjs";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-customer-report",
  templateUrl: "./customer-report.component.html",
  styleUrls: ["./customer-report.component.scss"],
})
export class CustomerReportComponent implements OnInit {
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
  selectedStore: any;
  storeList: any = [];
  store_label: any;
  customerReportList: any = [];
  isSuperAdmin = false;
  store_id: any = 0;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  fullAddress: any = [];

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private CostomerService: CostomerService,
    private cdr: ChangeDetectorRef,
    private DemoStoreService: DemoStoreService,
    private _stockInwardService: StockInwardService,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    this.isSuperAdmin = false;
    if (
      this.main.LoggedUserInfo.role_id == 6 ||
      this.main.LoggedUserInfo.role_id == 1
    ) {
      this.isSuperAdmin = true;
    }
    if (this.generalSetting) {
      this.store_label = this.generalSetting.store_label;
    } else {
      this.store_label = this.main.store_label;
    }
    if (this.isSuperAdmin == true) {
      this.getSellerList();
      this.getCustomerReportList(this.page);
    }

    if (this.isSuperAdmin == false) {
      this.getStoreList();
      this.getCustomerReportList(this.page);
    }

    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.getCustomerReportList(1);
          })
        )
        .subscribe();


    this.cdr.detectChanges();
    this.getHelpDetails()
  }


  /** Get seller list using service. */
  //store list for superadmin = true
  getSellerList() {
    var data = {
      is_verified: 2,
      khata_user: 0,
      market_type: 2
    };
    this.DemoStoreService.getSellerListRecord(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.storeList = [
            { store_name: "", manager_name: "All", store_id: 0 },
          ];
          response.data.forEach((element) => {
            this.storeList.push({
              store_name: element.store_name,
              manager_name: element.manager_name,
              store_id: element.store_id,
              store_area_name: element.store_area_name,
              store_city_name: element.store_city_name,
            });
          });

          this.selectedStore = this.storeList[0];
          this.storeList = this.storeList.sort((a, b) => a.store_name.localeCompare(b.store_name));

        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //storelist for superadmin false
  /** Get store list using service. */
  getStoreList() {
    const data = {
      user_id: this.main.LoggedUserInfo.user_id,
    };
    this._stockInwardService.getStoreList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.storeList = [{ store_name: "", manager: "All", store_id: 0 }];
          response.data.forEach((element) => {
            this.storeList.push({
              store_name: element.store_name,
              manager: element.manager,
              store_id: element.store_id,
              area_name: element.area_name,
              city_name: element.city_name,
            });
          });
          this.selectedStore = this.storeList[0];
          this.storeList = this.storeList.sort((a, b) => a.store_name.localeCompare(b.store_name));

        } else {
          this.toastr.error(response.message);
        }
      },
    });
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getCustomerReportList(1);
    }
  }

  //get user list

  getCustomerReportList(page) {
    this.page = page;
    var data = {};
    data = {
      store_ids: this.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
      page: this.page,
      limit: this.tableSize,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      search_query: this.search
    };
    this.CostomerService.getCustomerReportItemsList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.customerReportList = response.data;
          //for full address
          this.customerReportList.forEach((customer) => {
            customer.fullAddress = [
              customer.address1,
              customer.address2,
              customer.city_name,
              customer.zipcode,
              customer.state_name,
              customer.country_name,
            ]
              .filter(Boolean)
              .join(", ");
          });
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.customerReportList = [];
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //image
  getInitials(name) {
    var canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = 35;
    canvas.height = 35;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    context.fillStyle = "#476ce8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "16px Arial";
    context.fillStyle = "#FFFFFF";
    var nameArray = name.split(" ");
    var initials = "";
    initials = initials + nameArray[0][0];
    initials = initials == "undefined" ? "U" : initials;
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 13, 22);
    } else {
      context.fillText(initials.toUpperCase(), 13, 22);
    }
    var data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }

  // changeStore
  changeStore(data) {
    let tempDisplay = '';
    if (this.selectedStore.store_name != '' && !this.isSuperAdmin) {
      tempDisplay = this.selectedStore.store_name + " (" + this.selectedStore.manager + ")"
      if (this.selectedStore.area_name) {
        tempDisplay += this.selectedStore.area_name + ", " + this.selectedStore.city_name
      }
    }

    if (this.selectedStore.store_name != '' && this.isSuperAdmin) {
      tempDisplay = this.selectedStore.store_name + " (" + this.selectedStore.manager_name + ") "
      if (this.selectedStore.store_area_name) {
        tempDisplay += this.selectedStore.store_area_name + ", " + this.selectedStore.store_city_name
      }
    }

    this.selectedStore = tempDisplay;

    this.store_id = data.store_id;
    this.getCustomerReportList(1);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.getCustomerReportList(this.page);
  }

  exportDataValidation() {
    if (this.count > 200000) {
      this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
    } else {
      this.exportData();
    }
  }

  exportData() {
    var data = {
      store_ids: this.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
      is_export: 1,
      current_store_id: this.sellerDetails.store_id
    };

    this.CostomerService.getCustomerReportItemsList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
        } else {
          this.toastr.error(this.translate.instant(response.message))
        }
      },
      error: (err) => { },
      complete: () => { }
    })
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
      data.module_key = '60'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '60'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '125'
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
}
