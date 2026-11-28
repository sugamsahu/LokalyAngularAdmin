import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { debounceTime, distinctUntilChanged, filter, fromEvent, Subject, takeUntil, tap } from "rxjs";
import { AppComponent } from "src/app/app.component";
import { UserRoles } from "src/app/enums/user-roles";
import { CommonService } from "src/app/services/common.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ItemService } from "src/app/services/item.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { SellerService } from "src/app/services/seller.service";
import { AddSelectItemComponent } from "../../model/add-select-item/add-select-item.component";
import { CookieService } from "ngx-cookie-service";
import { ToastrService } from "ngx-toastr";
import { DashboardHelpInfoComponent } from "../../model/dashboard-help-info/dashboard-help-info.component";

@Component({
  selector: "app-item-collection",
  templateUrl: "./item-collection.component.html",
  styleUrls: ["./item-collection.component.scss"],
})
export class ItemCollectionComponent implements OnInit, OnDestroy {
  noData: boolean = true;
  item_collection_list: any = [];
  main: any;
  total_count: number = 0;
  search: string = '';
  page: number = 1;
  table_size: number = 10;
  count: number = 0;
  @ViewChild("search", { static: true }) SearchEvt: ElementRef;
  destroy$ = new Subject();
  AllowManageItem: boolean = false;
  IsStoreManager: boolean = false;
  userRoleEnum = UserRoles;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  seller_list: any = [];
  selectedSeller: any;
  is_super_admin: boolean;
  storeId: string;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));

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
    private sellerService: SellerService,
    private cookieService: CookieService
  ) {
    this.main = this.appComponent.main;
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;
    if (localStorage.getItem("seller_Order_obj") != null && localStorage.getItem("seller_Order_obj") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
      this.storeId = this.cryptoService.decryptIdValue(
        "selectedStore" + this.main.LoggedUserStoreInfo?.store_id?.toString(),
        this.main.CryptoKey
      );
      this.cookieService.deleteAll()
    }
    if (filterObject) {
      this.search = filterObject.search;
      this.SearchEvt.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }
    this.is_super_admin =
      this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin
          ? true
          : false;

    if (this.is_super_admin) {
      this.getSellerList();
    } else {
      this.getCollectionList(this.page);
    }
    fromEvent(this.SearchEvt.nativeElement, "keyup").pipe(
      filter(() => !window.getSelection().toString()),
      filter(Boolean),
      debounceTime(environment.search_time),
      distinctUntilChanged(),
      tap(() => {
        this.search = this.SearchEvt.nativeElement.value;
        this.getCollectionList(this.page);
      })
    ).subscribe();
    if (this.main.LoggedUserStoreInfo.role_id == this.userRoleEnum.StoreManager) {
      this.IsStoreManager = true;
      this.getStoreManagerSettings()
    }
    this.getHelpDetails();
  }

  getSellerList() {
    let data: any = {
      is_verified: 2,
      khata_user: 0,
      market_type: 2
    };

    this.sellerService.getSellerList(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.seller_list = response.data;
          this.seller_list.splice(0, 0, {store_id:"0",manager_name:"All",store_name:""});
          if (this.storeId) {
            this.selectedSeller = this.seller_list.filter(store => store.store_id == this.storeId)[0]
          } else {
            this.selectedSeller = response.data[0];
          }
          this.getCollectionList(this.page);
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {
        //
      },
    });
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
      this.getCollectionList(1);
    }
  }

  changeStore(item) {
    this.selectedSeller = item
    this.getCollectionList(1);
  }

  getCollectionList(page) {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data: any = {
      search_query: this.search,
      page: this.page,
      limit: this.table_size
    };
    if (this.is_super_admin) {
      data.store_id = this.selectedSeller.store_id;
    } else {
      data.store_id = this.main.LoggedUserStoreInfo.store_id;
    }
    this.itemService.getCollectionList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.noData = false;
          this.item_collection_list = response.data;
          // if(this.main.LoggedUserInfo.role_id != 6){
            this.item_collection_list = this.item_collection_list.filter(x=>x.is_active == 1)            
            this.total_count = this.item_collection_list.length || 0;
          // } else {
          //   this.total_count = response.count || 0;
          // }
          this.count = response.count || 0;
        } else {
          this.noData = true;
          this.item_collection_list = [];
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  editCollection(itemCollectionId) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    if (this.is_super_admin) {
      this.cryptoService.encryptIdValue(
        itemCollectionId.toString(),
        "itemCollectionId" + this.main.LoggedUserStoreInfo?.store_id?.toString(),
        this.main.CryptoKey
      );
      this.cryptoService.encryptIdValue(
        this.selectedSeller.store_id,
        "selectedStore" + this.main.LoggedUserStoreInfo?.store_id?.toString(),
        this.main.CryptoKey
      );
    } else {
      this.cryptoService.encryptIdValue(
        itemCollectionId.toString(),
        "itemCollectionId" + this.main.LoggedUserStoreInfo.store_id.toString(),
        this.main.CryptoKey
      );
    }
    this.router.navigate(["/items/itemcollectionedit"]);
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      // backdrop: "static",
      // keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  openSelectItemPopup(item: any) {
    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
      centered: true,
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.isSuperAdmin = this.is_super_admin;
    modalRef.componentInstance.selectedSeller = this.selectedSeller;
    modalRef.componentInstance.foritemcollectionDisplay = true;
    modalRef.componentInstance.foritemcollection = true;
    modalRef.componentInstance.item_collection_id = item.item_collection_id;
    modalRef.componentInstance.seller_item_collection_id = item.seller_item_collection_id;
    modalRef.componentInstance.SelectedItems = [];
    modalRef.componentInstance.SelectedItemFromStore.subscribe(
      (selectedItem) => {
      }
    );
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '114'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '114'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '114'
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

  openinfomodel(selected: any) {
    var data = {
      seller_item_collection_id: selected.seller_item_collection_id,
    };
    this.itemService.getStoreCollectionDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          const modalRef = this.modalService.open(DashboardHelpInfoComponent, {
            size: "lg",
            centered: true,
          });
          modalRef.componentInstance.collection_info = response.data;
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

  deleteCollection(itemId) {
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
      }
    });
  }

  deleteItemConfirm(itemId) {
    var fd = new FormData();
    fd.append("seller_item_collection_id", itemId);
    this.itemService.deleteStoreItemCollection(fd).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(response.message);
          this.getCollectionList(this.page);
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

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
