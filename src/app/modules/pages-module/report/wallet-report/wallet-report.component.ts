import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import * as moment from "moment";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { WalletReportService } from "src/app/services/report/wallet-report.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { WalletReportListComponent } from "../../model/wallet-report-list/wallet-report-list.component";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CommonService } from "src/app/services/common.service";
@Component({
  selector: "app-wallet-report",
  templateUrl: "./wallet-report.component.html",
  styleUrls: ["./wallet-report.component.scss"],
})
export class WalletReportComponent implements OnInit {
  public formGroup: UntypedFormGroup;
  page: number = 1;
  count: number = 0;
  tableSize = environment.tableSize;
  no_data = true;
  main: any;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  show_price_same_font = this.generalSetting.show_price_same_font;
  amount_seperator = this.generalSetting?.amount_seperator;
  sortKey: any = "";
  isOrderBy: boolean = true;
  maxDate: any;
  customerList: any = [];
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  tempFromDate: Date;
  tempToDate: Date;
  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    private formBuilder: UntypedFormBuilder,
    private WalletReportService: WalletReportService,
    private modalService: NgbModal,
    private _helpService: BannerService,
    private router: Router,
    public commonService: CommonService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }
  ngOnInit(): void {
    var month = moment().subtract(1, "month");
    this.main = this.appComponent.main;
    this.maxDate = new Date();
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    this.GeCustomerList();

    this.GetWalletReport(this.page);
    this.cdr.detectChanges();
    this.getHelpDetails();
  }
  //load form
  loadForm() {
    this.formGroup = this.formBuilder.group({
      fromDate: new UntypedFormControl(moment().subtract(1, "month")),
      toDate: new UntypedFormControl(new Date()),
      selectedCustomer: new UntypedFormControl(null),
    });
    this.formGroup.get("fromDate").valueChanges.subscribe((val) => {
      this.getDate(val);
    });

    this.formGroup.get("toDate").valueChanges.subscribe((val) => {
      this.getToDate(val);
    });
  }

  getDate(fromdate) {
    this.tempFromDate = fromdate;
    if (fromdate > this.formGroup.value.toDate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
    else {
      this.GetWalletReport(1);
    }
  }
  getToDate(todate) {
    this.tempToDate = todate;
    if (this.formGroup.value.fromDate > todate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
    else {
      this.GetWalletReport(1);
    }
  }

  //get customer
  GeCustomerList() {
    const data = {
      user_id: this.main.LoggedUserInfo.user_id,
    };
    this.WalletReportService.getCustomerList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.customerList = [{ label: "All", value: 0 }];
          response.data.forEach((element) => {
            this.customerList.push({
              label: element.name,
              value: element.user_id,
            });
          });
          this.formGroup.controls.selectedCustomer.setValue(
            this.customerList[0]
          );
        } else {
          this.toastr.error(response.message);
        }
      },
    });
  }

  //get customer id
  selectedCustomer() {
    this.GetWalletReport(1);
  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.generalSetting.date_format_web.split(" ")[0];
  }
  //get user list
  walletReportList: any = [];
  GetWalletReport(page, fromDate?, toDate?) {

    this.page = page;
    var data: any = {};
    data = {
      page: this.page,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };

    if (!this.tempFromDate) {
      data.from_date = moment(new Date(this.formGroup.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn())
    } else {
      data.from_date = moment(new Date(this.tempFromDate)).format(this.DateFormateFromServerSideOnlyDateReturn())
    }

    if (!this.tempToDate) {
      data.to_date = moment(new Date(this.formGroup.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn())
    } else {
      data.to_date = moment(new Date(this.tempToDate)).format(this.DateFormateFromServerSideOnlyDateReturn())
    }

    if (this.formGroup.value.selectedCustomer) {
      data.user_id = this.formGroup.value.selectedCustomer.value
    }
    this.WalletReportService.getWalletReportList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.walletReportList = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.walletReportList = [];
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //sorting
  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetWalletReport(this.page);
  }

  //Modal open for details
  viewWalletReportDetail(item) {
    const modalRef = this.modalService.open(WalletReportListComponent, {
      size: "lg",
    });
    modalRef.componentInstance.details = item;
    modalRef.componentInstance.userid = this.main.LoggedUserInfo.user_id
    modalRef.componentInstance.fromDate = moment(new Date(this.formGroup.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn());
    modalRef.componentInstance.toDate = moment(new Date(this.formGroup.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn());
  }
  /** Export wallet report using service */
  exportDataValidation() {
    if (this.count > 200000) {
      this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
    } else {
      this.exportData();
    }
  }

  exportData() {
    var data: any = {};
    data = {
      from_date: moment(new Date(this.formGroup.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.formGroup.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      is_export: 1,
      report_user_id: this.main.LoggedUserInfo.user_id
    };

    if (this.formGroup.value.selectedCustomer) {
      data.user_id = this.formGroup.value.selectedCustomer.value
    }
    this.WalletReportService.getWalletReportList(data).subscribe({
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
      data.module_key = '62'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '62'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '62'
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
