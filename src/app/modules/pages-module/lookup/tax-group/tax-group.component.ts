
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { TaxGroupService } from "src/app/services/lookup/tax-group.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { environment } from "src/environments/environment";
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap} from "rxjs";
import { Router } from "@angular/router";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-tax-group",
  templateUrl: "./tax-group.component.html",
  styleUrls: ["./tax-group.component.scss"],
})
export class TaxGroupComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search = "";
  no_data = true;
  main: any;
  tax_group_list: any;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));

  constructor(
    private TaxGroupService: TaxGroupService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit() {
    this.main = this.appComponent.main;
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
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }
    this.GetPagedList(this.page);

    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.GetPagedList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetPagedList(1);
    }
  }
  /** Get tax group list using service. */
  GetPagedList(page): void {
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

    this.TaxGroupService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.tax_group_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.tax_group_list = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  onSearchChange(value) {
    this.search = value;
    this.page = 1;
    this.GetPagedList(1);
  }

  editTaxGroupDetail(tax_group_id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      tax_group_id.toString(),
      "lookup_tax_group_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/tax-group/edit"]);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetPagedList(this.page);
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
      data.module_key = '48'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '48'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '48'
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
