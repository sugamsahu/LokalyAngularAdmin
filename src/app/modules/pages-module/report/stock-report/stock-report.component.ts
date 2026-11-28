import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { StockInwardService } from "src/app/services/manage-stock/stock-inward.service";
import { StockReportService } from "src/app/services/report/stock-report.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from "rxjs";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: "app-stock-report",
  templateUrl: "./stock-report.component.html",
  styleUrls: ["./stock-report.component.scss"],
})
export class StockReportComponent implements OnInit, OnDestroy {
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
  selectedStore: any;
  storeList: any = [];
  store_label: any;
  stockReportList: any = [];
  isSuperAdmin = false;
  store_id: any;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  stockMethodList = [{ id: 0, label: 'All' }, { id: 1, label: 'Manual Stock' }, { id: 2, label: 'At Item Level' }, { id: 3, label: 'At Variants Level' }]
  itemDisplayList = [{ id: 0, label: 'All Items' }, { id: 1, label: 'Items which are In Stock' }, { id: 2, label: 'Items which are Out of Stock' }, { id: 3, label: 'Items where Current Stock <= Reorder Level' }]
  stock_management_method = 0
  item_stock_type = 0
  stockReportData: any;
  data: {};
  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private _stockInwardService: StockInwardService,
    private StockReportService: StockReportService,
    private cryptoService: CryptoService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private cookieService: CookieService,
    private router: Router,
    public commonService: CommonService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    if (this.generalSetting) {
      this.store_label = this.generalSetting.store_label;
    } else {
      this.store_label = this.main.store_label;
    }

    this.stockReportData = this.cryptoService.decryptIdValue(
      "stockReportData" + this.sellerDetails.store_id?.toString(),
      this.main.CryptoKey
    );
    if (this.stockReportData) {
      this.stockReportData = JSON.parse(this.stockReportData)
      this.store_id = this.stockReportData?.store_id
      this.search = this.stockReportData?.search_query
      this.stock_management_method = this.stockReportData?.stock_management_method == '' ? 0 : this.stockReportData?.stock_management_method
      this.item_stock_type = this.stockReportData?.item_stock_type == '' ? 0 : this.stockReportData?.item_stock_type
      this.page = this.stockReportData?.page
    }
    this.cookieService.deleteAll()
    this.getStoreList();
    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.GetStockReportList(1);
          })
        )
        .subscribe();
    this.getHelpDetails();
  }

  ngOnDestroy(): void {
    this.cookieService.deleteAll()
    this.cookieService.delete("stockReportData" + this.sellerDetails.store_id?.toString())
    this.cookieService.delete("stockReportItemId" + this.sellerDetails.store_id?.toString())
    this.cookieService.delete("stockReportItemVariantId" + this.sellerDetails.store_id?.toString())
    this.cookieService.delete("variantString" + this.sellerDetails.store_id?.toString())
    this.cryptoService.clearCookie("stockReportData" + this.sellerDetails.store_id?.toString())
    this.cryptoService.clearCookie("stockReportItemId" + this.sellerDetails.store_id?.toString())
    this.cryptoService.clearCookie("stockReportItemVariantId" + this.sellerDetails.store_id?.toString())
    this.cryptoService.clearCookie("variantString" + this.sellerDetails.store_id?.toString())
  }

  //storelist
  getStoreList() {
    const data = {
      user_id: this.main.LoggedUserInfo.user_id,
    };

    this._stockInwardService.getStoreList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach((element) => {
            this.storeList = response.data;
          });

          this.storeList = this.storeList.sort((a, b) => a.store_name.localeCompare(b.store_name));
          this.storeList.forEach(element => {
            if (element.store_id == this.sellerDetails.store_id && !this.store_id) {
              if (element.store_name != "") {
                this.selectedStore = element.store_name + " (" + element.manager + ")";
              }
              if (element.store_name == "") {
                this.selectedStore = element.manager;
              }
              this.store_id = element.store_id;
            } else if (element.store_id == this.store_id) {
              if (element.store_name != "") {
                this.selectedStore = element.store_name + " (" + element.manager + ")";
              }
              if (element.store_name == "") {
                this.selectedStore = element.manager;
              }
              this.store_id = element.store_id;
            }
          });
          this.GetStockReportList(this.page)
        } else {
          this.toastr.error(response.message);
        }
      },
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
    this.getStoreList();
  }

  GetStockReportList(page) {
    this.page = page;
    var data = {};
    data = {
      store_id: this.store_id,
      page: this.page,
      limit: this.tableSize,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      user_id: this.main.LoggedUserInfo.user_id,
      search_query: this.search,
      stock_management_method: this.stock_management_method == 0 ? '' : this.stock_management_method,
      item_stock_type: this.item_stock_type == 0 ? '' : this.item_stock_type,
    };

    this.StockReportService.getStockList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.data = data
          this.stockReportList = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.stockReportList = [];
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  SearchStockReport() {
    if (this.selectedStore) {
      this.GetStockReportList(1);
    }
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetStockReportList(this.page);
  }

  viewStockReportDetail(item) {
    this.cookieService.deleteAll()
    this.cryptoService.clearCookie("stockReportData" + this.sellerDetails.store_id.toString())
    this.cryptoService.clearCookie("stockReportItemId" + this.sellerDetails.store_id.toString())
    this.cryptoService.clearCookie("stockReportItemVariantId" + this.sellerDetails.store_id.toString())
    this.cryptoService.clearCookie("variantString" + this.sellerDetails.store_id.toString())

    this.cryptoService.encryptIdValue(
      JSON.stringify(this.data),
      "stockReportData" + this.sellerDetails.store_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.encryptIdValue(
      item.item_id.toString(),
      "stockReportItemId" + this.sellerDetails.store_id.toString(),
      this.main.CryptoKey
    );
    if (item.stock_management_method == 3) {
      this.cryptoService.encryptIdValue(
        item.item_variants_id.toString(),
        "stockReportItemVariantId" + this.sellerDetails.store_id.toString(),
        this.main.CryptoKey
      );
    } else {
      this.cryptoService.encryptIdValue(
        item.variants.toString(),
        "variantString" + this.sellerDetails.store_id.toString(),
        this.main.CryptoKey
      );
    }
    window.open("/stock-report/view-stock-report", "_blank");
  }

  clearSearch() {
    if (this.search == '') {
      this.search = '';
      this.GetStockReportList(1);
    }
  }
  /** Export stock report data using service */

  exportDataValidation() {
    if (this.count > 200000) {
      this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
    } else {
      this.exportData();
    }
  }

  exportData() {
    var data = {};
    data = {
      store_id: this.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
      is_export: 1,
      current_store_id: this.sellerDetails.store_id,
      stock_management_method: this.stock_management_method == 0 ? '' : this.stock_management_method,
      item_stock_type: this.item_stock_type == 0 ? '' : this.item_stock_type,
    };

    this.StockReportService.getStockList(data).subscribe({
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

  priceFormatter(value: any) {
    if (value) {
      var price = value.toString().split(".")[0];
      var decimal = value.toString().split(".")[1];
      if (this.show_price_same_font == 1) {
        return price + this.amount_seperator + decimal;
      } else {
        return price + "<span class='price-decimal'><small><b>" + this.amount_seperator + decimal + "</b></small></span>";
      }
    } else {
      return '0';
    }
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '130'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '130'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '130'
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
