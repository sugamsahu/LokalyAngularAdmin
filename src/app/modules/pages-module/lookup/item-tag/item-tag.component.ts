import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ItemTagService } from 'src/app/services/lookup/item-tag.service';
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from 'src/app/app.component';
import { environment } from "src/environments/environment";
import { Router } from '@angular/router';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap } from "rxjs";
import { BannerService } from 'src/app/services/configuration/banner.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-item-tag',
  templateUrl: './item-tag.component.html',
  styleUrls: ['./item-tag.component.scss']
})
export class ItemTagComponent implements OnInit {

  page: number = 1;
  count: number = 0;
  table_size: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search = "";
  no_data = true;
  main: any;
  item_tag_list: any;
  SelectedStore: any;
  store_type_list: any;
  sortKey: any = "";
  isOrderBy: boolean = true;
  language_id = localStorage.getItem("select_lan_id") || "1";

  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  store_label = this.general_setting.store_label;
  help_details: any;

  constructor(
    private itemTagService: ItemTagService,
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

  selectedStoreFromEdit: Number = 0;
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

    if (preUrl == '/item-tag/edit') {
      if (localStorage.getItem("seller_Order_obj") != null && localStorage.getItem("seller_Order_obj") != undefined) {
        filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
        localStorage.removeItem("seller_Order_obj");
      }
    }

    if (filterObject) {
      this.search = filterObject.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
      this.searchbox.nativeElement.value = this.search;
      this.selectedStoreFromEdit = filterObject.SelectedStore
    }
    this.categoryListRecord();

    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.GetItemTagList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetItemTagList(1);
    }
  }

  GetItemTagList(page): void {

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
      sort_type: this.isOrderBy ? 1 : 2
    };

    this.itemTagService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.item_tag_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.item_tag_list = [];
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
  }

  SelectTagList(item) {
    this.GetItemTagList(0)
  }

  async categoryListRecord() {
    var data = {
      token_type: 1,
    };

    await this.itemTagService.getStoreTypeList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {

          this.store_type_list = [{ category_id: 0, category_name: "All" }];
          response.data.forEach(item => {
            this.store_type_list.push(item)
          });
          if (localStorage.getItem("Previous_URL") != '/item-tag/edit') {
            this.SelectedStore = this.store_type_list[0].category_id;
          } else {
            if (this.selectedStoreFromEdit != 0) {
              this.SelectedStore = this.selectedStoreFromEdit;
            } else {
              this.SelectedStore = this.store_type_list[0].category_id;
            }
          }
          this.GetItemTagList(this.page);
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
  }

  //image
  getInitials(name) {
    var canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = 35;
    canvas.height = 35;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    context.fillStyle = "#476ce8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "16px Arial";
    context.fillStyle = "#FFFFFF";
    var nameArray = name?.split(" ");
    var initials = "";
    initials = initials + nameArray[0][0];
    initials = initials == "undefined" ? "U" : initials;
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 13, 22);
    } else {
      context.fillText(initials.toUpperCase(), 13, 22);
    }
    var data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }

  editItemTagDetail(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
      SelectedStore: this.SelectedStore
    };

    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      id.toString(),
      "lookup_itemTag_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/item-tag/edit"]);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetItemTagList(this.page);
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
      data.module_key = '44'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '44'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '44'
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
