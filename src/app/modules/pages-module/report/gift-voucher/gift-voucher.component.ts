import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import * as moment from "moment";
import {
  FormBuilder,
  FormControl,
  FormGroup,
} from "@angular/forms";
import { GiftVoucherService } from "src/app/services/report/gift-voucher.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from "rxjs";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-gift-voucher",
  templateUrl: "./gift-voucher.component.html",
  styleUrls: ["./gift-voucher.component.scss"],
})
export class GiftVoucherComponent implements OnInit {
  public formGroup: FormGroup;
  page: number = 1;
  count: number = 0;
  tableSize = environment.tableSize;
  no_data = true;
  main: any;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  show_price_same_font = this.generalSetting.show_price_same_font;
  sortKey: any = "";
  isOrderBy: boolean = true;
  maxDate: any;
  search = "";
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  tempFromDate: Date;
  tempToDate: Date;
  giftvoucherList: any = [];

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private GiftVoucherService: GiftVoucherService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private router: Router,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    this.maxDate = new Date();
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    this.getGiftVoucherList(this.page);
    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.getGiftVoucherList(this.page);
          })
        ).subscribe();
    this.cdr.detectChanges();
    this.getHelpDetails();
  }

  //load form
  loadForm() {
    this.formGroup = this.formBuilder.group({
      fromDate: new FormControl(new Date()),
      toDate: new FormControl(new Date()),
    });
    this.formGroup.get("fromDate").valueChanges.subscribe((val) => {
      this.getDate(val);
    });

    this.formGroup.get("toDate").valueChanges.subscribe((val) => {
      this.getToDate(val);
    });
  }

  /** Get gift voucher from-date */
  getDate(date) {
    this.tempFromDate = date;
    if (date > this.formGroup.value.toDate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
    else {
      this.getGiftVoucherList(1);
    }
  }

  /** Get gift voucher to-date */
  getToDate(todate) {
    this.tempToDate = todate;
    if (this.formGroup.value.fromDate > todate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
    else {
      this.getGiftVoucherList(1);
    }
  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.generalSetting.date_format_web.split(" ")[0];
  }

  //Get gift voucher report list
  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getGiftVoucherList(1);
    }
  }

  getGiftVoucherList(page) {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data: any = {};
    data = {
      user_id: this.main.LoggedUserInfo.user_id,
      page: this.page,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      search_query: search,
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
    this.GiftVoucherService.getGiftVoucherReportList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.giftvoucherList = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.giftvoucherList = [];
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
    this.getGiftVoucherList(this.page);
  }

  exportDataValidation() {
    if (this.count > 200000) {
      this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
    } else {
      this.exportData();
    }
  }

  /** Export gift voucher report using service. */
  exportData() {
    var data = {};
    data = {
      from_date: moment(new Date(this.formGroup.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.formGroup.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      user_id: this.main.LoggedUserInfo.user_id,
      is_export: 1,
    };
    this.GiftVoucherService.getGiftVoucherReportList(data).subscribe({
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
      data.module_key = '59'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '59'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '59'
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