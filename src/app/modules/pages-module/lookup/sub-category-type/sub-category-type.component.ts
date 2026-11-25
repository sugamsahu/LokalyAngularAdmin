import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SubCategoryTypeService } from 'src/app/services/lookup/sub-category-type.service';
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap, } from "rxjs";
import { Router } from "@angular/router";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-sub-category-type',
  templateUrl: './sub-category-type.component.html',
  styleUrls: ['./sub-category-type.component.scss']
})
export class SubCategoryTypeComponent implements OnInit {
  search: any;
  page: number = 1;
  table_size: number = 20;
  tableSizes: any = [3, 6, 9, 12];
  selected_category: any = 0;
  category_type_list: [];
  no_data = true;
  count: number = 0;
  category_list: any;
  main: any;
  newStore_Type: any;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  store_label = this.general_setting.store_label;
  changeSubCategory: any = null;
  language_id = localStorage.getItem("select_lan_id") || "1";
  help_details: any;

  constructor(
    private subCategoryServices: SubCategoryTypeService,
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
      this.changeSubCategory = filterObject.changedSubcategoryId
    }

    if (this.changeSubCategory != null) {
      this.selected_category = this.changeSubCategory
    }

    this.parentCategoryListRecord()
    this.GetSubCategoryTypeList(this.page);

    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(1000),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.GetSubCategoryTypeList(1);
          })
        )
        .subscribe();
    this.getHelpDetails()
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetSubCategoryTypeList(1);
    }
  }
  subCategoryChangeData: any;
  ChangeParentCategory(item) {
    this.subCategoryChangeData = item
    this.GetSubCategoryTypeList(1)
  }


  async parentCategoryListRecord() {

    var data = {};
    await this.subCategoryServices.getParentCategoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {

          this.category_list = [{ parent_category_id: 0, parent_category_name: "All" }];
          response.data.forEach(item => {
            this.category_list.push(item)
          });

          if (this.selected_category == 0) {
            this.selected_category = this.category_list[0].parent_category_id
          }
        }
      },
      error: (error) => {

      },
      complete: () => {
      },
    });
  }

  onSearchChange(value) {
    this.search = value;
    this.page = 1;

    this.GetSubCategoryTypeList(1);
  }

  async GetSubCategoryTypeList(page) {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    // after choose particular data from dropdown
    this.page = page;
    var data: any = {
      page: this.page,
      search_query: this.search,
      limit: this.table_size,
      parent_category_id: this.selected_category,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };

    await this.subCategoryServices.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.category_type_list = response.data;
          this.no_data = false;
          this.count = response.count;
          var store_Data = [];
          this.category_type_list?.forEach(function (element: any) {
            var names = element.store_types?.split(',');
            names?.forEach(element => {
              var flag = store_Data.includes(element)
              if (flag == false) {
                store_Data.push(element);
              }
            });
          });

          this.newStore_Type = store_Data.toString()
          this.no_data = false;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.category_type_list = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {


      },
    });
  }

  editSubCategoryTypeDetail(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
      changedSubcategoryId: this.subCategoryChangeData
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));

    this.cryptoService.encryptIdValue(
      id?.toString(),
      "lookup_subCategoryType_Id" + this.main.LoggedUserInfo.role_id?.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/sub-category-type/edit/"]);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetSubCategoryTypeList(this.page);
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
      data.module_key = '50'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '50'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '50'
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
