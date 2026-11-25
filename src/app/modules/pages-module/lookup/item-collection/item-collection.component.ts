import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { ItemCollectionService } from 'src/app/services/lookup/item-collection.service';
import { environment } from "src/environments/environment";
import { TranslateService } from "@ngx-translate/core";
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap } from "rxjs";
import Swal from 'sweetalert2';
import { CommonService } from 'src/app/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-item-collection',
  templateUrl: './item-collection.component.html',
  styleUrls: ['./item-collection.component.scss']
})
export class ItemCollectionComponent implements OnInit {

  page: number = 1;
  count: number = 0;
  table_size: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  no_data = true;
  search = "";
  main: any;
  item_collection_list: any;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));

  constructor(
    private itemCollectionService: ItemCollectionService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private commonService: CommonService,
    private modalService: NgbModal,
    private _helpService: BannerService,
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
    this.GetItemCollectionList(this.page);

    if (this.searchbox != undefined) {
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.GetItemCollectionList(1);
          })
        )
        .subscribe();
      this.getHelpDetails()
    }

  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetItemCollectionList(1);
    }
  }

  GetItemCollectionList(page): void {
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
    };

    this.itemCollectionService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.item_collection_list = response.data;
          this.no_data = false;
          // if(this.main.LoggedUserInfo.role_id != 6){
          //   this.item_collection_list = this.item_collection_list.filter(x=>x.is_active == 1)
            
          //   this.count = this.item_collection_list.length || 0;
          // } else {
          //   this.count = response.count || 0;
          // }
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.item_collection_list = [];
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
  }

  edititemCollectionDetail(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      id.toString(),
      "lookup_itemCollection_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/item-collection/edit"]);
  }

  deleteItemCollection(id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_ITEM_COLLECTION"),
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
      item_collection_id: id,
      user_id: this.main.LoggedUserInfo.user_id
    }
    this.itemCollectionService.deleteItemCollection(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
          this.GetItemCollectionList(this.page);
        }
      },
      error: (error) => { },
      complete: () => { }
    })
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetItemCollectionList(this.page);
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
      data.module_key = '45'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '45'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '45'
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
