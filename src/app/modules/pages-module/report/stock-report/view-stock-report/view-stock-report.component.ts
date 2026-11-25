import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { StockReportService } from "src/app/services/report/stock-report.service";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-view-stock-report",
  templateUrl: "./view-stock-report.component.html",
  styleUrls: ["./view-stock-report.component.scss"],
})
export class ViewStockReportComponent implements OnInit {
  ItemId: any = 0;
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
  itemDetails: any = [];
  store_id: any;
  selectedVariant: any;
  report_detail_data: any;
  selectVariant: any;
  variantString: string;
  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cryptoService: CryptoService,
    private StockReportService: StockReportService,
    private cookieService: CookieService,
    private router: Router,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    this.ItemId = this.cryptoService.decryptIdValue(
      "stockReportItemId" + this.sellerDetails.store_id?.toString(),
      this.main.CryptoKey
    );

    this.selectedVariant = this.cryptoService.decryptIdValue(
      "stockReportItemVariantId" + this.sellerDetails.store_id?.toString(),
      this.main.CryptoKey
    );

    this.variantString = this.cryptoService.decryptIdValue(
      "variantString" + this.sellerDetails.store_id?.toString(),
      this.main.CryptoKey
    );
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.GetStockReportDetail(1);
  }

  ngOnDestroy(): void {
    this.cookieService.deleteAll()
  }

  GetStockReportDetail(page) {
    this.page = page;
    var data: any = {};
    data = {
      item_id: this.ItemId,
      page: this.page,
      limit: this.tableSize,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };
    if (this.selectedVariant) {
      data.item_variants_id = this.selectedVariant
    }
    this.StockReportService.getStockReportDetail(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.itemDetails = response.data.item_details;
          if (this.itemDetails.stock_management_method == 3) {
            this.selectVariant = this.itemDetails.item_variants.filter(item => item.item_variants_id == this.selectedVariant)[0]
          } else {
            this.selectVariant = this.itemDetails.item_variants[0]
          }
          this.report_detail_data = response.data.report_detail_data;
          if (this.report_detail_data.length == 0) {
            this.no_data = true;
          } else {
            this.no_data = false;
          }
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.itemDetails = [];
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }
}
