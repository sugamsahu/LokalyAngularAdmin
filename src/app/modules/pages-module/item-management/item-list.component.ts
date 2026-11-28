import { RearrangeItemsComponent } from "./../model/rearrange-items/rearrange-items.component";
import { SubCategoryService } from "../../../services/lookup/sub-category.service";
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Injector,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  OnDestroy,
  HostListener,
  Renderer2,
} from "@angular/core";
import { Router } from "@angular/router";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  Observable,
  startWith,
  Subject,
  takeUntil,
  tap,
} from "rxjs";
import { AppComponent } from "src/app/app.component";
import { UserRoles } from "src/app/enums/user-roles";
import { CommonService } from "src/app/services/common.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ItemService } from "src/app/services/item.service";
import { CategoryService } from "src/app/services/lookup/category.service";
import { PriceService } from "src/app/services/price.service";
import { SellerService } from "src/app/services/seller.service";
import { shareURLComponent } from "../model/share-url/share-url.component";
import Swal from "sweetalert2";
import { ItemFilterComponent } from "../model/item-filter/item-filter.component";
import { AddEditVariantModelComponent } from "../model/add-edit-variant/add-edit-variant.component";
import { makeStateKey } from "@angular/platform-browser";
import { isPlatformServer } from "@angular/common";
const configKey = makeStateKey("CONFIG");
import { CookieService } from "ngx-cookie-service";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { cloneDeep } from "lodash";
import { ExportItemDlModelComponent } from "../model/export-item-dl/export-item-dl.component";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { VoiceSearchComponent } from "../model/voice-search/voice-search.component";
import { ToastrService } from "ngx-toastr";
import { ItemDescriptionComponent } from "../model/item-description-model/item-description-model.component";
@Component({
  selector: "app-item-list",
  templateUrl: "./item-list.component.html",
  styleUrls: ["./item-list.component.scss"],
})
export class ItemListComponent implements OnInit, OnDestroy {
  @ViewChild('tabGroup')
  tabGroup;
  @ViewChild('sub_cat_tabGroup')
  sub_cat_tabGroup;
  scrolling: boolean = false;
  atBottom: boolean = false;
  scroll_timeout: number = 100;
  scrollTop: number;
  scrollHeight: number;
  elementHeight: number;
  private destroy$ = new Subject();
  page: number = 1;
  count: number = 0;
  table_size: number = 20;
  tableSizes: any = [3, 6, 9, 12];
  tile_view: any = false;
  search = "";
  no_data = true;
  main: any;
  is_superAdmin: boolean;
  is_item_approval: boolean = false;
  userRoleEnum = UserRoles;
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  seller_list: any = [];
  selectedSeller: any;
  category_list: any = [];
  category_list_for_rearrange: any = [];
  selectedCategory: any
  item_approval_shop_type_string: any;
  iseatery: any;
  category_customer_icon: any;
  userId: any;
  storeId: any;
  CategoryGridData: any = [];
  total_count: number = 0;
  show_price_same_font: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  global_currency: any;
  sidebarCategoryId: any;
  sortKey: any = "";
  isOrderBy: any = 1;
  store_label: any;
  subCategoryList: any = [];
  selectedSubCategory: any = {
    label: "",
    value: "",
    sub_category_name: "",
  };
  UrL: string;
  whatsapp_url: string;
  init_filter_data: any;
  filters: any;
  clearFilter: any = true;
  showFilters: boolean = false;
  session_store_id = localStorage.getItem("adminselectedstore");
  AllowManageItem: boolean = false;
  isStoreManager: boolean = false;
  swipeLimitWidth = 80;
  connectEdges = true;
  //recent search
  myControl = new UntypedFormControl("");
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  searchHistory: any;
  category: any = [];
  review_rating_module: any;
  show_rating_different_color_code: any;
  default_rating_color_code_bg: any;
  alternate_color_code_bg: any;
  alternate_color_code_text: any;
  default_rating_color_code_text: any;
  show_save_item: any;
  masterList = false
  public formGroup: UntypedFormGroup;
  StoreList: any = [];
  SelectedStoreType: any;
  FilterByStatusList = [
    { name: "All", value: 0 },
    { name: "Active", value: 1 },
    { name: "InActive", value: 2 },
  ];
  AdminImp = {
    SelectAllItems: false,
  };
  CatIDs: any;
  showCombineVarient: any = true;
  newItem: any = [];
  varientItem: any = [];
  counter = 0;
  checkall = false;
  selected_store_id: any;
  sorted: any = 1
  show_combine: boolean = true;
  changeEditItemId: boolean = false;
  adminStoreId: any
  is_subcat_visible = 0;
  selectedCategoryTab: number = 0;
  selectedSubCategoryTab: number = 0;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  checkCategoryData = '';
  spinner = false;
  postDataFilter: boolean = false;
  categoryListLocal: any;
  initialcat: any = [];
  editCategoryId: any;
  itemFlagData = false
  comboval = 0;
  closeResult: any;
  amount_seperator: any;
  dropdown_position: string = 'top'
  mob_view: boolean = false;
  lastScrollTop = 0;
  is_variant_display: boolean = false;

  constructor(
    private itemService: ItemService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private sellerService: SellerService,
    private categoryService: CategoryService,
    private subCategoryService: SubCategoryService,
    private priceService: PriceService,
    public commonService: CommonService,
    private modalService: NgbModal,
    private injector: Injector,
    private cdr: ChangeDetectorRef,
    private cookieService: CookieService,
    private formBuilder: UntypedFormBuilder,
    private spinnerService: SpinnerService,
    private _helpService: BannerService,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformid: Object
  ) {
    if (window.innerWidth <= 700) {
      this.mob_view = true;
    }
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    if (isPlatformServer(this.platformid)) {
      const envJson = this.injector.get("CONFIG")
        ? this.injector.get("CONFIG")
        : {};
      this.translate.set(configKey, envJson as any);
    }
  }

