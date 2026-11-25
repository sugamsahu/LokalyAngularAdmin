import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  tap,
} from "rxjs";
import { AppComponent } from "src/app/app.component";
import { UserRoles } from "src/app/enums/user-roles";
import { CommonService } from "src/app/services/common.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ItemService } from "src/app/services/item.service";
import { PriceService } from "src/app/services/price.service";
import { AddEditVariantModelComponent } from "../../model/add-edit-variant/add-edit-variant.component";
import { NgxSpinnerService } from "ngx-spinner";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-item-submission-approval',
  templateUrl: './item-submission-approval.component.html',
  styleUrls: ['./item-submission-approval.component.scss']
})
export class ItemSubmissionApprovalComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size: number = 20;
  tableSizes: any = [3, 6, 9, 12];
  search = "";
  no_data = true;
  main: any;
  is_super_admin: boolean;
  is_item_approval: boolean = false;
  userRoleEnum = UserRoles;
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  selectedCategory: any = {
    label: "",
    value: "",
  };
  iseatery: any;
  userId: any;
  storeId: any;
  CategoryGridData: any = [];
  total_count: number = 0;
  show_price_same_font: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  global_currency: any;
  sidebarCategoryId: any;
  sortKey: any = "";
  isOrderBy: boolean = true;
  store_label: any;
  subCategoryList: any = [];
  selectedSubCategory: any = {
    label: "",
    value: "",
  };
  UrL: string;
  whatsappURL: string;
  init_filter_data: any;
  filters: any;
  clearFilter: any = true;
  showFilters: boolean = false;
  session_store_id = localStorage.getItem("adminselectedstore");
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  amount_seperator: any;
  closeResult: any;

  constructor(
    private itemService: ItemService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private priceService: PriceService,
    public commonService: CommonService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private _helpService: BannerService,
  ) {
    this.main = this.appComponent.main;
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');;
  }

  ngOnInit(): void {
    $('<style>.ng-dropdown-panel.ng-select-bottom { margin-top: ' + '62px' + '!important; }</style>').appendTo('body');
    this.getItemList(this.page);
    this.amount_seperator = this.general_setting?.amount_seperator;
    this.show_price_same_font = this.general_setting.show_price_same_font;
    this.global_currency = this.general_setting.currency_symbol;
    this.store_label = this.general_setting.store_label;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.is_item_approval =
      this.general_setting.item_approval_shop_type
        .split(",")
        .filter((x) => x == this.main.LoggedUserStoreInfo?.category_id).length >
      0;
    this.iseatery = this.main.LoggedUserStoreInfo?.iseatery;
    this.is_super_admin =
      this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin
          ? true
          : false;
    var preUrl = localStorage.getItem("Previous_URL");
    let previousURL = preUrl.slice(0, preUrl.lastIndexOf("/"));
    var filterObject: any;
    this.page = 1;
    this.search = "";
    this.count = 0;
    if (previousURL == "/payment-method/edit") {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    } else {
      localStorage.removeItem("seller_Order_obj");
    }
    this.itemService.isCategoryIdUpdated().subscribe((sidebarCategoryId) => {
      this.sidebarCategoryId = sidebarCategoryId;
      this.selectedCategory = sidebarCategoryId;
      this.getItemList(this.page);
    });
    let sessionSelectedCategory: any;
    sessionSelectedCategory = this.cryptoService.decryptIdValue(
      "urlcategoryid" + this.main.LoggedUserStoreInfo?.store_id?.toString(),
      this.main.CryptoKey
    );
    if (
      sessionSelectedCategory != null ||
      sessionSelectedCategory != undefined
    ) {
      this.sidebarCategoryId = sessionSelectedCategory;
      this.selectedCategory = sessionSelectedCategory;
    }
    if (localStorage.getItem("itemApprovalData") != null && localStorage.getItem("itemApprovalData") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("itemApprovalData"));
      localStorage.removeItem("itemApprovalData");
    }
    if (filterObject) {
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }
    this.getItemList(this.page);
    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean),
        debounceTime(1000),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getItemList(1);
        })
      ).subscribe();
    this.getHelpDetails();
  }
  
  getItemList(page: any) {
    this.spinner.show();
    this.showFilters = false;
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data: any;
    data = {
      page: this.page,
      search_query: search,
      limit: this.table_size,
      user_id: this.main.LoggedUserInfo.user_id,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };

    this.itemService.pendingItemsApproval(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.showFilters = true;
          this.CategoryGridData = [];
          var data = {
            items: response.data,
          };
          this.CategoryGridData.push(data);
          var filterData = response.filter_data;
          if (filterData?.categories?.length > 0) {
            filterData.categories.splice(0, 0, {
              category_name: "All",
              category_id: "All",
            });
          }
          if (filterData?.item_tags?.length > 0) {
            filterData.item_tags.splice(0, 0, "All");
          }
          if (filterData?.brands?.length > 0) {
            filterData.brands.splice(0, 0, "All");
          }
          this.init_filter_data = filterData;
          this.total_count = response.count;
          this.CategoryGridData[0].items.forEach((Item: any) => {
            Item.iseatery = Item.is_eatery;
            delete Item.is_eatery;
            var varientInitialcount = 0;
            Item.checked = false;
            Item.item_variants.forEach((varients) => {
              varients.unit_quantity =
                parseFloat(varients.unit_quantity) == 0
                  ? ""
                  : parseFloat(varients.unit_quantity);
              if (varients.item_image_ids) {
                var imageObject: any = [];
                var img = varients.item_image_ids.split(',');
                img.forEach((vraiant_image: any) => {
                  var found = Item.item_images.filter((item: any) => item.item_image_id == vraiant_image)[0];
                  if (found) {
                    let obj: any = {
                      image: found.image,
                      thumbImage: found.image,
                      type: found.type
                    }
                    imageObject.push(obj)
                  }
                });
                varients.ImageObject = imageObject;
              }
            });
            Item.optionsOpen = false;
            if (Item.item_variants[0] != undefined) {
              Item.SelectedItemVarient = Item.item_variants[0];
            }
            varientInitialcount =
              varientInitialcount + Item.item_variants.length;
          });
          this.no_data = false;
          this.count = response.count;
        } else {
          this.showFilters = true;
          this.init_filter_data = response.filter_data;
          this.toastr.error(this.translate.instant(response.message));
          this.no_data = true;
          this.count = 0;
          this.CategoryGridData = [];
        }
      },
      error: (error) => {
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  approveItems(id: any) {
    var data: any;
    var ids: any = [];
    this.CategoryGridData[0].items.forEach((element: any) => {
      if (element.checked == true) {
        ids.push(element.item_id)
      }
    });
    data = {
      user_id: this.main.LoggedUserInfo.user_id,
      item_ids: id > 0 ? id : ids.toString(),
      remarks: "Item is apprved by web admin"
    };
    this.itemService.approveItems(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
          this.getItemList(this.page);
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      }
    })
  }

  rejectItems(id: any) {
    var data: any;
    var ids: any = [];
    this.CategoryGridData[0].items.forEach((element: any) => {
      if (element.checked == true) {
        ids.push(element.item_id)
      }
    });
    data = {
      user_id: this.main.LoggedUserInfo.user_id,
      item_ids: id > 0 ? id : ids.toString(),
      remarks: "Item is Rejected by web admin"
    };
    this.itemService.rejectItems(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant("ITEM_REJECTED_SUCCESSFULLY"));
          this.getItemList(this.page);
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      }
    })
  }

  checkAllCheckBox(ev: any) {
    this.CategoryGridData[0].items.forEach((x: any) => x.checked = ev.target.checked)
  }

  isAllCheckBoxChecked() {
    return this.CategoryGridData.length > 0 ? this.CategoryGridData[0].items.every((p: any) => p.checked) : false;
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getItemList(1);
    }
  }

  addItem() { }

  editItem(categoryItem: any) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("itemApprovalData", JSON.stringify(obj));

    this.localStorageSetData();

    if (this.is_super_admin) {
      localStorage.setItem("selectedStore", JSON.stringify(categoryItem));
      this.cryptoService.encryptIdValue(
        categoryItem.item_id.toString(),
        "adminitemid" + this.main.LoggedUserInfo?.role_id?.toString(),
        this.main.CryptoKey
      );
      this.router.navigate(["/items/edit-adminitem"]);
    }
  }

  localStorageSetData() {
    var obj = {
      page: this.page,
      search: this.search,
      listdataBySearch: this.filters,
      filterdata: this.filters,
      sortKey: this.sortKey,
      isOrderBy: this.isOrderBy,
    };
    localStorage.setItem("seller_item_list_obj", JSON.stringify(obj));
  }

  discountPriceCondition(discountPrice, price) {
    return this.priceService.discountPriceCondition(discountPrice, price);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName; //set the sortKey to the param passed
    this.isOrderBy = !this.isOrderBy;
    this.getItemList(this.page);
  }

  addEditVariant() {
    const modalRef = this.modalService.open(AddEditVariantModelComponent, {
      size: "w-1300",
    });
    modalRef.componentInstance.main = this.main;
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
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
      data.module_key = '19'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '19'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '19'
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

  sideMenuClose() {
    if (window.innerWidth > 700) {
      var sidebarOpne: any = true;
      sidebarOpne = localStorage.getItem('sidebarOpen');
      if (sidebarOpne == "true") {
        $('.navbar-toggler').click();
      }
    }
  }

  ngOnDestroy(): void {
    $(
      "<style>.ng-dropdown-panel.ng-select-bottom {  margin-top:" +
      "-1px" +
      " !important; }</style>"
    ).appendTo("body");
  }
}

