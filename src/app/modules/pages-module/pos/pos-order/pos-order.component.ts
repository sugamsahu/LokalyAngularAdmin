import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectorRef, Renderer2, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import Swal from 'sweetalert2';
import { AppComponent } from 'src/app/app.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangeCustomerComponent } from '../../model/change-customer/change-customer.component';
import { environment } from 'src/environments/environment';
import { WebCamComponent } from '../../model/web-cam/web-cam.component';
import { CategoryService } from 'src/app/services/lookup/category.service';
import { ItemService } from 'src/app/services/item.service';
import { SortPipe } from '../../util/sort.pipe';
import { cloneDeep } from "lodash";
import { Observable, Subject, debounceTime, distinctUntilChanged, filter, fromEvent, map, startWith, takeUntil, tap } from 'rxjs';
import { SelectComboItemsComponent } from '../../model/select-combo-items/select-combo-items.component';
import { RepeatComboItemsComponent } from '../../model/repeat-combo-items/repeat-combo-items.component';
import { SelectAddonChoicesComponent } from '../../model/select-addon-choices/select-addon-choices.component';
import { RepeatAddonChoiceComponent } from '../../model/repeat-addon-choice/repeat-addon-choice.component';
import { SelectItemDeleteAddonChoiceComponent } from '../../model/select-item-delete-addon-choice/select-item-delete-addon-choice.component';
import { CommonService } from 'src/app/services/common.service';
import { AddOrderService } from 'src/app/services/add-order.service';
import { installHtmlTooltips, trustedTooltipHtml } from "src/app/utils/html-tooltip";
import { PosSeetingService } from "src/app/services/store-management/pos-seeting.service";
import { OrderService } from "src/app/services/order.service";
import * as moment from "moment";
import { AvailableOffersComponent } from '../../model/available-offers/available-offers.component';
import { PosViewBillComponent } from '../../model/pos-view-bill/pos-view-bill.component';
import { Router } from '@angular/router';
import { PosOrderConfirmComponent } from '../../model/pos-order-confirm/pos-order-confirm.component';
import { AddPosCustomerComponent } from '../../model/add-pos-customer/add-pos-customer.component';
import { ItemFilterComponent } from '../../model/item-filter/item-filter.component';
import { FormControl } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { VoiceSearchComponent } from '../../model/voice-search/voice-search.component';
import { ToastrService } from 'ngx-toastr';
import { ItemDescriptionComponent } from '../../model/item-description-model/item-description-model.component';

