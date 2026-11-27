import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { Moment } from 'moment';
import * as moment from 'moment';
import { StockInwardService } from 'src/app/services/manage-stock/stock-inward.service';
import { SubscriptionReportService } from 'src/app/services/report/subscription-report.service';
import { environment } from "src/environments/environment";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubscriptionSettlementComponent } from '../../model/subscription-settlement/subscription-settlement.component';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MMM-YYYY',
  },
  display: {
    dateInput: 'MMM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-subscription-report',
  templateUrl: './subscription-report.component.html',
  styleUrls: ['./subscription-report.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class SubscriptionReportComponent implements OnInit {

  main: any;
  subscriptionForm: UntypedFormGroup;
  fromDate = new UntypedFormControl(moment());
  startDate: any;
  toDate = new UntypedFormControl(moment());
  endDate: any;
  generalSetting: any = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  store_label: string = this.generalSetting.store_label;
  storeList: any = [];
  page: number = 1;
  subscriptionList: any = [];
  count: number = 0;
  tableSize: number = environment.tableSize;
  sortKey: string;
  isOrderBy: boolean;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  show_price_same_font = this.generalSetting.show_price_same_font;
  amount_seperator = this.generalSetting?.amount_seperator;
  cancel_click: boolean = false;
  constructor(
    private translate: TranslateService,
    private appComponent: AppComponent,
    private fb: UntypedFormBuilder,
    private siService: StockInwardService,
    private toastr: ToastrService,
    private subscriptionService: SubscriptionReportService,
    private modalService: NgbModal,
    private _helpService: BannerService,
    private router: Router,
    public commonService: CommonService,
  ) {
    this.main = this.appComponent.main;
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.loadForm()
    this.getStoreList();
    this.getHelpDetails();
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
  }

  loadForm() {
    this.startDate = moment(new Date()).format(
      'MM-YYYY'
    );
    this.endDate = moment(new Date()).format(
      'MM-YYYY'
    );

    this.subscriptionForm = this.fb.group({
      selectedStoreItem: new UntypedFormControl(null)
    })

    if (this.cancel_click == true) {
      this.fromDate.setValue(moment(this.startDate, "MM-YYYY"));
      this.toDate.setValue(moment(this.endDate, "MM-YYYY"));
    } else {
      this.fromDate.valueChanges.subscribe((val) => {
        this.setFromDate(val);
      });
      this.toDate.valueChanges.subscribe((val) => {
        this.setToDate(val);
      });
    }
    this.translate.get(["ALL"]).subscribe((translations) => {
      this.storeList = [{ label: translations.ALL, value: 0 }]
    });
  }

  setMonthAndYearFromDate(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.fromDate.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.fromDate.setValue(ctrlValue);
    datepicker.close();
  }
  setMonthAndYearToDate(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.toDate.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.toDate.setValue(ctrlValue);
    datepicker.close();
  }
  setFromDate(Fdate) {
    let tempSdate = ''
    tempSdate = moment(Fdate).format('MM-YYYY'.split(" ")[0]);
    if (tempSdate > this.endDate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      this.fromDate.setValue(moment(this.startDate, "MM-YYYY"));
      return;
    }
    this.startDate = moment(Fdate).format('MM-YYYY'.split(" ")[0]);
  }

  setToDate(Tdate) {
    let tempTdate = ''
    tempTdate = moment(Tdate).format('MM-YYYY'.split(" ")[0]);
    if (tempTdate < this.startDate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      this.toDate.setValue(moment(this.endDate, "MM-YYYY"));
      return;
    }
    this.endDate = moment(Tdate).format('MM-YYYY'.split(" ")[0]);
  }

  getStoreList() {
    const data = {
      user_id: this.main.LoggedUserInfo.user_id
    }
    this.siService.getStoreList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.filter((item) => item.role_id == 2 && item.khata_user == 0).forEach(el => {
            var data = { label: el.store_name + '(' + el.name + ')', value: el.store_id };
            this.storeList.push(data);
          })

          this.subscriptionForm.controls.selectedStoreItem.setValue(this.storeList[0].value)
          this.storeList = this.storeList.sort((a, b) => a.label.localeCompare(b.label));
          this.GetSubscriptionList(1)
        } else {
          this.toastr.error(this.translate.instant(response.message))
        }
      },
      error: (err) => { },
      complete: () => { }
    })
  }

  SearchSubscriptionReport() {
    this.GetSubscriptionList(1)
  }

  ClearSubscriptionReport() {
    this.cancel_click = true;
    
    this.startDate = '';
    this.endDate = '';
    this.storeList = [];
    this.page = 1;
    this.subscriptionList = [];
    this.count = 0;
    this.sortKey = '';
    this.ngOnInit()
  }

  downloadReport() {
    const data = {
      from: this.startDate,
      to: this.endDate,
      store_id: this.subscriptionForm.value.selectedStoreItem,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      is_export: 1,
      user_id: this.main.LoggedUserInfo.user_id,
    }

    if (this.count > 200000) {
      this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
    } else {
      this.subscriptionService.subscriptionReport(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(this.translate.instant(response.message));
          } else {
            this.toastr.error(this.translate.instant(response.message));
          }
        },
        error: (err) => { },
        complete: () => { }
      })
    }
  }

  GetSubscriptionList(page) {
    this.page = page;
    this.subscriptionList = [];
    const data = {
      from: this.startDate,
      to: this.endDate,
      page: this.page,
      store_id: this.subscriptionForm.value.selectedStoreItem,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      user_id: this.main.LoggedUserInfo.user_id,
    }

    this.subscriptionService.subscriptionReport(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.subscriptionList = response.data;
          this.count = response.count;
        } else {
          this.subscriptionList = [];
          this.count = 0;
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (err) => { },
      complete: () => { }
    })
  }
  /** Open SubscriptionSettlementComponent modal */
  viewSubscription(item) {
    const modalRef = this.modalService.open(SubscriptionSettlementComponent, {
      size: "lg",
      centered: true
    })
    modalRef.componentInstance.receivedData = item
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetSubscriptionList(this.page);
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
      data.module_key = '63'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '63'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '63'
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
