import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { ManageStoreService } from 'src/app/services/manage-store.service';
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-payment-setting',
  templateUrl: './payment-setting.component.html',
  styleUrls: ['./payment-setting.component.scss']
})
export class PaymentSettingComponent implements OnInit {
  seller_details = JSON.parse(localStorage.getItem('loginUserStore'));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  POSTS: any;
  page: number = 1;
  search: any;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  sortKey: any = "";
  isOrderBy: boolean = true;
  no_data = true;
  count: number = 0;
  manage_payment_list: [];
  main: any;
  seller_payment_type_id: any;
  payment_type_id: any;
  is_default: any;
  paydetails: {};
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  id: any;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  skipShow: boolean = true;
  pos_allowed: any;

  constructor(
    private manageStoreService: ManageStoreService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private router: Router,
    private appComponent: AppComponent,
    private cryptoService: CryptoService,
    private _snackbarService: ToastrService,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    translate.addLangs(["it", "en", "de"]);
    translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    var preUrl = localStorage.getItem("Previous_URL");
    let previousURL = preUrl.slice(0, preUrl.lastIndexOf("/"));
    var filterObject;
    this.search = "";
    this.count = 0;
    if (previousURL == "/payment-setting/edit") {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    } else {
      localStorage.removeItem("seller_Order_obj");
    }
    if (filterObject) {
      this.search = filterObject.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }
    this.pos_allowed = this.main.LoggedUserStoreInfo.pos_allowed
    if (this.pos_allowed == 1) {
      this.pos_allowed = this.main.LoggedUserStoreInfo.pos == 1 ? 1 : 0;
    }
    this.Payment_Details(this.page);
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.Payment_Details(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }

  /** Get payment setting details list using service. */
  Payment_Details(page): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data = {
      store_id: this.seller_details.store_id,
      seller_payment_type_id: this.id,
      search_query: search,
    };
    this.manageStoreService.getStorePaymentTypeList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.manage_payment_list = response.data;
          if (this.manage_payment_list.length > 0) {
            this.no_data = false;
          } else {
            this.no_data = true;
          }
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.manage_payment_list = [];
        }
      },
      error: (error) => {
        // handle error

      },
      complete: () => {
        ;

      },
    });
  }

  editpaymentDetail(item) {
    var id = item.seller_payment_type_id;
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      id.toString(),
      "payment-setting" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );

    this.router.navigate(["/payment-setting/edit"]);
  }

  onPreviousButton() {
    this.router.navigate([`/business-hours`])
  }

  onNextButton() {
    if (this.generalSetting.allow_khata) {
      this.router.navigate([`/khatasettings`])
    } else if (this.generalSetting.order_settings) {
      this.router.navigate([`/order-settings`])
    } else if (this.generalSetting.pos_module && this.pos_allowed == '1') {
      this.router.navigate([`/possetting`])
    } else {
      this.router.navigate([`/other-settings`])
    }
  }

  deletepaymenttable(id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_PAYMENT_METHOD"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteConfirm(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        console.log("cancelled");
      }
    });
  }

  deleteConfirm(id) {
    let data = {
      store_id: this.seller_details.store_id,
      seller_payment_type_id: id,
    };

    this.manageStoreService.deletePaymentstoreType(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.Payment_Details(this.page);
        } else {
          this._snackbarService.error(response.message);
        }
      },
      error: (error) => {

        this._snackbarService.error(error);
      },
      complete: () => {

        ;
      },
    });
  }

  onSearchChange(value) {
    this.search = value;
    this.Payment_Details(0);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName; //set the sortKey to the param passed
    this.isOrderBy = !this.isOrderBy;
    this.Payment_Details(this.page);
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.Payment_Details(1);
    }
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '94'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '94'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '94'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_details = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

}
