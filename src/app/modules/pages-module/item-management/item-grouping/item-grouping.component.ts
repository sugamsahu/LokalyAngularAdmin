import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ItemService } from "src/app/services/item.service";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { Subject, debounceTime, distinctUntilChanged, filter, fromEvent, takeUntil, tap } from "rxjs";
import { environment } from "src/environments/environment";
import { UserRoles } from "src/app/enums/user-roles";
import { CommonService } from "src/app/services/common.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-item-grouping",
  templateUrl: "./item-grouping.component.html",
  styleUrls: ["./item-grouping.component.scss"],
})
export class ItemGroupingComponent implements OnInit {
  destroy$ = new Subject();
  noData: boolean = true;
  total_count: number = 0;
  item_group_list: any = [];
  main: any;
  search: string = '';
  page: number = 1;
  table_size: number = environment.tableSize;
  count: number = 0;
  @ViewChild("search", { static: true }) SearchEvt: ElementRef;
  userRoleEnum = UserRoles
  isStoreManager: boolean = false;
  AllowManageItem: boolean = false;
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private itemService: ItemService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cryptoService: CryptoService,
    private router: Router,
    public commonService: CommonService,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
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
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }

    this.getItemGroups(this.page);
    if (this.main.LoggedUserStoreInfo.role_id == this.userRoleEnum.StoreManager) {
      this.isStoreManager = true;
      this.getStoreManagerSettings();
    }
    if (this.searchbox != undefined) {
      fromEvent(this.SearchEvt.nativeElement, "keyup").pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean),
        debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.SearchEvt.nativeElement.value;
          this.getItemGroups(this.page);
        })
      ).subscribe();
    }
    this.getHelpDetails();
  }

  getStoreManagerSettings() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id
    }
    this.commonService.getStoreSetting(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.data.manage_item == 1) {
          this.AllowManageItem = true;
        } else {
          this.AllowManageItem = false;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {
      },
    })
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getItemGroups(1);
    }
  }

  getItemGroups(page) {
    this.page = page;
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
      search_query: this.search,
      page: this.page
    };
    this.itemService.getRecommendedItems(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.noData = false;
          this.item_group_list = response.data;
          this.total_count = response.data?.length || 0;
          this.count = response.data?.length || 0;
        } else {
          this.noData = true;
          this.item_group_list = [];
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  deleteGroup(itemId) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteItemConfirm(itemId);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        console.log("cancelled");
      }
    });
  }

  deleteItemConfirm(itemId) {
    var data = {
      user_id: this.main.LoggedUserStoreInfo.user_id,
      item_recommend_id: itemId,
    };
    this.itemService.deleteStoreItemGroup(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(response.message);
          this.getItemGroups(this.page);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  editGroup(itemRecommandId) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      itemRecommandId.toString(),
      "itemRecommandId" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/items/itemgroupedit"]);
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
      data.module_key = '113'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '113'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '113'
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