  ngOnInit(): void {
    var variant_grid_display: any = localStorage.getItem("item_grid_display");
    if (variant_grid_display != null && variant_grid_display != undefined) {
      this.tile_view = variant_grid_display == 'true' ? true : false;
    }
    $("<style>.product-rating { background:" + this.general_setting.default_rating_color_code_bg + " !important}</style>").appendTo("body");
    $("<style>.product-rating span { color:" + this.general_setting.default_rating_color_code_text + " !important}</style>").appendTo("body");
    $("<style>.product-rating svg, rating svg { fill: " + this.general_setting.default_rating_color_code_text + " !important}</style>").appendTo("body");
    if (location.href.indexOf("/items/masteritems") > -1) {
      this.masterList = true;
    } else {
      var variant_display: any = localStorage.getItem("item_variant_display");
      if (variant_display != null && variant_display != undefined) {
        this.showCombineVarient = variant_display == 'true' ? true : false;
      }
    }
    $(
      "<style>.mat-form-field-appearance-outline .mat-form-field-outline {  margin-top:" +
      "28px" +
      " !important;  margin-bottom:" +
      "10px" +
      " !important;}</style>"
    ).appendTo("body");
    this.loadForm();
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin && window.location.pathname == "/items/masteritems") {
      this.router.navigate(['/dashboard']);
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      this.cryptoService.encryptIdValue(this.loginUserStore.store_id.toString(), "selectedStoreId" + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
    }
    this.show_price_same_font = this.general_setting.show_price_same_font;
    this.amount_seperator = this.general_setting?.amount_seperator;
    this.review_rating_module = this.general_setting.review_rating_module;
    this.global_currency = this.general_setting.currency_symbol;
    this.store_label = this.general_setting.store_label;
    this.show_rating_different_color_code = this.general_setting.show_rating_different_color_code;
    this.default_rating_color_code_bg = this.general_setting.default_rating_color_code_bg;
    this.alternate_color_code_bg = this.general_setting.alternate_color_code_bg;
    this.alternate_color_code_text = this.general_setting.alternate_color_code_text;
    this.default_rating_color_code_text = this.general_setting.default_rating_color_code_text;
    this.show_save_item = this.general_setting.show_save_item;
    this.is_superAdmin =
      this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin
          ? true
          : false;

    this.is_item_approval =
      this.general_setting.item_approval_shop_type
        .split(",")
        .filter((x) => x == this.main.LoggedUserStoreInfo?.category_id)?.length >
      0;
    this.iseatery = this.main.LoggedUserStoreInfo?.iseatery;
    var filterObject: any;
    this.page = 1;
    this.search = "";
    this.count = 0;
    var categoryIndex: any;
    if (
      localStorage.getItem("seller_Order_obj") != null &&
      localStorage.getItem("seller_Order_obj") != undefined
    ) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }
    // filterObject = JSON.parse(localStorage.getItem("seller_item_list_obj"));
    // localStorage.removeItem("seller_item_list_obj");
    categoryIndex = JSON.parse(localStorage.getItem("getCategoryIndex"))
    localStorage.removeItem("getCategoryIndex")
    if (filterObject) {
      this.searchbox.nativeElement.value = filterObject.search;
      this.search = filterObject.search;
      this.myControl.setValue(filterObject.search);
      this.page = filterObject.page;
      this.changeEditItemId = filterObject.changeEditItemIdData;
      this.adminStoreId = filterObject.adminStoreId;
      this.filters = filterObject.filterdata;
      if (filterObject.filterdata != undefined) {
        this.clearFilter = false;
        this.cdr.detectChanges();
      }
      this.selectedCategoryTab = filterObject.selectedCategoryTab;
      this.selectedSubCategoryTab = filterObject.selectedSubCategoryTab;
      if (this.selectedSubCategoryTab > 0) {
        this.is_subcat_visible = this.selectedSubCategoryTab
      }
    }
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
    if (!this.masterList) {
      if (this.main.LoggedUserStoreInfo?.role_id == this.userRoleEnum.StoreManager) {
        this.isStoreManager = true;
        this.getStoreManagerSettings();
      }
      this.loadData();
    } else {
      localStorage.setItem("masterItemDuplicate", "false");
      this.storeTypeListRecord();
    }
    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean),
        debounceTime(2000),
        distinctUntilChanged(),
        tap(() => {
          this.CategoryGridData = []
          this.search = this.searchbox.nativeElement.value;
          // this.getItemList(1);
          this.getCategoryList('postSearch');
        })
      )
      .subscribe();
    if (!filterObject) {
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(""),
        map((value) => this._filter(value || ""))
      );
    }
    this.getSearchHistory();
    this.getHelpDetails()
    // window.onscroll = function() {this.myFunction()};
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
      },
      complete: () => {
      },
    })
  }

  getOfferPercentage(item) {
    var itemPrice = Number(item.item_price);
    var discountedPrice = Number(item.discounted_price);
    var a: any = Number(((itemPrice - discountedPrice) / itemPrice) * 100).toFixed(0);
    return a
  }

  getItemOffer(item: any) {
    var offerValue: any = Number(Number(item.item_price) - Number(item.discounted_price)).toFixed(0);
    return offerValue
  }

  getSearchHistory() {
    var cookies =
      this.is_superAdmin == true
        ? this.cookieService.get("recentsearch2")
        : this.cookieService.get("recentsearch");
    var data: any = cookies.split(",");
    if (data == "") {
      data = [];
    }
    this.options = data;
  }

  setCookie(search) {
    if (this.options.length > 4) {
      var first = this.options[0];
      var newNum = search;
      for (let i = 1; i < this.options.length; i++) {
        var temp = null;
        temp = this.options[i];
        this.options[i] = first;
        first = temp;
        if (i == this.options.length - 1) {
          this.options[0] = newNum;
        }
      }
    } else {
      this.options.unshift(search)
    }
    var data: any = this.options;
    if (this.is_superAdmin == true) {
      this.cookieService.set("recentsearch2", data);
    } else {
      this.cookieService.set("recentsearch", data);
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    // this.searchFun();

    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  searchFun() {
    var value = this.myControl.value;
    this.options.forEach((el) => {
      if (value == el) {
        this.search = el;
        this.getItemList(1);
      }
    });
  }

  clearSearch() {
    this.myControl.setValue(null);
    this.search = null;
    this.CategoryGridData = [];
    (<HTMLInputElement>document.getElementById("search")).value = ''
    // this.getItemList(1);
    this.getCategoryList('postSearch');
  }

  //delete history
  deleteHistory(data) {
    this.options.forEach((element, i) => {
      if (element == data) {
        this.options.splice(i, 1)
      }
    });
    this.myControl.setValue(null)
    var data: any = this.options;
    if (this.is_superAdmin == true) {
      this.cookieService.set("recentsearch2", data);
    } else {
      this.cookieService.set("recentsearch", data);
    }
  }

  voiceSearch() {
    const modalRef = this.modalService.open(VoiceSearchComponent, {
      size: "md",
      centered: true,
      animation: true,
    });
    modalRef.componentInstance.isVoiceSearch = true;
    modalRef.componentInstance.Voice.subscribe((voice) => {
      if (voice) {
        this.CategoryGridData = [];
        (<HTMLInputElement>document.getElementById("search")).value = voice;
        this.myControl.setValue(voice);
        this.search = voice;
        this.getItemList(1);
      }
    });
  }

  loadData() {
    if (this.is_superAdmin) {
      this.getSellerList();
    } else {
      this.getCategoryList()
    }
  }

  async getItemList(page) {
    if (!this.masterList) {
      this.is_variant_display = this.showCombineVarient;
    } else {
      this.is_variant_display = this.formGroup.value.showCombineVarient;
    }
    if (!this.spinner) {
      this.spinner = true;
      var search = "";
      if (this.search != "" && this.search != undefined && this.search != null) {
        search = this.search;
      }
      if (search != "") {
        var temp = false;
        this.options.forEach((element) => {
          if (element == search) {
            temp = true;
          }
        });
        if (temp == false) {
          this.setCookie(search);
        }
      }
      this.page = page;
      var data: any;
      data = {
        page: this.page,
        search_query: search,
        limit: this.table_size,
        user_id: this.main.LoggedUserInfo.user_id,
        sort_field: this.sortKey,
        sort_type: this.isOrderBy,
        search_type: 1,
      };

      if (!this.masterList) {
        data.is_item_variant_level = this.showCombineVarient == true ? 0 : 1
      }
      else {
        data.is_item_variant_level = this.formGroup.value.showCombineVarient == true ? 0 : 1
      }

      if (this.filters != undefined && this.filters != null && this.filters?.length != 0) {
        data.max_discount = this.filters.discountedPriceHighValue
          ? this.filters.discountedPriceHighValue
          : 0;

        data.max_price = this.filters.priceHighValue
          ? this.filters.priceHighValue
          : 0;

        data.min_discount = this.filters.discountedPriceValue
          ? this.filters.discountedPriceValue
          : 0;

        data.min_price = this.filters.priceValue ? this.filters.priceValue : 0;

        if (this.filters.item_avaibility) {
          let inStock = this.filters?.item_avaibility?.filter(
            (x) => x.value == 0
          )[0];
          let outOfStock = this.filters?.item_avaibility?.filter(
            (x) => x.value == 1
          )[0];

          data.out_of_stock =
            inStock?.is_checked && outOfStock?.is_checked
              ? ""
              : inStock?.is_checked
                ? "0"
                : outOfStock?.is_checked
                  ? "1"
                  : "";
        }

        if (this.filters.item_type) {
          data.item_type = this.filters.item_type
            .filter((x) => x.is_added == true)
            .map((x) => x.id)
            .toString();
        }

        if (this.filters.item_type_pharma) {
          data.prescription = this.filters.item_type_pharma
            .filter((x) => x.is_checked == true)
            .map((x) => x.value)
            .toString();
        }

        if (this.filters.selectedBrands) {
          data.brands = this.filters.selectedBrands.map((x) => x).toString();
        }

        if (this.filters.selectedTag) {
          data.item_tags = this.filters.selectedTag.map((x) => x).toString();
        }
      }

      if (this.is_superAdmin == true) {
        data.store_id = this.selectedSeller?.store_id == undefined ? this.adminStoreId : this.selectedSeller?.store_id;
        data.categories =
          this.selectedCategory?.length == 0
            ? ""
            : this.selectedCategory?.value?.toString();
        data.sub_category_id = this.selectedSubCategory?.value

        if (this.masterList) {
          data.filter =
            this.formGroup.value.filter > 0 ? this.formGroup.value.filter : ""
        }
      }
      else {
        data.store_id = this.main.LoggedUserStoreInfo.store_id
          ? this.main.LoggedUserStoreInfo.store_id
          : "";
        if (
          this.filters &&
          this.filters.selectedCategory &&
          this.filters.selectedCategory.length > 0
        ) {
          data.categories = this.filters.selectedCategory
            .map((x) => x.category_id)
            .toString();
          if (this.filters.selectedSubCategory) {
            data.sub_category_id = this.filters.selectedSubCategory.value?.toString();
          }
        }
        else {
          if (this.selectedCategory?.value) {
            data.categories =
              this.selectedCategory.length == 0
                ? ""
                : this.selectedCategory?.value?.toString();
            data.sub_category_id = this.selectedSubCategory?.value
          } else {
            data.categories = this.selectedCategory
              ? this.selectedCategory.value?.toString()
              : "";
          }
        }
        if (this.filters && this.filters.item_attributes) {
          data.item_attributes = this.filters.item_attributes
        }
      }

      if (this.tile_view) {
        data.displaySpinner = true
      }


      if (data.categories == "2") {
        this.show_combine = false;
      } else {
        this.show_combine = true;
      }
      await this.itemService.get(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.showFilters = true;
            if (this.is_superAdmin == true) {
              if (this.comboval != 2) {
                if (!this.masterList) {
                  if (this.subCategoryList.length > 0) {
                    this.subCategoryList[0].label = "All (" + response.count + ")";
                  }
                }
              }
            }

            if (response.data != undefined) {
              var data = {
                items: response.data,
              };
              this.checkCategoryData = response.data
            }

            this.spinnerService.hide()

            if (!this.tile_view) {
              this.CategoryGridData = []
              this.CategoryGridData.push(data);
            }
            else {
              if (this.page == 1) {
                this.CategoryGridData = []
                this.CategoryGridData.push(data);
              }
              else {
                response.data.forEach(element => {
                  this.CategoryGridData[0]?.items.push(element)
                });
              }
            }
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
            if (response.data != undefined) {
              this.CategoryGridData[0]?.items.forEach((Item: any) => {
                if (this.masterList) {
                  Item.SelectedItem = false;
                }

                var varientInitialcount = 0;
                Item.item_variants.forEach((varients) => {
                  varients.unit_quantity = parseFloat(varients.unit_quantity);
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

                if (Item.SelectedItemVarient.out_of_stock == 1) {
                  Item.out_of_stock = 1
                }
                varientInitialcount = varientInitialcount + Item.item_variants?.length;
              });
            }

            if (this.CategoryGridData[0]?.items?.length == 1) {
              this.dropdown_position = "bottom"
            }
            this.no_data = false;
            this.count = response.count;
            this.applyCss();
            this.spinner = false;
            this.cdr.detectChanges();
          }
          else {
            var filterData = response.filter_data;
            this.init_filter_data = filterData;
            this.spinnerService.hide();
            this.spinner = false;
            this.showFilters = true;
            this.postDataFilter = true
            this.init_filter_data = response.filter_data;
            this.toastr.error(this.translate.instant(response.message));
            this.no_data = true;
            this.count = 0;
            this.total_count = 0;
            this.CategoryGridData = [];
          }

        },
        error: (error) => {
        },
        complete: () => { },
      });
    }
  }

  //last 5 elements should get the css as false
  applyCss() {
    let countTotal = this.CategoryGridData[0]?.items?.length;
    let applyUntill = null;
    if (countTotal > 5) {
      applyUntill = countTotal - 5;
    }
    for (let i = 0; i < countTotal; i++) {
      if (i < (applyUntill)) {
        this.CategoryGridData[0].items[i].applyCss = true;
      } else {
        this.CategoryGridData[0].items[i].applyCss = false;
      }
    }
    this.cdr.detectChanges();
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

          this.seller_list = this.seller_list.sort((a, b) => a.store_name.localeCompare(b.store_name));
          var selected_store: any = JSON.parse(localStorage.getItem("selected_store_item_list"));
          if (selected_store != undefined && selected_store != null) {
            this.selectedSeller = selected_store;
            this.iseatery = this.selectedSeller.iseatery;
          } else {
            this.selectedSeller = response.data[0];
            this.iseatery = this.selectedSeller.iseatery;
          }

          this.category_customer_icon =
            this.selectedSeller.category_customer_icon;
          localStorage.setItem("selectedStore", JSON.stringify(this.selectedSeller));
          localStorage.setItem("selected_store_item_list", JSON.stringify(this.selectedSeller));
          this.getCategoryList();
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {
      },
    });
  }

  async getCategoryList(label?: any) {
    var categoryList = [];
    var preSearchCats: any = cloneDeep(this.category_list);
    this.category_list = [];
    let data: any = {
      store_id:
        this.is_superAdmin == true
          ? this.selectedSeller.store_id
          : this.main.LoggedUserStoreInfo.store_id,
    };

    // var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      // search = this.search;
      data.searchQuery = this.search;
    }

    await this.categoryService.get(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (label == 'postSearch') {
            this.postSearch(response, preSearchCats);
          } else {
            categoryList = cloneDeep(response.data);
            for (var i = 0; i < response.data?.length; i++) {
              if (response.data[i].count == 0 || response.data[i].category_id == 1 || response.data[i].category_id == 2) {
                response.data.splice(i, 1);
                i--;
              }
            }

            this.categoryListLocal = response.data;
            this.category_list_for_rearrange = response.data;
            if (categoryList?.length > 0) {
              var allCategory = {
                label: "All (0)", value: 0
              }
              var allCatCount = 0;
              var variantAllCatCount = 0;
              this.category_list.push(allCategory);

              categoryList.forEach(item => {
                var categoryLable = item.category_name + ' (' + item.count + ')';
                var variantCategoryLable = item.category_name + ' (' + item.variants_count + ')';
                var data = { label: categoryLable, variantLabel: variantCategoryLable, value: item.category_id, image: item.category_id == 2 ? this.general_setting.combo_category_image : item.category_id == 1 ? this.general_setting.best_seller_category_image : item.category_image, sub_categories: item.sub_categories, count: item.count, variants_count: item.variants_count };
                if (item.count > 0) {
                  allCatCount += item.category_id == 1 ? 0 : item.count;
                  variantAllCatCount += item.category_id == 1 ? 0 : item.variants_count;
                  this.category_list[0].label = 'All (' + allCatCount + ')';
                  this.category_list[0].variantLabel = 'All (' + variantAllCatCount + ')';
                  this.category_list.push(data);
                }
              });
              if (this.selectedCategoryTab > 0) {
                this.selectedCategory = this.category_list[this.selectedCategoryTab];
              }
              else if (this.selectedCategory?.length == undefined) {
                this.selectedCategory = this.category_list[0];
              }
            }
            this.getSubCategoryList();
            if (label == 'rearrange') {
              const modalRef = this.modalService.open(RearrangeItemsComponent, {
                size: "lg-600",
                backdrop: 'static'
              });

              modalRef.componentInstance.categoryList = this.category_list_for_rearrange;
              if (this.is_superAdmin == true) {
                var storeId: any = {
                  store_id: this.selectedSeller.store_id
                }
                modalRef.componentInstance.storeId = storeId;
              }
              modalRef.result.then(() => {
                location.reload();
              });
            }
          }
        } else {
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  async getInitialCategoryList() {
    let data: any = {
      store_id: 199,
    };

    await this.categoryService.get(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.initialcat = response.data;
          if (this.is_superAdmin == true) {
            this.getSearchHistory();
          }
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  getSubCategoryList() {
    if (!this.masterList) {
      this.subCategoryList = [];

      let data: any = {
        store_id:
          this.is_superAdmin == true
            ? this.selectedSeller.store_id
            : this.main.LoggedUserStoreInfo.store_id,
        category_id:
          this.selectedCategory?.length == 0
            ? ""
            : this.selectedCategory?.value?.toString(),
      };

      this.subCategoryService.get(data).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            let subCategoryListLocal = response.data;

            var allsubCategory = {
              label: "All (0)",
              value: 0,
            };
            var allCatCount = 0;
            this.subCategoryList.push(allsubCategory);
            if (this.comboval != 2) {
              subCategoryListLocal.forEach((item, count) => {

                var categoryLable =
                  item.sub_category_name + " (" + item.count + ")";
                var data = {
                  label: categoryLable,
                  value: item.sub_category_id,
                  category_id: item.category_id,
                  sub_category_name: item.sub_category_name
                };

                if (item.count > 0) {
                  allCatCount += item.count;
                  if (this.selectedCategory.value == 0) {
                    this.subCategoryList[0].label = this.category_list[0].label;
                  } else {
                    this.subCategoryList[0].label = "All (" + allCatCount + ")";
                  }
                  this.subCategoryList.push(data);
                }
              });
            }
            if (this.selectedSubCategoryTab > 0) {
              this.selectedSubCategory = this.subCategoryList[this.selectedSubCategoryTab];
            } else {
              this.selectedSubCategory = this.subCategoryList[0];
            }
            this.getItemList(this.page);
          } else {
            this.getItemList(this.page);
          }
        },
        error: (error) => {
        },
        complete: () => { },
      });
    } else {
      this.getItemList(this.page);
    }
  }

  changeVariantType(item: any) {
    this.CategoryGridData[0].items.forEach(element => {
      if (element.SelectedItemVarient.item_variants_id == item.item_variants_id) {
        element.out_of_stock = item.out_of_stock == 0 ? "0" : "1"
      }
    });
  }

  localStorageSetData() {
    var obj = {
      page: this.page,
      search: this.search,
      listdataBySearch: this.filters,
      filterdata: this.filters,
      sortKey: this.sortKey,
      changeEditItemIdData: false,
      adminStoreId: this.storeId,
      selectedCategoryTab: this.selectedCategoryTab,
      selectedSubCategoryTab: this.selectedSubCategoryTab
    };

    localStorage.setItem("seller_item_list_obj", JSON.stringify(obj));

    if (this.is_superAdmin == true) {
      localStorage.setItem(
        "selectedstore",
        JSON.stringify(this.selectedSeller)
      );
    }
  }

  public onSelectedCategoryIndexChange(tabIndex: number) {
    this.selectedCategoryTab = tabIndex;
  }

  public onSelectedSubCategoryIndexChange(tabIndex: number) {
    this.selectedSubCategoryTab = tabIndex;
  }

  editItem(categoryItemData) {
    localStorage.setItem("item_grid_display", this.tile_view);
    if (!this.masterList) {
      localStorage.setItem("item_variant_display", this.showCombineVarient);
    } else {
      localStorage.setItem("item_variant_display_master", this.formGroup.value.showCombineVarient);
    }

    this.cryptoService.encryptIdValue(categoryItemData.store_id.toString(), "selectedStoreId" + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
    this.editCategoryId = categoryItemData;
    this.localStorageSetData();
    this.changeEditItemId = categoryItemData.is_combo == "true" || categoryItemData.is_combo == true || categoryItemData.is_combo == 1 ? true : false;

    if (this.changeEditItemId == true) {
      this.cryptoService.clearCookie("itemComboId" + this.main.LoggedUserStoreInfo.store_id.toString())
      this.cryptoService.encryptIdValue(
        categoryItemData.item_id.toString(),
        "itemComboId" + this.main.LoggedUserStoreInfo.store_id.toString(),
        this.main.CryptoKey
      );
      this.router.navigate(["/items/comboitemedit"]);
    } else {
      if (this.is_superAdmin) {
        this.cryptoService.clearCookie("adminitemid" + this.main.LoggedUserInfo.role_id.toString())
        this.cryptoService.encryptIdValue(
          categoryItemData.item_id.toString(),
          "adminitemid" + this.main.LoggedUserInfo.role_id.toString(),
          this.main.CryptoKey
        );
        if (!this.masterList) {
          this.router.navigate(["/items/edit-adminitem"]);
        } else {
          localStorage.setItem("selectedStore", JSON.stringify(this.selectedSeller))
          this.router.navigate(["/items/edit-master-adminitem"]);
        }
      } else {
        this.cryptoService.clearCookie("selleritemid" + this.main.LoggedUserStoreInfo.store_id.toString())
        this.cryptoService.encryptIdValue(
          categoryItemData.item_id.toString(),
          "selleritemid" + this.main.LoggedUserStoreInfo.store_id.toString(),
          this.main.CryptoKey
        );
        this.router.navigate(["/items/item-edit"]);
      }
    }
    this.cdr.detectChanges();
  }

  exportItemModelOpen() {
    const modalRef = this.modalService.open(ExportItemDlModelComponent, {
      size: "md",
      centered: true
    });
    var data: any = {};
    if (this.is_superAdmin == true) {
      data.store_id = this.selectedSeller.store_id;
      data.user_id = this.main.LoggedUserInfo.user_id;
      data.category_id = this.selectedCategory?.length == 0
        ? ""
        : this.selectedCategory?.value;
      data.sub_category_id = this.selectedSubCategory?.value
      data.search_query = this.search
    } else {
      data.store_id = this.main.LoggedUserStoreInfo.store_id;
      data.user_id = this.main.LoggedUserInfo.user_id;
    }
    modalRef.componentInstance.data = data;
    modalRef.componentInstance.main = this.main;
  }

  openfilter() {
    var hide_sub_category = true;
    if (this.selectedSubCategory) {
      if (this.selectedSubCategory.value == 0) {
        hide_sub_category = false;
      }
    }

    var tempcat: any
    var hide_cat = true
    if (this.selectedCategory.value != 0 && this.init_filter_data?.categories != null) {
      tempcat = this.categoryListLocal.filter((x) => x.category_id == this.selectedCategory.value)
      if (this.filters) {
        this.filters.selectedCategory = tempcat;
      }
    }
    const modalRef = this.modalService.open(ItemFilterComponent, {
      size: "md",
      backdrop: 'static'
    });

    if (this.selectedCategory == 0 && this.init_filter_data?.categories != null) {
      hide_cat = false
    }
    modalRef.componentInstance.hide_sub_category = hide_sub_category;
    modalRef.componentInstance.Hide_Category = hide_cat;
    modalRef.componentInstance.selected_sub_cat = this.selectedSubCategory;

    if (!this.filters) {
      modalRef.componentInstance.selectedcat = tempcat;
    }

    modalRef.componentInstance.appComponent = this.appComponent;
    modalRef.componentInstance.postFilter = this.postDataFilter
    modalRef.componentInstance.init_filter_data = cloneDeep(this.init_filter_data);
    modalRef.componentInstance.filters = cloneDeep(this.filters);
    modalRef.componentInstance.selectedsort = this.sorted;

    var itemFlagData = true
    modalRef.componentInstance.itemFlag = itemFlagData

    modalRef.componentInstance.appliedFilters.pipe(takeUntil(this.destroy$)).subscribe((filterData) => {
      this.filters = filterData;
      this.clearFilter = false;

    });
    modalRef.componentInstance.filterCleared.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.postDataFilter = false;
      this.clearFilter = data;
      this.filters = {};
    });

    modalRef.componentInstance.sort.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.sorted = data
      if (data == 1) {
        this.sortKey = "item_name";
        this.isOrderBy = 1;
      }
      if (data == 0) {
        this.sortKey = "item_name";
        this.isOrderBy = 2;
      }
      if (data == 2) {
        this.sortKey = "item_price";
        this.isOrderBy = 1;
      }
      if (data == 3) {
        this.sortKey = "item_price";
        this.isOrderBy = 2;
      }
    });

    modalRef.result.then((data) => {
      this.getItemList(1);
    });
  }

  changeSeller(item: any) {
    this.iseatery = item.iseatery;
    this.item_approval_shop_type_string = this.general_setting != undefined ?
      this.general_setting.item_approval_shop_type : this.main.item_approval_shop_type;

    this.item_approval_shop_type_string = this.item_approval_shop_type_string == null ?
      '' : this.item_approval_shop_type_string;

    if (item.iseatery == 0) {
      var itemApprovalShopType = this.item_approval_shop_type_string
        .toString()
        .split(",");
      var filterSubcategory = itemApprovalShopType.filter(
        (shopType) => shopType == item.store_category_id
      );

      if (filterSubcategory?.length > 0) {
        this.iseatery = 1;
      }
    }
    this.userId = item.user_id;
    this.storeId = item.store_id;
    this.selectedCategory = {};
    this.category_list = [];
    this.category_customer_icon = item.category_customer_icon;
    this.CategoryGridData = []
    localStorage.setItem("selectedStore", JSON.stringify(item));
    localStorage.setItem("selected_store_item_list", JSON.stringify(item));
    localStorage.setItem("adminselectedstore", item.store_id);
    this.cryptoService.clearCookie("selectedStoreId" + this.main.LoggedUserInfo.role_id.toString());
    this.cryptoService.encryptIdValue(item.store_id.toString(), "selectedStoreId" + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
    this.getCategoryList();
  }

  tabChanged(event) {
    this.is_subcat_visible = event.index;
    this.selectedSubCategoryTab = 0;
    localStorage.setItem("seller_Order_obj", JSON.stringify(this.is_subcat_visible))
    var category: any = this.category_list[event.index];
    this.changeCategory(category);
  }

  changeCategory(category: any) {
    this.comboval = category?.value
    this.subCategoryList = [];
    this.selectedCategory = category;
    if (this.selectedCategory?.sub_categories) {
      category.sub_categories = category?.sub_categories?.filter((x) => x.count > 0)
      // DO NOT REMOVE BELOW COMMENTED CODE

      // this.selectedCategory.sub_categories.splice(0, 0, {
      //   sub_category_id: 0,
      //   sub_category_name: "All"
      // })
      this.subCategoryList = this.selectedCategory.sub_categories;
    }
    localStorage.setItem("adminselectedcategory", this.selectedCategory?.value);
    this.CategoryGridData = []

    // DO NOT REMOVE BELOW COMMENTED CODE

    // this.getSubCategoryList();

    let subCategoryListLocal = cloneDeep(this.subCategoryList);
    this.subCategoryList = [];
    var allsubCategory = {
      label: "All (0)",
      value: 0,
    };
    var allCatCount = 0;
    var variantAllCatCount = 0;
    this.subCategoryList.push(allsubCategory);
    if (this.comboval != 2) {
      subCategoryListLocal.forEach((item, count) => {

        var categoryLable = item.sub_category_name + " (" + item.count + ")";
        var variantSubCategoryLable = item.sub_category_name + ' (' + item.variants_count + ')';

        var data = {
          label: categoryLable,
          variantLabel: variantSubCategoryLable,
          value: item.sub_category_id,
          category_id: item.category_id,
          sub_category_name: item.sub_category_name,
          count: item.count,
          variants_count: item.variants_count
        };

        if (item.count > 0) {
          allCatCount += item.count;
          variantAllCatCount += item.variants_count;

          // if (this.selectedCategory.value == 0) {
          //   this.subCategoryList[0].label = this.category_list[0].label;
          // } else {
          //   this.subCategoryList[0].label = "All (" + allCatCount + ")";
          // }
          this.subCategoryList[0].label = 'All (' + allCatCount + ')';
          this.subCategoryList[0].variantLabel = 'All (' + variantAllCatCount + ')';
          this.subCategoryList.push(data);
        }
      });
    }

    if (this.selectedSubCategoryTab > 0) {
      this.selectedSubCategory = this.subCategoryList[this.selectedSubCategoryTab];
    } else {
      this.selectedSubCategory = this.subCategoryList[0];
    }
    this.getItemList(this.page);
  }

  tabChanged_sub(event) {
    var subcat: any = this.subCategoryList[event.index];
    this.changeSubCategory(subcat);
  }

  changeSubCategory(subCategory: any) {
    this.selectedSubCategory = subCategory;
    localStorage.setItem(
      "adminselectedsubcategory",
      this.selectedSubCategory?.value
    );
    this.getItemList(1);
  }

  discountPriceCondition(discountPrice, price) {
    return this.priceService.discountPriceCondition(discountPrice, price);
  }

  shareUrl(itemDetail) {
    var Url = this.general_setting.website_url;
    this.UrL =
      Url +
      "/store/" +
      itemDetail.store_slug +
      "/" +
      itemDetail.store_id +
      "/i/" +
      itemDetail.item_slug +
      "/" +
      itemDetail.item_id;
    this.whatsapp_url =
      "https://api.whatsapp.com/send/?phone&text=" + this.UrL + "&app_absent=0";
    const modalRef = this.modalService.open(shareURLComponent);
    modalRef.componentInstance.UrL = this.UrL;
    modalRef.componentInstance.whatsappURL = this.whatsapp_url;
  }

  outOfStoke(Item, flag) {
    if (Item.used_in_combo == 1 && flag == true) {
      var message =
        "The Item is currently used for Combo. By making this Out of Stock all the Combo which are using this Item will also be set as Out of Stock.";
      this.outOfStokeConfirm(Item, flag, message);
    } else if (Item.used_in_combo == 1 && flag == false) {
      var message =
        "The Item is currently used for Combo which may be already set for Out of Stock. By making this Item In-Stock it will not automatically set those Combo In-Stock. You will have to manually do the same.";
      this.outOfStokeConfirm(Item, flag, message);
    } else {
      this.outOfStokeAPICall(Item, flag);
    }
  }

  outOfStokeConfirm(Item, flag, message) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant(message),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.outOfStokeAPICall(Item, flag);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  outOfStokeAPICall(Item, flag) {
    this.spinnerService.show()
    var FormArrayData = [
      {
        item_id: Item.item_id,
        item_variants_id: Item.SelectedItemVarient.item_variants_id,
        out_of_stock: flag == true ? 1 : 0,
      },
    ];

    let fd = new FormData();
    fd.append("is_combo", "1");
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("item_array", JSON.stringify(FormArrayData));

    if (this.is_superAdmin) {
      fd.append("store_id", this.selectedSeller.store_id);
    } else {
      fd.append(
        "store_id",
        this.main.LoggedUserStoreInfo.store_id
          ? this.main.LoggedUserStoreInfo.store_id
          : this.session_store_id
      );
    }
    var newData = fd;

    this.itemService.outOfStockItem(newData).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (flag == true) {
            Item.SelectedItemVarient.out_of_stock = 1;
          } else {
            Item.SelectedItemVarient.out_of_stock = 0;
          }
          this.cdr.detectChanges()
          this.toastr.success(response.message);
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

  manageFeaturedType(item, flag) {
    let fd = new FormData();
    fd.append("featured_type", flag ? "1" : "0");
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("item_id", item.item_id);

    if (this.is_superAdmin) {
      fd.append("store_id", this.selectedSeller.store_id);
    } else {
      fd.append(
        "store_id",
        this.main.LoggedUserStoreInfo.store_id
          ? this.main.LoggedUserStoreInfo.store_id
          : this.session_store_id
      );
    }

    this.itemService.manageFeaturedType(fd).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (item.featured_type == 1) {
            item.featured_type = 0;
          } else {
            item.featured_type = 1;
          }
          this.getItemList(this.page)
          this.getCategoryList();
          this.toastr.success(response.message);
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

  changeItemPrice(item) {
    this.localStorageSetData();
    this.cryptoService.encryptIdValue(
      item.item_id.toString(),
      "ItemList_item_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.encryptIdValue(
      item.SelectedItemVarient.item_variants_id.toString(),
      "Selected_Item_variant_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/items/change-price"]);
  }

  manageMaskPrice(Item, flag) {
    let data: any = {};
    var FormArrayData = [
      {
        item_id: Item.item_id,
        item_variants_id: Item.SelectedItemVarient.item_variants_id,
        mask_price: flag ? 1 : 0,
      },
    ];
    data.user_id = this.main.LoggedUserInfo.user_id;
    data.item_array = FormArrayData;
    let storeId;
    if (this.is_superAdmin == true) {
      storeId = this.selectedSeller.store_id;
    } else {
      storeId = this.main.LoggedUserStoreInfo.store_id
        ? this.main.LoggedUserStoreInfo.store_id
        : this.session_store_id;
    }
    data.store_id = storeId;

    var fd = new FormData();
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("item_array", JSON.stringify(FormArrayData));
    fd.append("store_id", storeId);

    this.itemService.manageMaskPrice(fd).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (Item.SelectedItemVarient.hide_variant == 1) {
            Item.SelectedItemVarient.hide_variant = 0;
          } else {
            Item.SelectedItemVarient.hide_variant = 1;
          }
          this.toastr.success(response.message);
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

  deleteItem(itemId) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_ITEM"),
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
    let fd = new FormData();
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("item_id", itemId);

    if (this.is_superAdmin) {
      fd.append("store_id", this.selectedSeller.store_id);
    } else {
      fd.append(
        "store_id",
        this.main.LoggedUserStoreInfo.store_id
          ? this.main.LoggedUserStoreInfo.store_id
          : this.session_store_id
      );
    }

    this.itemService.deleteItem(fd).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.getItemList(this.page);
          this.toastr.success(response.message);
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

  sortAPISide(columnName) {
    this.sortKey = columnName;
    if (this.isOrderBy == 1) {
      this.isOrderBy = 2
    }
    else {
      this.isOrderBy = 1
    }
    this.getItemList(this.page);
  }

  rearrangeItem() {
    this.getCategoryList('rearrange');
  }

  addEditVariant() {
    const modalRef = this.modalService.open(AddEditVariantModelComponent, {
      size: "w-1300",
    });
    modalRef.componentInstance.main = this.main;
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }

  scrollTabs(event) {
    const children = this.tabGroup._tabHeader._elementRef.nativeElement.children;
    const back = children[0];
    const forward = children[2];
    if (event.deltaY > 0) {
      forward.click();
    } else {
      back.click();
    }
  }

  subCategoryScrollTabs(event) {
    const children = this.sub_cat_tabGroup._tabHeader._elementRef.nativeElement.children;
    const back = children[0];
    const forward = children[2];
    if (event.deltaY > 0) {
      forward.click();
    } else {
      back.click();
    }
  }

  getInitials(name) {
    var canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = 35;
    canvas.height = 35;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    context.fillStyle = "#476ce8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "18px Arial";
    context.fillStyle = "#FFFFFF";
    context.textAlign = "left";
    var nameArray = name.split(" ");
    var initials = "";
    initials = initials + nameArray[0][0];
    initials = initials == "undefined" ? "U" : initials;
    if (initials?.length > 1) {
      context.fillText(initials.toUpperCase(), 13, 22);
    } else {
      context.fillText(initials.toUpperCase(), 13, 22);
    }
    var data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }

  changeView(value) {
    if (this.masterList) {
      this.checkall = false;
      this.formGroup.controls["checkall_grid"].setValue(false);
      this.selectAllItem();
    }
    this.spinner = false;
    this.tile_view = value;
    if (this.search !== '') {
      (<HTMLInputElement>document.getElementById("searchevt")).value = ''
      this.search = '';
    }
    this.getItemList(1)
  }

  onScroll(e: any) {
    this.scrolling = true;
    this.scrollTop = e.srcElement.scrollTop;
    this.scrollHeight = e.srcElement.scrollHeight;
    this.elementHeight = e.srcElement.clientHeight;

    var temp = this.scrollHeight - (this.elementHeight + this.scrollTop);
    if (temp < 5) {
      this.atBottom = true;
      this.handleScrollBottom();
    } else {
      this.atBottom = false;
    }
    setTimeout(() => { this.scrolling = false; }, this.scroll_timeout);
  }

  handleScrollBottom() {
    if (this.total_count !== this.CategoryGridData[0]?.items?.length) {
      var nextPage = this.page + 1;
      if (this.total_count >= 30) {
        this.getItemList(nextPage);
      } else {
        this.spinner = false;
        this.atBottom = false;
        this.no_data = false;
      }
    }
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      showCombineVarient: new UntypedFormControl(true),
      filter: new UntypedFormControl(0),
      checkall_grid: new UntypedFormControl(false)
    });
    var variant_display: any = localStorage.getItem("item_variant_display_master");
    if (this.masterList && (variant_display != null && variant_display != undefined)) {
      variant_display = variant_display == 'true' ? true : false;
      this.formGroup.controls['showCombineVarient'].setValue(variant_display);
    }
  }

  //get store type list
  async storeTypeListRecord() {
    var data = {
      token_type: 1,
    };
    await this.commonService.getMasterCategoryList(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var storetypelist = response.data;
          storetypelist.forEach((element) => {
            this.StoreList.push(element);
          });
          var selected_store_type = JSON.parse(localStorage.getItem("seleceted_store_type"));
          if (selected_store_type) {
            this.SelectedStoreType = selected_store_type.category_id;
            this.selected_store_id = selected_store_type.store_id;
            this.selectedSeller = selected_store_type
          } else {
            this.SelectedStoreType = this.StoreList[0].category_id;
            this.selected_store_id = this.StoreList[0].store_id;
            this.selectedSeller = this.StoreList[0]
          }

          localStorage.setItem("selectedStore", JSON.stringify(this.selectedSeller));
          localStorage.setItem("seleceted_store_type", JSON.stringify(this.selectedSeller));
          this.getCategoryList();
          this.cdr.detectChanges();
        } else {
        }
      },
      error: (error) => {
      },
      complete: () => { },
    });
  }

  //get store type id
  getStoreTypeId(item: any) {
    var temp = this.StoreList.filter((x) => x.category_id == this.SelectedStoreType)[0];
    this.selectedSeller = temp
    localStorage.setItem("selectedStore", JSON.stringify(this.selectedSeller));
    localStorage.setItem("seleceted_store_type", JSON.stringify(this.selectedSeller));
    this.cryptoService.clearCookie("selectedStoreId" + this.main.LoggedUserInfo.role_id.toString());
    this.cryptoService.encryptIdValue(this.selectedSeller.store_id.toString(), "selectedStoreId" + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
    this.getCategoryList();
  }

  // active and inactive
  itemActiveInActive(activeInactiveFlag) {
    var Items = [];
    if (!this.formGroup.value.showCombineVarient) {
      this.CategoryGridData[0].items.forEach((Item) => {
        if (Item.SelectedItem == true) {
          var item = {
            item_variants_id: Item.item_variants[0].item_variants_id,
            is_active: activeInactiveFlag,
          };
          Items.push(item);
        }
      });
    } else {
      for (var i = 0; i < this.CategoryGridData[0].items?.length; i++) {
        if (this.CategoryGridData[0].items[i].SelectedItem == true) {
          var item = {
            item_id: this.CategoryGridData[0].items[i].item_id,
            is_active: activeInactiveFlag,
          };
          Items.push(item);
        }
      }
    }
    this.defaultItemListActiveInActive(Items);
  }

  //select combine view
  showCombineVarientList() {
    this.getItemList(this.page);
  }

  defaultItemListActiveInActive(Items) {
    var fd = {
      items: Items,
      user_id: this.main.LoggedUserInfo.user_id,
    };

    this.itemService.defaultItemActiveInActive(fd).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.checkall = false;
          this.formGroup.controls['checkall_grid'].setValue(false);
          this.toastr.success(response.message);
          this.getItemList(this.page);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //check all
  selectAllItem() {
    if (this.tile_view) {
      this.checkall = this.formGroup.value.checkall_grid;
    }
    if (this.checkall == true) {
      this.CategoryGridData[0].items.forEach((category) => {
        category.SelectedItem = true;
      });
    }
    if (this.checkall == false) {
      this.CategoryGridData[0].items.forEach((category) => {
        category.SelectedItem = false;
      });
    }
  }

  //details modal
  itemDetailsModal(itemId: any) {
    this.spinnerService.show();
    const modalRef = this.modalService.open(ItemDescriptionComponent, {
      size: "lg-950",
      centered: true,
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.itemId = itemId;
    modalRef.componentInstance.show_price_same_font = this.show_price_same_font;
    modalRef.componentInstance.is_display_item_type = this.SelectedStoreType.item_type;
    this.cdr.detectChanges();
  }

  closeImagePreview() {
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
    $(
      "<style>.mat-form-field-appearance-outline .mat-form-field-outline {  margin-top:" +
      "0px" +
      " !important;  margin-bottom:" +
      "0px" +
      " !important;}</style>"
    ).appendTo("body");
  }

  sideMenuClose() {
    var sidebarOpne: any = true;
    sidebarOpne = localStorage.getItem('sidebarOpen');
    return sidebarOpne;
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
    if (this.masterList) {
      if (this.main.LoggedUserInfo.role_id == 1) {
        data.module_key = '15'
      }
      if (this.main.LoggedUserInfo.role_id == 6) {
        data.module_key = '15'
      }
      if (this.main.LoggedUserInfo.role_id == 2) {
        data.module_key = '15'
      }
    } else {
      if (this.main.LoggedUserInfo.role_id == 1) {
        data.module_key = '17'
      }
      if (this.main.LoggedUserInfo.role_id == 6) {
        data.module_key = '17'
      }
      if (this.main.LoggedUserInfo.role_id == 2) {
        data.module_key = '112'
      }
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

  getUnites(packaging_name, unit_quantity, unit_name) {
    var unit: any;
    if (packaging_name && unit_quantity && unit_name) {
      unit = packaging_name + ' ' + unit_quantity + ' ' + unit_name
    }
    if (packaging_name && !unit_quantity && !unit_name) {
      unit = packaging_name
    }
    if (!packaging_name && unit_quantity && unit_name) {
      unit = unit_quantity + ' ' + unit_name
    }
    return unit;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e: any) {
    this.scrolling = true;
    this.scrollTop = e.srcElement.documentElement.scrollTop;
    this.scrollHeight = e.srcElement.documentElement.scrollHeight;
    this.elementHeight = e.srcElement.documentElement.clientHeight;

    var temp = this.scrollHeight - (this.elementHeight + this.scrollTop);
    if (temp < 5) {
      this.atBottom = true;
      this.myFunction(true);
    } else {
      this.atBottom = false;
    }
    setTimeout(() => { this.scrolling = false; }, this.scroll_timeout);
  }

  myFunction(scrollingDown: boolean) {
    if (scrollingDown && this.tile_view) {
      this.handleScrollBottom();
    } else {
    }
  }

  scrool_to_first() {
    try {
      const errorField = this.renderer.selectRootElement('.first-item');
      errorField.scrollIntoView();
    } catch (err) {

    }

    this.gotoTop();
  }

  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  getSearch(search) {
    this.CategoryGridData = []
    this.search = search;
    this.getCategoryList('postSearch');
  }

  postSearch(response, preSearchCats) {
    var preSearchSubCats: any = cloneDeep(this.subCategoryList);
    var categoryList: any = cloneDeep(response.data);
    for (var i = 0; i < response.data?.length; i++) {
      if (response.data[i].count == 0 || response.data[i].category_id == 1 || response.data[i].category_id == 2) {
        response.data.splice(i, 1);
        i--;
      }
    }

    // Category Section
    this.categoryListLocal = response.data;
    this.category_list_for_rearrange = response.data;
    if (categoryList?.length > 0) {
      var allCategory = {
        label: "All (0)", value: 0
      }
      var allCatCount = 0;
      var variantAllCatCount = 0;
      this.category_list.push(allCategory);

      categoryList.forEach(item => {
        let isCatExist: any = preSearchCats.filter((cat: any) => cat.value == item.category_id)[0];
        if (isCatExist) {
          var categoryLable = item.category_name + ' (' + item.count + ')';
          var variantCategoryLable = item.category_name + ' (' + item.variants_count + ')';
          var data = { label: categoryLable, variantLabel: variantCategoryLable, value: item.category_id, image: item.category_id == 2 ? this.general_setting.combo_category_image : item.category_id == 1 ? this.general_setting.best_seller_category_image : item.category_image, sub_categories: item.sub_categories, count: item.count, variants_count: item.variants_count };
          allCatCount += item.category_id == 1 ? 0 : item.count;
          variantAllCatCount += item.category_id == 1 ? 0 : item.variants_count;
          this.category_list[0].label = 'All (' + allCatCount + ')';
          this.category_list[0].variantLabel = 'All (' + variantAllCatCount + ')';
          this.category_list.push(data);
        }
      });
      // var isBestSeller: any = this.category_list.filter((x: any) => x.value == 1)[0];
      // if (!isBestSeller) {
      //   this.selectedCategoryTab = this.selectedCategoryTab - 1;
      // }
      if (this.selectedCategoryTab > 0) {
        this.selectedCategory = this.category_list[this.selectedCategoryTab];
      }
      else if (this.selectedCategory?.length == undefined) {
        this.selectedCategory = this.category_list[0];
      }
    }

    // Sub-Category Section
    this.comboval = this.selectedCategory?.value
    this.subCategoryList = [];
    if (this.selectedCategory?.sub_categories) {
      this.subCategoryList = this.selectedCategory.sub_categories;
    }
    this.CategoryGridData = []
    let subCategoryListLocal = cloneDeep(this.subCategoryList);
    this.subCategoryList = [];
    var allsubCategory = {
      label: "All (0)",
      value: 0,
    };
    var allCatCount = 0;
    var variantAllCatCount = 0;
    this.subCategoryList.push(allsubCategory);
    if (this.comboval != 2) {
      subCategoryListLocal.forEach((item) => {
        let isSubCatExist: any = preSearchSubCats.filter((subCat: any) => subCat.value == item.sub_category_id)[0];
        if (isSubCatExist) {
          var categoryLable = item.sub_category_name + " (" + item.count + ")";
          var variantSubCategoryLable = item.sub_category_name + ' (' + item.variants_count + ')';

          var data = {
            label: categoryLable,
            variantLabel: variantSubCategoryLable,
            value: item.sub_category_id,
            category_id: item.category_id,
            sub_category_name: item.sub_category_name,
            count: item.count,
            variants_count: item.variants_count
          };

          allCatCount += item.count;
          variantAllCatCount += item.variants_count;
          this.subCategoryList[0].label = 'All (' + allCatCount + ')';
          this.subCategoryList[0].variantLabel = 'All (' + variantAllCatCount + ')';
          this.subCategoryList.push(data);
        }
      });
    }

    if (this.selectedSubCategoryTab > 0) {
      this.selectedSubCategory = this.subCategoryList[this.selectedSubCategoryTab];
    } else {
      this.selectedSubCategory = this.subCategoryList[0];
    }
    this.getItemList(1);
  }
}