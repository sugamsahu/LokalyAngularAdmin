import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { StockInwardService } from "src/app/services/manage-stock/stock-inward.service";
import { KhataService } from "src/app/services/report/khata.service";
import * as moment from "moment";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-khata-report",
  templateUrl: "./khata-report.component.html",
  styleUrls: ["./khata-report.component.scss"],
})
export class KhataReportComponent implements OnInit {
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
  amount_seperator = this.generalSetting?.amount_seperator;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  selectedStore: any;
  selectedCustomer: any;
  storeList: any = [];
  khataReportList: any = [];
  customerList: any = [];
  store_id: any = 0;
  isdisplayKhata: any;
  khata_label: any;
  store_label: any;
  customerId: any = 0;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    private _stockInwardService: StockInwardService,
    private KhataService: KhataService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private router: Router,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }
  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    if (this.generalSetting) {
      this.isdisplayKhata = parseInt(this.generalSetting.allow_khata);
      this.khata_label = this.generalSetting.khata_label;
      this.store_label = this.generalSetting.store_label;
    } else {
      this.isdisplayKhata = parseInt(this.main.allow_khata);
      this.khata_label = this.main.khata_label;
      this.store_label = this.main.store_label;
    }

    this.getStoreList();
    this.GetKhataReport(this.page);
    this.GeCustomerList();
    this.cdr.detectChanges();
    this.getHelpDetails();
  }

  //storelist
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
  /** Get khata list using service */
  //get user list
  GetKhataReport(page) {
    this.page = page;
    var data = {};
    data = {
      store_ids: this.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
      customer_user_ids: this.customerId,
      page: this.page,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };
    this.KhataService.getKhataList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.khataReportList = response.data;
          // for full address
          this.khataReportList.forEach((Item) => {
            var currentDate = new Date();
            var remainingDay = Item.remaining_days.split(" ", 1);
            var numberOfDaysToAdd = remainingDay[0];
            var CreditLimitDueDate = currentDate.setDate(
              currentDate.getDate() + parseInt(numberOfDaysToAdd)
            );
            Item.CreditLimitDueDate = moment(
              new Date(CreditLimitDueDate)
            ).format(this.main.DateFormate.split(" ")[0]);

            Item.fullAddress = [
              Item.address1,
              Item.address2,
              Item.area_name,
              Item.city_name,
              Item.state_name,
              Item.country_name,
              Item.zipcode,
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
          this.khataReportList = [];
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  // changeStore
  changeStore(data) {
    if (data.store_name != "") {
      this.selectedStore = data.store_name + " (" + data.manager + ")";
    }
    if (data.store_name == "") {
      this.selectedStore = data.manager;
    }

    this.store_id = data.store_id;
    this.GetKhataReport(1);
  }

  // Get Customer list
  GeCustomerList() {
    const data = {
      user_id: this.main.LoggedUserInfo.user_id,
    };
    this.KhataService.getCustomerList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          console.log(response.data);

          this.customerList = [{ label: "All", value: 0, phone: "" }];
          response.data.forEach((element) => {
            this.customerList.push({
              label: element.name,
              value: element.user_id,
              phone: element.phone
            });
          });
          console.log(this.customerList);

          this.selectedCustomer = this.customerList[0];
        } else {
          this.toastr.error(response.message);
        }
      },
    });
  }

  //search report
  searchKhataReport() {
    this.customerId = this.selectedCustomer.value;
    this.GetKhataReport(1);
  }

  //sorting
  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetKhataReport(this.page);
  }

  exportDataValidation() {
    if (this.count > 200000) {
      this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
    } else {
      this.exportData();
    }
  }

  /** Export khata report. */
  exportData() {
    var data = {};
    data = {
      store_ids: this.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
      customer_user_ids: this.customerId,
      is_export: 1,
    };

    this.KhataService.getKhataList(data).subscribe({
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
      data.module_key = '126'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '126'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '126'
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

  itemPrice(itemPrice: any) {
    let price: any;
    if (itemPrice != undefined && itemPrice != 0) {
      price = itemPrice.toString().split(".");
      return price;
    } else if (Number(itemPrice) == 0) {
      price = ["0", "00"];
      return price;
    }
  }
}
