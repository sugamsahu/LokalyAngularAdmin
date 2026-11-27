import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { AppComponent } from "src/app/app.component";
import { ItemWiseOrderService } from "src/app/services/report/item-wise-order.service";
import { environment } from "src/environments/environment";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { AuditLogReportService } from "src/app/services/report/audit-log-report.service";
import { AuditLogDetailComponent } from "../../model/audit-log-details/audit-log-details.component";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-audit-log-report',
  templateUrl: './audit-log-report.component.html',
  styleUrls: ['./audit-log-report.component.scss'],
})

export class AuditLogReportComponent implements OnInit {
  main: any;
  page: number = 1;
  count: number = 0;
  tableSize: number = environment.tableSize;
  auditLogForm: UntypedFormGroup;
  generalSetting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  deliveryboy_label: string = this.generalSetting.deliveryboy_label;
  store_label: string = this.generalSetting.store_label;
  actionList: any = [
    { value: 'All', label: "All" },
    { value: 'INSERT', label: "Insert" },
    { value: 'UPDATE', label: "Update" },
    { value: 'DELETE', label: "Delete" },
  ];
  show_customer_details_to_store: boolean =
    this.generalSetting.show_customer_details_to_store == "1" ? true : false;
  global_currency: string = this.generalSetting.currency_symbol;
  dinein_module = this.generalSetting.dinein_module;
  orderStatusList: any = [];
  auditLogTableList: any = [];
  tempOrderDuringStatus: any = [];
  auditLogList: any = [];
  sortKey: string;
  maxDatefrom: Date = new Date();
  maxDateto: Date = new Date();
  PlatformSetting: any;
  business_model: any;
  isReporsShow: any;
  dienIn: any;
  pos: any;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  isOrderBy: boolean = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private appComponent: AppComponent,
    private translate: TranslateService,
    private itemWiseOrderService: ItemWiseOrderService,
    private auditLogReportService: AuditLogReportService,
    private toastr: ToastrService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private router: Router,
    private spinner: SpinnerService
  ) {
    this.main = this.appComponent.main;
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.dienIn = this.sellerDetails.dine_in
    this.pos = this.sellerDetails.pos
    this.loadForm();
    this.getHelpDetails();
    this.getTableList();
    this.getAuditReport();
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
  }

  loadForm() {
    this.auditLogForm = this.formBuilder.group({
      table_name: new UntypedFormControl('All'),
      fromDate: new UntypedFormControl(new Date()),
      toDate: new UntypedFormControl(new Date()),
      action: new UntypedFormControl("All"),
      search: new UntypedFormControl(""),
    });

    this.auditLogForm.get("fromDate").valueChanges.subscribe((val) => {
      this.getDate(val);
    });

    this.auditLogForm.get("toDate").valueChanges.subscribe((val) => {
      this.getToDate(val);
    });

    this.translate
      .get([
        "ALL",
        "ORDER_PENDING",
        "ORDER_ACCEPTED",
        "ORDER_READY_FOR_PICKUP",
        "ORDER_OUT_FOR_DELIVERY",
        "PROCESSING",
        "READY_FOR_BILLING",
        "ORDER_DELIVERED",
        "ORDER_REJECTED",
        "ORDER_UNDELIVEREDED",
      ])
      .subscribe((translations) => {
        this.orderStatusList = [
          { label: translations.ALL, value: 0 },
          { label: translations.ORDER_PENDING, value: 1 },
          { label: translations.ORDER_ACCEPTED, value: 2 },
          { label: translations.ORDER_READY_FOR_PICKUP, value: 3 },
          { label: translations.ORDER_OUT_FOR_DELIVERY, value: 4 },
          { label: translations.PROCESSING, value: 9 },
          { label: translations.READY_FOR_BILLING, value: 10 },
          { label: translations.ORDER_DELIVERED, value: 5 },
          { label: translations.ORDER_REJECTED, value: 6 },
          { label: translations.ORDER_UNDELIVEREDED, value: 7 },
        ];
        if (this.dienIn == 0) {
          this.orderStatusList = this.orderStatusList.filter((x) => x.value != 9 && x.value != 10)
          var Ids = [1, 2];
          this.auditLogForm.controls.order_status.setValue(Ids);
        }
        if (this.pos == 0) {
          this.orderStatusList = this.orderStatusList.filter((x) => x.value != 11)
        }
      });
  }

  getDate(date) {
    let date1: any = moment(date).format('ddd MMM DD YYYY');
    let date2: any = moment(this.auditLogForm.value.toDate).format('ddd MMM DD YYYY');
    this.compareDates(date1, date2)
  }

  /** Get item wise order to-date using form */
  getToDate(todate) {
    let date1: any = moment(this.auditLogForm.value.fromDate).format('ddd MMM DD YYYY');
    let date2: any = moment(todate).format('ddd MMM DD YYYY');
    this.compareDates(date1, date2)
  }

  actionChange() {
    this.page = 1;
  }

  getAuditReport() {
    this.page = 1;
    let date1: any = moment(this.auditLogForm.value.fromDate).format('ddd MMM DD YYYY');
    let date2: any = moment(this.auditLogForm.value.toDate).format('ddd MMM DD YYYY');
    if (this.compareDates(date1, date2)) {
      this.getAuditLogList(this.page);
    }
  }

  compareDates(fromDate: any, toDate: any) {
    let date1 = moment(fromDate, "ddd MMM DD YYYY");
    let date2 = moment(toDate, "ddd MMM DD YYYY");

    // Compare the dates
    if (date1.isBefore(date2)) {
      console.log(`${date1} is before ${date2}`);
      return true;
    } else if (date1.isAfter(date2)) {
      console.log(`${date1} is after ${date2}`);
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return false;
    } else {
      console.log(`${date1} is equal to ${date2}`);
      return true;
    }
  }

  clearAuditReport() {
    this.loadForm();
    this.getAuditReport();

  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.main.DateFormate.split(" ")[0];
  }

  getTableList() {
    var data: any = {};

    this.auditLogReportService.auditLogTableList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.auditLogTableList = response.data;
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      complete() {
      },
    });
  }

  getAuditLogList(page) {
    this.page = page;
    var data: any = {
      from_date: moment(new Date(this.auditLogForm.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.auditLogForm.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      action: this.auditLogForm.value.action == 'All' ? '' : this.auditLogForm.value.action,
      user_id: this.main.LoggedUserInfo.user_id,
      page: this.page,
      search_query: this.auditLogForm.value.search,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };

    this.auditLogReportService.auditLogSummary(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.auditLogList = response.data;
          this.count = response.count;
        } else {
          this.auditLogList = [];
          this.count = 0;
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      complete() {
      },
    });
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.getAuditLogList(this.page);
  }

  exportDataValidation() {
    if (this.count > 200000) {
      this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
    } else {
      this.spinner.show();
      this.exportData();
    }
  }

  /** Export item wise order report using service  */
  exportData() {
    var data: any = {
      table_name: this.auditLogForm.value.table_name,
      search_query: this.auditLogForm.value.search,
      from_date: moment(new Date(this.auditLogForm.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.auditLogForm.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      action: this.auditLogForm.value.action == 'All' ? '' : this.auditLogForm.value.action,
      user_id: this.main.LoggedUserInfo.user_id,
      is_export: 1,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };

    this.auditLogReportService.auditLogSummary(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
        } else {
          this.toastr.error(this.translate.instant(response.message))
        }
      },
      error: () => { },
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
      data.module_key = '141'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '141'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '141'
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
      complete: () => {
        this.spinner.show();
      },
    });
  }

  openDetailModel(item: any) {
    const modalRef = this.modalService.open(AuditLogDetailComponent, {
      size: "xl",
      centered: true
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.audutLogDetails = item;
  }

}


