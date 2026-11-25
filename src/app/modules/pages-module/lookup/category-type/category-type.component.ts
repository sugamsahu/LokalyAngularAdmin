import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CategoryTypeService } from 'src/app/services/lookup/category-type.service';
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap, } from "rxjs";
import { Router } from "@angular/router";
import { CommonService } from 'src/app/services/common.service';
import { environment } from "src/environments/environment";
import { BannerService } from 'src/app/services/configuration/banner.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-type',
  templateUrl: './category-type.component.html',
  styleUrls: ['./category-type.component.scss']
})
export class CategoryTypeComponent implements OnInit {

  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search: any;
  category_type_list: [];
  no_data = true;
  main: any = {};
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  category_list: any;
  selected_category: any;
  sortKey: any = "";
  isOrderBy: boolean = true;
  platform_setting = JSON.parse(localStorage.getItem('_platform_setting'));
  business_model = this.platform_setting.business_model;
  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  store_label = this.general_setting.store_label;
  language_id = localStorage.getItem("select_lan_id") || "1";
  help_details: any;

  constructor(
    private categoryTypeServices: CategoryTypeService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    public commonService: CommonService,
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
    this.categoryListRecord()
    this.GetCategoryTypeList(this.page);

    // server-side search
    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.GetCategoryTypeList(1);
          })
        )
        .subscribe();
    this.getHelpDetails();
  }

  async categoryListRecord() {
    await this.categoryTypeServices.getStoreTypeList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.category_list = [{ category_id: 0, category_name: "All" }];
          response.data.forEach(item => {
            this.category_list.push(item)
          });
          this.selected_category = this.category_list[0].category_id
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
  }

  GetCategoryTypeList(page: any): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data = {
      category_id: this.selected_category,
      page: this.page,
      search_query: this.search,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy == true ? 1 : 2
    };
    this.categoryTypeServices.getStoreParentCategories(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.category_type_list = response.data;

          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.category_type_list = [];
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
  }

  ChangeCategory(item) {
    this.GetCategoryTypeList(0)
  }

  onSearchChange(value) {
    this.search = value;
    this.page = 1;
    this.GetCategoryTypeList(1);
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetCategoryTypeList(1);
    }
  }

  editCategoryTypeDetail(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      id?.toString(),
      "lookup_categoryType_Id" + this.main.LoggedUserInfo.role_id?.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/category-type/edit/"]);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetCategoryTypeList(this.page);
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
      data.module_key = '49'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '49'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '49'
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