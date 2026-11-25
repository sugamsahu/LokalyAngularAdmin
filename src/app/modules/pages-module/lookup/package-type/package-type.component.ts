
import { PackageTypeService } from "src/app/services/lookup/package-type.service";
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap, } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-package-type',
  templateUrl: './package-type.component.html',
  styleUrls: ['./package-type.component.scss']
})
export class PackageTypeComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search: any;
  pack_type_list: [];
  no_data = true;
  main: any;
  sortKey: any = "";
  isOrderBy: boolean = true;

  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";


  constructor(
    private packageTypeService: PackageTypeService,
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

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    if (localStorage.getItem("seller_Order_obj") != null && localStorage.getItem("seller_Order_obj") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }

    if (filterObject) {
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }
    this.GetPackTypeList(this.page);

    // server-side search
    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.GetPackTypeList(1);
          })
        )
        .subscribe();
    this.getHelpDetails()
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetPackTypeList(1);
    }
  }

  GetPackTypeList(page): void {


    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    this.page = page;
    var data = {
      page: this.page,
      search_query: this.search,
      limit: this.table_size,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };

    this.packageTypeService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.pack_type_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.pack_type_list = [];
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

  onSearchChange(value) {
    this.search = value;
    this.page = 1;
    this.GetPackTypeList(1);

  }

  editPackageTypeDetail(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));

    this.cryptoService.encryptIdValue(
      id.toString(),
      "lookup_packageType_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/package-type/edit/"]);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetPackTypeList(this.page);
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
      data.module_key = '51'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '51'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '51'
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
