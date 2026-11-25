import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { Router } from "@angular/router";
import { CustomerService } from "src/app/services/customer.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { customerDetailComponent } from "../model/customer-details/customer-details.component";
import Swal from "sweetalert2";
import { environment } from "src/environments/environment";
import { CommonService } from "src/app/services/common.service";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-manage-customer",
  templateUrl: "./manage-customer.component.html",
  styleUrls: ["./manage-customer.component.scss"],
})
export class ManageCustomerComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search: any;
  customer_list: [];
  no_data = true;
  main: any;
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  show_price_same_font = this.general_setting.show_price_same_font;
  currency_icon = this.general_setting.currency_symbol;
  amount_seperator = this.general_setting.amount_seperator;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  is_super_admin: boolean;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  session: { getSessionLogin: () => string; setSessionLogin: (isLogin: any) => void; clearSessionLogin: () => void; getSessionToken: () => string; getSessionDeviceId: () => string; setSessionToken: (token: any) => void; clearSessionToken: () => void; getSessionLoginUser: () => any; setSessionLoginUser: (loginUser: any) => void; clearSessionLoginUser: () => void; getSessionLoginUserStore: () => any; setSessionLoginUserStore: (loginUserStore: any) => void; clearSessionLoginUserStore: () => void; getSessionLanguageList: () => any; setSessionLanguageList: (languageList: any) => void; clearSessionLanguageList: () => void; encryptIdValue: (val: any, cookiename: any, key: any) => void; decryptIdValue: (cookiename: any, key: any) => string; clearCookie: (name: any) => void; deleteAllCookies: () => void; };

  constructor(
    private customerService: CustomerService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private modalService: NgbModal,
    public CommonService: CommonService,
    private _helpService: BannerService,
  ) {
    this.session = this.appComponent.sessionConfig();
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    this.is_super_admin = false;
    if (
      this.main.LoggedUserInfo.role_id == 6 ||
      this.main.LoggedUserInfo.role_id == 1
    ) {
      this.is_super_admin = true;
    }
    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;
    if (
      localStorage.getItem("seller_Order_obj") != null &&
      localStorage.getItem("seller_Order_obj") != undefined
    ) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }
    if (filterObject) {
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }
    this.customerList(this.page);
    // server-side search
    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.customerList(1);
          })
        )
        .subscribe();
    this.getHelpDetails();
  }

  customerList(page): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data = {};
    if (this.is_super_admin == false) {
      data = {
        page: this.page,
        search_query: this.search,
        limit: this.table_size,
        store_id: this.seller_details.store_id,
        sort_field: this.sortKey,
        sort_type: this.isOrderBy ? 1 : 2,
      };
    } else {
      data = {
        page: this.page,
        search_query: this.search,
        limit: this.table_size,
        sort_field: this.sortKey,
        sort_type: this.isOrderBy ? 1 : 2,
      };
    }
    this.customerService
      .getStoreCustomerList(data, this.is_super_admin)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.customer_list = response.data;
            this.no_data = false;
            this.count = response.count;
          } else {
            this.toastr.error(response.message);
            this.no_data = true;
            this.count = 0;
            this.customer_list = [];
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

  getInitials(name) {
    var canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = 35;
    canvas.height = 35;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    context.fillStyle = "#476ce8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "18px Arial";
    context.fillStyle = "#FFFFFF";
    context.textAlign = "center";
    var nameArray = name.split(" ");
    var initials = "";
    initials = initials + nameArray[0][0];
    initials = initials == "undefined" ? "U" : initials;
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 13, 22);
    } else {
      context.fillText(initials.toUpperCase(), 13, 22);
    }
    var data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }
  /** Open customerDetailComponent modal */
  openDetailModel(cid, totaloverdue, customer_user_id) {
    const modalRef = this.modalService.open(customerDetailComponent, {
      size: "xl",
      centered: true
    });
    modalRef.componentInstance.isSuperAdmin = this.is_super_admin;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.sessionConfig = this.session;
    modalRef.componentInstance.customer_user_id = customer_user_id;
    modalRef.componentInstance.cid = cid;
    modalRef.componentInstance.totaloverdue = totaloverdue;
    modalRef.componentInstance.sellerDetails = this.seller_details;
    var data = {};
  }

  onSearchChange(value) {
    this.search = value;
    this.page = 1;
    this.customerList(1);
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.customerList(1);
    }
  }

  editCustomer(cid, customerUserId) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      cid.toString(),
      "customer_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.encryptIdValue(
      customerUserId.toString(),
      "customer_User_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/manage-customer/edit/"]);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.customerList(this.page);
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
      data.module_key = '79'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '13'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '105'
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
  
  deleteCustomer(cusid, overdue) {
    Swal.fire({
      title:
        overdue > 0
          ? this.translate.instant("TOTAL_DUE_AMOUNT_IS") +
          " " +
          overdue +
          "." +
          this.translate.instant(
            "ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_CUSTOMER"
          )
          : this.translate.instant(
            "ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_CUSTOMER"
          ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteCustomerConfirm(cusid);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  deleteCustomerConfirm(id) {
    let data = {
      user_id: this.main.LoggedUserInfo.user_id,
      customer_id: id,
    };
    this.customerService.deleteStoreCustomer(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(response.message);
          this.customerList(this.page);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {
        ;
      },
    });
  }
}