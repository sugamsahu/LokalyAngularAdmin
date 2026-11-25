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
import { Router } from "@angular/router";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { AppComponent } from "src/app/app.component";
import Swal from "sweetalert2";
import { BannerService } from "src/app/services/configuration/banner.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-help",
  templateUrl: "./help.component.html",
  styleUrls: ["./help.component.scss"],
})
export class HelpComponent implements OnInit {
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  search: any;
  selectedPageType = "1";
  help_list: [];
  User = JSON.parse(localStorage.getItem("LoginUserDetails"));
  page: number = 1;
  count: number = 0;
  table_size: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  sortKey: any = "sequence_no";
  isOrderBy: boolean = true;
  no_data = true;
  main: any = {};
  language_id: any = 1;
  help_details: any;

  constructor(
    public translate: TranslateService,
    private pageManagementService: PageManagementService,
    private _helpService: BannerService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private cryptoService: CryptoService,
    private router: Router,
    private appComponent: AppComponent,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.language_id = localStorage.getItem("select_lan_id") || "1";
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
      localStorage.removeItem("help_module_is_Id");
      this.cryptoService.clearCookie(
        "seller_Order_obj" + this.main.LoggedUserInfo.role_id?.toString()
      );
      this.cryptoService.clearCookie(
        "help_content_mgmt_Id" + this.main.LoggedUserInfo.role_id?.toString()
      );
      this.cryptoService.clearCookie(
        "help_module_key_Id" + this.main.LoggedUserInfo.role_id?.toString()
      );
      this.cryptoService.clearCookie(
        "duplicate_help_id" + this.main.LoggedUserInfo.role_id?.toString()
      );
    }
    if (filterObject) {
      this.search = filterObject?.search;
      this.page = filterObject?.page;
      this.table_size = filterObject?.limit;
      this.searchbox.nativeElement.value = this.search;
      this.selectedPageType = filterObject?.selectedPageType;
    }
    this.getHelpList(this.page);

    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean),
        debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getHelpList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }

  
  getHelpList(page): void {
    this.page = page;
    let data: any = {
      page: this.page,
      search_query: this.search,
      limit: this.table_size,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      language_id: this.language_id,
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.role_id = this.main.LoggedUserInfo.role_id
    }

    this._helpService.getHelpList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_list = response.data;
          this.no_data = false;
          this.count = response.count;
          if (response.data.length > 0) {
            localStorage.setItem("languageList", JSON.stringify(response.data[0].languages));
          }
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.help_list = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  clearSearch() {
    if (this.search !== "") {
      this.search = "";
      this.getHelpList(1);
    }
  }

  chnagePageType(event) {
    this.search = "";
    this.searchbox.nativeElement.value = "";
    this.selectedPageType = event.target.defaultValue;
    this.getHelpList(1);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName; //set the sortKey to the param passed
    this.isOrderBy = !this.isOrderBy;
    this.getHelpList(this.page);
  }

  editPage(id: any, module_key: any, languages: any) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
      selectedPageType: this.selectedPageType,
      languages: languages
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      module_key?.toString(),
      "help_module_key_Id" + this.main.LoggedUserInfo.role_id?.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/help/edit/"]);
  }

  duplicateDetail(id: any, languages: any) {
    var obj: any = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
      languages: languages
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      id.toString(),
      "help_module_key_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.encryptIdValue(
      'duplicate',
      "duplicate_help_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/help/edit"]);
  }

  deletePage(id: any) {
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

  ConfirmDelete(id: any) {
    const data = {
      module_key: id,
    };
    this.pageManagementService.deleteHelp(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
          this.getHelpList(this.page);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      // backdrop: "static",
      // keyboard: false,
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
      data.module_key = '35'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '35'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '35'
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
