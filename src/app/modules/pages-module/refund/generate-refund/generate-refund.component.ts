import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GenerateRefundService } from 'src/app/services/generate-refund.service';
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from 'src/app/app.component';
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RefundinfoComponent } from './refundinfo/refundinfo.component';
import { OrderRefundDetailsComponent } from '../../model/order-refund-details/order-refund-details.component';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
@Component({
  selector: 'app-generate-refund',
  templateUrl: './generate-refund.component.html',
  styleUrls: ['./generate-refund.component.scss']
})
export class GenerateRefundComponent implements OnInit {
  main: any = { LoggedUserInfo: {} };
  refundList: any;
  tableSize: number = 20;
  page: number = 1;
  count: number = 0;
  search: '';
  no_data = true;
  isOrderBy: boolean = true
  sortKey: any = "";
  add_refund_module: boolean = false;
  view_refund_module: any;
  isSuperAdmin = false
  viewRefundDetail: any;
  generalSetting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  PlatformSetting = JSON.parse(localStorage.getItem('_platform_setting'));
  business_model = this.PlatformSetting.business_model
  refund_module = this.generalSetting.refund_module;
  subscription_model = this.PlatformSetting.subscription_model;
  sellerDetails = JSON.parse(localStorage.getItem('loginUserStore'));
  session = this.appComponent.sessionConfig();
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  show_price_same_font: any;
  amount_seperator: any;
  constructor(
    private generateRefundServices: GenerateRefundService,
    public translate: TranslateService,
    private appComponent: AppComponent,
    private toastr: ToastrService,
    public router: Router,
    private cryptoService: CryptoService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private _helpService: BannerService,
    public commonService: CommonService


  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin)  {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.generalSetting = this.generalSetting == null ? this.main : this.generalSetting;
    this.PlatformSetting = this.PlatformSetting == null ? this.main.platform_setting : this.PlatformSetting;
    this.show_price_same_font = this.generalSetting.show_price_same_font;
    this.amount_seperator = this.generalSetting?.amount_seperator;
    if (Number(this.refund_module) != 0) {
      if (this.main.LoggedUserInfo.role_id == 6 || this.main.LoggedUserInfo.role_id == 1) {
        this.refund_module = ((this.subscription_model == 2 || this.subscription_model == 3) && this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6) ? true : ((this.subscription_model == 2 || this.subscription_model == 3) && (this.business_model == 2 || this.business_model == 3) && this.main.LoggedUserInfo.role_id == 1) ? true : false;
        this.add_refund_module = true;
      }
      else {
        this.add_refund_module = this.subscription_model == 1 ? true : false;
        this.view_refund_module = this.subscription_model != 1 ? true : false;
        this.cdr.detectChanges();
      }
    }

    if (this.main.LoggedUserInfo.role_id == this.main.UserRole.SuperAdmin || this.main.LoggedUserInfo.role_id == this.main.UserRole.Admin) {
      this.isSuperAdmin = true;
    }

    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;
    if (filterObject) {
      this.search = filterObject.search;
      this.page = filterObject.page;
      this.tableSize = filterObject.limit;
      this.searchbox.nativeElement.value = this.search;
    }

    this.generateRefundList(this.page);

    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.generateRefundList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.generateRefundList(1);
    }
  }
  /** Get refund list using service */
  generateRefundList(page) {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    this.page = page;
    var data = {};

    data = {
      page: this.page,
      search_query: search,
      limit: this.tableSize,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      store_id: this.sellerDetails.store_id,
    };

    this.generateRefundServices.getRefundData(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.refundList = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.refundList = [];
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }
  /** Open RefundinfoComponent modal. */
  openinfomodel(storeorderstatistics) {
    const modalRef = this.modalService.open(RefundinfoComponent, {
      size: "lg-600",
    });
  }
  /** Redirect to add refund component. */
  addRefundUsingOrder(orderId) {

    if (this.isSuperAdmin == true) {
      this.session.clearCookie('order_id' + this.main.LoggedUserInfo.role_id.toString());
      this.session.encryptIdValue(orderId.toString(), 'order_id' + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
    }
    else {
      this.session.clearCookie('order_id' + this.sellerDetails.store_id.toString());
      this.session.encryptIdValue(orderId.toString(), 'order_id' + this.sellerDetails.store_id.toString(), this.main.CryptoKey);
    }
    this.router.navigate(["/generate-refund/edit-refund/"]);
  }
  /** Open OrderRefundDetailsComponent modal */
  viewRefund(item: any) {
    this.viewRefundDetail = item;
    this.viewRefundDetail.add_refund_module = this.add_refund_module
    const modalRef = this.modalService.open(OrderRefundDetailsComponent, {
      size: "lg",
      centered: true
    });

    modalRef.componentInstance.viewRefundDetail = this.viewRefundDetail
    modalRef.componentInstance.main = this.main
    modalRef.componentInstance.session = this.session

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
      data.module_key = '110'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '110'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '110'
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
