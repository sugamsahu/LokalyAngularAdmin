import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  tap,
} from "rxjs";
import { PageManagementService } from "src/app/services/page-management.service";
import { environment } from "src/environments/environment";
import { RearrangePageManagementComponent } from "../model/rearrange-page-management/rearrange-page-management.component";
import { Router } from "@angular/router";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { AppComponent } from "src/app/app.component";
import Swal from "sweetalert2";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-page-management",
  templateUrl: "./page-management.component.html",
  styleUrls: ["./page-management.component.scss"],
})
export class PageManagementComponent implements OnInit {
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  search: any;
  selectedPageType = "1";
  page_management_list: [];
  pageManagementListForRearrange: [];

  page: number = 1;
  count: number = 0;
  table_size: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  sortKey: any = "sequence_no";
  isOrderBy: boolean = true;
  no_data = true;
  main: any = {};
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";


  constructor(
    public translate: TranslateService,
    private pageManagementService: PageManagementService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private cryptoService: CryptoService,
    private router: Router,
    private appComponent: AppComponent,
    private _helpService: BannerService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit() {
    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    if (
      localStorage.getItem("seller_Order_obj") != null &&
      localStorage.getItem("seller_Order_obj") != undefined
    ) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
      this.cryptoService.clearCookie(
        "page_mgmt_Id" + this.main.LoggedUserInfo.role_id?.toString()
      );
      this.cryptoService.clearCookie(
        "content_mgmt_Id" + this.main.LoggedUserInfo.role_id?.toString()
      );
    }

    if (filterObject) {
      this.search = filterObject.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
      this.searchbox.nativeElement.value = this.search;
      this.selectedPageType = filterObject.selectedPageType;
    }
    this.GetPageManagementList(this.page);

    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean),
        debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.GetPageManagementList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }

  clearSearch() {
    if (this.search !== "") {
      this.search = "";
      this.GetPageManagementList(1);
    }
  }

  chnagePageType(event) {
    this.searchbox.nativeElement.value = this.search;
    this.selectedPageType = event.target.defaultValue;
    this.GetPageManagementList(1);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName; //set the sortKey to the param passed
    this.isOrderBy = !this.isOrderBy;
    this.GetPageManagementList(this.page);
  }

  GetPageManagementList(page): void {
    this.page = page;
    var data = {
      page: this.page,
      search_query: this.search,
      limit: this.table_size,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      is_active: this.selectedPageType,
    };

    this.pageManagementService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.page_management_list = response.data;          
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.page_management_list = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  rearrangeitem() {
    const modalRef = this.modalService.open(RearrangePageManagementComponent, {
      size: "lg-600",
    });
    modalRef.componentInstance.pageManagementList = this.page_management_list;
    modalRef.result.then(() => {
      location.reload();
    });
  }

  editPage(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
      selectedPageType: this.selectedPageType,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));

    this.cryptoService.encryptIdValue(
      id?.toString(),
      "page_mgmt_Id" + this.main.LoggedUserInfo.role_id?.toString(),
      this.main.CryptoKey
    );

    this.router.navigate(["/page-management/edit/"]);
  }

  deletePage(id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_PAGE"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.ConfirmDelete(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  ConfirmDelete(id) {
    const data = {
      page_id: id,
      user_id: this.main.LoggedUserInfo.user_id,
    };
    this.pageManagementService.deleteContent(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
          this.GetPageManagementList(this.page);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  editContent(id, languages, page_title) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
      selectedPageType: this.selectedPageType,
      languages: languages,
      pageTitle: page_title
    };

    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));

    this.cryptoService.encryptIdValue(
      id?.toString(),
      "content_mgmt_Id" + this.main.LoggedUserInfo.role_id?.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/page-management/edit-content/"]);
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
      data.module_key = '34'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '34'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '34'
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
