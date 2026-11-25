import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { ItemAttributeService } from 'src/app/services/lookup/item-attribute.service';
import { environment } from "src/environments/environment";
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap} from "rxjs";
import { CommonService } from 'src/app/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-item-attribute',
  templateUrl: './item-attribute.component.html',
  styleUrls: ['./item-attribute.component.scss']
})
export class ItemAttributeComponent implements OnInit {

  page: number = 1;
  count: number = 0;
  table_size: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search = "";
  no_data = true;
  main: any;
  item_attribute_list: any;
  SelectedStore = 0;
  sortKey: any = "";
  isOrderBy: boolean = true;
  store_type_list: any = [];

  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private itemAttributeService: ItemAttributeService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private commonService: CommonService,
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

    if (localStorage.getItem("seller_Order_obj") != null && localStorage.getItem("seller_Order_obj") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }

    if (filterObject) {
      this.search = filterObject.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
      this.searchbox.nativeElement.value = this.search;
    }

    this.categoryListRecord();
    this.GetItemAttributeList(this.page);

    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.GetItemAttributeList(1);
        })
      )
      .subscribe();
    this.getHelpDetails()
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetItemAttributeList(1);
    }
  }

  SelectDropDownList() {
    this.GetItemAttributeList(0)
  }

  async categoryListRecord() {


    var data = {
      token_type: 1,
    };

    await this.itemAttributeService.getStoreTypeList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.store_type_list = [{ category_id: 0, category_name: "All" }];
          response.data.forEach(item => {
            this.store_type_list.push(item)
          });
          this.SelectedStore = this.store_type_list[0].category_id
        }
      },
      error: (error) => {

      },
      complete: () => {
      },
    });
  }

  GetItemAttributeList(page): void {
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
      category_id: this.SelectedStore,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };

    this.itemAttributeService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.item_attribute_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.item_attribute_list = [];
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    })
  }

  editItemAttributeDetail(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      id.toString(),
      "lookup_itemAttribute_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/item-attribute/edit"]);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetItemAttributeList(this.page);
  }

  getInitials(name) {
    return this.commonService.getInitials(name);
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
      data.module_key = '46'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '46'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '46'
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
