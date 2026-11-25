import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { ManageStoreService } from "src/app/services/manage-store.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-manage-table",
  templateUrl: "./manage-table.component.html",
  styleUrls: ["./manage-table.component.scss"],
})
export class ManagetableComponent implements OnInit {
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  POSTS: any;
  page: number = 1;
  search: any;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  sortKey: any = "";
  isOrderBy: boolean = true;
  no_data = true;
  count: number = 0;
  manage_store_list: [];
  main: any;
  session = this.appComponent.sessionConfig();
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  pos_allowed: any;

  constructor(
    private manageStoreService: ManageStoreService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private router: Router,
    private appComponent: AppComponent,
    private _snackbarService: ToastrService,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    translate.addLangs(["it", "en", "de"]);
    translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    var preUrl = localStorage.getItem("Previous_URL");
    let previousURL = preUrl.slice(0, preUrl.lastIndexOf("/"));
    var filterObject;
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
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }
    this.pos_allowed = this.main.LoggedUserStoreInfo.pos_allowed
    if (this.pos_allowed == 1) {
      this.pos_allowed = this.main.LoggedUserStoreInfo.pos == 1 ? 1 : 0;
    }
    this.manageTableList(this.page);
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.manageTableList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }

  manageTableList(page): void {
    this.page = page;
    var data = {
      page: this.page,
      search_query: this.search,
      store_id: this.seller_details.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
      limit: 20,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };
    this.manageStoreService.storeTableLists(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.manage_store_list = response.data;
          if (this.manage_store_list.length > 0) {
            this.no_data = false;
          } else {
            this.no_data = true;
          }
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.manage_store_list = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  editunitDetail(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.session.clearCookie('manage_table' + this.main.LoggedUserInfo.role_id.toString());
    this.session.encryptIdValue(id.toString(), "manage_table" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    )
    this.router.navigate(["/manage-table/edit"]);
  }

  onSearchChange(value) {
    this.search = value;
    this.manageTableList(0);
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.manageTableList(1);
    }
  }

  onPreviousButton() {
    if (this.general_setting.dinein_module && this.main.LoggedUserStoreInfo.iseatery == '1') {
      this.router.navigate([`/dine-in-setting`])
    } else if (this.general_setting.pos_module && this.pos_allowed == '1') {
      this.router.navigate([`/possetting`])
    } else if (this.main.LoggedUserStoreInfo.is_searchable == "1") {
      this.router.navigate([`/order-settings`])
    } else if (this.general_setting.allow_khata) {
      this.router.navigate([`/khatasettings`])
    } else {
      this.router.navigate([`/payment-setting`])
    }
  }

  onNextButton() {
    this.router.navigate([`/storeholidays`])
  }

  sortAPISide(columnName) {
    this.sortKey = columnName; //set the sortKey to the param passed
    this.isOrderBy = !this.isOrderBy;
    this.manageTableList(this.page);
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
      data.module_key = '103'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '103'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '103'
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

  deleteManageTable(id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_TABLE"),
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
      store_table_id: id,
      store_id: this.seller_details.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
    };
    this.manageStoreService.deleteStoreTables(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.manageTableList(this.page);
        } else {
          this._snackbarService.error(response.message);
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => { },
    });
  }
}
