import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { WalletReportService } from "src/app/services/report/wallet-report.service";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "src/environments/environment";
import { ToastrService } from "ngx-toastr";
import { CommonService } from "src/app/services/common.service";
@Component({
  selector: "app-wallet-report-list",
  templateUrl: "./wallet-report-list.component.html",
  styleUrls: ["./wallet-report-list.component.scss"],
})
export class WalletReportListComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  page: number = 1;
  count: number = 0;
  tableSize = environment.tableSize;
  no_data = true;
  @Input() details: any;
  @Input() fromDate: any;
  @Input() toDate: any;
  @Input() userid
  style_obj_wallet_report_list: any;
  show_price_same_font = this.generalSetting.show_price_same_font;
  amount_seperator = this.generalSetting?.amount_seperator;
  constructor(
    public activeModal: NgbActiveModal,
    private WalletReportService: WalletReportService,
    public translate: TranslateService,
    private toastr: ToastrService,
    public commonService : CommonService,
  ) {
    
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.style_obj_wallet_report_list = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    console.log(this.page);

    this.GetWalletReportforParticular(this.page);
  }

  //get user list
  walletReportListforParticular: any = [];
  GetWalletReportforParticular(page) {
    this.page = page;
    var data = {};
    data = {
      from_date: this.fromDate,
      to_date: this.toDate,
      customer_id: this.details.customer.user_id,
      page: this.page,
      user_id: this.userid
    };
    this.WalletReportService.getWalletReportDetailforParticular(data).subscribe(
      {
        next: (response: any) => {
          if (response.status == 1) {
            this.walletReportListforParticular = response.data;
            this.no_data = false;
            this.count = response.count;
          } else {
            this.toastr.error(response.message);
            this.no_data = true;
            this.count = 0;
            this.walletReportListforParticular = [];
          }
        },
        error: (error) => { },
        complete: () => { },
      }
    );
  }

  exportData() {
    var data = {};
    data = {
      from_date: this.fromDate,
      to_date: this.toDate,
      customer_id: this.details.customer.user_id,
      user_id: this.userid,
      is_export: 1,
    };
    this.WalletReportService.getWalletReportDetailforParticular(data).subscribe({
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
}