@Component({
  selector: 'app-pos-order',
  templateUrl: './pos-order.component.html',
  styleUrls: ['./pos-order.component.scss']
})
export class PosOrderComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  customerdetails: any;
  screenfull: boolean = true;
  elem;
  main: any;
  global_currency: any;
  offers_module: any;
  global_timezone: any;
  refund_module: any;
  khata_label: any;
  refund_validity: any;
  show_price_same_font: any;
  store_tax_label: any;
  store_label: any;
  tax_recalculation_offer: any;
  item_tax_type: any;
  sellerDetails: any;
  iseatery: any;
  isdisplayWallet: any;
  walletMaxValue: any;
  cart_group_id: any;
  category_customer_icon: any;
  @ViewChild('tabGroup')
  tabGroup;
  @ViewChild('sub_cat_tabGroup')
  sub_cat_tabGroup;
  selecteditemsqty: number = 0;
  categoryList: any = [];
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  selectedCategory: any = {
    label: "",
    value: "",
  };
  page: number = 1;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  search: string = "";
  count: number = 0;
  tableSize: number = environment.tableSize;
  session_store_id = localStorage.getItem("adminselectedstore");
  totalCount: number = 0;
  categoryGridData: any = [];
  noData: boolean = true;
  gridData: any = [];
  gridDataPage: any = [];
  SelectedQty: number;
  SelectedItemsAddOnsChoices: any = [];
  SelectedItemsCombo: any = [];
  last_used_addon_choice: any;
  selectedItemAddonChoicesLst: any = [];
  isNewAddCombo: boolean = false;
  tax_calculation_address = Number(this.generalSetting.tax_calculation_address);
  deliveryAddress;
  billingAddress;
  orderdetail;
  modelNewItem: any;
  tileview = true;
  interval: AsyncIterable<number>;
  spinner = false
  sortKey: any = "item_name";
  isOrderBy = 1;
  init_filter_data: any;
  filters: any;
  clearFilter: any = true;
  showFilters: boolean = false;
  @ViewChild('scroll') private scr: ElementRef;
  scrollTimeout: number = 100;
  scrollTimer: any;
  scrollTop: number;
  scrollHeight: number;
  elementHeight: number;
  scrolling: boolean = false;
  atBottom: boolean = false;
  sorted: any = 1
  swipeLimitWidth = 80;
  connectEdges = true;
  categoryListLocal: any;
  selectedSubcategory: any
  added_items: any = [];
  subCategoryList: any[];
  SelectedItems: any = [];
  fullScreenDisplay: boolean = false;
  chr_lnth: any = 13;
  is_open_sidebar: boolean = false;
  private destroy$ = new Subject();
  receivedSelectedItems: any[] = [];
  itemtotal: any = 0.00;
  taxAndChargesTotal: any = 0;
  taxPrice: any = 0.00;
  packagingCharges: any = 0;
  grandtotal: any = 0;
  selecteditemscount: number = 0;
  prescription: number = 0;
  originalWalletBalance = 0.0;
  deliverycharge: any = 0;
  storedeliverysettings: any = [];
  taxAndChargesTotalToolTip;
  offer_code;
  settings: any = {};
  wallet_amount = 0.0;
  order_amount: any = 0.00;
  offerPrice: any = 0.00;
  paymentMethod: any;
  newSellerOrder = {
    remarks: '',
    offerCode: '',
    apply_Wallet: false
  }
  walletBalance: any = 0.0;
  offerList = [];
  paymentMethodList: any = [];
  deliverytype = 1;
  paymentM = {
    selected: null
  }
  SelectedAdminSeller: any = null;
  onlysave: any;
  oldcustomerdetails: any;
  is_cart: any;
  balance_due: any = 0.0;
  multipaymentList: any = [];
  mainpaymentMethodList: any = [];
  temp_paymentMethodList: any = [];
  orderitemdetail: any;
  myControl = new FormControl("");
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  searchHistory: any;
  superAdmin: any
  amount_seperator: any;
  constructor(
    public translate: TranslateService,
    @Inject(DOCUMENT) private document: any,
    private appComponent: AppComponent,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private categoryService: CategoryService,
    private itemService: ItemService,
    private sortPipe: SortPipe,
    public commonService: CommonService,
    private addOrderService: AddOrderService,
    public PosSeetingService: PosSeetingService,
    private OrderService: OrderService,
    private router: Router,
    private renderer: Renderer2,
    private cookieService: CookieService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.customerdetails = JSON.parse(localStorage.getItem("customerdetails"));
    this.is_cart = JSON.parse(localStorage.getItem("is_cart"));
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    this.superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (this.superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    installHtmlTooltips(); // HTML only for tooltips built with trustedTooltipHtml()
    this.conditions();
    this.elem = document.documentElement;

    $(
      "<style>.card-body {  padding: 0.75rem !important; padding-top: 0.2rem !important; padding-bottom: 0rem !important}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-form-field-appearance-outline .mat-form-field-outline {  margin-top:" +
      "28px" +
      " !important;  margin-bottom:" +
      "10px" +
      " !important;}</style>"
    ).appendTo("body");

    $(
      "<style>.mat-form-field {width: 100% !important;}</style>"
    ).appendTo("body");

    $(
      "<style>.mat-form-field-infix {width: 100% !important;}</style>"
    ).appendTo("body");

    this.commonService.aClickedEvent
      .subscribe((data: string) => {
        this.redesign(data);
      });
  }

  conditions() {
    if (this.generalSetting) {
      this.global_currency = this.generalSetting.currency_symbol;
      this.offers_module = this.generalSetting.offers_module;
      this.global_timezone = this.generalSetting.timezone;
      this.refund_module = this.generalSetting.refund_module;
      this.khata_label = this.generalSetting.khata_label;
      this.refund_validity = this.generalSetting.refund_validity;
      this.show_price_same_font = this.generalSetting.show_price_same_font;
      this.amount_seperator = this.generalSetting?.amount_seperator;
      this.store_tax_label = this.generalSetting.store_tax_label;
      this.store_label = this.generalSetting.store_label
      this.tax_recalculation_offer = this.generalSetting.tax_recalculation_offer;
      this.item_tax_type = this.generalSetting.item_tax_type;
    }
    else {
      this.global_currency = this.main.currency_symbol;
      this.offers_module = this.main.offers_module;
      this.global_timezone = this.main.generalSetting.timezone;
      this.refund_module = this.main.refund_module;
      this.khata_label = this.main.khata_label;
      this.refund_validity = this.main.refund_validity;
      this.show_price_same_font = this.main.show_price_same_font;
      this.amount_seperator = this.generalSetting?.amount_seperator;
      this.store_tax_label = this.main.store_tax_label;
      this.store_label = this.main.store_label;
      this.tax_recalculation_offer = this.main.tax_recalculation_offer;
      this.item_tax_type = this.main.item_tax_type;

    }
    this.sellerDetails = JSON.parse(localStorage.getItem('loginUserStore'));
    this.iseatery = this.main.LoggedUserStoreInfo.iseatery;
    this.isdisplayWallet = this.generalSetting.allow_wallet;
    this.walletMaxValue = this.generalSetting.max_payment;
    this.customerdetails = JSON.parse(localStorage.getItem('customerdetails'))
    this.cart_group_id = JSON.parse(localStorage.getItem('cart_group_id'))
    this.category_customer_icon = this.main.LoggedUserStoreInfo.category_customer_icon;
    this.main.DateFormate = this.main.DateFormate != this.generalSetting.date_format_web ? this.generalSetting.date_format_web : this.main.DateFormate;
    this.getStoreDeliverySettings();
    this.get_pos_settings();

    if (this.iseatery == 0) {
      this.tileview = false
    }
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.gridDataPage = [];
          this.getItemList(1);
        })
      )
      .subscribe();

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value || ""))
    );

    this.getSearchHistory();
  }

  getSearchHistory() {
    var cookies = this.cookieService.get("pos_recentsearch");
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
    this.cookieService.set("pos_recentsearch", data);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    this.searchFun();

    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
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
    this.cookieService.set("pos_recentsearch", data);
  }

  searchFun() {
    var value = this.myControl.value;
    this.options.forEach((el) => {
      if (value == el) {
        this.search = el;
        this.gridDataPage = [];
        this.getItemList(1);
      }
    });
  }

  redesign(event) {
    this.is_open_sidebar = event;
    if (this.is_open_sidebar && !this.fullScreenDisplay) {
      this.chr_lnth = 15;
    } else {
      this.chr_lnth = 13;
    }
    this.cdr.detectChanges();
  }

  fullScreen() {
    this.screenfull = false;
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
  }

  exitFullScreen() {
    this.screenfull = true;
    if (document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
    }
  }

  //Change customer
  change_customer() {
    var note = this.translate.instant('ANY_OFFER_OR_WALLET_APPLIED_WILL_NOT_BE_SAVED');
    if (this.isdisplayWallet == 0) {
      note = this.translate.instant('ANY_OFFER_APPLIED_WILL_NOT_BE_SAVED');
    }
    if (this.offers_module == 0 || this.main.LoggedUserStoreInfo.offer_module == 0) {
      note = this.translate.instant('WALLET_APPLIED_WILL_NOT_BE_SAVED');
    }
    if (this.isdisplayWallet == 0 && (this.offers_module == 0 || this.main.LoggedUserStoreInfo.offer_module == 0)) {
      note = ''
    }

    Swal.fire({
      title: (note),
      text: this.translate.instant("CONTINUE_?"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("YES"),
      cancelButtonText: this.translate.instant("NO"),
    }).then((result) => {
      if (result.value) {
        this.customerchangeModel();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  //Change customer modal
  customerchangeModel() {
    const modalRef = this.modalService.open(ChangeCustomerComponent, {
      size: "w-1300",
      centered: true,
    });
    modalRef.componentInstance.selected_customer = this.customerdetails;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.selectedcustomer.subscribe(
      (item) => {
        this.customerdetails = item;
        this.oldcustomerdetails = JSON.parse(localStorage.getItem("oldcustomerdetails"));
        this.getItemList(1);
      }
    );
  }

  //clear search
  clearSearch() {
    this.myControl.setValue(null)
    this.gridDataPage = [];
    if (this.search !== '') {
      (<HTMLInputElement>document.getElementById("searchevt")).value = ''
      this.search = '';
      this.getItemList(1);
    }
  }

  public voiceSearch() {
    const modalRef = this.modalService.open(VoiceSearchComponent, {
      size: "md",
      centered: true,
      animation: true,
    });
    modalRef.componentInstance.isVoiceSearch = true;
    modalRef.componentInstance.Voice.subscribe((voice) => {
      if (voice) {
        this.gridDataPage = [];
        (<HTMLInputElement>document.getElementById("searchevt")).value = voice;
        this.myControl.setValue(voice);
        this.search = voice;
        this.getItemList(1);
      }
    });
  }

  openfilter() {
    var hide_sub_category = true;
    if (this.selectedSubcategory) {
      if (this.selectedSubcategory.sub_category_id == 0) {
        hide_sub_category = false;
      }
    }

    var tempcat: any
    var hide_cat = true
    if (this.selectedCategory.value != 0 && this.init_filter_data.categories != null) {
      tempcat = this.categoryListLocal.filter((x) => x.category_id == this.selectedCategory.value)
      if (this.filters) {
        this.filters.selectedCategory = tempcat;
      }
    }
    const modalRef = this.modalService.open(ItemFilterComponent, {
      size: "md",
      backdrop: 'static'
    });
    if (this.selectedCategory.value == 0 && this.init_filter_data?.categories != null) {
      hide_cat = false
    }
    modalRef.componentInstance.hide_sub_category = hide_sub_category;
    modalRef.componentInstance.selected_sub_cat = this.selectedSubcategory;

    modalRef.componentInstance.forPOS = true;
    modalRef.componentInstance.Hide_Category = hide_cat;
    modalRef.componentInstance.init_filter_data = this.init_filter_data;
    if (!this.filters) {
      modalRef.componentInstance.selectedcat = tempcat;
    }
    modalRef.componentInstance.filters = this.filters;
    modalRef.componentInstance.selectedsort = this.sorted;
    modalRef.componentInstance.appliedFilters.subscribe((filterData) => {
      this.filters = filterData;
      this.clearFilter = false;
    });
    modalRef.componentInstance.filterCleared.subscribe((data) => {
      this.clearFilter = data;
      this.filters = {};
    });
    modalRef.componentInstance.sort.subscribe((data) => {
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
      this.gridDataPage = [];
      this.getItemList(1);
    });
  } // to be

  //bar code
  opencam() {
    const modalRef = this.modalService.open(WebCamComponent, {
      size: "md",
      centered: true,
    });
    modalRef.componentInstance.BarCode.subscribe(
      (barcodeValue) => {
        this.getItemData(barcodeValue)
      }
    );
  }

  //bar code get data
  async getItemData(barcode) {
    //test
    this.search = barcode
    this.getItemList(this.page);
  }

  changeView(value) {
    this.spinner = false
    this.tileview = value;
  }

  //change screen size
  fullscreenView() {
    this.fullScreenDisplay = this.fullScreenDisplay == true ? false : true;
    if (this.is_open_sidebar && !this.fullScreenDisplay) {
      this.chr_lnth = 15;
    } else {
      this.chr_lnth = 13;
    }
    this.cdr.detectChanges();
  }

  //Get category list
  getCategoryList() {
    const data: any = {
      store_id: this.loginUserStore.store_id,
      is_pos: 1
    };

    this.categoryService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.categoryListLocal = response.data;
          var allCategory = {
            label: "All",
            value: 0,
            image: "",
            sub_categories: null
          };
          this.categoryList.push(allCategory);
          this.categoryListLocal.forEach((item, i) => {
            if (item.count > 0) {
              var categoryLable = item.category_name;
              var data = { label: categoryLable, value: item.category_id, image: item.category_id == 2 ? this.generalSetting.combo_category_image : item.category_id == 1 ? this.generalSetting.best_seller_category_image : item.category_image, sub_categories: item.sub_categories };
              this.categoryList.push(data);
            }
          });
          this.selectedCategory = this.categoryList[0];

          this.getItemList(1);
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
      },
      complete: () => { },
    });
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

  tabChanged(event) {
    var category: any = this.categoryList[event.index];
    this.changeCategory(category);
  }

  changeCategory(category) {
    this.subCategoryList = []
    this.cdr.detectChanges()
    category.sub_categories = category.sub_categories?.filter((x) => x.count > 0)
    this.filters = undefined
    this.clearFilter = true;
    this.gridDataPage = [];
    this.selectedCategory = category;
    if (this.selectedCategory.sub_categories) {
      this.selectedCategory.sub_categories.splice(0, 0, {
        sub_category_id: 0,
        sub_category_name: "All"
      })
      this.subCategoryList = this.selectedCategory.sub_categories;
    }
    this.selectedSubcategory = this.selectedCategory.sub_categories ? this.selectedCategory.sub_categories[0] : 0;
    this.getItemList(1);
  }

  //Get img
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
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 13, 22);
    } else {
      context.fillText(initials.toUpperCase(), 13, 22);
    }
    var data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }

  sub_cat_scrollTabs(event) {
    const children = this.sub_cat_tabGroup._tabHeader._elementRef.nativeElement.children;
    const back = children[0];
    const forward = children[2];
    if (event.deltaY > 0) {
      forward.click();
    } else {
      back.click();
    }
  }

  tabChanged_sub(event) {
    var subcat: any = this.subCategoryList[event.index];
    this.changeSubCategory(subcat);
  }

  changeSubCategory(subcat) {
    this.filters = undefined
    this.clearFilter = true;
    this.gridDataPage = [];
    this.selectedSubcategory = subcat;
    this.getItemList(1);
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
      this.atBottom = false; // Reset the flag when not at the bottom
    }
    setTimeout(() => { this.scrolling = false; }, this.scrollTimeout);
  }

  handleScrollBottom() {
    if (this.totalCount !== this.gridDataPage.length) {
      var nextPage = this.page + 1;
      if (this.totalCount >= 30) { // last page logic need to be implement when count error fix
        this.getItemList(nextPage);
      } else {
        this.spinner = false;
        this.atBottom = false;
        this.noData = false;
      }
    }
  }

  openSelectAddonChoices(item, addons, choices) {
    const modalRef = this.modalService.open(SelectAddonChoicesComponent, {
      size: "lg",
      centered: true,
      animation: true,
    });
    modalRef.componentInstance.SelectedItems = this.set_adn_chs(item, addons, choices);

    modalRef.componentInstance.SelectedAddonChoicesItem.subscribe((addonChoicesItem) => {
      this.gridDataPage.forEach((item: any) => {
        if (item.item_variants_id == addonChoicesItem.item_variants_id) {
          if (this.settings.pos_min_max == 1) {
            if (addonChoicesItem.quantity == 0 && addonChoicesItem.min_qty != 0) {
              item.quantity = addonChoicesItem.min_qty
            } else {
              item.quantity = addonChoicesItem.quantity + 1
            }
          } else {
            item.quantity = addonChoicesItem.quantity + 1
          }
        }
      });

      addonChoicesItem.discounted_price = addonChoicesItem.discountedprice == undefined ? addonChoicesItem.discounted_price : addonChoicesItem.discountedprice
      var itemChoice = {
        discountedprice: addonChoicesItem.discounted_price,
        discounted_price: addonChoicesItem.discounted_price,
        min_qty: addonChoicesItem.min_qty,
        max_qty: addonChoicesItem.max_qty,
        item_id: addonChoicesItem.item_id,
        item_image: addonChoicesItem.item_image,
        item_name: addonChoicesItem.item_name,
        item_variants_id: addonChoicesItem.item_variants_id,
        packaging: addonChoicesItem.packaging,
        price: addonChoicesItem.price,
        quantity: 1,
        item_price: addonChoicesItem.item_price,
        choices: addonChoicesItem.choices,
        addons: addonChoicesItem.addons,
        tax: addonChoicesItem.tax,
        tax_price: addonChoicesItem.tax_price,
        brand_name: addonChoicesItem.brand_name,
        choices_addons: null,
        combo_variants: addonChoicesItem.combo_variants,
        order_item_id: addonChoicesItem.order_item_id,
        packaging_name: addonChoicesItem.packaging_name,
        unit_name: addonChoicesItem.unit_name,
        unit_quantity: addonChoicesItem.unit_quantity,
        prescription: addonChoicesItem.prescription,
        is_choice_addon: addonChoicesItem.is_choice_addon
      };

      if (this.settings.pos_min_max == 1) {
        if (addonChoicesItem.min_qty != 0) {
          itemChoice.quantity = addonChoicesItem.min_qty
          item.quantity = itemChoice.quantity
        } else {
          item.quantity = itemChoice.quantity;
        }
      } else {
        item.quantity = itemChoice.quantity;
      }

      var price = Number(addonChoicesItem.discounted_price);
      var item_price = Number(addonChoicesItem.item_price);
      var choices_addons = [];

      itemChoice.choices?.forEach((choice: any) => {
        choice.choice_prices.forEach((choicePrice: any) => {
          if (choicePrice.is_added == true) {
            price += Number(choicePrice.price);
            item_price += Number(choicePrice.price);
            choices_addons.push(choice.variant_choice_name + ' : ' + choicePrice.variant_sub_choice_name);
          }
        });
      });

      itemChoice.addons?.forEach((addon: any) => {
        var addonName = '';
        addon.addon_prices.forEach((addonsPrice: any) => {
          if (addonsPrice.is_added == true) {
            price += Number(addonsPrice.price);
            item_price += Number(addonsPrice.price);
            addonName = addonName == '' ? addonsPrice.variant_sub_addon_name : (addonName + ', ' + addonsPrice.variant_sub_addon_name);
          }
        });
        if (addonName != '') {
          choices_addons.push(addon.variant_addon_name + ' : ' + addonName);
        }
      });

      itemChoice.choices_addons = choices_addons;
      itemChoice.discounted_price = Number(price).toFixed(2);
      itemChoice.price = Number(item_price).toFixed(2);
      itemChoice.tax_price = Number(((Number(itemChoice.discounted_price) * itemChoice.tax) / 100) * itemChoice.quantity).toFixed(2)
      this.SelectedItems.push(itemChoice);
      this.selecteditemsqty = 0;

      this.SelectedItems.forEach((item: any) => {
        this.selecteditemsqty = this.selecteditemsqty + item.quantity
        item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
      });

      this.itemtotal = Number(Number(this.itemtotal) + Number(itemChoice.discounted_price * itemChoice.quantity)).toFixed(2);
      this.packagingCharges = Number(this.packagingCharges) + (Number(itemChoice.packaging * itemChoice.quantity));
      this.taxPrice = this.taxPrice + Number(((Number(itemChoice.discounted_price) * itemChoice.tax) / 100) * itemChoice.quantity);
      this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
      this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
      var price = Number(itemChoice.discounted_price * itemChoice.quantity) + Number(((Number(itemChoice.discounted_price) * itemChoice.tax) / 100) * itemChoice.quantity) + (Number(itemChoice.packaging * itemChoice.quantity));
      this.grandtotal = Number(Number(this.grandtotal) + Number(price)).toFixed(2);

      if (this.offer_code) {
        this.ValidOfferCode(this.offer_code)
      }
      else {
        this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
      }
    });
  }

  openLastAddOnChoice() {
    const modalRef = this.modalService.open(RepeatAddonChoiceComponent, {
      size: "md",
      centered: true,
      animation: true,
    });

    modalRef.componentInstance.last_used_addon_choice =
      this.last_used_addon_choice;

    modalRef.componentInstance.repeatOrAdd.subscribe((x) => {
      if (x == 1) {
        this.addNewAddOnChoice();
      } else {
        this.repeatAddOnChoice(x);
      }
    });
  }

  addNewAddOnChoice() {
    var found = this.modelNewItem;
    this.openSelectAddonChoices(found, found.addons, found.choices);
  }

  repeatAddOnChoice(selectedItem) {
    selectedItem.quantity++;
    this.gridDataPage.forEach((item: any) => {
      if (item.item_variants_id == selectedItem.item_variants_id) {
        item.quantity = selectedItem.quantity
      }
    });

    this.selecteditemsqty = 0;
    this.SelectedItems.forEach((item: any) => {
      this.selecteditemsqty = this.selecteditemsqty + item.quantity
      item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
    });

    this.itemtotal = Number(Number(this.itemtotal) + Number(selectedItem.discounted_price)).toFixed(2);
    this.packagingCharges = Number(this.packagingCharges) + (Number(selectedItem.packaging));
    this.taxPrice = this.taxPrice + ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100);
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
    this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);

    var price = Number(selectedItem.discounted_price) + ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100) + (Number(selectedItem.packaging));
    this.grandtotal = Number(Number(this.grandtotal) + Number(price)).toFixed(2);
    if (this.offer_code) {
      this.ValidOfferCode(this.offer_code)
    }
    else {
      this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
    }
  }

  set_adn_chs(item, addons, choices) {
    item.total_Price = 0;
    if (item.choices != null) {
      if (item.choices.length > 0) {
        item.choices.forEach((choice) => {
          for (var i = 0; i < choice.choice_prices.length; i++) {
            if (i == 0) {
              choice.choice_prices[i].is_added = true;
              item.total_Price = Number(
                Number(item.total_Price) + Number(choice.choice_prices[i].price)
              ).toFixed(2);
            } else {
              choice.choice_prices[i].is_added = 0;
            }
          }
        });
      }
    }
    if (item.addons != null) {
      if (item.addons.length > 0) {
        item.addons.forEach((addon) => {
          for (var i = 0; i < addon.addon_prices.length; i++) {
            addon.addon_prices[i].is_added = 0;
          }
        });
      }
    }
    return item;
  }

  openSelectComboItems(item) {
    const modalRef = this.modalService.open(SelectComboItemsComponent, {
      size: "w-1300",
      centered: true,
    });

    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.SelectedItems = item;
    modalRef.componentInstance.SelectedComboItems.subscribe(
      (userSelectedCombo) => {
        this.gridDataPage.forEach((item: any) => {
          if (item.item_variants_id == userSelectedCombo.item_variants_id) {
            item.quantity = userSelectedCombo.quantity + 1
          }
        });

        var itemcombo = {
          discountedprice: userSelectedCombo.discounted_price,
          discounted_price: userSelectedCombo.discounted_price,
          item_id: userSelectedCombo.item_id,
          item_name: userSelectedCombo.item_name,
          item_image: userSelectedCombo.item_image,
          item_variants_id: userSelectedCombo.item_variants_id,
          packaging: userSelectedCombo.packaging,
          price: userSelectedCombo.price,
          quantity: 1,
          choices: userSelectedCombo.choices,
          addons: userSelectedCombo.addons,
          tax: userSelectedCombo.tax,
          tax_price: userSelectedCombo.tax_price,

          brand_name: userSelectedCombo.brand_name,
          choices_addons: null,
          combo_variants: userSelectedCombo.combo_variants,
          order_item_id: userSelectedCombo.order_item_id,
          packaging_name: userSelectedCombo.packaging_name,
          unit_name: userSelectedCombo.unit_name,
          unit_quantity: userSelectedCombo.unit_quantity,
          prescription: userSelectedCombo.prescription,
          is_combo: userSelectedCombo.is_combo
        };
        item.quantity = itemcombo.quantity;
        var price = Number(userSelectedCombo.item_variants[0].item_price);
        var choices_addons = [];

        if (itemcombo.combo_variants) {
          itemcombo.combo_variants.forEach((combo: any) => {
            choices_addons = [];
            combo.choices?.forEach((choice: any) => {
              choice.choice_prices.forEach((choicePrice: any) => {
                if (choicePrice.is_added == true) {
                  price += Number(choicePrice.price);
                  choices_addons.push(choice.variant_choice_name + ' : ' + choicePrice.variant_sub_choice_name);
                }
              });
            });

            combo.addons?.forEach((addon: any) => {
              var addonName = '';
              addon.addon_prices.forEach((addonsPrice: any) => {
                if (addonsPrice.is_added == true) {
                  price += Number(addonsPrice.price);
                  addonName = addonName == '' ? addonsPrice.variant_sub_addon_name : (addonName + ', ' + addonsPrice.variant_sub_addon_name);
                }
              });

              if (addonName != '') {
                choices_addons.push(addon.variant_addon_name + ' : ' + addonName);
              }
            });

            combo.choices_addons = choices_addons;
          });
        }
        else {
          itemcombo.choices.forEach((choice: any) => {
            choice.choice_prices.forEach((choicePrice: any) => {
              if (choicePrice.is_added == true) {
                price += Number(choicePrice.price);
                choices_addons.push(choice.variant_choice_name + ' : ' + choicePrice.variant_sub_choice_name);
              }
            });
          });

          itemcombo.addons.forEach((addon: any) => {
            var addonName = '';
            addon.addon_prices.forEach((addonsPrice: any) => {
              if (addonsPrice.is_added == true) {
                price += Number(addonsPrice.price);
                addonName = addonName == '' ? addonsPrice.variant_sub_addon_name : (addonName + ', ' + addonsPrice.variant_sub_addon_name);
              }
            });

            if (addonName != '') {
              choices_addons.push(addon.variant_addon_name + ' : ' + addonName);
            }
          });
          itemcombo.choices_addons = choices_addons;
        }

        itemcombo.discounted_price = Number(price).toFixed(2);
        itemcombo.discountedprice = Number(price).toFixed(2);
        itemcombo.price = Number(price).toFixed(2);

        if (itemcombo.combo_variants.length > 0) {
          this.SelectedItems.push(itemcombo);

          this.itemtotal = Number(Number(this.itemtotal) + Number(itemcombo.price)).toFixed(2);
          this.packagingCharges = Number(this.packagingCharges) + (Number(itemcombo.packaging));
          this.taxPrice = this.taxPrice + ((Number(itemcombo.price) * itemcombo.tax) / 100);
          this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
          this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
          var price = Number(itemcombo.discounted_price) + ((Number(itemcombo.price) * itemcombo.tax) / 100) + (Number(itemcombo.packaging));
          this.grandtotal = Number(Number(this.grandtotal) + Number(price)).toFixed(2);

          if (this.deliverytype == 1) {
            if (this.storedeliverysettings.delivery_charge_type == 1) {
              this.deliverycharge = 0.00;;
            }
            else {
              if (parseFloat(this.itemtotal) >= parseFloat(this.storedeliverysettings.min_order_amount)) {
                this.deliverycharge = 0.00;
              }
              else {
                this.deliverycharge = 0.00;;
              }
            }
            this.grandtotal = (parseFloat(this.deliverycharge) + parseFloat(this.itemtotal) + parseFloat(this.taxAndChargesTotal)).toFixed(2);
          }
        }
        this.selecteditemsqty = 0;
        this.SelectedItems.forEach((item: any) => {
          this.selecteditemsqty = this.selecteditemsqty + item.quantity
          item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
        });
        if (this.offer_code) {
          this.ValidOfferCode(this.offer_code)
        }
        else {
          this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
        }
      });
  }

  openLastCombo() {
    const modalRef = this.modalService.open(RepeatComboItemsComponent, {
      size: "md",
      centered: true,
      animation: true,
    });

    modalRef.componentInstance.last_used_addon_choice =
      this.last_used_addon_choice;

    modalRef.componentInstance.comboInstance.subscribe((repeatOrAdd) => {
      if (repeatOrAdd == 1) {
        this.addNewCombo();
      } else {
        this.repeatCombo(repeatOrAdd);
      }
    });
  }

  addNewCombo() {
    var combo_item = this.modelNewItem;
    this.openSelectComboItems(combo_item);
    this.isNewAddCombo = true;
  }

  repeatCombo(selectedItem) {
    selectedItem.quantity++;
    this.gridDataPage.forEach((item: any) => {
      if (item.item_variants_id == selectedItem.item_variants_id) {
        item.quantity = selectedItem.quantity;
      }
    });

    this.selecteditemsqty = 0;
    this.SelectedItems.forEach((item: any) => {
      this.selecteditemsqty = this.selecteditemsqty + item.quantity
      item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
    });

    this.itemtotal = Number(Number(this.itemtotal) + Number(selectedItem.discounted_price)).toFixed(2);
    this.packagingCharges = Number(this.packagingCharges) + (Number(selectedItem.packaging));
    this.taxPrice = this.taxPrice + ((Number(selectedItem.price) * selectedItem.tax) / 100);
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
    this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);

    var price = Number(selectedItem.discounted_price) + ((Number(selectedItem.price) * selectedItem.tax) / 100) + (Number(selectedItem.packaging));
    this.grandtotal = Number(Number(this.grandtotal) + Number(price)).toFixed(2);
    if (this.offer_code) {
      this.ValidOfferCode(this.offer_code)
    }
    else {
      this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
    }
  }

  changeItemQty(item) {
    for (let i = 0; i < this.SelectedItems.length; i++) {
      if (this.SelectedItems[i].item_variants_id == item.item_variants_id) {
        this.selecteditemsqty -= this.SelectedItems[i].quantity;
        this.SelectedItems[i].quantity = item.SelectedQty;
        this.SelectedItems[i].SelectedQty = item.SelectedQty;
        this.selecteditemsqty += item.SelectedQty;
      }
    }
  }

  Getitems(newPage, addons?, choices?) {
    this.gridData.forEach((item) => {
      var found: any = [];
      this.SelectedItems.forEach((el) => {
        if (item.item_variants_id == el.item_variants_id) {
          found[0] = el;
        }
      });
      if (found.length > 0) {
        item.Selected = 1;
        item.SelectedQty = found[0].quantity;
      } else {
        this.SelectedQty == 0;
      }

      if (addons != null && item.addons != null) {
        for (var i = 0; i < addons; i++) {
          for (var j = 0; j < item.addons; j++) {
            if (addons[i].variant_addon_id == item.addons[j].variant_addon_id) {
              item.addons[j].addon_prices = addons[i].addon_prices;
            }
          }
        }
      }

      if (choices != null && item.choices != null) {
        for (var i = 0; i < choices; i++) {
          for (var j = 0; j < item.choices; j++) {
            if (
              choices[i].variant_choice_id == item.choices[j].variant_choice_id
            ) {
              item.choices[j].choice_prices = choices[i].choice_prices;
            }
          }
        }
      }
    });

    var start = 1 * 20 - 20;
    this.gridDataPage = [];
    var j = 0;
    for (var i = 0; i < this.gridData.length; i++) {
      if (i >= start) {
        if (
          this.gridData[i].SelectedQty == null ||
          this.gridData[i].SelectedQty == "" ||
          this.gridData[i].SelectedQty == undefined
        ) {
          this.gridData[i].SelectedQty = 0;
        }
        this.gridDataPage.push(this.gridData[i]);
        j++;
      }
    }
    this.count = 0;
    this.count = this.gridData.length;
    this.page = newPage;
  }

  openselectItemsDelete() {
    const modalRef = this.modalService.open(
      SelectItemDeleteAddonChoiceComponent,
      {
        size: "md",
        centered: true,
        animation: true,
      }
    );

    modalRef.componentInstance.selectedItemAddonChoicesLst =
      this.selectedItemAddonChoicesLst;

    modalRef.componentInstance.receivedItemToDelete.subscribe((selected) => {
      this.deleteModalFunction(selected);
    });
  }

  deleteComboPopup() {
    const modalRef = this.modalService.open(
      SelectItemDeleteAddonChoiceComponent,
      {
        size: "md",
        centered: true,
        animation: true,
      }
    );

    modalRef.componentInstance.selectedItemAddonChoicesLst =
      this.selectedItemAddonChoicesLst;

    modalRef.componentInstance.receivedItemToDelete.subscribe((selected) => {
      this.deleteModalFunction(selected);
    });
  }

  deleteModalFunction(selected) {
    var tot: any = $("#item" + selected.item_variants_id.toString()).val();
    tot = Number(tot) - 1;
    $("#item" + selected.item_variants_id.toString()).val(tot);

    this.selecteditemsqty -= 1;

    var found = this.gridData.filter(
      (x) => x.item_variants_id == selected.item_variants_id
    )[0];

    if (found != null || found != undefined) {
      var length = this.selectedItemAddonChoicesLst.filter(
        (x) => x.item_variants_id == selected.item_variants_id
      ).length;
      found.Selected = length != undefined ? (length > 1 ? 1 : 0) : 0;
    }

    this.selectedItemAddonChoicesLst.splice(selected.index, 1);

    if (selected.is_combo != "1") {
      this.SelectedItemsAddOnsChoices = this.SelectedItemsAddOnsChoices.filter(
        (el) => el.item_variants_id !== selected.item_variants_id
      );
    } else {
      this.SelectedItemsCombo = this.SelectedItemsCombo.filter(
        (el) => el.item_variants_id != selected.item_variants_id
      );

    }

    this.SelectedItems = this.SelectedItems.filter(
      (el) => el.item_variants_id != selected.item_variants_id
    );
    for (var i = 0; i < this.selectedItemAddonChoicesLst.length; i++) {
      var additem = {
        item_id: this.selectedItemAddonChoicesLst[i].item_id,
        item_variants_id: this.selectedItemAddonChoicesLst[i].item_variants_id,
        item_name: this.selectedItemAddonChoicesLst[i].item_name,
        price: this.selectedItemAddonChoicesLst[i].item_price,
        discountedprice: this.selectedItemAddonChoicesLst[i].discounted_price,
        quantity:
          this.selectedItemAddonChoicesLst[i].SelectedQty == ""
            ? 0
            : this.selectedItemAddonChoicesLst[i].SelectedQty,
        packaging: this.selectedItemAddonChoicesLst[i].packaging,
        addons: this.selectedItemAddonChoicesLst[i].addons,
        choices: this.selectedItemAddonChoicesLst[i].choices,
      };
      this.SelectedItems.push(additem);

      if (selected.is_combo != "1") {
        this.SelectedItemsAddOnsChoices.push(this.selectedItemAddonChoicesLst[i]);
      } else {
        this.SelectedItemsCombo.push(this.selectedItemAddonChoicesLst[i]);
      }
    }
    this.Getitems(1);
  }

  deleteItem(deleteItem, addon, choice) {
    this.SelectedItems.forEach((item) => {
      if (item.item_variants_id == deleteItem.item_variants_id) {
        var found: any = [];

        this.gridData.forEach((i) => {
          if (i.item_variants_id == item.item_variants_id) {
            found[0] = i;
          }
        });

        if (found.length > 0 || found != null || found != undefined) {
          found[0].Selected = 0;
          found[0].SelectedQty = 0;
          this.selecteditemsqty -= item.quantity;
          this.SelectedItems = this.SelectedItems.filter(
            (items) => items !== item
          );
        }
      }
    });
  }

  //get item
  getItemList(page) {
    if (!this.spinner) {
      this.showFilters = false;
      this.spinner = true;
      this.page = page;

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

      var data: any = {
        store_id: this.loginUserStore.store_id,
        page: this.page,
        categories: this.selectedCategory ? this.selectedCategory.value : 0,
        sub_category_id: this.selectedSubcategory ? this.selectedSubcategory.sub_category_id : 0,
        search_query: search,
        user_id: this.main.LoggedUserInfo.user_id,
        out_of_stock: '0',
        limit: 24,
        mask_price: 0,
        order_type: 3,
        customer_address_id:
          this.tax_calculation_address == 1
            ? this.deliveryAddress == undefined
              ? undefined
              : this.deliveryAddress.customer_address_id
            : this.billingAddress == undefined
              ? undefined
              : this.billingAddress.customer_address_id,
        is_item_variant_level: 0,
        order_id:
          this.orderdetail == undefined ? undefined : this.orderdetail.order_id,
        sort_field: this.sortKey,
        sort_type: this.isOrderBy,
        is_pos: 1,
        search_type: 1,
      };

      data.displaySpinner = true

      //filter
      if (this.filters) {
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
                ? 0
                : outOfStock?.is_checked
                  ? 1
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

      if (
        this.filters &&
        this.filters.selectedCategory &&
        this.filters.selectedCategory.length > 0
      ) {
        data.categories = this.filters.selectedCategory
          .map((x) => x.category_id)
          .toString();

        if (this.filters.selectedSubCategory) {
          data.sub_category_id = this.filters.selectedSubCategory.sub_category_id.toString()
        }

      }

      this.cdr.detectChanges()
      this.itemService.get(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.showFilters = true;
            this.noData = false;
            this.totalCount = response.count;
            this.count = response.count;
            this.categoryGridData = response.data;
            this.gridData = [];

            // filter
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
            //filter end

            this.categoryGridData.forEach((category) => {
              category.item_variants.forEach((varient) => {
                var found = this.SelectedItems.filter(item => item.item_variants_id === varient.item_variants_id)[0];
                var default_image: any;
                if (varient.item_image_ids) {
                  var variant_image: any = varient.item_image_ids.split(',');
                  default_image = category.item_images.filter((img: any) => img.item_image_id == variant_image[0])[0];
                }
                var itemdata: any = {
                  item_images: category?.item_images,
                  avg_rating: category.avg_rating,
                  unit_quantity: parseFloat(varient.unit_quantity),
                  Selected: 0,
                  SelectedQty: found != undefined ? found.quantity : 0,
                  quantity: found != undefined ? found.quantity : 0,
                  item_image: default_image ? default_image.image : '',
                  item_type: category.item_type,
                  category_name: category.category_name,
                  parent_category_name: category.parent_category_name,
                  sub_category_name: category.sub_category_name,
                  default_sub_category_name: category.default_sub_category_name,
                  brand_name: category.brand_name,
                  item_name: category.item_name,
                  item_id: category.item_id,
                  item_variants_id: varient.item_variants_id,
                  item_price: varient.item_price,
                  discounted_price: varient.discounted_price,
                  packaging_id: varient.packaging_id,
                  item_description: category.item_description,
                  packaging_name: varient.packaging_name,
                  unit_id: varient.unit_id,
                  unit_name: varient.unit_name,
                  sku: varient.sku,
                  out_of_stock: varient.out_of_stock,
                  mask_price: varient.mask_price,
                  min_qty: varient.min_qty,
                  max_qty: varient.max_qty,
                  packaging: varient.packaging,
                  is_choice_addon: varient.is_choice_addon,
                  ia_available_choice_addon: varient.is_choice_addon == 0 ? "Choices / Addons Available" : varient.is_choice_addon == 1 ? "Choices Available" : varient.is_choice_addon == 2 ? "Addons Available" : "",
                  choices: varient.choices,
                  addons: varient.addons,
                  prescription: category.prescription,
                  is_combo: category.is_combo,
                  //modify from here
                  manufacturer_details: category.manufacturer_details,
                  how_to_use: category.how_to_use,
                  features: category.features,
                  benefits: category.benefits,
                  ingredients: category.ingredients,
                  nutritional_information: category.nutritional_information,
                  product_information: category.product_information,
                  other_information: category.other_information,
                };
                if (this.settings.pos_allow_item_packaging == 0) {
                  itemdata.packaging = '0'
                }
                itemdata.tax = this.item_tax_type == 1 ? varient.tax : varient.tax_group_percentage;
                itemdata.tax_price = Number(Number(varient.discounted_price) * Number(itemdata.tax) / 100).toFixed(2);

                this.gridData.push(itemdata);
              });
            });
            if (this.searchItem == true) { }
            else {
              this.SelectedItems.forEach((item) => {
                var found = this.gridData.filter(
                  (x) => x.item_variants_id == item.item_variants_id
                )[0];

                if (found != null || found != undefined) {
                  var found123 = this.SelectedItems.filter(
                    (el) => el.item_variants_id == item.item_variants_id
                  );
                  if (found123.length > 1) {
                    var qty = 0;
                    for (var j = 0; j < found123.length; j++) {
                      qty += parseInt(item.quantity);
                    }
                    found.Selected = 1;
                    found.SelectedQty = qty;
                  } else {
                    found.Selected = 1;
                    found.SelectedQty = item.quantity;
                  }
                }
              });

              this.gridData.reverse();
              this.gridData = this.sortPipe.transform(
                this.gridData,
                "desc",
                "Selected"
              );

              this.gridData.forEach(element => {
                this.gridDataPage.push(element)
              });

              if (this.isdisplayWallet && this.settings.pos_wallet) {
                this.GetCustomerWalletBalance();
              } else {
                this.GetOnGoingStoreOffers();
              }
            }
            this.spinner = false
            if (this.gridDataPage.length == 0) {
              this.toastr.error(this.translate.instant("NO_RECORD_FOUNDS"));
              this.totalCount = 0;
              this.categoryGridData = [];
              this.noData = true;
            }
            this.cdr.detectChanges();
          } else {
            this.showFilters = true;
            this.init_filter_data = response.filter_data;
            this.toastr.error(this.translate.instant(response.message));
            this.spinner = false
            this.totalCount = 0;
            this.categoryGridData = [];
            this.noData = true;
            this.cdr.detectChanges()
          }
        },
      });
    }
  }

  // sort
  sortAPISide(columnName) {
    this.sortKey = columnName;
    var temp = cloneDeep(this.isOrderBy);
    if (temp == 1) {
      this.isOrderBy = 2
    }
    if (temp == 2) {
      this.isOrderBy = 1
    }
    if (this.isOrderBy == 2) {
      if (columnName == 'discounted_price') {
        this.gridDataPage = this.gridDataPage.sort((low, high) => high.discounted_price - low.discounted_price);
      }
      else {
        this.gridDataPage.sort(this.compareValues(columnName, 'desc'));
      }

    }
    if (this.isOrderBy == 1) {
      if (columnName == 'discounted_price') {
        this.gridDataPage = this.gridDataPage.sort((low, high) => low.discounted_price - high.discounted_price);
      }
      else {
        this.gridDataPage.sort(this.compareValues(columnName, 'asc'));
      }
    }
  }

  compareValues(key: string, order = 'asc') {
    return function (a: any, b: any) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return 0;
      }

      const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }

  sortArrayByColumn(columnName: string, arrayToSort: any[]): any[] {
    return arrayToSort.sort((a, b) => {
      if (a[columnName] < b[columnName]) {
        return -1;
      }
      if (a[columnName] > b[columnName]) {
        return 1;
      }
      return 0;
    });
  }

  discountPriceCondition(discountPrice, price) {
    if (Number(discountPrice) < Number(price)) {
      return true;
    } else {
      return false;
    }
  };

  async getStoreDeliverySettings() {
    const data = {
      store_id: this.sellerDetails.store_id,
    };

    await this.addOrderService
      .getOrderSettings(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.storedeliverysettings = response.data;
          } else {
          }
        },
        error: (error) => { },
        complete: () => { },
      });
  }

  /** Tool tip, tax and charges  */
  taxAndChargesToolTip(global_currency, packaging_cost, order_tax) {
    var taxAndChargesTotalToolTip = "";
    if (Number(packaging_cost) > 0 && Number(order_tax) <= 0) {
      taxAndChargesTotalToolTip =
        "<div>Store Packaging Cost: " +
        global_currency +
        " " +
        Number(packaging_cost).toFixed(2) +
        "</div>";
    } else if (Number(order_tax) > 0 && Number(packaging_cost) <= 0) {
      taxAndChargesTotalToolTip =
        "<div>" +
        this.generalSetting.store_tax_label +
        ": " +
        global_currency +
        " " +
        Number(order_tax).toFixed(2) +
        "</div>";
    } else {
      taxAndChargesTotalToolTip =
        "<div style='width:100%;'><div style='float:left; text-align:left;'>" +
        this.generalSetting.store_label +
        " Packaging Cost: </div><div style='float:right;'> " +
        global_currency +
        " " +
        Number(packaging_cost).toFixed(2) +
        "</div> </div><div style='width:100%;clear:both;'><div style='width:calc(100% - 50px); float:left; text-align:left;'> " +
        this.generalSetting.store_tax_label +
        ": </div><div style='float:right;'>" +
        global_currency +
        " " +
        Number(order_tax).toFixed(2) +
        "</div>";
    }
    return trustedTooltipHtml(taxAndChargesTotalToolTip);
  };

  //Get pos settings
  async get_pos_settings() {
    var data = {
      store_id: this.sellerDetails.store_id,
    };
    await this.PosSeetingService.getPOSSettings(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.packagingCharges = 0;
          this.settings = response.data;
          this.packagingCharges = this.settings.pos_packaging_per_order == "" ? 0 : this.settings.pos_packaging_per_order
          this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
          this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
          this.ProcessPaymentMethods(this.settings.pos_payment_methods)
          this.taxAndChargesTotal = this.packagingCharges;
          this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
          this.grandtotal = (parseFloat(this.deliverycharge) + parseFloat(this.itemtotal) + parseFloat(this.packagingCharges)).toFixed(2);

          if (this.is_cart == true) {
            this.cartDetails();
          } else {
            this.getCategoryList();
          }
          this.cdr.detectChanges();
        } else {
          this.settings = {};
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  ProcessPaymentMethods(payments) {
    this.paymentMethodList = [{ name: 'Multiple' }];
    payments.forEach((value) => {
      var name;
      if (value.max_order_value > 0.00) {
        name = value.pos_method_name + ' ' + '(Max : ' + this.priceFormatter(value.max_order_value) + ')'
      } else {
        name = value.pos_method_name;
      }
      var payoption = {
        id: value.payment_method_id,
        name: name,
        maxordervalue: value.max_order_value,
        method_type_val: value.method_type_val,
        multipayment_allowed: value.multipayment_allowed
      };
      if (value.is_added == 1) {
        if (value.payment_method_id == 0) { //add to Khata
          if (this.customerdetails.is_khata == 1) {  // Check Selected Customer Is Khata add or not
            this.paymentMethodList.push(payoption);
          }
        }
        else {
          this.paymentMethodList.push(payoption);
        }
      }
    });
  }

  searchItem: boolean = false;
  incrementValue(item, add, choice) {
    this.SelectedAdminSeller = null;
    var itemdetails = JSON.stringify(item);
    this.modelNewItem = itemdetails;
    if (this.searchItem == true) {
    }
    else {
      if (item.quantity < 1) {
        this.updateItemQuantity(item, add, choice);
      }
    }
  }

  updateItemQuantity(item, add, choice) {
    if (item.is_choice_addon != null) {
      var found123 = this.SelectedItemsAddOnsChoices.filter(x => x.item_variants_id === item.item_variants_id);
      if (found123 != null && found123 != undefined && found123.length > 0) {
        var found45 = found123[found123.length - 1];
        var found46 = JSON.stringify(found45);
        var found = JSON.parse(found46);
        var price = found.discounted_price != '' || found.discounted_price != undefined ? parseFloat(found.discounted_price) : parseFloat(found.item_price);
        var choices_addons = [];

        if (found.choices != null) {
          found.choices.forEach((choice: any) => {
            choice.choice_prices.forEach((choicePrice: any) => {
              if (choicePrice.is_added == true) {
                price += parseFloat(choicePrice.price);
                choices_addons.push(choice.variant_choice_name + ' : ' + choicePrice.variant_sub_choice_name);
              }
            });
          });
        }

        if (found.addons != null) {
          found.addons.forEach((addon: any) => {
            var addonName = '';
            addon.addon_prices.forEach((addonPrice: any) => {
              if (addonPrice.is_added == true) {
                price += parseFloat(addonPrice.price);
                addonName = addonName == '' ? addonPrice.variant_sub_addon_name : (addonName + ', ' + addonPrice.variant_sub_addon_name);
              }
            });
            if (addonName != '') {
              choices_addons.push(addon.variant_addon_name + ' : ' + addonName);
            }
          });
          found.choices_addons = choices_addons;
        }

        found.price = price;
        found.total_price = price;
        this.last_used_addon_choice = found;
        this.openLastAddOnChoice();
      }
      else {
        if (this.settings.pos_min_max == 1) {
          if (item.quantity == 0 && item.min_qty != 0) {
            Swal.fire({
              title: ('The minimum quantity for item is ' + item.min_qty + ', Do you want to proceed?'),
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: this.translate.instant("YES"),
              cancelButtonText: this.translate.instant("NO"),
            }).then((result) => {
              if (result.value) {
                this.openSelectAddonChoices(item, add, choice);
              } else if (result.dismiss === Swal.DismissReason.cancel) {
              }
            });
          } else {
            this.openSelectAddonChoices(item, add, choice);
          }
        } else {
          this.openSelectAddonChoices(item, add, choice);
        }
      }
      return;
    }

    if (item.is_combo == "1") {
      var findSelectedComboItem = this.SelectedItemsCombo.filter(x => x.item_variants_id === item.item_variants_id);
      if (findSelectedComboItem != null && findSelectedComboItem != undefined && findSelectedComboItem.length > 0) {
        var findSelectedComboItem1 = findSelectedComboItem[findSelectedComboItem.length - 1];
        var price = findSelectedComboItem1.discounted_price != '' || findSelectedComboItem1.discounted_price != undefined ? parseFloat(findSelectedComboItem1.discounted_price) : parseFloat(findSelectedComboItem1.item_price);
        if (findSelectedComboItem1.combo_variants.length > 0) {
          findSelectedComboItem1.combo_variants.forEach((combo: any) => {
            var choices_addons = [];
            combo.choices.forEach((choice: any) => {
              choice.choice_prices.forEach((choicePrice: any) => {
                if (choicePrice.is_added == true) {
                  price += Number(choicePrice.price);
                  choices_addons.push(choice.variant_choice_name + ' : ' + choicePrice.variant_sub_choice_name);
                }
              });
            });

            combo.addons.forEach((addon: any) => {
              var addonName = '';
              addon.addon_prices.forEach((addonsPrice: any) => {
                if (addonsPrice.is_added == true) {
                  price += Number(addonsPrice.price);
                  addonName = addonName == '' ? addonsPrice.variant_sub_addon_name : (addonName + ', ' + addonsPrice.variant_sub_addon_name);
                }
              });
              if (addonName != '') {
                choices_addons.push(addon.variant_addon_name + ' : ' + addonName);
              }
            });
            combo.choices_addons = choices_addons;
          });
        }
        this.last_used_addon_choice = findSelectedComboItem1;
        this.openLastCombo();
        return;
      }
      else {
        this.openSelectComboItems(item);
      }
      return;
    }

    if (item.SelectedQty == 0 || item.SelectedQty == undefined) {
      if (this.settings.pos_min_max == 1) {
        if (item.quantity == 0 && item.min_qty != 0) {
          Swal.fire({
            title: ('The minimum quantity for item is ' + item.min_qty + ', Do you want to proceed?'),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: this.translate.instant("YES"),
            cancelButtonText: this.translate.instant("NO"),
          }).then((result) => {
            if (result.value) {
              if (item.min_qty == 1) {
                item.quantity = 0
              } else {
                item.quantity = item.min_qty - 1
              }
              item.SelectedQty = item.quantity;
              this.selectItem(item, add, choice);
              var value = parseInt(item.SelectedQty, 10);
              value = isNaN(value) ? 0 : value;
              value++;
              item.SelectedQty = value;
              item.quantity = value;
              this.selecteditemsqty = 0;
              this.SelectedItems.forEach((item: any) => {
                this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
                item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
              });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
          });
        } else {
          this.selectItem(item, add, choice);
          var value = parseInt(item.SelectedQty, 10);
          value = isNaN(value) ? 0 : value;
          value++;
          item.SelectedQty = value;
          item.quantity = value;
          this.selecteditemsqty = 0;
          this.SelectedItems.forEach((item: any) => {
            this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
            item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
          });
        }
      }
      else {
        this.selectItem(item, add, choice);
        var value = parseInt(item.SelectedQty, 10);
        value = isNaN(value) ? 0 : value;
        value++;
        item.SelectedQty = value;
        item.quantity = value;
        this.selecteditemsqty = 0;
        this.SelectedItems.forEach((item: any) => {
          this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
          item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
        });
      }
    }
    else {
      var value = parseInt(item.SelectedQty, 10);
      value = isNaN(value) ? 0 : value;
      value++;
      item.SelectedQty = value;
      item.quantity = value;
      this.selecteditemsqty = 0;
      this.SelectedItems.forEach((item: any) => {
        this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
        item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
      });
    }
  }

  selectItem(item, addons, choices) {
    this.SelectedItems.push({
      item_id: item.item_id,
      item_variants_id: item.item_variants_id,
      quantity: item.quantity + 1,
      price: item.item_price,
      discounted_price: item.discounted_price,
      discountedprice: item.discounted_price,
      packaging: item.packaging,
      brand_name: item.brand_name,
      item_image: item.item_image,
      choices_addons: null,
      combo_variants: null,
      item_name: item.item_name,
      order_item_id: item.order_item_id,
      packaging_name: item.packaging_name,
      unit_name: item.unit_name,
      unit_quantity: item.unit_quantity,
      tax: item.tax,
      tax_price: item.tax_price,
      choices: item.choices,
      addons: item.addons,
      prescription: item.prescription,
      min_qty: item.min_qty,
      max_qty: item.max_qty,
    });
    this.incrementValueee(this.SelectedItems)
  }

  incrementValueee(selectedItem) {
    if (selectedItem[selectedItem.length - 1].is_combo == "1") {
      this.modelNewItem = {};
      this.modelNewItem = cloneDeep(selectedItem[selectedItem.length - 1]);
      var findSelectedComboItem1 = selectedItem[selectedItem.length - 1];
      this.last_used_addon_choice = findSelectedComboItem1;
      this.openLastCombo();
    } else if (selectedItem[selectedItem.length - 1].is_choice_addon != null) {
      this.modelNewItem = {};
      this.modelNewItem = cloneDeep(selectedItem[selectedItem.length - 1]);
      this.last_used_addon_choice = selectedItem[selectedItem.length - 1];
      this.openLastAddOnChoice();
    }
    else {
      this.itemtotal = Number(Number(this.itemtotal) + Number(selectedItem[selectedItem.length - 1].discounted_price * selectedItem[selectedItem.length - 1].quantity)).toFixed(2);
      this.packagingCharges = Number(this.packagingCharges) + (Number(selectedItem[selectedItem.length - 1].packaging * selectedItem[selectedItem.length - 1].quantity));
      this.taxPrice = this.taxPrice + Number(((Number(selectedItem[selectedItem.length - 1].discounted_price) * selectedItem[selectedItem.length - 1].tax) / 100) * selectedItem[selectedItem.length - 1].quantity);
      this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
      this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
      var price = Number(selectedItem[selectedItem.length - 1].discounted_price * selectedItem[selectedItem.length - 1].quantity) + Number(((Number(selectedItem[selectedItem.length - 1].discounted_price) * selectedItem[selectedItem.length - 1].tax) / 100) * selectedItem[selectedItem.length - 1].quantity) + (Number(selectedItem[selectedItem.length - 1].packaging * selectedItem[selectedItem.length - 1].quantity));
      this.grandtotal = Number(Number(this.grandtotal) + Number(price)).toFixed(2);
    }

    if (this.offer_code) {
      this.ValidOfferCode(this.offer_code);
    }
    else {
      this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
    }
  }

  async ValidOfferCode(offerCode) {
    var data = {
      amount: this.itemtotal,
      discount_code: offerCode,
      order_type: 3,
      store_id: this.sellerDetails.store_id,
      user_id: this.customerdetails.customer_user_id,
      payment_method: this.paymentMethod != undefined ? this.paymentMethod.id : '',
      items: JSON.stringify(this.SelectedItems)
    }

    await this.OrderService.getValidOfferCode(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            if (this.offerPrice == undefined || this.offerPrice == 0) {
              this.toastr.success(response.message);
            } else {
              this.toastr.success(response.message);
            }

            var ValidOfferCode = response.data;
            var DiffranceOfferDicount = Number(ValidOfferCode.offer_discount).toFixed(2);
            if (this.offer_code) {
              this.grandtotal = Number(Number(this.grandtotal) + Number(DiffranceOfferDicount)).toFixed(2);
            }

            this.offer_code = offerCode;
            if (this.tax_recalculation_offer == 1) {
              if (ValidOfferCode.sub_offer_type_id == 4 || ValidOfferCode.sub_offer_type_id == 5 || ValidOfferCode.sub_offer_type_id == 13) {
                this.taxPrice = 0;
                this.SelectedItems.forEach((item: any) => {
                  item.offerItemAmountPer = Number(Number(ValidOfferCode.offer_discount) / Number(Number(this.itemtotal)) * Number(item.discounted_price * item.quantity)); //Offer (Actual)
                  item.postDiscountItemPrice = Number(Number(item.discounted_price * item.quantity) - Number(item.offerItemAmountPer));  //Total Item Price (Post - Discount
                  item.itemTextAmount = Number(Number(Number(item.tax) / 100) * Number(item.postDiscountItemPrice)); //Tax Amt
                  this.taxPrice += Number(item.itemTextAmount);
                });

                this.taxPrice = Number(this.taxPrice).toFixed(2);
                this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
                this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
                this.grandtotal = (parseFloat(this.deliverycharge) + parseFloat(this.itemtotal) + parseFloat(this.taxAndChargesTotal)).toFixed(2);
              }
            }
            this.offerPrice = Number(ValidOfferCode.offer_discount).toFixed(2);
            this.grandtotal = Number(Number(this.grandtotal) - Number(DiffranceOfferDicount)).toFixed(2);
            this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
          } else {
            if (this.offer_code) {
              this.offer_code = ''
              this.grandtotal = Number(Number(this.grandtotal) + Number(this.offerPrice)).toFixed(2);
              this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
            }
            this.toastr.error(response.message);
          }
        },
        error: (err) => { },
        complete: () => { },
      });
  }

  ApplyWallateAmount(isChecked) {
    this.newSellerOrder.apply_Wallet = isChecked;
    if (this.newSellerOrder.apply_Wallet) {
      if (this.walletMaxValue == 0) {
        var wallet_amount = Number(Number(this.walletMaxValue) == 0 ? this.originalWalletBalance : this.walletMaxValue) >= Number(this.grandtotal) ? this.grandtotal : this.originalWalletBalance;
      } else {
        var wallet_amount = Number(Number(this.walletMaxValue) == 0 ? this.originalWalletBalance : this.walletMaxValue) >= Number(this.grandtotal) ? this.grandtotal : this.walletMaxValue;
      }
      this.wallet_amount = Number(this.originalWalletBalance) > Number(wallet_amount) ? wallet_amount : this.originalWalletBalance;
      this.order_amount = Number(Number(this.grandtotal) - Number(this.wallet_amount)).toFixed(2);
      this.walletBalance = Number(Number(this.originalWalletBalance) - Number(this.wallet_amount)).toFixed(2);
    }
    else {
      this.walletBalance = Number(this.originalWalletBalance).toFixed(2);
      this.wallet_amount = 0.00;
    }
    this.order_amount = Number(Number(this.grandtotal) - Number(this.wallet_amount)).toFixed(2);

    if (this.order_amount == 0) { // When all amount pay through wallet, Payment method will undefined
      this.paymentMethod = undefined;
      this.paymentM.selected = null;
    }
  }

  async GetCustomerWalletBalance() {
    var data = {
      user_id: this.customerdetails.customer_user_id,
    }

    await this.addOrderService
      .getCustomerWalletBalance(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.walletBalance = response.data.balance;
            this.originalWalletBalance = response.data.balance;
            this.GetOnGoingStoreOffers();
          } else {
            this.GetOnGoingStoreOffers();
          }
        },
        error: (err) => { },
        complete: () => { },
      });
  }

  async GetOnGoingStoreOffers() {
    var data = {
      is_store_listing: 0,
      store_id: this.sellerDetails.store_id,
      user_id: this.customerdetails.customer_user_id,
      is_pos: 1
    }
    await this.addOrderService
      .getOnGoingStoreOffersList(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.offerList = response.data;
            this.getStoreDeliverySettings();
            this.offerList.forEach((item: any) => {
              var from = item.validity.split(' ')[0]
              var fromDate;
              if (this.main.DateFormate.split(' ')[0] == 'DD-MM-YYYY') {
                fromDate = item.validity.substr(5, 11)
              } else {
                fromDate = new Date(item.validity.substr(5, 11))
                fromDate = moment(fromDate).format(this.main.DateFormate.split(' ')[0]);
              }

              if (item.validity.length == 31) {
                var to = item.validity.substr(17, 18)
                to = to.split(' ')[0]
                var todate
                if (this.main.DateFormate.split(' ')[0] == 'DD-MM-YYYY') {
                  todate = item.validity.substr(20, 31)
                } else {
                  todate = new Date(item.validity.substr(20, 31))
                  todate = moment(todate).format(this.main.DateFormate.split(' ')[0]);
                }
              }
              item.validity = from + ' ' + fromDate;
              if (todate != undefined) {
                item.validity = item.validity + ' ' + to + ' ' + todate;
              }
            });
          } else {
            this.offerList = [];
          }
        },
        error: (err) => { },
        complete: () => { },
      });
  }

  //inc qty
  increasequantity(event) {
    if (event.is_combo == "1") {
      this.modelNewItem = {};

      this.SelectedItems.forEach((item: any) => {
        if (item.item_variants_id == event.item_variants_id) {
          this.modelNewItem = cloneDeep(item);
          var findSelectedComboItem1 = item;
          this.last_used_addon_choice = findSelectedComboItem1;
        }
      });
      this.openLastCombo();
    }
    else if (event.is_choice_addon != null) {
      this.modelNewItem = {};
      this.SelectedItems.forEach((item: any) => {
        if (item.item_variants_id == event.item_variants_id) {
          this.modelNewItem = cloneDeep(item);
          this.last_used_addon_choice = item;
        }
      });
      if (this.settings.pos_min_max == 1) {
        if (event.max_qty == event.quantity) {
          Swal.fire({
            title: ('The maximum quantity for item is ' + event.max_qty + '.'),
            icon: "warning",
            showCancelButton: false,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: this.translate.instant("OK"),
          }).then((result) => {
            if (result.value) {
              return;
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
          });
        } else {
          this.openLastAddOnChoice();
        }
      } else {
        this.openLastAddOnChoice();
      }
    }
    else {
      if (this.settings.pos_min_max == 1) {
        if (event.max_qty == event.quantity) {
          Swal.fire({
            title: ('The maximum quantity for item is ' + event.max_qty + '.'),
            icon: "warning",
            showCancelButton: false,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: this.translate.instant("OK"),
          }).then((result) => {
            if (result.value) {
              return;
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
          });
        } else {
          event.quantity++;
          event.SelectedQty++;
          this.SelectedItems.forEach((item: any) => {
            if (item.item_variants_id == event.item_variants_id) {
              item.quantity = event.quantity
              this.SelectedItems = this.SelectedItems.filter(event => event.item_variants_id !== item.item_variants_id)
              this.SelectedItems.push(item)

            }
          });

          this.itemtotal = Number(Number(this.itemtotal) + Number(event.discounted_price)).toFixed(2);
          this.packagingCharges = Number(this.packagingCharges) + (Number(event.packaging));
          this.taxPrice = this.taxPrice + ((Number(event.discounted_price) * event.tax) / 100);
          this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
          this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
          var item_price = Number(event.discounted_price) + ((Number(event.discounted_price) * event.tax) / 100) + (Number(event.packaging));
          this.grandtotal = Number(Number(this.grandtotal) + Number(item_price)).toFixed(2);
        }
        this.selecteditemsqty = 0;
        this.SelectedItems.forEach((item: any) => {
          this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
          item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
        });

        if (this.offer_code) {
          this.ValidOfferCode(this.offer_code)
        }
        else {
          this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
        }
      } else {
        event.quantity++;
        event.SelectedQty++;
        this.SelectedItems.forEach((item: any) => {
          if (item.item_variants_id == event.item_variants_id) {
            item.quantity = event.quantity
            this.SelectedItems = this.SelectedItems.filter(event => event.item_variants_id !== item.item_variants_id)
            this.SelectedItems.push(item)
          }
        });
        this.itemtotal = Number(Number(this.itemtotal) + Number(event.discounted_price)).toFixed(2);
        this.packagingCharges = Number(this.packagingCharges) + (Number(event.packaging));
        this.taxPrice = this.taxPrice + ((Number(event.discounted_price) * event.tax) / 100);
        this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
        this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
        var item_price = Number(event.discounted_price) + ((Number(event.discounted_price) * event.tax) / 100) + (Number(event.packaging));
        this.grandtotal = Number(Number(this.grandtotal) + Number(item_price)).toFixed(2);
      }
      this.selecteditemsqty = 0;
      this.SelectedItems.forEach((item: any) => {
        this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
        item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
      });
      if (this.offer_code) {
        this.ValidOfferCode(this.offer_code)
      }
      else {
        this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
      }
    }
  }

  //dec qty
  decrementquntity(selectedItem) {
    if (selectedItem.is_choice_addon != null && selectedItem.quantity > 1) {
      this.toastr.error(this.translate.instant("CUSTOMIZE_AVAILABLE_IN_ITEM_GO_TO_CART_TO_REMOVE_THE_ITEM"));
      return;
    }
    if (selectedItem.is_combo == 1 && selectedItem.quantity > 1) {
      this.toastr.error(this.translate.instant("CUSTOMIZE_AVAILABLE_IN_ITEM_GO_TO_CART_TO_REMOVE_THE_ITEM"));
      return;
    }
    if (this.settings.pos_min_max == 1) {
      if (selectedItem.min_qty == selectedItem.quantity) {
        Swal.fire({
          title: ('The minimum quantity for item is ' + selectedItem.min_qty + ', Do you wish to remove?'),
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: this.translate.instant("YES"),
          cancelButtonText: this.translate.instant("NO"),
        }).then((result) => {
          if (result.value) {
            this.packagingCharges = Number(this.packagingCharges) - (Number(selectedItem.packaging * selectedItem.quantity));
            this.taxPrice = this.taxPrice - Number(((Number(selectedItem.discounted_price) * selectedItem.tax) / 100) * selectedItem.quantity)
            this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
            this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);

            var price = Number(selectedItem.discounted_price * selectedItem.quantity) + Number(((Number(selectedItem.discounted_price) * selectedItem.tax) / 100) * selectedItem.quantity) + (Number(selectedItem.packaging * selectedItem.quantity));
            this.grandtotal = Number(Number(this.grandtotal) - Number(price)).toFixed(2);

            this.SelectedItems.forEach((item: any) => {
              if (item.item_variants_id == selectedItem.item_variants_id) {
                this.itemtotal = Number(Number(this.itemtotal) - Number(item.discounted_price * selectedItem.quantity)).toFixed(2);
                selectedItem.quantity = 0;
                selectedItem.SelectedQty = 0;
                item.quantity = selectedItem.quantity

              }
            });
            this.selecteditemsqty = 0;

            this.SelectedItems.forEach((item: any) => {
              this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
              item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
            });

            this.SelectedItems = this.SelectedItems.filter(item => item.quantity != 0);

            if (this.SelectedItems.length == 0) {
              this.newSellerOrder.apply_Wallet = false
            }
            if (this.offer_code) {
              this.ValidOfferCode(this.offer_code)
            }
            else {
              this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
            }
          } else if (result.dismiss === Swal.DismissReason.cancel) {
          }
        });
      }
      else {
        selectedItem.quantity--;
        selectedItem.SelectedQty--;

        this.SelectedItems.forEach((item: any) => {
          if (item.item_variants_id == selectedItem.item_variants_id) {
            item.quantity = selectedItem.quantity
            this.itemtotal = Number(Number(this.itemtotal) - Number(item.discounted_price)).toFixed(2);
          }
        });

        this.selecteditemsqty = 0;
        this.SelectedItems.forEach((item: any) => {
          this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
          item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
        });

        this.packagingCharges = Number(this.packagingCharges) - (Number(selectedItem.packaging));
        this.taxPrice = this.taxPrice - ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100)
        this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
        this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);

        var price = Number(selectedItem.discounted_price) + ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100) + (Number(selectedItem.packaging));
        this.grandtotal = Number(Number(this.grandtotal) - Number(price)).toFixed(2);
        this.SelectedItems = this.SelectedItems.filter(item => item.quantity != 0);
        if (this.SelectedItems.length == 0) {
          this.newSellerOrder.apply_Wallet = false
        }
        if (this.offer_code) {
          this.ValidOfferCode(this.offer_code)
        }
        else {
          this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
        }
      }
    }
    else {
      selectedItem.quantity--;
      selectedItem.SelectedQty--;

      this.SelectedItems.forEach((item: any) => {
        if (item.item_variants_id == selectedItem.item_variants_id) {
          item.quantity = selectedItem.quantity
          this.itemtotal = Number(Number(this.itemtotal) - Number(item.discounted_price)).toFixed(2);
        }
      });

      this.selecteditemsqty = 0;
      this.SelectedItems.forEach((item: any) => {
        this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
        item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
      });

      this.packagingCharges = Number(this.packagingCharges) - (Number(selectedItem.packaging));
      this.taxPrice = this.taxPrice - ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100)
      this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
      this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);

      var price = Number(selectedItem.discounted_price) + ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100) + (Number(selectedItem.packaging));
      this.grandtotal = Number(Number(this.grandtotal) - Number(price)).toFixed(2);
      this.SelectedItems = this.SelectedItems.filter(item => item.quantity != 0);
      if (this.SelectedItems.length == 0) {
        this.newSellerOrder.apply_Wallet = false
      }
      if (this.offer_code) {
        this.ValidOfferCode(this.offer_code)
      }
      else {
        this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
      }
    }
  }

  decrementValue(selectedItem) {
    if (this.settings.pos_min_max == 1) {
      if (selectedItem.min_qty == selectedItem.quantity) {
        Swal.fire({
          title: ('The minimum quantity for item is ' + selectedItem.min_qty + ', Do you wish to remove?'),
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: this.translate.instant("YES"),
          cancelButtonText: this.translate.instant("NO"),
        }).then((result) => {
          if (result.value) {
            this.itemtotal = Number(Number(this.itemtotal) - Number(selectedItem.discounted_price * selectedItem.quantity)).toFixed(2);
            this.packagingCharges = Number(this.packagingCharges) - (Number(selectedItem.packaging * selectedItem.quantity));
            this.taxPrice = this.taxPrice - Number(((Number(selectedItem.discounted_price) * selectedItem.tax) / 100) * selectedItem.quantity)
            this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
            this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);

            var price = Number(selectedItem.discounted_price * selectedItem.quantity) + Number(((Number(selectedItem.discounted_price) * selectedItem.tax) / 100) * selectedItem.quantity) + (Number(selectedItem.packaging * selectedItem.quantity));
            this.grandtotal = Number(Number(this.grandtotal) - Number(price)).toFixed(2);
            selectedItem.quantity = 0;

            this.gridDataPage.forEach((item: any) => {
              if (item.item_variants_id == selectedItem.item_variants_id) {
                item.quantity = selectedItem.quantity
                item.SelectedQty = item.quantity
              }
            });
            this.selecteditemsqty = 0;

            this.SelectedItems.forEach((item: any) => {
              this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
              item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
            });

            this.SelectedItems = this.SelectedItems.filter(item => item.quantity != 0);
            if (this.SelectedItems.length == 0) {
              this.newSellerOrder.apply_Wallet = false
            }
            if (this.offer_code) {
              this.ValidOfferCode(this.offer_code)
            }
            else {
              this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
            }
          } else if (result.dismiss === Swal.DismissReason.cancel) {
          }
        });
      }
      else {
        selectedItem.quantity--;
        this.gridDataPage.forEach((item: any) => {
          if (item.item_variants_id == selectedItem.item_variants_id) {
            item.quantity = selectedItem.quantity
            item.SelectedQty = item.quantity
          }
        });

        this.selecteditemsqty = 0;
        this.SelectedItems.forEach((item: any) => {
          this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
          item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
        });

        this.itemtotal = Number(Number(this.itemtotal) - Number(selectedItem.discounted_price)).toFixed(2);
        this.packagingCharges = Number(this.packagingCharges) - (Number(selectedItem.packaging));
        this.taxPrice = this.taxPrice - ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100)
        this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
        this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);

        var price = Number(selectedItem.discounted_price) + ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100) + (Number(selectedItem.packaging));
        this.grandtotal = Number(Number(this.grandtotal) - Number(price)).toFixed(2);
        this.SelectedItems = this.SelectedItems.filter(item => item.quantity != 0);
        if (this.SelectedItems.length == 0) {
          this.newSellerOrder.apply_Wallet = false
        }
        if (this.offer_code) {
          this.ValidOfferCode(this.offer_code)
        }
        else {
          this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
        }
      }
    }
    else {
      selectedItem.quantity--;
      this.gridDataPage.forEach((item: any) => {
        if (item.item_variants_id == selectedItem.item_variants_id) {
          if (item.quantity > 1 && selectedItem.quantity == 0) {
            item.quantity = item.quantity - 1
            item.SelectedQty = item.quantity
          } else if (item.quantity > 1 && selectedItem.quantity != 0) {
            item.quantity = item.quantity - 1
            item.SelectedQty = item.quantity
          }
          else {
            item.quantity = selectedItem.quantity
            item.SelectedQty = item.quantity
          }

        }
      });

      this.selecteditemsqty = 0;
      this.SelectedItems.forEach((item: any) => {
        this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
        item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
      });

      this.itemtotal = Number(Number(this.itemtotal) - Number(selectedItem.discounted_price)).toFixed(2);
      this.packagingCharges = Number(this.packagingCharges) - (Number(selectedItem.packaging));
      this.taxPrice = this.taxPrice - ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100)
      this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
      this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);

      var price = Number(selectedItem.discounted_price) + ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100) + (Number(selectedItem.packaging));
      this.grandtotal = Number(Number(this.grandtotal) - Number(price)).toFixed(2);
      this.SelectedItems = this.SelectedItems.filter(item => item.quantity != 0);
      if (this.SelectedItems.length == 0) {
        this.newSellerOrder.apply_Wallet = false
      }
      if (this.offer_code) {
        this.ValidOfferCode(this.offer_code)
      }
      else {
        this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
      }
    }
  }

  incrementValuess(selectedItem) {
    if (selectedItem.is_combo == "1") {
      this.modelNewItem = {};
      this.modelNewItem = cloneDeep(selectedItem);
      var findSelectedComboItem1 = selectedItem;

      this.last_used_addon_choice = findSelectedComboItem1;
      this.openLastCombo();
    }

    else if (selectedItem.is_choice_addon != null) {
      this.modelNewItem = {};
      this.modelNewItem = cloneDeep(selectedItem);
      this.last_used_addon_choice = selectedItem;
      if (this.settings.pos_min_max == 1) {
        if (selectedItem.max_qty == selectedItem.quantity) {
          Swal.fire({
            title: ('The maximum quantity for item is ' + selectedItem.max_qty + '.'),
            icon: "warning",
            showCancelButton: false,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: this.translate.instant("OK"),
          }).then((result) => {
            if (result.value) {
              return;
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
          });
        } else {
          this.openLastAddOnChoice();
        }
      } else {
        this.openLastAddOnChoice();
      }
    }

    else {
      if (this.settings.pos_min_max == 1) {
        if (selectedItem.max_qty == selectedItem.quantity) {
          Swal.fire({
            title: ('The maximum quantity for item is ' + selectedItem.max_qty + '.'),
            icon: "warning",
            showCancelButton: false,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: this.translate.instant("OK"),
          }).then((result) => {
            if (result.value) {
              return;
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
          });
        }
        else {
          selectedItem.quantity++;

          this.gridDataPage.forEach((item: any) => {
            if (item.item_variants_id == selectedItem.item_variants_id) {
              item.quantity = selectedItem.quantity
              item.SelectedQty = item.quantity
            }
          });

          this.itemtotal = Number(Number(this.itemtotal) + Number(selectedItem.discounted_price)).toFixed(2);
          this.packagingCharges = Number(this.packagingCharges) + (Number(selectedItem.packaging));
          this.taxPrice = this.taxPrice + ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100);
          this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
          this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
          var price = Number(selectedItem.discounted_price) + ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100) + (Number(selectedItem.packaging));
          this.grandtotal = Number(Number(this.grandtotal) + Number(price)).toFixed(2);
        }
        this.selecteditemsqty = 0;
        this.SelectedItems.forEach((item: any) => {
          this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
          item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
        });

        if (this.offer_code) {
          this.ValidOfferCode(this.offer_code)
        }
        else {
          this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
        }
      }
      else {
        selectedItem.quantity++;

        this.gridDataPage.forEach((item: any) => {
          if (item.item_variants_id == selectedItem.item_variants_id) {
            item.quantity = selectedItem.quantity
            item.SelectedQty = item.quantity
          }
        });

        this.itemtotal = Number(Number(this.itemtotal) + Number(selectedItem.discounted_price)).toFixed(2);
        this.packagingCharges = Number(this.packagingCharges) + (Number(selectedItem.packaging));
        this.taxPrice = this.taxPrice + ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100);
        this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
        this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
        var price = Number(selectedItem.discounted_price) + ((Number(selectedItem.discounted_price) * selectedItem.tax) / 100) + (Number(selectedItem.packaging));
        this.grandtotal = Number(Number(this.grandtotal) + Number(price)).toFixed(2);
      }

      this.selecteditemsqty = 0;
      this.SelectedItems.forEach((item: any) => {
        this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
        item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
      });

      if (this.offer_code) {
        this.ValidOfferCode(this.offer_code)
      }
      else {
        this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
      }
    }
  }

  /** Open AvailableOffersComponent modal */
  openOfferListModel() {
    if (this.offerList.length == 0) {
      this.toastr.error(this.translate.instant("NO_OFFERS_AVAILABLE"));
      return;
    }

    const modalRef = this.modalService.open(AvailableOffersComponent, {
      size: "lg",
      centered: true,
    });
    modalRef.componentInstance.offerList = this.offerList;
    modalRef.componentInstance.itemtotal = this.itemtotal;
    modalRef.componentInstance.pos = true;

    modalRef.componentInstance.offerCode.subscribe((offerCode) => {
      this.ValidOfferCode(offerCode);
      this.newSellerOrder.offerCode = offerCode;
    });
  }

  clearOfferCode() {
    this.newSellerOrder.offerCode = '';
    this.offer_code = '';
    this.taxPrice = 0;

    this.SelectedItems.forEach((item: any) => {
      this.taxPrice += Number(Number(Number(Number(item.tax) / 100) * Number(Number(item.discounted_price * item.quantity))));
    });

    this.grandtotal = Number(Number(this.grandtotal) + Number(this.offerPrice)).toFixed(2);
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
    this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
    this.grandtotal = (parseFloat(this.deliverycharge) + parseFloat(this.itemtotal) + parseFloat(this.taxAndChargesTotal)).toFixed(2);
    this.offerPrice = 0;
    this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
  }

  getSelectedPaymentMethod(item, boolean?) {
    this.paymentMethod = item;
    this.paymentM.selected = item;
    if (boolean != 'true') {
      if (item.name == 'Multiple') {
        var data = {
          paymentMethod: null,
          payment_transaction_id: null,
          amount: null

        }
        this.multipaymentList = [];
        this.temp_paymentMethodList = []
        this.multipaymentList.push(data);
        if (this.mainpaymentMethodList) {
          this.mainpaymentMethodList.forEach((item: any) => {
            item.added = 0;
          });
        }
      }
    }
  }

  clearCart() {
    if (this.SelectedItems.length == 0) {
      this.toastr.error(this.translate.instant("CART_IS_EMPTY"));
      return;
    }
    Swal.fire({
      title: this.translate.instant("DO_YOU_WANT_TO_CLEAR_CART"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("YES"),
      cancelButtonText: this.translate.instant("NO"),
    }).then((result) => {
      if (result.value) {
        this.selecteditemsclear();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  selecteditemsclear() {
    this.selecteditemsqty = 0;
    this.itemtotal = 0.00;
    this.offerPrice = 0.00
    this.wallet_amount = 0.00
    this.order_amount = 0.00
    this.SelectedItems = [];
    this.offer_code = '';
    this.SelectedAdminSeller = null;
    this.taxPrice = 0.00
    this.newSellerOrder.apply_Wallet = false;
    this.packagingCharges = this.settings.pos_packaging_per_order == "" ? 0 : this.settings.pos_packaging_per_order
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
    this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
    this.paymentM.selected = null;
    this.taxAndChargesTotal = this.packagingCharges;
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
    this.grandtotal = (parseFloat(this.deliverycharge) + parseFloat(this.itemtotal) + parseFloat(this.packagingCharges)).toFixed(2);

    this.gridDataPage.forEach((category: any) => {
      category.quantity = 0;
      category.SelectedQty = 0
    });

    this.GetCustomerWalletBalance();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKeyPress(event: KeyboardEvent) {
    if (this.modalService.hasOpenModals() && event.keyCode === 27) {
      this.modalService.dismissAll();
    }
  }

  openviewbill() {
    const modalRef = this.modalService.open(PosViewBillComponent, {
      size: "w-1300",
      centered: true,
      keyboard: false,
    });

    modalRef.componentInstance.selecteditemsqty = this.selecteditemsqty;
    modalRef.componentInstance.category_customer_icon = this.category_customer_icon;
    modalRef.componentInstance.SelectedAdminSeller = this.SelectedAdminSeller;
    modalRef.componentInstance.gridData = this.gridData;
    modalRef.componentInstance.global_currency = this.global_currency;
    modalRef.componentInstance.searchItem = this.searchItem;
    modalRef.componentInstance.modelNewItem = this.modelNewItem;
    modalRef.componentInstance.SelectedItemsAddOnsChoices = this.SelectedItemsAddOnsChoices;
    modalRef.componentInstance.last_used_addon_choice = this.last_used_addon_choice;
    modalRef.componentInstance.settings = this.settings;
    modalRef.componentInstance.SelectedItemsCombo = this.SelectedItemsCombo;
    modalRef.componentInstance.SelectedItems = this.SelectedItems;
    modalRef.componentInstance.gridDataPage = this.gridDataPage;
    modalRef.componentInstance.itemtotal = this.itemtotal;
    modalRef.componentInstance.packagingCharges = this.packagingCharges;
    modalRef.componentInstance.taxPrice = this.taxPrice;
    modalRef.componentInstance.taxAndChargesTotalToolTip = this.taxAndChargesTotalToolTip;
    modalRef.componentInstance.taxAndChargesTotal = this.taxAndChargesTotal;
    modalRef.componentInstance.grandtotal = this.grandtotal;
    modalRef.componentInstance.offer_code = this.offer_code;
    modalRef.componentInstance.newSellerOrder = this.newSellerOrder;
    modalRef.componentInstance.sellerDetails = this.sellerDetails;
    modalRef.componentInstance.paymentMethod = this.paymentMethod;
    modalRef.componentInstance.offerPrice = this.offerPrice;
    modalRef.componentInstance.tax_recalculation_offer = this.tax_recalculation_offer;
    modalRef.componentInstance.deliverycharge = this.deliverycharge;
    modalRef.componentInstance.walletMaxValue = this.walletMaxValue;
    modalRef.componentInstance.originalWalletBalance = this.originalWalletBalance;
    modalRef.componentInstance.wallet_amount = this.wallet_amount;
    modalRef.componentInstance.order_amount = this.order_amount;
    modalRef.componentInstance.walletBalance = this.walletBalance;
    modalRef.componentInstance.isNewAddCombo = this.isNewAddCombo;
    modalRef.componentInstance.deliverytype = this.deliverytype;
    modalRef.componentInstance.storedeliverysettings = this.storedeliverysettings;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.isdisplayWallet = this.isdisplayWallet;
    modalRef.componentInstance.show_price_same_font = this.show_price_same_font;
    modalRef.componentInstance.offerList = this.offerList;
    modalRef.componentInstance.paymentM = this.paymentM;
    modalRef.componentInstance.paymentMethodList = this.paymentMethodList;
    modalRef.componentInstance.balance_due = this.balance_due;
    modalRef.componentInstance.multipaymentList = this.multipaymentList;
    modalRef.componentInstance.mainpaymentMethodList = this.mainpaymentMethodList;
    modalRef.componentInstance.temp_paymentMethodList = this.temp_paymentMethodList;
    modalRef.componentInstance.is_cart = this.is_cart;
    modalRef.componentInstance.cart_group_id = this.cart_group_id;
    modalRef.componentInstance.item_tax_type = this.item_tax_type;

    modalRef.componentInstance.updatedData.subscribe((updatedData) => {
      $(
        "<style>.mat-form-field-appearance-outline .mat-form-field-outline {  margin-top:" +
        "28px" +
        " !important;  margin-bottom:" +
        "10px" +
        " !important;}</style>"
      ).appendTo("body");
      if (!updatedData.orderdetail) {
        this.updatedData(updatedData);
      } else {
        this.itemtotal = updatedData.itemtotal;
        this.print_order_bill(updatedData);
      }
    });
  }

  updatedData(data) {
    this.selecteditemsqty = data.selecteditemsqty;
    this.SelectedAdminSeller = data.SelectedAdminSeller;
    this.gridData = data.gridData;
    this.searchItem = data.searchItem;
    this.modelNewItem = data.modelNewItem;
    this.SelectedItemsAddOnsChoices = data.SelectedItemsAddOnsChoices;
    this.last_used_addon_choice = data.last_used_addon_choice;
    this.settings = data.settings;
    this.SelectedItemsCombo = data.SelectedItemsCombo;
    this.SelectedItems = data.SelectedItems;
    this.gridDataPage = data.gridDataPage;
    this.itemtotal = data.itemtotal;
    this.packagingCharges = data.packagingCharges;
    this.taxPrice = data.taxPrice;
    this.taxAndChargesTotalToolTip = data.taxAndChargesTotalToolTip;
    this.taxAndChargesTotal = data.taxAndChargesTotal;
    this.grandtotal = data.grandtotal;
    this.offer_code = data.offer_code;
    this.newSellerOrder = data.newSellerOrder;
    this.sellerDetails = data.sellerDetails;
    this.paymentMethod = data.paymentMethod;
    this.offerPrice = data.offerPrice;
    this.tax_recalculation_offer = data.tax_recalculation_offer;
    this.deliverycharge = data.deliverycharge;
    this.walletMaxValue = data.walletMaxValue;
    this.originalWalletBalance = data.originalWalletBalance;
    this.wallet_amount = data.wallet_amount;
    this.order_amount = data.order_amount;
    this.walletBalance = data.walletBalance;
    this.isNewAddCombo = data.isNewAddCombo;
    this.deliverytype = data.deliverytype;
    this.storedeliverysettings = data.storedeliverysettings;
    this.isdisplayWallet = data.isdisplayWallet;
    this.offerList = data.offerList;
    this.paymentM = data.paymentM;
    this.balance_due = data.balance_due;
    this.multipaymentList = data.multipaymentList;
    this.mainpaymentMethodList = data.mainpaymentMethodList;
    this.temp_paymentMethodList = data.temp_paymentMethodList;
    this.is_cart = data.is_cart;
    this.cart_group_id = data.cart_group_id;

    this.cdr.detectChanges();
  }

  savecart(label) {
    this.onlysave = label;
    if (this.SelectedItems.length == 0) {
      this.toastr.error(this.translate.instant("EMPTY_CART_CANNOT_BE_SAVED"));
      return;
    }

    var note = 'Any offer or wallet applied will not be saved.'
    if (this.isdisplayWallet == 0) {
      note = 'Any offer applied will not be saved.'
    }
    if (this.offers_module == 0 || this.main.LoggedUserStoreInfo.offer_module == 0) {
      note = 'wallet applied will not be saved.'
    }
    Swal.fire({
      title: (note),
      text: this.translate.instant("CONTINUE_?"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("YES"),
      cancelButtonText: this.translate.instant("NO"),
    }).then((result) => {
      if (result.value) {
        this.savecartdetails();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  async savecartdetails() {
    var cartSelectedItems = [];
    cartSelectedItems = cloneDeep(this.SelectedItems);

    cartSelectedItems.forEach((item: any) => {
      if (item.is_combo == "1") {
        item.combo_items = item.combo_variants;

        if (item.combo_items != null) {
          item.tempAddons = [];
          item.combo_items.forEach((combo_variants: any) => {

            if (combo_variants.choices != null) {
              combo_variants.choices.forEach((choices: any) => {
                choices.choice_prices.forEach((choice_prices: any) => {
                  if (choice_prices.is_added == true) {
                    choices.variant_choice_price_id = choice_prices.variant_choice_price_id
                  }
                });
              });
            }

            if (combo_variants.addons != null) {
              combo_variants.tempAddons = [];
              combo_variants.addons.forEach((addons: any) => {
                addons.addon_prices.forEach((addon_prices: any) => {
                  if (addon_prices.is_added == true) {
                    var objAddons = {
                      variant_addon_id: addon_prices.variant_addon_id,
                      variant_addon_price_id: addon_prices.variant_addon_price_id
                    }
                    combo_variants.tempAddons.push(objAddons);
                  }
                });
              });

              combo_variants.addons = cloneDeep(combo_variants.tempAddons);
            }

          });
          item.choices = cloneDeep(item.tempAddons);
        }
      }
      else {
        if (item.choices != null) {
          item.choices.forEach((choices: any) => {
            choices.choice_prices.forEach((choice_prices: any) => {
              if (choice_prices.is_added == true) {
                choices.variant_choice_price_id = choice_prices.variant_choice_price_id
              }
            });
          });
        }

        if (item.addons != null) {
          item.tempAddons = [];
          item.addons.forEach((addons: any) => {
            addons.addon_prices.forEach((addon_prices: any) => {
              if (addon_prices.is_added == true) {
                var objAddons = {
                  variant_addon_id: addon_prices.variant_addon_id,
                  variant_addon_price_id: addon_prices.variant_addon_price_id
                }
                item.tempAddons.push(objAddons);
              }
            });
          });
          item.addons = cloneDeep(item.tempAddons);
        }

      }
    });

    var fd = new FormData();

    var cart_type: any = 3;
    var remove_cart: any = 1;

    fd.append('user_id', this.customerdetails.customer_user_id == 0 ? this.generalSetting.guest_user_id : this.customerdetails.customer_user_id);
    fd.append('store_id', this.sellerDetails.store_id);
    fd.append('pos_user_id', this.main.LoggedUserInfo.user_id)
    fd.append('items', JSON.stringify(cartSelectedItems));
    fd.append('cart_type', cart_type);
    fd.append('remove_cart', remove_cart);
    if (this.is_cart == true) {
      if (this.cart_group_id) {
        fd.append('cart_group_id', this.cart_group_id);
      } else {
        fd.append('cart_group_id', '');
      }
    } else {
      fd.append('cart_group_id', '');
    }
    if (this.oldcustomerdetails) {
      fd.append('old_user_id', this.oldcustomerdetails.customer_user_id);
    }

    await this.OrderService
      .addCart(fd)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.cart_group_id = response.data.cart_group_id
            this.is_cart = true
            if (this.onlysave != 'save') {
              this.router.navigate(["/pos"]);
            }
            this.toastr.success(response.message);
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => { },
        complete: () => { },
      });
  }

  //view saved order
  async cartDetails() {
    var fd = new FormData();

    var cart_type: any = 3;
    var only_item_name: any = 1;
    fd.append('user_id', this.customerdetails.customer_user_id == 0 ? this.generalSetting.guest_user_id : this.customerdetails.customer_user_id);
    fd.append('store_id', this.sellerDetails.store_id);
    fd.append('cart_group_id', this.cart_group_id);
    fd.append('cart_type', cart_type);
    fd.append('only_item_name', only_item_name);

    await this.OrderService
      .cartDetails(fd)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.getCategoryList();
            var cart_item = response.data;
            this.SelectedItems = []
            var itemdetails = [];
            cart_item.items.forEach((Item: any) => {
              Item.item_variants.forEach((variant: any) => {
                if (variant.is_added == 1) {
                  var item_data: any = {
                    item_id: Item.item_id,
                    item_image: Item.item_image,
                    item_variants_id: variant.item_variants_id,
                    order_item_id: variant.order_item_id,
                    item_name: Item.item_name,
                    brand_name: Item.brand_name,
                    packaging_name: variant.packaging_name,
                    unit_name: variant.unit_name,
                    quantity: Number(variant.quantity).toFixed(0),
                    unit_quantity: variant.unit_quantity,
                    discounted_price: variant.total_discounted_price,
                    discountedprice: variant.total_discounted_price,
                    price: variant.item_price,
                    packaging: variant.packaging == null ? 0 : variant.packaging,
                    tax: variant.tax,
                    choices: variant.choices,
                    addons: variant.addons,
                    is_combo: Item.is_combo,
                    min_qty: variant.min_qty,
                    max_qty: variant.max_qty,
                    tax_price: Number(Number(variant.discounted_price) * Number(variant.tax) / 100).toFixed(2),
                  }

                  if (this.settings.pos_allow_item_packaging == 0) {
                    item_data.packaging = '0'
                  }
                  item_data.tax = this.item_tax_type == 1 ? variant.tax : variant.tax_group_percentage;
                  item_data.tax_price = Number(Number(variant.discounted_price) * Number(item_data.tax) / 100).toFixed(2);

                  if (variant.choices_addons != null) {
                    item_data.choices_addons = variant.choices_addons;
                  } else {
                    item_data.choices_addons = null;
                  }

                  var choices_addons = [];
                  if (Item.combo_variants != null) {
                    item_data.combo_variants = Item.combo_variants;
                    if (item_data.combo_variants) {
                      item_data.combo_variants.forEach((combo: any) => {
                        choices_addons = [];
                        combo.choices.forEach((choice: any) => {
                          choice.choice_prices.forEach((choicePrice: any) => {
                            if (choicePrice.is_added == 1) {
                              choices_addons.push(choice.variant_choice_name + ' : ' + choicePrice.variant_sub_choice_name);
                            }
                          });
                        });

                        combo.addons.forEach((addon: any) => {
                          var addonName = '';
                          addon.addon_prices.forEach((addonsPrice: any) => {
                            if (addonsPrice.is_added == 1) {
                              addonName = addonName == '' ? addonsPrice.variant_sub_addon_name : (addonName + ', ' + addonsPrice.variant_sub_addon_name);
                            }
                          });
                          if (addonName != '') {
                            choices_addons.push(addon.variant_addon_name + ' : ' + addonName);
                          }
                        });
                        combo.choices_addons = choices_addons;
                      });
                    }
                  } else {
                    item_data.choices?.forEach((choice: any) => {
                      choice.choice_prices.forEach((choicePrice: any) => {
                        if (choicePrice.is_added == 1) {
                          choices_addons.push(choice.variant_choice_name + ' : ' + choicePrice.variant_sub_choice_name);
                        }
                      });
                    });

                    item_data.addons?.forEach((addon: any) => {
                      var addonName = '';
                      addon.addon_prices.forEach((addonsPrice: any) => {
                        if (addonsPrice.is_added == 1) {
                          addonName = addonName == '' ? addonsPrice.variant_sub_addon_name : (addonName + ', ' + addonsPrice.variant_sub_addon_name);
                        }
                      });
                      if (addonName != '') {
                        choices_addons.push(addon.variant_addon_name + ' : ' + addonName);
                      }
                    });
                    item_data.choices_addons = choices_addons;
                  }
                  itemdetails.push(item_data);
                }
              });
            });

            this.SelectedItems = itemdetails;
            this.itemtotal = 0;
            this.taxPrice = 0;
            this.taxAndChargesTotal = 0;
            this.grandtotal = 0;

            this.SelectedItems.forEach((item: any) => {
              this.itemtotal = Number(Number(this.itemtotal) + Number(item.discounted_price * item.quantity)).toFixed(2);
              this.packagingCharges = Number(this.packagingCharges) + (Number(item.packaging * item.quantity));
              this.taxPrice = this.taxPrice + Number(((Number(item.discounted_price) * item.tax) / 100) * item.quantity);
              this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
              this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
              var price = Number(Number(item.discounted_price) * item.quantity);
              this.grandtotal = Number(Number(this.grandtotal) + Number(price)).toFixed(2);
            });
            this.grandtotal = Number(Number(this.grandtotal) + Number(this.taxAndChargesTotal)).toFixed(2);
            this.selecteditemsqty = 0;

            this.SelectedItems.forEach((item: any) => {
              this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
              item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
            });
            this.toastr.success(response.message);
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => { },
        complete: () => { },
      });
  }

  back() {
    if (this.SelectedItems.length == 0) {
      history.back();
    } else {
      Swal.fire({
        title: this.translate.instant('DO_YOU_WANT_TO_CLEAR_CART_AND_GO_TO_SELECT_CUSTOMER'),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: this.translate.instant("YES"),
        cancelButtonText: this.translate.instant("NO"),
      }).then((result) => {
        if (result.value) {
          history.back();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
    }
  }

  orderConform() {
    if (this.SelectedItems.length == 0) {
      this.toastr.error(this.translate.instant("CART_CANNOT_BE_EMPTY"));
      return;
    }
    if (this.paymentMethod == undefined) {
      if (this.order_amount != 0) {
        this.toastr.error(this.translate.instant("PLEASE_SELECT_PAYMENT_METHOD"));
        return;
      }
    }

    this.balance_due = 0.00;

    if (this.paymentMethod) {
      if (this.paymentMethod.name == 'Multiple') {
        if (this.wallet_amount > 0) {
          this.balance_due = Number(this.order_amount).toFixed(2)
        } else {
          this.balance_due = Number(this.grandtotal).toFixed(2)
        }
      } else {
        if (this.wallet_amount > 0) {
          this.balance_due = Number(Number(this.balance_due) - Number(this.order_amount)).toFixed(2)
        } else {
          this.balance_due = Number(Number(this.balance_due) - Number(this.grandtotal)).toFixed(2)
        }
      }

      if (this.paymentMethod.name != 'Multiple') {
        if (parseFloat(this.paymentMethod.maxordervalue) > 0 && parseFloat(this.grandtotal) > parseFloat(this.paymentMethod.maxordervalue)) {
          var name = this.paymentMethod.name.split('(')[0]
          name = name.split(' ')[0]
          this.toastr.error(this.translate.instant("Max limit for Payment Method (" + name + ") has exceeded"));
          return;
        }
      }
    }
    this.OrderConformPopUp();
  }

  OrderConformPopUp() {
    const modalOrderConfirm = this.modalService.open(PosOrderConfirmComponent, {
      size: "md",
    });
    modalOrderConfirm.componentInstance.global_currency = this.global_currency;
    modalOrderConfirm.componentInstance.order_amount = this.order_amount;
    modalOrderConfirm.componentInstance.wallet_amount = this.wallet_amount;
    modalOrderConfirm.componentInstance.grandtotal = this.grandtotal;
    modalOrderConfirm.componentInstance.selecteditemsqty = this.selecteditemsqty;
    modalOrderConfirm.componentInstance.paymentMethod = this.paymentMethod;
    modalOrderConfirm.componentInstance.balance_due = this.balance_due;
    modalOrderConfirm.componentInstance.paymentM = this.paymentM;
    modalOrderConfirm.componentInstance.mainpaymentMethodList = this.mainpaymentMethodList;
    modalOrderConfirm.componentInstance.temp_paymentMethodList = this.temp_paymentMethodList;
    modalOrderConfirm.componentInstance.paymentMethodList = this.paymentMethodList;
    modalOrderConfirm.componentInstance.settings = this.settings;
    modalOrderConfirm.componentInstance.main = this.main;
    modalOrderConfirm.componentInstance.SelectedItems = this.SelectedItems;
    modalOrderConfirm.componentInstance.sellerDetails = this.sellerDetails;
    modalOrderConfirm.componentInstance.offer_code = this.offer_code;
    modalOrderConfirm.componentInstance.offerPrice = this.offerPrice;
    modalOrderConfirm.componentInstance.deliverycharge = this.deliverycharge;
    modalOrderConfirm.componentInstance.packagingCharges = this.packagingCharges;
    modalOrderConfirm.componentInstance.taxPrice = this.taxPrice;
    modalOrderConfirm.componentInstance.newSellerOrder = this.newSellerOrder;
    modalOrderConfirm.componentInstance.is_cart = this.is_cart;
    modalOrderConfirm.componentInstance.cart_group_id = this.cart_group_id;

    modalOrderConfirm.componentInstance._printData.subscribe((printData) => {
      this.print_order_bill(printData);
    });
  }

  print_order_bill(printData) {
    this.orderdetail = printData.orderdetail;
    this.sellerDetails.fullAddress = printData.fullAddress;
    this.orderitemdetail = printData.orderitemdetail;
    window.setTimeout(() => {
      this.PrintDIV("PrintMiniBill");
    }, 1000);
  }

  PrintDIV(divId: any) {
    var contents = document.getElementById(divId).innerHTML;
    var body = document.getElementsByTagName("BODY")[0];

    //Create a dynamic IFRAME.
    var frame1: any = document.createElement("IFRAME");
    frame1.name = "frame1";
    frame1.setAttribute("style", "position:absolute;top:-1000000px");
    body.appendChild(frame1);

    //Create a Frame Document.
    var frameDoc = frame1.contentWindow
      ? frame1.contentWindow
      : frame1.contentDocument.document
        ? frame1.contentDocument.document
        : frame1.contentDocument;
    frameDoc.document.open();

    //Create a new HTML document.
    frameDoc.document.write("<html><head><title></title>");
    frameDoc.document.write("</head><body>");
    frameDoc.document.write(
      "<style>.profile-media {display: -ms-flexbox;display: flex;-ms-flex-align: start;align-items: flex-start;}.profile-body {-ms-flex: 1;flex: 1;padding-left: 15px;border-left: 1px solid #ddd;}.profile-media .profile-box {width: 90px;height: 90px;overflow: hidden;border-radius: 50%;margin-right: 15px;}.prcess-circle {width: 120px;height: 120px;display: inline-block;border: 2px solid #e0e0e0;border-radius: 50%;background-color: #ffffff;}.profile-media .profile-box img {width: 100%;}.profile-media .dt-row {margin-bottom: 10px;}.account-process {text-align: center;width: 100%;}.prcess-circle .title-box {margin-top: 22px;margin-left: auto;margin-right: auto;width: 90px;text-align: center;font-size: 14px;line-height: 18px}.prcess-circle .profile-box img {width: 100%;}.orderDetail {padding: 15px 0;}.orderDetail .control-label {margin: 0;}.modal-content tr:nth-child(even) {background: #CCC}.modal-content tr:nth-child(odd) {background: #FFF}.schaduleDiv{background-color:#24c9fcc7;padding: 10px 10px;margin-left: 12px;margin-top: 10px;}.table{border-collapse: inherit;} ul { padding-left: 0rem !important; list-style: none; }</style>"
    );
    frameDoc.document.write(
      "<style>@media print{.col-md-6{width:50%; float:left;} .col-sm-4 {width: 33.33333333%;float:left;} .col-md-8 {width: 66.66666667%;} .form-group label {margin-bottom: 5px;color: #666666;font-weight: 400;font-size: 13px; th {background-color: #d8d4d4;font-size: 13px; }}}.table > tbody > tr > td{font-size: 13px;} ul { padding-left: 0rem !important; list-style: none; }</style>"
    );
    if (divId == "PrintPackSlip") {
      frameDoc.document.write("<style>@page{size:Statement;}</style>");
    } else {
      frameDoc.document.write("<style>@page{size:A4;}</style>");
    }

    //Append the external CSS file.
    frameDoc.document.write(
      '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">'
    );

    //Append the DIV contents.
    frameDoc.document.write(contents);
    frameDoc.document.write("</body></html>");
    frameDoc.document.close();
    this.router.navigate(["/pos/"]);

    window.setTimeout(function () {
      window.frames["frame1"].focus();
      window.frames["frame1"].print();
      body.removeChild(frame1);
    }, 1000);
  }

  view_item_details(item) {
    var tem_varient = {
      discounted_price: item.discounted_price,
      item_price: item.item_price,
      item_variants_id: item.item_variants_id,
      packaging_id: item.packaging_id,
      packaging_name: item.packaging_name,
      sub_category_id: 1,
      unit_id: item.unit_id,
      unit_name: item.unit_name,
      unit_quantity: item.unit_quantity
    }
    var varientItem: any = [];
    varientItem.push(tem_varient);
    const modalRef = this.modalService.open(ItemDescriptionComponent, {
      size: "lg-950",
      centered: true,
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.itemId = item.item_id;
    modalRef.componentInstance.show_price_same_font = this.show_price_same_font;
    modalRef.componentInstance.is_pos = true;
    modalRef.componentInstance.is_display_item_type = this.loginUserStore.item_type;
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

  addCustomer() {
    const addCustomer_modalRef = this.modalService.open(AddPosCustomerComponent, {
      size: "md",
    });
    addCustomer_modalRef.componentInstance.main = this.main;
    addCustomer_modalRef.componentInstance.order_page = true;
    addCustomer_modalRef.componentInstance.newCutomer.subscribe(
      (item) => {
        this.customerdetails = item;
      }
    );
  }

  removeItemOnOrder(selectedItem) {
    var filterData = this.SelectedItems.filter((item) => item !== selectedItem);
    this.SelectedItems = filterData;
    this.gridDataPage.forEach((item: any) => {
      if (item.item_variants_id == selectedItem.item_variants_id) {
        item.quantity = 0
        item.SelectedQty = 0
      }
    });

    this.selecteditemsqty = 0;
    this.SelectedItems.forEach((item: any) => {
      this.selecteditemsqty = Number(this.selecteditemsqty) + Number(item.quantity)
      item.final_price = Number((Number(item.discounted_price) + Number(item.tax_price)) * Number(item.quantity)).toFixed(2)
    });

    this.itemtotal = Number(Number(this.itemtotal) - (Number(selectedItem.discounted_price) * Number(selectedItem.quantity))).toFixed(2);
    this.taxPrice = this.taxPrice - (((Number(selectedItem.discounted_price) * selectedItem.tax) * Number(selectedItem.quantity)) / 100);
    this.packagingCharges = Number(this.packagingCharges) - (Number(selectedItem.packaging) * Number(selectedItem.quantity));
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.packagingCharges, this.taxPrice);
    this.taxAndChargesTotal = Number(Number(this.taxPrice) + Number(this.packagingCharges)).toFixed(2);
    this.grandtotal = Number(Number(this.itemtotal) + Number(this.taxAndChargesTotal)).toFixed(2);
    this.SelectedItems = this.SelectedItems.filter(item => item.quantity != 0);

    if (this.SelectedItems.length == 0) {
      this.newSellerOrder.apply_Wallet = false
    }
    if (this.offer_code) {
      this.ValidOfferCode(this.offer_code)
    }
    else {
      this.ApplyWallateAmount(this.newSellerOrder.apply_Wallet);
    }
  }

  micRifht() {

  }

  priceFormatter(value: any) {
    if (value) {
      var price = value.toString().split(".")[0];
      var decimal = value.toString().split(".")[1];
      if (this.show_price_same_font == 1) {
        return this.global_currency + price + this.amount_seperator + decimal;
      } else {
        return this.global_currency + price + "<span class='price-decimal'><small>" + this.amount_seperator + decimal + "</small></span>";
      }
    } else {
      return '0';
    }
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
}

