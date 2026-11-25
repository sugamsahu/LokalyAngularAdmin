import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from "src/environments/environment";
import { Router } from '@angular/router';
import { TranslateService } from "@ngx-translate/core";
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap } from "rxjs";
import { AppComponent } from 'src/app/app.component';
import { StoreTypeService } from 'src/app/services/lookup/store-type.service';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-store-type',
  templateUrl: './store-type.component.html',
  styleUrls: ['./store-type.component.scss']
})
export class StoreTypeComponent implements OnInit {
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  page: number = 1;
  count: number = 0;
  table_size: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search = "";
  no_data = true;
  main: any;
  store_type_list: any;
  sortKey: any = "";
  isOrderBy: boolean = true;
  hide_add: boolean = false;

  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  is_display_whole_sale = Number(this.general_setting.allow_wholeseller);
  is_display_is_eatery = Number(this.general_setting.eatery_module);
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  store_label = this.general_setting.store_label;

  constructor(
    private storeTypeService: StoreTypeService,
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
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    var preUrl = localStorage.getItem("Previous_URL");
    let previousURL = preUrl.slice(0, preUrl.lastIndexOf("/"));

    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;

    if (localStorage.getItem("seller_Order_obj") != null && localStorage.getItem("seller_Order_obj") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }

    if (this.PlatformSetting.business_model == 3 && this.main.LoggedUserInfo.role_id == 1) {
      this.hide_add = true;
    }

    if (filterObject) {
      this.search = filterObject.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
      this.searchbox.nativeElement.value = this.search;
    }

    this.GetStoreTypeList(this.page);

    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.GetStoreTypeList(1);
        })
      )
      .subscribe();
    this.getHelpDetails()
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetStoreTypeList(1);
    }
  }

  GetStoreTypeList(page): void {

    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    this.page = page;
    var data = {};

    data = {
      page: this.page,
      search_query: search,
      limit: this.table_size,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };

    this.storeTypeService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.store_type_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.store_type_list = [];
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
  }

  editStoreTypeDetail(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      id.toString(),
      "lookup_storeType_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/store-type/edit"]);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName; //set the sortKey to the param passed
    this.isOrderBy = !this.isOrderBy;
    this.GetStoreTypeList(this.page);
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
      data.module_key = '40'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '40'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '40'
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
