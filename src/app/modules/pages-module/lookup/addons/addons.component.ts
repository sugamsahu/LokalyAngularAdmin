
import { Component, ElementRef, OnChanges, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { AddonsService } from "src/app/services/lookup/addons.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { environment } from "src/environments/environment";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { Router } from "@angular/router";
import { BannerService } from "src/app/services/configuration/banner.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-addons",
  templateUrl: "./addons.component.html",
  styleUrls: ["./addons.component.scss"],
})
export class AddonsComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search = "";
  no_data = true;
  main: any;
  addons_list: any;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private AddonsService: AddonsService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit() {
    this.main = this.appComponent.main;
    this.getHelpDetails();
    var preUrl = localStorage.getItem("Previous_URL");
    let previousURL = preUrl.slice(0, preUrl.lastIndexOf("/"));
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
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
    this.getPagedList(this.page);

    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getPagedList(1);
        })
      )
      .subscribe();
  }

  
  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '43'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '43'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '43'
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

    /** Get addon list using service */
    getPagedList(page): void {
      var search = "";
      if (this.search != "" && this.search != undefined && this.search != null) {
        search = this.search;
      }
  
      this.page = page;
      var data = {};
  
      data = {
        page: this.page,
        search_query: search,
        sort_field: this.sortKey,
        sort_type: this.isOrderBy ? 1 : 2,
        limit: this.table_size,
      };
  
      this.AddonsService.getAddonsList(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.addons_list = response.data;
            this.no_data = false;
            this.count = response.count;
          } else {
            this.toastr.error(response.message);
            this.no_data = true;
            this.count = 0;
            this.addons_list = [];
          }
        },
        error: (error) => {
          // handle error
        },
        complete: () => {
  
        },
      });
    }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getPagedList(1);
    }
  }

  onSearchChange(value) {
    this.search = value;
    this.page = 1;
    this.getPagedList(1);
  }

  editAddonsDetail(addon_id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      addon_id.toString(),
      "lookup_addon_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/addons/edit"]);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.getPagedList(this.page);
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }
}
