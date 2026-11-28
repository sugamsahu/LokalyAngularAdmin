import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ItemService } from "src/app/services/item.service";
import { CategoryService } from "src/app/services/lookup/category.service";
import { SortPipe } from "../../util/sort.pipe";
import { RepeatAddonChoiceComponent } from "../repeat-addon-choice/repeat-addon-choice.component";
import { SelectAddonChoicesComponent } from "../select-addon-choices/select-addon-choices.component";
import { SelectItemDeleteAddonChoiceComponent } from "../select-item-delete-addon-choice/select-item-delete-addon-choice.component";
import { environment } from "src/environments/environment";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { SelectComboItemsComponent } from "../select-combo-items/select-combo-items.component";
import * as $ from "jquery";
import { RepeatComboItemsComponent } from "../repeat-combo-items/repeat-combo-items.component";
import { cloneDeep } from "lodash";
import { ItemFilterComponent } from "../item-filter/item-filter.component";
import { WebCamComponent } from "../web-cam/web-cam.component";
import { ViewMultipleImageComponent } from "../view-multiple-image/view-multiple-image.component";
import { StockInwardService } from 'src/app/services/manage-stock/stock-inward.service';
import { CommonService } from "src/app/services/common.service";
import Swal from 'sweetalert2';
import { VoiceSearchComponent } from "../voice-search/voice-search.component";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-add-select-item',
  templateUrl: './add-select-item.component.html',
  styleUrls: ['./add-select-item.component.scss']
})

export class AddSelectItemComponent implements OnInit {
  @ViewChild('tabGroup')
  tabGroup;
  @ViewChild('sub_cat_tabGroup')
  sub_cat_tabGroup;
  @Input() main: any;
  @Input() isSuperAdmin: any;
  @Input() selectedSeller: any;
  @Input() foritemcollectionDisplay: any;
  @Input() chatSupport: boolean = false;
  @Output() SelectedItemFromStore: EventEmitter<any> = new EventEmitter<any>();
  selecteditemsqty: number = 0;
  categoryList: any = [];
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  selectedCategory: any = {
    label: "",
    value: "",
  };
  stockMethodList = [
    { label: 'At Item Level', value: 2 },
    { label: 'At Variant Level', value: 3 }
  ]
  selectedStockMethod = 2
  page: number = 1;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  search: string = "";
  count: number = 0;
  tableSize: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  session_store_id = localStorage.getItem("adminselectedstore");
  totalCount: number = 0;
  categoryGridData: any = [];
  noData: boolean = true;
  gridData: any = [];
  gridDataPage: any = [];
  selectedItems: any = [];
  iseatery: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  show_price_same_font: any;
  global_currency: any;
  @Input() SelectedItems: any = [];
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
  modelNewItem: any = [];
  @Input() picker;
  @Input() singlepicker;
  @Input() categoryId;
  @Input() forAddOrder;
  tileview = true;
  //voice
  @ViewChild("gSearch") formSearch;
  isVoiceSearch = false;
  @ViewChild("searchKey") hiddenSearchHandler;
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
  @Input() orderprocess;
  selectedSubcategory: any
  //combo
  @Input() comboItemSelection: boolean = false;
  @Input() isOfferItemSelection: boolean = false;
  @Input() initialSelectedItems: any;
  @Input() offerAddedItem: any;
  @Input() comboItemId: number = 0;
  //dinein
  @Input() IsDineInStiing: boolean = false;
  //dinein
  @Output() selectedPopupItems: EventEmitter<any> = new EventEmitter();
  //manage offer (start)
  @Input() isManageOffer: boolean = false;
  @Input() showvariant: any

  //manage offer (end)
  @Input() foritemgrouping: boolean = false;
  @Input() foritemcollection: boolean = false;
  @Input() item_recommend_id;
  @Input() seller_item_collection_id;
  @Input() item_collection_id;
  added_items: any = [];
  subCategoryList: any[];
  @Input() is_damage_stock: boolean = false;

  //To handle table view
  view_image = true;
  view_sub_category = true;
  view_veg_non_neg = true;
  view_brand = true;
  view_item = true;
  view_varient = true;
  view_chs_adns = true;
  view_price = true;
  view_packaging = true;
  view_quantity = true;
  view_action = false;
  view_category = false;
  from_items = false;
  existing_selectedItems: any = [];
  all_AdnChsDlt: any = false;
  hideGotoCart: any = true;
  hidePrice: any = true;
  is_damage: any;
  is_outward: any;
  style_obj_add_select_item: any;
  amount_seperator: any;
  @Input() admin_combo;
  constructor(
    public modal: NgbActiveModal,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private itemService: ItemService,
    private sortPipe: SortPipe,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private _stockInwardService: StockInwardService,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    if (this.admin_combo) {
      this.loginUserStore = this.main.LoggedUserStoreInfo;
    }
    this.style_obj_add_select_item = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    if (this.comboItemSelection || this.foritemcollection || this.foritemgrouping || this.isManageOffer || this.IsDineInStiing || this.is_damage_stock) {
      this.from_items = true;
    }

    if (this.foritemcollection || this.foritemgrouping) {
      this.view_varient = false;
      this.view_price = false;
      this.view_chs_adns = false;
      this.view_packaging = false;
      this.view_quantity = false;
      this.view_action = true;
    }

    if (this.comboItemSelection) {
      this.view_chs_adns = false;
      this.view_packaging = false;
      this.view_quantity = false;
      this.view_action = true;
    }

    if (this.isManageOffer || this.IsDineInStiing) {
      this.view_chs_adns = false;
      this.view_packaging = false;
      this.view_quantity = false;
      this.view_action = true;
      this.view_price = true;
    }

    if (this.is_damage_stock) {
      this.view_chs_adns = false;
      this.view_packaging = false;
      this.view_price = false;
    }

    if (this.comboItemSelection || this.foritemcollection || this.foritemgrouping || this.isManageOffer || this.IsDineInStiing) {
      this.view_category = true;
    }

    $(
      "<style>.card-body {  padding: 0.75rem !important; padding-top: 0.2rem !important; padding-bottom: 0rem !important}</style>"
    ).appendTo("body");

    $(
      "<style>.modal-content{ max-height: 34.25rem;}</style>"
    ).appendTo("body");

    if (this.from_items) {
      this.tileview = false
      if (this.initialSelectedItems?.length > 0) {
        this.added_items = this.initialSelectedItems;
        this.calculateSelectedItem();
      }
    } else {
      if (this.picker == 1) {
        this.SelectedItems.forEach((element) => {
          element.SelectedQty = element.quantity;
        });
      }
      if (this.SelectedItems != null || this.SelectedItems.length > 0) {
        this.existing_selectedItems = cloneDeep(this.SelectedItems);
        this.patchSelectedValue();
      }
    }

    this.iseatery = this.main.LoggedUserStoreInfo.iseatery;
    if (this.iseatery == 0) {
      this.tileview = false
    }

    if (this.comboItemSelection || this.foritemcollection || this.foritemgrouping || this.isManageOffer || this.IsDineInStiing || this.is_damage_stock || this.chatSupport) {
      this.hideGotoCart = false;
    }

    if (this.picker || this.foritemgrouping || this.foritemcollection) {
      this.hidePrice = false;
    }
    this.amount_seperator = this.generalSetting?.amount_seperator;
    this.show_price_same_font = this.generalSetting.show_price_same_font;
    this.global_currency = this.generalSetting.currency_symbol;
    this.getCategoryList();
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.gridDataPage = []
          this.getItemList(1);
        })
      )
      .subscribe();
  }

  calculateSelectedItem() {
    this.added_items.forEach((element) => {
      this.selecteditemsqty += parseInt(element.quantity ? element.quantity : 0);
    });
  }

  stockMethodChange(item) {
    this.selectedStockMethod = item
    this.gridDataPage = []
    this.getItemList(1);
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
        this.search = voice;
        this.getItemList(1);
      }
    });
  }

  clearSearch() {
    this.gridDataPage = [];
    if (this.search !== '') {
      (<HTMLInputElement>document.getElementById("searchevt")).value = ''
      this.search = '';
      this.getItemList(1);
    }
  }

  patchSelectedValue() {
    this.SelectedItems.forEach((item) => {
      this.selecteditemsqty += parseInt(item.quantity);
      var ch: any = {
        order_item_id: item.order_item_id,
        unit_quantity: item.unit_quantity,
        Selected: item.Selected,
        SelectedQty: item.quantity == "" ? 0 : item.quantity,
        item_image: item.item_image,
        item_type: item.item_type,
        category_name: item.category_name,
        sub_category_name: item.sub_category_name,
        brand_name: "",
        item_name: item.item_name,
        item_id: item.item_id,
        item_variants_id: item.item_variants_id,
        item_price: item.price,
        discounted_price: item.discountedprice
          ? item.discountedprice
          : item.discounted_price,
        packaging_id: item.packaging,
        packaging_name: item.packaging_name,
        unit_id: item.unit_id,
        unit_name: item.unit_name,
        sku: "",
        out_of_stock: '0',
        mask_price: 0,
        min_qty: 0,
        max_qty: 0,
        ia_available_choice_addon: item.ia_available_choice_addon,
        is_choice_addon: item.is_choice_addon,
        choices: item.choices,
        addons: item.addons,
        packaging: item.packaging,
        tax_price: item.tax_price,
        tax: item.tax,
        prescription: item.prescription,
        combo_variants: item.combo_variants,
        is_combo: item.is_combo,
        choices_addons: item.choices_addons,
      };
      if (this.orderprocess) {
        ch.current_stock = item.current_stock
        ch.stock_unit = item.stock_unit
        ch.stock_management_method = item.stock_management_method
        ch.out_stock_qty = item.out_stock_qty
      }
      if (
        item.choices != null ||
        item.addons != null ||
        // item.choices_addons != null
        item.choices_addons?.length != 0
      ) {
        this.SelectedItemsAddOnsChoices.push(ch);
      }
      if (item.combo_variants != null) {
        this.SelectedItemsCombo.push(ch);
      }
    });
  }

  getCategoryList() {
    if ((this.foritemcollectionDisplay || this.foritemcollection) && this.isSuperAdmin && this.selectedSeller) {
      var data: any = {
        store_id: this.selectedSeller.store_id,
      };
    } else {
      var data: any = {
        store_id: this.loginUserStore.store_id,
      };
    }

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

          //for combo
          if (this.from_items && !this.foritemcollection) {
            this.categoryList = this.categoryList.filter((cat) => cat.value != 1 && cat.value != 2);
          }

          //for dineIn Setting
          if (this.IsDineInStiing) {
            if (this.added_items.length > 0) {
              this.categoryList.splice(0, 0, {
                label: "Excluded Items",
                value: -1,
                image: "",
                sub_categories: null
              })
            }
          }

          //for picker category open
          if (this.singlepicker) {
            this.subCategoryList = [];
            this.selectedCategory = this.categoryList.filter((cat: any) => cat.value == this.categoryId)[0];
            this.selectedCategory.sub_categories = this.selectedCategory.sub_categories?.filter((x) => x.count > 0)
            if (this.selectedCategory.sub_categories) {
              this.selectedCategory.sub_categories.splice(0, 0, {
                sub_category_id: 0,
                sub_category_name: "All"
              })
              this.subCategoryList = this.selectedCategory.sub_categories;
            }
            this.selectedSubcategory = this.selectedCategory.sub_categories ? this.selectedCategory.sub_categories[0] : 0;
          }

          //manage offer (start)
          else if (this.showvariant && this.isManageOffer == true) {
            if (this.added_items.length > 0) {
              this.categoryList.splice(0, 0, {
                label: "Selected Items",
                value: -1,
                image: "",
                sub_categories: null
              })
            }
          }


          //for add order
          if (this.SelectedItems.length > 0) {
            if (this.forAddOrder) {
              this.categoryList.splice(0, 0, {
                label: "Selected Items",
                value: -1,
                image: "",
                sub_categories: null
              })
            }
          }

          this.selectedCategory = this.categoryList[0];
          this.getItemList(1);
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

  tabChanged(event) {
    var category: any = this.categoryList[event.index];
    this.changeCategory(category);
  }

  changeCategory(category) {
    // if(category.value == '-1'){
    // this.gridDataPage = this.SelectedItems
    // }else{
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
    // }
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

      if (this.singlepicker == 1) {
        this.selectedCategory.label = "xyz";
        this.selectedCategory.value = this.categoryId;
      }

      var data: any = {
        store_id: this.main.LoggedUserStoreInfo.store_id
          ? this.main.LoggedUserStoreInfo.store_id
          : this.session_store_id,
        page: this.page,
        categories: this.selectedCategory ? this.selectedCategory.value : 0,
        sub_category_id: this.selectedSubcategory ? this.selectedSubcategory.sub_category_id : 0,
        search_query: search,
        user_id: this.main.LoggedUserInfo.user_id,
        is_item_variant_level: 0,
        out_of_stock: '0',
        limit: 24,
        mask_price: 0,
        order_type: 1,
        customer_address_id:
          this.tax_calculation_address == 1
            ? this.deliveryAddress == undefined
              ? undefined
              : this.deliveryAddress.customer_address_id
            : this.billingAddress == undefined
              ? undefined
              : this.billingAddress.customer_address_id,
        order_id:
          this.orderdetail == undefined ? undefined : this.orderdetail.order_id,
        sort_field: this.sortKey,
        sort_type: this.isOrderBy,
        search_type: 1,
      };

      data.displaySpinner = true

      if (this.from_items) {
        delete data.out_of_stock;
        delete data.mask_price;
        delete data.order_type;
        delete data.is_item_variant_level;
      }

      if (this.isManageOffer || this.IsDineInStiing || this.forAddOrder) {
        data.is_item_variant_level = 0;
        if (this.selectedCategory.value == -1) {
          data.categories = 0
        }
      }

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
                ? '0'
                : outOfStock?.is_checked
                  ? '1'
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
          // data.sub_category_id = this.filters.selectedSubCategory
          // .map((x) => x.sub_category_id)
          // .toString();
          data.sub_category_id = this.filters.selectedSubCategory.sub_category_id.toString()
        }

      }

      if (this.foritemgrouping) {
        if (this.item_recommend_id) {
          data.item_recommend_id = this.item_recommend_id
        }
      }

      if (this.foritemcollection || this.foritemcollectionDisplay) {
        if (this.seller_item_collection_id) {
          data.seller_item_collection_id = this.seller_item_collection_id
        }
        data.is_sort = 1
      }

      if (this.foritemcollectionDisplay) {
        if (this.item_collection_id) {
          data.item_collection_id = this.item_collection_id
        }
      }

      if (this.picker) {
        data.is_picker = 1
      }

      this.isVoiceSearch = false;
      this.cdr.detectChanges()
      if (this.is_damage_stock) {
        data.category_id = data.categories
        data.stock_management_method = this.selectedStockMethod
      }
      if (this.forAddOrder == 1 || this.orderprocess == 1 || this.chatSupport || this.isManageOffer) {
        data.out_of_stock = '0'
      }
      if ((this.foritemcollectionDisplay || this.foritemcollection) && this.isSuperAdmin && this.selectedSeller) {
        data.store_id = this.selectedSeller.store_id
      }
      this.itemService.get(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.showFilters = true;
            this.noData = false;
            this.totalCount = response.count;
            this.count = response.count;
            this.categoryGridData = response.data;
            if (this.selectedStockMethod == 2 && this.is_damage_stock == true) {
              this.categoryGridData.forEach(element => {
                element.item_variants.forEach((variant, index) => {
                  element.unit = (element.unit ? element.unit : '') + variant.unit_quantity + ' ' + variant.unit_name
                  if (element.item_variants[index + 1]) {
                    element.unit = element.unit + ', '
                  }

                });

              });
            }
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
            if (!this.from_items) {
              this.categoryGridData.forEach((category) => {
                category.item_variants.forEach((varient) => {
                  var itemdata = {
                    // item_images: category?.item_images.lenth > 0 ? category.item_images : null,
                    item_image_ids: varient.item_image_ids,
                    item_images: category?.item_images,
                    avg_rating: category?.avg_rating,
                    unit_quantity: parseFloat(varient.unit_quantity),
                    Selected: 0,
                    SelectedQty: 0,
                    item_image: category.item_image,
                    item_type: category.item_type,
                    category_id: category.category_id,
                    category_name: category.category_name,
                    sub_category_id: category.sub_category_id,
                    sub_category_name: category.sub_category_name,
                    brand_name: category.brand_name,
                    item_name: category.item_name,
                    item_id: category.item_id,
                    item_variants_id: varient.item_variants_id,
                    item_price: varient.item_price,
                    discounted_price: varient.discounted_price,
                    packaging_id: varient.packaging_id,
                    packaging_name: varient.packaging_name,
                    unit_id: varient.unit_id,
                    unit_name: varient.unit_name,
                    sku: varient.sku,
                    out_of_stock: varient.out_of_stock,
                    mask_price: varient.mask_price,
                    min_qty: varient.min_qty,
                    packaging: varient.packaging,
                    tax: varient.tax,
                    // tax_price: Number(Number(varient.item_price) * Number(varient.tax) / 100).toFixed(2),
                    tax_price: Number(
                      (Number(varient.discounted_price) * Number(varient.tax)) / 100
                    ),
                    max_qty: varient.max_qty,
                    is_choice_addon: varient.is_choice_addon,
                    ia_available_choice_addon:
                      varient.is_choice_addon == 0
                        ? "Choices / Addons Available"
                        : varient.is_choice_addon == 1
                          ? "Choices Available"
                          : varient.is_choice_addon == 2
                            ? "Addons Available"
                            : "",
                    choices: varient.choices,
                    addons: varient.addons,
                    prescription: category.prescription,
                    is_combo: category.is_combo,
                    stock_management_method: category?.stock_management_method,
                    current_stock: category?.stock_management_method == 2 ? category?.current_stock : category?.stock_management_method == 3 ? varient?.current_stock : 0,
                    out_stock_qty: varient?.out_stock_qty,
                    stock_unit: category?.stock_management_method == 2 ? category?.unit_name : varient?.unit_name,
                  };
                  if (this.orderprocess == 1) {
                    itemdata.current_stock = category?.stock_management_method == 1 ? (varient?.out_of_stock == 1 ? 'Out' : 'In') : category?.stock_management_method == 2 ? Number(category?.current_stock).toFixed(2) : Number(varient?.current_stock).toFixed(0)
                  }
                  this.gridData.push(itemdata);
                  // this.tempGridData.push(itemdata);
                });
              });
              // this.gridData.reverse()
              this.SelectedItems.forEach((item) => {
                item.item_price = item.price;
                item.quantity = Number(item.quantity);

                var found = this.gridData.filter(
                  (x) => x.item_variants_id == item.item_variants_id
                )[0];

                if (found != null || found != undefined) {
                  var found123 = this.selectedItems.filter(
                    (el) => el.item_variants_id == item.item_variants_id
                  );
                  if (found123.length > 1) {
                    var qty = 0;
                    for (var j = 0; j < found123.length; j++) {
                      qty += parseInt(item.quantity);
                    }
                    found.Selected = 1;
                    found.SelectedQty = qty;
                    // found.SelectedQty += qty;
                    if (this.picker) {
                      found.is_new = item.is_new
                    }
                    if (item.choices != null || item.addons != null) {
                      found.temp_selectedQty = item.quantity; // for min max
                    }
                  } else {
                    found.Selected = 1;
                    found.SelectedQty = item.quantity;
                    if (this.picker) {
                      found.is_new = item.is_new
                    }
                    // found.SelectedQty += item.quantity;
                    if (item.choices != null || item.addons != null) {
                      found.temp_selectedQty = item.quantity; // for min max
                    }
                  }
                }
              });
              if (this.forAddOrder && this.selectedCategory.value == -1) {
                this.gridData = [];
                this.SelectedItems.forEach(element => {
                  element.SelectedQty = element.quantity
                  element.Selected = element.quantity
                });
                this.gridData = this.SelectedItems;
                this.count = this.gridData?.length;
                this.totalCount = this.gridData?.length;
              }
            }
            else {
              if (this.comboItemSelection || this.showvariant) {
                this.categoryGridData.forEach((category) => {
                  if (category.category_id != 0) {
                    category.item_variants.forEach((varient) => {
                      var itemdata = {
                        item_image_ids: varient.item_image_ids,
                        item_images: category?.item_images, //may be change
                        avg_rating: category?.avg_rating,
                        combo_item_detail_id: this.comboItemId,
                        unit_quantity: parseFloat(varient.unit_quantity),
                        Selected: 0,
                        SelectedQty: 0,
                        item_image: category.item_image,
                        item_type: category.item_type,
                        category_name: category.category_name,
                        sub_category_name: category.sub_category_name,
                        brand_name: category.brand_name,
                        item_name: category.item_name,
                        item_id: category.item_id,
                        item_variants_id: varient.item_variants_id,
                        item_price: varient.item_price,
                        discounted_price: varient.discounted_price,
                        packaging_id: varient.packaging_id,
                        packaging_name: varient.packaging_name,
                        unit_id: varient.unit_id,
                        unit_name: varient.unit_name,
                        sku: varient.sku,
                        out_of_stock: varient.out_of_stock,
                        mask_price: varient.mask_price,
                        min_qty: varient.min_qty,
                        packaging: varient.packaging,
                        max_qty: varient.max_qty,
                        is_choice_addon: varient.is_choice_addon,
                        choices: varient.choices,
                        addons: varient.addons,
                        stock_management_method: category?.stock_management_method,
                        current_stock: category?.stock_management_method == 2 ? category?.current_stock : category?.stock_management_method == 3 ? varient?.current_stock : 0
                      };
                      this.gridData.push(itemdata);
                    });
                  }
                });
                this.added_items.forEach((item) => {
                  var found = this.gridData.filter(
                    (x) => x.item_variants_id == item.item_variants_id
                  )[0];
                  if (found != null || found != undefined) {
                    found.Selected = 1;
                    found.SelectedQty = item.quantity;
                  }
                });

                // if (this.isManageOffer == true && this.showvariant && this.selectedCategory.value == -1) {
                //   this.initialSelectedItems.forEach((item) => {
                //     item.item_variants.forEach((variant) => {
                //       // var selected_item = {
                //       item.conversation = variant.conversation,
                //         item.conversation_name = variant.conversation_name,
                //         item.discounted_price = variant.discounted_price,
                //         item.external_item_id = variant.external_item_id,
                //         item.from_unit_id = variant.from_unit_id,
                //         item.from_unit_name = variant.from_unit_name,
                //         item.from_unit_value = variant.from_unit_value,
                //         item.is_choice_addon = variant.is_choice_addon,
                //         item.is_favourite = variant.is_favourite,
                //         item.item_price = variant.item_price,
                //         item.item_variants_id = variant.item_variants_id,
                //         item.mask_price = variant.mask_price,
                //         item.max_qty = variant.max_qty,
                //         item.min_qty = variant.min_qty,
                //         item.opening_stock = variant.opening_stock,
                //         item.out_of_stock = variant.out_of_stock,
                //         item.packaging = variant.packaging,
                //         item.packaging_id = variant.packaging_id,
                //         item.packaging_name = variant.packaging_name,
                //         item.reorder_quantity = variant.reorder_quantity,
                //         item.sku = variant.sku,
                //         item.tax = variant.tax,
                //         item.tax_group_id = variant.tax_group_id,
                //         item.to_unit_id = variant.to_unit_id,
                //         item.to_unit_name = variant.to_unit_name,
                //         item.to_unit_value = variant.to_unit_value,
                //         item.unit_conversation_id = variant.unit_conversation_id,
                //         item.unit_id = variant.unit_id,
                //         item.unit_name = variant.unit_name,
                //         item.unit_quantity = variant.unit_quantity
                //       // }


                //     })
                //   })
                // }
                //manage offer (start)
                if (this.isManageOffer == true && this.showvariant && this.selectedCategory.value == -1) {
                  this.gridData = []
                  // this.gridData = this.offerAddedItem;
                  this.gridData = this.initialSelectedItems;
                  this.count = this.gridData?.length;
                  this.totalCount = this.gridData?.length
                }
                //manage offer (end)

              }
              else {
                if (this.foritemcollection || this.foritemgrouping) {
                  this.categoryGridData.forEach((category) => {
                    // category.item_variants.forEach((varient) => {
                    var itemdata = {
                      unit: category.unit,
                      // item_images: category?.item_images.lenth > 0 ? category.item_images : null,
                      item_images: category?.item_images,
                      avg_rating: category?.avg_rating,
                      unit_quantity: parseFloat(category.item_variants[0].unit_quantity),
                      Selected: 0,
                      SelectedQty: 0,
                      item_image: category.item_image,
                      item_type: category.item_type,
                      category_id: category.category_id,
                      category_name: category.category_name,
                      sub_category_id: category.sub_category_id,
                      sub_category_name: category.sub_category_name,
                      brand_name: category.brand_name,
                      item_name: category.item_name,
                      item_id: category.item_id,
                      item_variants_id: category.item_variants[0].item_variants_id,
                      item_price: category.item_variants[0].item_price,
                      discounted_price: category.item_variants[0].discounted_price,
                      packaging_id: category.item_variants[0].packaging_id,
                      packaging_name: category.item_variants[0].packaging_name,
                      unit_id: category.item_variants[0].unit_id,
                      unit_name: category.item_variants[0].unit_name,
                      stock_unit_name: this.selectedStockMethod == 2 && this.is_damage_stock ? category.unit_name : category.item_variants[0].unit_name,
                      sku: category.item_variants[0].sku,
                      out_of_stock: category.item_variants[0].out_of_stock,
                      mask_price: category.item_variants[0].mask_price,
                      min_qty: category.item_variants[0].min_qty,
                      packaging: category.item_variants[0].packaging,
                      tax: category.item_variants[0].tax,
                      // tax_price: Number(Number(varient.item_price) * Number(varient.tax) / 100).toFixed(2),
                      tax_price: Number(
                        (Number(category.item_variants[0].discounted_price) * Number(category.item_variants[0].tax)) / 100
                      ),
                      max_qty: category.item_variants[0].max_qty,
                      is_choice_addon: category.item_variants[0].is_choice_addon,
                      ia_available_choice_addon:
                        category.item_variants[0].is_choice_addon == 0
                          ? "Choices / Addons Available"
                          : category.item_variants[0].is_choice_addon == 1
                            ? "Choices Available"
                            : category.item_variants[0].is_choice_addon == 2
                              ? "Addons Available"
                              : "",
                      choices: category.item_variants[0].choices,
                      addons: category.item_variants[0].addons,
                      prescription: category.prescription,
                      is_combo: category.is_combo,
                      stock_management_method: category?.stock_management_method,
                      current_stock: category?.stock_management_method == 2 ? category?.current_stock : category?.stock_management_method == 3 ? category.item_variants[0]?.current_stock : 0
                    };
                    if (this.is_damage_stock && this.selectedStockMethod == 2) {
                      if (this.gridData[this.gridData.length - 1]?.item_id != itemdata.item_id) {
                        this.gridData.push(itemdata);
                      }
                    } else {
                      this.gridData.push(itemdata);
                    }
                    // this.tempGridData.push(itemdata);
                    // });
                  });
                } else {
                  this.categoryGridData.forEach((category) => {
                    category.item_variants.forEach((varient) => {
                      var itemdata = {
                        unit: category.unit,
                        // item_images: category?.item_images.lenth > 0 ? category.item_images : null,
                        item_image_ids: varient.item_image_ids,
                        item_images: category?.item_images,
                        avg_rating: category?.avg_rating,
                        unit_quantity: parseFloat(varient.unit_quantity),
                        Selected: 0,
                        SelectedQty: 0,
                        item_image: category.item_image,
                        item_type: category.item_type,
                        category_id: category.category_id,
                        category_name: category.category_name,
                        sub_category_id: category.sub_category_id,
                        sub_category_name: category.sub_category_name,
                        brand_name: category.brand_name,
                        item_name: category.item_name,
                        item_id: category.item_id,
                        item_variants_id: varient.item_variants_id,
                        item_price: varient.item_price,
                        discounted_price: varient.discounted_price,
                        packaging_id: varient.packaging_id,
                        packaging_name: varient.packaging_name,
                        unit_id: varient.unit_id,
                        unit_name: varient.unit_name,
                        stock_unit_name: this.selectedStockMethod == 2 && this.is_damage_stock ? category.unit_name : varient.unit_name,
                        sku: varient.sku,
                        out_of_stock: varient.out_of_stock,
                        mask_price: varient.mask_price,
                        min_qty: varient.min_qty,
                        packaging: varient.packaging,
                        tax: varient.tax,
                        // tax_price: Number(Number(varient.item_price) * Number(varient.tax) / 100).toFixed(2),
                        tax_price: Number(
                          (Number(varient.discounted_price) * Number(varient.tax)) / 100
                        ),
                        max_qty: varient.max_qty,
                        is_choice_addon: varient.is_choice_addon,
                        ia_available_choice_addon:
                          varient.is_choice_addon == 0
                            ? "Choices / Addons Available"
                            : varient.is_choice_addon == 1
                              ? "Choices Available"
                              : varient.is_choice_addon == 2
                                ? "Addons Available"
                                : "",
                        choices: varient.choices,
                        addons: varient.addons,
                        prescription: category.prescription,
                        is_combo: category.is_combo,
                        stock_management_method: category?.stock_management_method,
                        current_stock: category?.stock_management_method == 2 ? category?.current_stock : category?.stock_management_method == 3 ? varient?.current_stock : 0
                      };
                      if (this.is_damage_stock && this.selectedStockMethod == 2) {
                        if (this.gridData[this.gridData.length - 1]?.item_id != itemdata.item_id) {
                          this.gridData.push(itemdata);
                        }
                      } else {
                        this.gridData.push(itemdata);
                      }
                      // this.tempGridData.push(itemdata);
                    });
                  });
                }


                //for dineIn Setting
                if (this.IsDineInStiing && this.selectedCategory.value == -1) {
                  this.gridData = [];
                  this.gridData = this.added_items;
                  this.count = this.gridData?.length;
                  this.totalCount = this.gridData?.length;
                }
                //for dineIn Setting

                //manage offer (start)
                if (this.isManageOffer == true && this.selectedCategory.value == -1) {
                  this.gridData = [];
                  this.gridData = this.initialSelectedItems;
                  this.count = this.gridData?.length;
                  this.totalCount = this.gridData?.length;
                }
                //manage offer (end)

                if (this.IsDineInStiing) {
                  this.added_items.forEach((item) => {
                    var found: any = this.gridData.filter(
                      (x) => x?.item_variants_id == item?.item_variants_id
                    )[0];

                    if (found != null || found != undefined) {
                      found.Selected = 1;
                      found.SelectedQty = item?.quantity;
                    }
                  });
                } else {
                  this.added_items.forEach((item) => {
                    var found: any = this.gridData.filter(
                      (x) => x?.item_id == item?.item_id
                    )[0];

                    if (found != null || found != undefined) {
                      found.Selected = 1;
                      found.SelectedQty = item?.quantity;
                    }
                  });
                }
              }
            }
            this.gridData.reverse()
            this.gridData = this.sortPipe.transform(
              this.gridData,
              "desc",
              "Selected"
            );

            this.gridData.forEach(element => {
              // For variant wise image display
              if (this.foritemcollection || this.foritemgrouping) {
                element.item_images.forEach(img => {
                  img.thumbImage = img.image
                });
                element.ImageObject = element.item_images
              } else {
                if (element.item_image_ids) {
                  var imageObject: any = [];
                  var img = element.item_image_ids.split(',');
                  img.forEach((vraiant_image: any) => {
                    var found = element.item_images.filter((item: any) => item.item_image_id == vraiant_image)[0];
                    if (found) {
                      let obj: any = {
                        image: found.image,
                        thumbImage: found.image,
                        type: found.type
                      }
                      imageObject.push(obj)
                    }
                  });
                  element.ImageObject = imageObject;
                }
              }

              if (this.picker) {
                if (!element.Selected) {
                  this.gridDataPage.push(element)
                } else {
                  if (element.is_new) {
                    this.gridDataPage.push(element)
                  }
                }
              } else {
                this.gridDataPage.push(element)
              }
            });

            this.spinner = false
            this.cdr.detectChanges()
          }
          else {
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

  incrementValue(item, add, choice, newPage) {
    if (item.SelectedQty == 0 && item.min_qty != 0) {
      Swal.fire({
        title: ('The minimum quantity for item is ' + item.min_qty + ', Do you want to proceed?'),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: this.translate.instant("YES"),
        cancelButtonText: this.translate.instant("NO"),
      }).then((result) => {
        if (result.value) {
          this.addItem(item, add, choice, newPage);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
    }
    else if (item.SelectedQty != 0 && item.max_qty != 0) {
      if ((item.choices != null || item.addons != null) && item?.is_combo != 1) {
        if (item.temp_selectedQty == item.max_qty) {
          Swal.fire({
            title: ('The maximum quantity for item is ' + item.max_qty + '.'),
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
          this.addItem(item, add, choice, newPage);
        }
      } else {
        if (item.SelectedQty == item.max_qty) {
          Swal.fire({
            title: ('The maximum quantity for item is ' + item.max_qty + '.'),
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
          this.addItem(item, add, choice, newPage);
        }
      }
    }
    // }
    else {
      this.addItem(item, add, choice, newPage);
    }
  }

  addItem(item, add, choice, newPage) {
    var itemdetails = JSON.stringify(item);
    this.modelNewItem = itemdetails;
    if (item.is_choice_addon != null) {
      var found123 = this.SelectedItemsAddOnsChoices.filter(
        (el) => el.item_variants_id == item.item_variants_id
      );
      if (found123 != null && found123 != undefined && found123?.length > 0) {
        var found45 = found123[found123?.length - 1];
        var found46 = JSON.stringify(found45);
        var found: any = JSON.parse(found46);
        var price =
          found.discounted_price != "" || found.discounted_price != undefined
            ? parseFloat(found.discounted_price)
            : parseFloat(found.item_price);
        var choices_addons = [];

        if (found.choices != null) {
          found.choices.forEach((choice) => {
            var choiceName = "";

            choice.choice_prices.forEach((choicePrice) => {
              if (choicePrice.is_added == true) {
                price += parseFloat(choicePrice.price);
                choiceName =
                  choice.variant_choice_name +
                  " : " +
                  choicePrice.variant_sub_choice_name
              }
            });
            if (choiceName != "") {
              choices_addons.push(choiceName)
            }
          });
          found.choices_addons = choices_addons // for showing last add choices data
        }

        if (found.addons != null) {
          found.addons.forEach((addon) => {
            var addonName = "";
            addon.addon_prices.forEach((addonPrice) => {
              if (addonPrice.is_added == true) {
                price += parseFloat(addonPrice.price);
                addonName =
                  addonName == ""
                    ? addonPrice.variant_sub_addon_name
                    : addonName + ", " + addonPrice.variant_sub_addon_name;
              }
            });
            if (addonName != "") {
              choices_addons.push(addon.variant_addon_name + " : " + addonName);
            }
          });
          found.choices_addons = choices_addons;
        }


        found.price = price;
        found.total_price = price;
        this.last_used_addon_choice = found;
        this.openLastAddOnChoice();
      } else {
        this.openSelectAddonChoices(item, add, choice);
      }
      // var stores = response.data.filter((item) => item.role_id == 2 && item.khata_user == 0);
      return;
    }

    if (item.is_combo == "1") {
      var findSelectedComboItem = this.SelectedItemsCombo.filter(
        (x) => x.item_variants_id == item.item_variants_id
      );
      if (
        findSelectedComboItem != null &&
        findSelectedComboItem != undefined &&
        findSelectedComboItem?.length > 0
      ) {
        var findSelectedComboItem1 =
          findSelectedComboItem[findSelectedComboItem?.length - 1];

        var price =
          findSelectedComboItem1.discounted_price != "" ||
            findSelectedComboItem1.discounted_price != undefined
            ? parseFloat(findSelectedComboItem1.discounted_price)
            : parseFloat(findSelectedComboItem1.item_price);

        if (findSelectedComboItem1.combo_variants?.length > 0) {
          findSelectedComboItem1.combo_variants.forEach((combo) => {
            var choices_addons = [];

            combo.choices?.forEach((choice) => {
              choice.choice_prices.forEach((choicePrice) => {
                if (choicePrice.is_added == true) {
                  price += Number(choicePrice.price);
                  choices_addons.push(
                    choice.variant_choice_name +
                    " : " +
                    choicePrice.variant_sub_choice_name
                  );
                }
              });
            });

            combo.addons?.forEach((addon) => {
              var addonName = "";
              addon.addon_prices.forEach((addonsPrice) => {
                if (addonsPrice.is_added == true) {
                  price += Number(addonsPrice.price);
                  addonName =
                    addonName == ""
                      ? addonsPrice.variant_sub_addon_name
                      : addonName + ", " + addonsPrice.variant_sub_addon_name;
                }
                if (addonName != "") {
                  choices_addons.push(
                    addon.variant_addon_name + " : " + addonName
                  );
                }
              });
            });
            combo.choices_addons = choices_addons;
          });
        }
        this.last_used_addon_choice = findSelectedComboItem1;
        this.openLastCombo();
        return;
      } else {
        this.isNewAddCombo = true;
        this.openSelectComboItems(item);
      }
      return;
    }

    if (item.SelectedQty == 0 || item.SelectedQty == undefined) {
      this.selectItem(item, add, choice, newPage);
    }
    // this.selecteditemsqty += item.SelectedQty; //old

    // var value = parseInt(item.SelectedQty, 10); // for min max
    // value = isNaN(value) ? 0 : value;
    // value++;
    // item.SelectedQty = value;

    if (item.SelectedQty == 0 && item.min_qty != 0) {
      item.SelectedQty = item.min_qty;
      this.changeItemQty(item);
    } else {
      var value = parseInt(item.SelectedQty, 10);
      value = isNaN(value) ? 0 : value;
      value++;
      item.SelectedQty = value;
      this.changeItemQty(item);
    }
    // this.changeItemQty(item);
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

  changeItemQty(item) {
    // this.selecteditemsqty += item.SelectedQty;
    for (let i = 0; i < this.SelectedItems?.length; i++) {
      if (this.SelectedItems[i].item_variants_id == item.item_variants_id) {
        this.selecteditemsqty -= parseInt(this.SelectedItems[i].quantity);
        this.SelectedItems[i].quantity = item.SelectedQty;
        this.SelectedItems[i].SelectedQty = item.SelectedQty;
        this.selecteditemsqty += parseInt(item.SelectedQty);
      }
    }
    // this.cdr.detectChanges();
  }

  discountPriceCondition = function (discountPrice, price) {
    if (Number(discountPrice) < Number(price)) {
      return true;
    } else {
      return false;
    }
  };

  selectItem(item, addons, choices, newPage) {
    if (choices != null || item.is_choice_addon != null) {
      this.SelectedItems.push({
        item_id: item.item_id,
        item_variants_id: item.item_variants_id,
        quantity: 1,
        price: item.item_price,
        discounted_price: item.discounted_price,
        discountedprice: item.discounted_price,
        packaging: item.packaging,
        brand_name: item.brand_name,
        //added new
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
        sub_category_id: item.sub_category_id,
        sub_category_name: item.sub_category_name,
        category_id: item.category_id,
        category_name: item.category_name,
        ImageObject: item.ImageObject,
        current_stock: item.current_stock,
        stock_management_method: item.stock_management_method,
        out_stock_qty: item.out_stock_qty,
        stock_unit: item.stock_unit,
        min_qty: item.min_qty,
        max_qty: item.max_qty
      });
      this.selecteditemsqty += 1;
    }
    else {
      this.SelectedItems.push({
        item_id: item.item_id,
        item_variants_id: item.item_variants_id,
        sub_category_id: item.sub_category_id,
        sub_category_name: item.sub_category_name,
        category_id: item.category_id,
        category_name: item.category_name,
        item_type: item.item_type,
        is_choice_addon: item.is_choice_addon,
        is_combo: item.is_combo,
        SelectedQty: 0,
        quantity: item.SelectedQty,
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
        ia_available_choice_addon: item.ia_available_choice_addon,
        unit_name: item.unit_name,
        unit_quantity: item.unit_quantity,
        tax: item.tax,
        tax_price: item.tax_price,
        choices: item.choices,
        addons: item.addons,
        prescription: item.prescription,
        ImageObject: item.ImageObject,
        min_qty: item.min_qty,
        max_qty: item.max_qty,
        current_stock: item.current_stock,
        stock_management_method: item.stock_management_method,
        out_stock_qty: item.out_stock_qty,
        stock_unit: item.stock_unit,
      });

      if (item.is_choice_addon != null) {
        this.selecteditemsqty += 1;
      }
    }
    this.Getitems(newPage, addons, choices);
  }

  Getitems(newPage, addons?, choices?) {
    var tempGrid: any = [];

    tempGrid = this.gridDataPage;

    tempGrid.forEach((item) => {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO: compares instead of assigning; probably meant item.SelectedQty = 0 for unselected rows
        this.SelectedQty == 0;
      }

      if (addons != null && item.addons != null) {
        for (var i = 0; i < addons?.length; i++) {
          for (var j = 0; j < item.addons?.length; j++) {
            if (addons[i].variant_addon_id == item.addons[j].variant_addon_id) {
              item.addons[j].addon_prices = addons[i].addon_prices;
            }
          }
        }
      }

      if (choices != null && item.choices != null) {
        for (var i = 0; i < choices?.length; i++) {
          for (var j = 0; j < item.choices?.length; j++) {
            if (
              choices[i].variant_choice_id == item.choices[j].variant_choice_id
            ) {
              item.choices[j].choice_prices = choices[i].choice_prices;
            }
          }
        }
      }

    });
    // this.gridData = this.sortPipe.transform(this.gridData, "desc", "Selected");

    // per page as per category Data
    // var start = newPage * 20 - 20;
    var start = 1 * 20 - 20;
    this.gridDataPage = [];
    var j = 0;
    for (var i = 0; i < tempGrid?.length; i++) {
      if (i >= start) {
        if (
          tempGrid[i].SelectedQty == null ||
          tempGrid[i].SelectedQty == "" ||
          tempGrid[i].SelectedQty == undefined
        ) {
          tempGrid[i].SelectedQty = 0;
        }
        this.gridDataPage.push(tempGrid[i]);
        j++;
      }
    }

    var temp_selected = cloneDeep(this.SelectedItems);
    temp_selected.forEach((element: any) => {
      if ((element.choices != null || element.addons != null) && element?.is_combo != 1) {
        if (element?.is_done != 1) {
          var temp = this.SelectedItems
            .filter((x) => x.item_variants_id == element.item_variants_id)

          // this.gridDataPage.forEach((data: any) => {
          //   if (element.item_variants_id == data.item_variants_id) {
          //     data.temp_selectedQty = temp.length;
          //     if (data.min_qty != 0) {
          //       data.temp_selectedQty = data.temp_selectedQty - 1 + data.min_qty;
          //     }
          //   }
          // });
          var check_duplicate: any = false;
          var count = 0
          temp_selected.forEach((temp) => {
            //
            if (JSON.stringify(element.item_variants_id) === JSON.stringify(temp.item_variants_id) && (JSON.stringify(element?.addons) != JSON.stringify(temp?.addons) || JSON.stringify(element?.choices) != JSON.stringify(temp?.choices))) {
              check_duplicate = true;
              count = count + 1;
            }
            //
            if (element.item_variants_id == temp.item_variants_id) {
              temp.is_done = 1;
            }
          });

          this.gridDataPage.forEach((data: any) => {
            if (element.item_variants_id == data.item_variants_id) {
              data.temp_selectedQty = temp?.length;
              if (data.min_qty != 0) {
                data.temp_selectedQty = data.temp_selectedQty - 1 + data.min_qty;
              }
              //
              if (check_duplicate == true && data.min_qty != 0) {
                data.temp_selectedQty = data.temp_selectedQty + count;
              }
              //
            }
          });

        }
      }
    });

    this.count = 0;
    this.count = this.gridData?.length;
    this.page = newPage;
    this.cdr.detectChanges();
  }

  Submit() {
    if (this.from_items) {
      this.selectedPopupItems.emit(this.added_items);
      this.modal.dismiss();
    }
    else {
      if (!this.picker) {
        this.saveandclose();
      }
      else {
        setTimeout(() => {
          this.SelectedItems.forEach((element) => {

            if (!element.item_remark) {
              element.item_remark = null
            }

            if (
              element.addons == null &&
              element.choices == null &&
              element.combo_variants == null
            ) {
              element.quantity = element.SelectedQty;
            }

            if (
              element.is_new == 1 &&
              (element.choices_addons?.length == 0 ||
                element?.choices_addons == null)
            ) {
              element.picker_quantity = element.SelectedQty;
            }

            if (
              element.is_new == 1 &&
              element.picker_quantity != element.quantity
            ) {
              element.quantity = element.picker_quantity;
            }

          });
          this.SelectedItemFromStore.emit(this.SelectedItems);
          this.modal.dismiss();
        }, 1000);
      }
    }
  }

  saveandclose() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // var pickerItems: any = cloneDeep(this.SelectedItems);
        // if (this.picker) {
        //   pickerItems.forEach((element) => {

        //     // if (!element.item_remark) {
        //     //   element.item_remark = null
        //     // }

        //     if (
        //       element.addons == null &&
        //       element.choices == null &&
        //       element.combo_variants == null
        //     ) {
        //       element.quantity = element.SelectedQty;
        //     }

        //     if (
        //       element.is_new == 1 &&
        //       (element.choices_addons?.length == 0 ||
        //         element?.choices_addons == null)
        //     ) {
        //       element.picker_quantity = element.SelectedQty;
        //     }

        //     if (
        //       element.is_new == 1 &&
        //       element.picker_quantity != element.quantity
        //     ) {
        //       element.quantity = element.picker_quantity;
        //     }

        //   });
        // }
        var choices = [];
        var addons = [];
        if (this.SelectedItemsAddOnsChoices?.length > 0) {
          this.SelectedItemsAddOnsChoices.forEach((item) => {
            this.SelectedItems.forEach((ele) => {
              if (item.item_variants_id == ele.item_variants_id && ele.SelectedQty) {
                item.SelectedQty = ele.SelectedQty
              }
            });
          });
          this.SelectedItemsAddOnsChoices.forEach((item) => {
            this.SelectedItems = this.SelectedItems.filter(function (el) {
              return el.item_variants_id !== item.item_variants_id;
            });
          });
          this.SelectedItemsAddOnsChoices.forEach((itemAddonChoices) => {
            var addItem: any = {
              item_id: itemAddonChoices.item_id,
              item_variants_id: itemAddonChoices.item_variants_id,
              sub_category_name: itemAddonChoices.sub_category_name,
              item_type: itemAddonChoices.item_type,
              is_choice_addon: itemAddonChoices.is_choice_addon,
              is_combo: itemAddonChoices.is_combo,
              SelectedQty:
                itemAddonChoices.SelectedQty == ""
                  ? 0
                  : itemAddonChoices.SelectedQty,
              quantity:
                itemAddonChoices.SelectedQty == ""
                  ? 0
                  : itemAddonChoices.SelectedQty,
              price: itemAddonChoices.price
                ? itemAddonChoices.price
                : itemAddonChoices.discounted_price,
              discounted_price: itemAddonChoices.discounted_price,
              discountedprice: itemAddonChoices.discounted_price,
              packaging: itemAddonChoices.packaging,
              brand_name: itemAddonChoices.brand_name,
              item_image: itemAddonChoices.item_image,
              combo_variants: null,
              item_name: itemAddonChoices.item_name,
              order_item_id: itemAddonChoices.order_item_id,
              packaging_name: itemAddonChoices.packaging_name,
              ia_available_choice_addon:
                itemAddonChoices.ia_available_choice_addon,
              unit_name: itemAddonChoices.unit_name,
              unit_quantity: itemAddonChoices.unit_quantity,
              tax: itemAddonChoices.tax,
              tax_price: itemAddonChoices.tax_price,
              choices: itemAddonChoices.choices,
              addons: itemAddonChoices.addons,
              prescription: itemAddonChoices.prescription,
              category_name: itemAddonChoices.category_name,
              category_id: itemAddonChoices.category_id,
              location: itemAddonChoices.location,
              choices_addons: itemAddonChoices.choices_addons
                ? itemAddonChoices.choices_addons
                : null,
              ImageObject: itemAddonChoices.ImageObject,
              min_qty: itemAddonChoices.min_qty,
              max_qty: itemAddonChoices.max_qty,

            };
            if (this.orderprocess) {
              addItem.stock_unit = itemAddonChoices.stock_unit
              addItem.out_stock_qty = itemAddonChoices.out_stock_qty
              addItem.stock_management_method = itemAddonChoices.stock_management_method
              addItem.current_stock = itemAddonChoices.current_stock
            }
            this.SelectedItems.push(addItem);
          });
        }

        if (this.SelectedItemsCombo?.length > 0) {
          this.SelectedItemsCombo.forEach((item) => {
            this.SelectedItems = this.SelectedItems.filter(function (el) {
              return el.item_variants_id !== item.item_variants_id;
            });
          });

          this.SelectedItemsCombo.forEach((item) => {
            var addItem: any = {
              discountedprice:
                item.order_item_id == undefined
                  ? item.discounted_price
                  : item.item_price,
              discounted_price:
                item.order_item_id == undefined
                  ? item.discounted_price
                  : item.item_price,
              item_id: item.item_id,
              item_name: item.item_name,
              item_image: item.item_image,
              item_variants_id: item.item_variants_id,
              packaging: item.packaging,
              price: item.price,
              quantity: item.SelectedQty == "" ? 0 : item.SelectedQty,
              choices: item.choices,
              addons: item.addons,
              combo_variants: item.combo_variants,
              tax: item.tax,
              tax_price: item.tax_price,

              brand_name: item.brand_name,
              choices_addons: null,
              order_item_id: item.order_item_id,
              packaging_name: item.packaging_name,
              unit_name: item.unit_name,
              unit_quantity: item.unit_quantity,
              prescription: item.prescription,
              is_combo: item.is_combo,
              category_name: item.category_name,
              category_id: item.category_id,
              location: item.location,
              ImageObject: item.ImageObject,
              min_qty: item.min_qty,
              max_qty: item.max_qty
            };
            if (this.orderprocess) {
              addItem.stock_unit = item.stock_unit
              addItem.out_stock_qty = item.out_stock_qty
              addItem.stock_management_method = item.stock_management_method
              addItem.current_stock = item.current_stock
            }
            this.SelectedItems.push(addItem);
          });
        }

        // if(this.picker){
        //   this.SelectedItems.forEach(element => {
        //     pickerItems.forEach(item => {
        //     if(element.item_variants_id === item.item_variants_id){
        //       element.picker_quantity = item.picker_quantity
        //     }
        //     });
        //   });
        // }
        this.SelectedItemFromStore.emit(this.SelectedItems);
        this.modal.dismiss();
        // this.modalInstance.close(this.SelectedItems);
      }, 1000);
    });
  }

  decrementValue(item, addon, choice) {
    if (item.is_choice_addon != null) {
      if (
        (addon != null || choice != null) &&
        this.SelectedItemsAddOnsChoices.length > 0
      ) {
        this.selectedItemAddonChoicesLst = [];//added due to delete problem
        var dert = JSON.stringify(this.SelectedItemsAddOnsChoices);
        var selecteditemsarr = JSON.parse(dert);
        for (var k = 0; k < selecteditemsarr.length; k++) {
          if (selecteditemsarr[k].item_variants_id == item.item_variants_id) {
            var found46 = JSON.stringify(selecteditemsarr[k]);
            var found = JSON.parse(found46);
            var price =
              found.discounted_price != "" ||
                found.discounted_price != undefined
                ? parseFloat(found.discounted_price)
                : parseFloat(found.item_price);
            var choices_addons = [];
            if (found.choices != null) {
              found.choices.forEach((choice) => {
                choice.choice_prices.forEach((choicePrice) => {
                  if (choicePrice.is_added == true) {
                    price += Number(choicePrice.price);
                    choices_addons.push(
                      choice.variant_choice_name +
                      " : " +
                      choicePrice.variant_sub_choice_name
                    );
                  }
                });
              });
            }

            if (found.addons != null) {
              found.addons.forEach((addon) => {
                var addonName = "";
                addon.addon_prices.forEach((addonsPrice) => {
                  if (addonsPrice.is_added == true) {
                    price += Number(addonsPrice.price);
                    addonName =
                      addonName == ""
                        ? addonsPrice.variant_sub_addon_name
                        : addonName + ", " + addonsPrice.variant_sub_addon_name;
                  }
                });

                if (addonName != "") {
                  choices_addons.push(
                    addon.variant_addon_name + " : " + addonName
                  );
                }
              });
            }

            found.choices_addons = choices_addons;
            found.price = price;
            found.total_price = price;
            this.selectedItemAddonChoicesLst.push(found);
          }
        }
        if (this.selectedItemAddonChoicesLst.length > 0) {
          this.openselectItemsDelete();
        }
        return;
      }
    }

    if (item.is_combo == "1") {
      if (this.SelectedItemsCombo.length > 0) {
        this.selectedItemAddonChoicesLst = [];

        this.SelectedItemsCombo.forEach((combo) => {
          var price = 0;
          if (combo.item_variants_id == item.item_variants_id) {
            if (combo.order_item_id != undefined) {
              price = combo.item_price;

              if (combo.combo_variants.length > 0) {
                combo.combo_variants.forEach((comboVarients) => {
                  if (comboVarients.choices != null) {
                    comboVarients.choices.forEach((choice) => {
                      choice.choice_prices = choice.choice_prices.filter(
                        (el) => el.is_added == true
                      );
                    });
                  }

                  if (comboVarients.addons != null) {
                    comboVarients.addons.forEach((addon) => {
                      // var addonName = '';
                      addon.addon_prices = addon.addon_prices.filter(
                        (el) => el.is_added == true
                      );
                    });
                  }
                });
              }
            } else {
              price =
                combo.discounted_price != "" ||
                  combo.discounted_price != undefined
                  ? parseFloat(combo.discounted_price)
                  : parseFloat(combo.item_price);

              if (combo.combo_variants.length > 0) {
                combo.combo_variants.forEach((comboVarients) => {
                  if (comboVarients.choices != null) {
                    comboVarients.choices?.forEach((choice) => {
                      choice.choice_prices = choice.choice_prices.filter(
                        (el) => el.is_added == true
                      );
                      choice.choice_prices.forEach((choicePrice) => {
                        if (choicePrice.is_added == true) {
                          price += Number(choicePrice.price);
                        }
                      });
                    });
                  }

                  if (comboVarients.addons != null) {
                    comboVarients.addons.forEach((addon) => {
                      addon.addon_prices = addon.addon_prices.filter(
                        (el) => el.is_added == true
                      );
                      addon.addon_prices.forEach((addonsPrice) => {
                        if (addonsPrice.is_added == true) {
                          price += Number(addonsPrice.price);
                        }
                      });
                    });
                  }
                });
              }
            }

            combo.price = price;
            combo.total_price = price;

            if (Number(combo.SelectedQty) > 1) {
              for (var j = 0; j < Number(combo.SelectedQty); j++) {
                var data: any = {};
                data = combo;
                // angular.copy(combo, data)
                data.SelectedQty = 1;
                this.selectedItemAddonChoicesLst.push(data);
              }
            } else {
              this.selectedItemAddonChoicesLst.push(combo);
            }
          }
        });

        if (this.selectedItemAddonChoicesLst.length > 0) {
          this.deleteComboPopup();
        }

        return;
      }
    }

    var value = parseInt(item.SelectedQty, 10);
    value = isNaN(value) ? 0 : value;
    if (value > 0) {
      if (value == item.min_qty) {
        Swal.fire({
          title: ('The minimum quantity for item is ' + item.min_qty + ', Do you wish to remove?'),
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: this.translate.instant("YES"),
          cancelButtonText: this.translate.instant("NO"),
        }).then((result) => {
          if (result.value) {
            value = 0;
            item.SelectedQty = value;
            this.deleteItem(item, addon, choice);
            this.changeItemQty(item);
          } else if (result.dismiss === Swal.DismissReason.cancel) {
          }
        });
      } else {
        value--;
        item.SelectedQty = value;
        if (value == 0) {
          this.deleteItem(item, addon, choice);
        }
        this.changeItemQty(item);
      }
    }
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
      // this.deleteAddOnChoices(selected);
      this.deleteModalFunction(selected);
    });
  }

  deleteModalFunction(selected) {
    var tot: any = $("#item" + selected.item_variants_id.toString()).val();
    tot = Number(tot) - 1;
    $("#item" + selected.item_variants_id.toString()).val(tot);
    // this.selecteditemsqty -= 1;

    if (this.all_AdnChsDlt == true) { // for min max
      this.selecteditemsqty -= parseInt(selected.min_qty);
    } else {
      this.selecteditemsqty -= 1;
    }
    this.all_AdnChsDlt = false;

    // var found = this.gridData.filter(
    var found = this.gridDataPage.filter(
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
          this.selecteditemsqty -= parseInt(item.quantity);
          this.SelectedItems = this.SelectedItems.filter(
            (items) => items !== item
          );
        }
      }
    });
  }

  func(item, addons, choices) {
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

  openSelectAddonChoices(item, addons, choices) {
    const modalRef = this.modalService.open(SelectAddonChoicesComponent, {
      size: "lg",
      centered: true,
      animation: true,
    });
    if (this.picker == 1) {
      modalRef.componentInstance.picker = this.picker;
    }
    modalRef.componentInstance.SelectedItems = this.func(item, addons, choices);

    modalRef.componentInstance.SelectedAddonChoicesItem.subscribe((item1) => {
      if (item1.is_choice_addon != null) {
        this.selectItem(item1, addons, choices, this.page);
        // item1.SelectedQty = 1; // for min max
        item1.SelectedQty = item1.min_qty == 0 ? 1 : item1.min_qty;
        this.selecteditemsqty -= 1;
        this.selecteditemsqty += parseInt(item1.SelectedQty);
        var tot: any = $("#item" + item1.item_variants_id.toString()).val();
        // tot = Number(tot) + 1; // for min max
        if (item1.min_qty == 0) {
          tot = Number(tot) + 1;
        } else {
          tot = Number(tot) + item1.min_qty;
        }
        $("#item" + item1.item_variants_id.toString()).val(tot);
        var de = JSON.stringify(item1);
        var der = JSON.parse(de);
        this.SelectedItemsAddOnsChoices.push(der);
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
        //Add
        this.addNewAddOnChoice();
      } else {
        this.repeatAddOnChoice(x);
      }
    });
  }

  addNewAddOnChoice() {
    var found = JSON.parse(this.modelNewItem);
    if (found.choices != null) {
      for (var i = 0; i < found.choices.length; i++) {
        for (var j = 0; j < found.choices[i].choice_prices.length; j++) {
          if (j == 0) {
            found.choices[i].choice_prices[j].is_added = true;
          } else {
            found.choices[i].choice_prices[j].is_added = false;
          }
        }
      }
    }

    if (found.addons != null) {
      for (var i = 0; i < found.addons.length; i++) {
        for (var j = 0; j < found.addons[i].addon_prices.length; j++) {
          found.addons[i].addon_prices[j].is_added = false;
        }
      }
    }

    this.openSelectAddonChoices(found, found.addons, found.choices);
  }

  repeatAddOnChoice(lastaddonchoice) {
    var tot: any = $(
      "#item" + lastaddonchoice.item_variants_id.toString()
    ).val();
    tot = Number(tot) + 1;
    $("#item" + lastaddonchoice.item_variants_id.toString()).val(tot);
    var lastAddedItems = this.SelectedItems.filter(
      (el) => el.item_variants_id == lastaddonchoice.item_variants_id
    );

    if (lastAddedItems.length > 0) {
      var lastAdded = lastAddedItems[lastAddedItems.length - 1];
      lastAdded.SelectedQty += 1;
      var lastAdded1 = JSON.stringify(lastAdded);
      var lastAdded2 = JSON.parse(lastAdded1);
      // this.SelectedItems.push(lastAdded2);
      delete lastaddonchoice.price;
      lastaddonchoice.SelectedQty += 1;
      this.selectItem(
        lastaddonchoice,
        lastaddonchoice.addons,
        lastaddonchoice.choices,
        this.page
      );
      this.SelectedItemsAddOnsChoices.push(lastaddonchoice);
    }
  }

  openselectItemsDelete() {
    var temp = this.gridDataPage.filter((x) => x.item_variants_id == this.selectedItemAddonChoicesLst[0].item_variants_id)[0];
    if (temp.temp_selectedQty == temp.min_qty) {
      this.all_AdnChsDlt = true;
      Swal.fire({
        title: ('The minimum quantity for item is ' + temp.min_qty + ', Do you wish to remove?'),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: this.translate.instant("YES"),
        cancelButtonText: this.translate.instant("NO"),
      }).then((result) => {
        if (result.value) {
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
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
    } else {
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
  }

  openSelectComboItems(item) {
    const modalRef = this.modalService.open(SelectComboItemsComponent, {
      size: "w-1300",
      centered: true,
    });

    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.SelectedItems = item;
    if (this.picker == 1) {
      modalRef.componentInstance.picker = this.picker;
    }
    modalRef.componentInstance.SelectedComboItems.subscribe(
      (userSelectedCombo) => {
        if (userSelectedCombo.combo_variants.length > 0) {
          this.SelectedItemsCombo.push(userSelectedCombo);
          this.SelectedItems.push(userSelectedCombo);

          if (this.isNewAddCombo == true) {
            var tot: any = $(
              "#item" + userSelectedCombo.item_variants_id.toString()
            ).val();
            tot = Number(tot) + 1;
            $("#item" + userSelectedCombo.item_variants_id.toString()).val(tot);

            this.selecteditemsqty += 1;
            userSelectedCombo.SelectedQty = 1;
            userSelectedCombo.quantity = 1;
            this.changeItemQty(userSelectedCombo);
            this.isNewAddCombo = false;
          }
        } else {
          userSelectedCombo.SelectedQty = 0;
          this.changeItemQty(userSelectedCombo);
        }
      }
    );
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
    var combo_item = JSON.parse(this.modelNewItem);
    this.openSelectComboItems(combo_item);
    this.isNewAddCombo = true;
  }

  repeatCombo(openLastCombo) {
    var lastAddedItems = this.SelectedItems.filter(
      (el) => el.item_variants_id == openLastCombo.item_variants_id
    );

    if (lastAddedItems.length > 0) {
      var lastAdded = JSON.parse(
        JSON.stringify(lastAddedItems[lastAddedItems.length - 1])
      );

      this.SelectedItems.push(lastAdded);

      delete openLastCombo.price;
      this.SelectedItemsCombo.push(openLastCombo);
      this.selecteditemsqty += 1;
    }

    var tot: any = $("#item" + openLastCombo.item_variants_id.toString()).val();
    tot = Number(tot) + 1;
    $("#item" + openLastCombo.item_variants_id.toString()).val(tot);
  }

  changeView(value) {

    this.spinner = false
    // this.page = 1;
    this.tileview = value;
    // this.gridDataPage = [];
    if (this.search !== '') {
      (<HTMLInputElement>document.getElementById("searchevt")).value = this.search
    }
    else {
      this.search = '';
    }
    // this.getItemList(1)
  }

  onScroll(e: any) {
    this.scrolling = true;
    this.scrollTop = e.srcElement.scrollTop;
    this.scrollHeight = e.srcElement.scrollHeight;
    this.elementHeight = e.srcElement.clientHeight;

    // this.atBottom = this.scrollHeight === this.elementHeight + this.scrollTop;
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

  sortAPISide(columnName) {
    this.sortKey = columnName;
    // this.isOrderBy = !this.isOrderBy;
    var temp = cloneDeep(this.isOrderBy);
    if (temp == 1) {
      this.isOrderBy = 2
    }
    if (temp == 2) {
      this.isOrderBy = 1
    }
    // this.getItemList(this.page);
    if (this.isOrderBy == 2) {
      // this.gridDataPage = this.sortPipe.transform(
      //   this.gridDataPage,
      //   "desc",
      //   columnName
      // );
      if (columnName == 'discounted_price') {
        this.gridDataPage = this.gridDataPage.sort((low, high) => high.discounted_price - low.discounted_price);
      }
      else {
        this.gridDataPage.sort(this.compareValues(columnName, 'desc'));
      }

    }
    if (this.isOrderBy == 1) {
      // this.gridDataPage = this.sortPipe.transform(
      //   this.gridDataPage,
      //   "asc",
      //   columnName
      // );
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

  openfilter() {
    var hide_price_filter = false
    if (this.foritemcollection || this.foritemgrouping) {
      hide_price_filter = true
    }

    var hide_sub_category = true;
    if (this.selectedSubcategory) {
      if (this.selectedSubcategory.sub_category_id == 0) {
        hide_sub_category = false;
      }
    }

    var tempcat: any
    var hide_cat = true
    if (this.selectedCategory.value != 0 && this.init_filter_data.categories != null) {
      // this.init_filter_data.categories = this.init_filter_data.categories.filter((x) => x.category_id != this.selectedCategory.value)
      tempcat = this.categoryListLocal.filter((x) => x.category_id == this.selectedCategory.value)
      if (this.filters) {
        this.filters.selectedCategory = tempcat;
      }
    }
    const modalRef = this.modalService.open(ItemFilterComponent, {
      size: "md",
      windowClass: 'modal-filter',
      backdrop: 'static'
    });
    if (this.selectedCategory.value == 0 && this.init_filter_data?.categories != null) {
      hide_cat = false
    }
    modalRef.componentInstance.hide_price_filter = hide_price_filter;
    modalRef.componentInstance.hide_sub_category = hide_sub_category;
    modalRef.componentInstance.selected_sub_cat = this.selectedSubcategory;

    modalRef.componentInstance.forAddOrder = this.forAddOrder;
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
  }

  //View multiple img
  open_img_view(multiple_img, single_img, item_name) {
    var images: any = []
    if (multiple_img.length == 0) {
      var img = {
        image: single_img
      }
      images[0] = img
    } else {
      images = multiple_img
    }
    const modalRef = this.modalService.open(ViewMultipleImageComponent, {
      size: "md",
    });
    modalRef.componentInstance.images = images;
    modalRef.componentInstance.item_name = item_name;
  }

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

  async getItemData(barcode) {
    this.search = barcode
    this.getItemList(this.page);
  }
  selectedIndex: number = 0;
  AddItem(item, i) {
    if (this.comboItemSelection || this.showvariant == true && this.isManageOffer == false) {
      this.added_items.push({
        item_id: item.item_id,
        item_variants_id: item.item_variants_id,
        quantity: 1,
        price: item.item_price,
        discountedprice: item.discounted_price,
        packaging: 0
      });
    }
    else if (this.isManageOffer && this.showvariant) {
      this.added_items.push({
        Selected: 1,
        addons: item.addons,
        brand_name: item.brand_name,
        category_name: item.category_name,
        choices: item.choices,
        combo_item_detail_id: item.combo_item_detail_id,
        discounted_price: item.discounted_price,
        is_choice_addon: item.is_choice_addon,
        item_id: item.item_id,
        item_image: item.item_image,
        item_name: item.item_name,
        item_price: item.item_price,
        item_type: item.item_type,
        item_variants_id: item.item_variants_id,
        mask_price: item.mask_price,
        max_qty: item.max_qty,
        min_qty: item.min_qty,
        out_of_stock: item.out_of_stock,
        packaging: item.packaging,
        packaging_id: item.packaging_id,
        sku: item.sku,
        sub_category_name: item.sub_category_name,
        unit_id: item.unit_id,
        unit_quantity: item.unit_quantity,
        unit_name: item.unit_name,
        packaging_name: item.packaging_name,
        quantity: 1,
        ImageObject: item.ImageObject
      })
      this.offerAddedItem = this.added_items
    }
    //manage offer (end)
    else {
      if (this.IsDineInStiing) {
        this.added_items.push({
          Selected: 1,
          quantity: 1,
          item_image: item.item_image,
          item_type: item.item_type,
          category_name: item.category_name,
          sub_category_name: item.sub_category_name,
          brand_name: item.brand_name,
          item_name: item.item_name,
          item_id: item.item_id,
          item_variants_id: item.item_variants_id,
          item_variants: item.item_variants,
          ImageObject: item.ImageObject,
          discounted_price: item.discounted_price,
          item_price: item.item_price,
          packaging: item.packaging,
          packaging_id: item.packaging_id,
          sku: item.sku,
          unit_id: item.unit_id,
          unit_quantity: item.unit_quantity,
          unit_name: item.unit_name,
          packaging_name: item.packaging_name,
        });
      }

      //manage offer (start)
      else if (this.isManageOffer) {
        this.added_items.push({
          Selected: item.Selected,
          item_id: item.item_id,
          quantity: 1,
          brand_name: item.brand_name,
          category_name: item.category_name,
          item_image: item.item_image,
          item_name: item.item_name,
          item_type: item.item_type,
          sub_category_name: item.sub_category_name,
        })
      }
      //manage offer (end)

      else {
        this.added_items.push({ item_id: item.item_id, quantity: 1 });
      }
    }

    this.selecteditemsqty += 1;

    if (this.comboItemSelection || this.showvariant) {
      this.added_items.forEach((item) => {
        var found = this.gridDataPage.filter(
          (x) => x.item_variants_id == item.item_variants_id
        )[0];
        if (found != null || found != undefined) {
          found.Selected = 1;
          found.SelectedQty = item.quantity;
        }
      });

    } else {
      if (this.foritemcollection || this.foritemgrouping) {
        this.added_items.forEach((item) => {
          var found = this.gridDataPage.filter(
            (x) => x.item_id == item.item_id
          )[0];

          if (found != null || found != undefined) {
            found.Selected = 1;
            found.SelectedQty = item.quantity;
          }
        });
      } else {
        this.added_items.forEach((item) => {
          var found = this.gridDataPage.filter(
            (x) => x.item_variants_id == item.item_variants_id
          )[0];

          if (found != null || found != undefined) {
            found.Selected = 1;
            found.SelectedQty = item.quantity;
          }
        });
      }
    }

    this.gridDataPage.sort(function (a, b) { return b.SelectedQty - a.SelectedQty; });

    this.cdr.detectChanges();
  }

  RemoveItem(deletedItem) {
    if (this.comboItemSelection || this.showvariant) {
      this.added_items.forEach((item) => {
        if (item.item_variants_id == deletedItem.item_variants_id) {
          var found: any = [];

          this.gridData.forEach((i) => {
            if (i.item_variants_id == item.item_variants_id) {
              found[0] = i;
            }
          });

          if (found.length > 0 || found != null || found != undefined) {
            found[0].Selected = 0;
            found[0].SelectedQty = 0;
            this.selecteditemsqty -= parseInt(item.quantity);
            this.added_items = this.added_items.filter(
              (items) => items !== item
            );
          }
        }
      });
    } else {
      this.added_items.forEach((selectedItem, i) => {
        if (this.foritemcollection || this.foritemgrouping) {
          if (selectedItem.item_id == deletedItem.item_id) {
            var found = this.gridDataPage.filter(
              (x) => x.item_id == deletedItem.item_id
            )[0];
            if (found != null || found != undefined) {
              found.Selected = 0;
              found.SelectedQty = 0;
              this.selecteditemsqty -= parseInt(selectedItem.quantity);
              if (this.isManageOffer == true) {
                this.added_items.splice(i, 1);
              } else {
                this.added_items = this.added_items.filter(
                  (x) => x.item_id !== selectedItem.item_id
                );
              }
            }
          }
        } else {
          if (selectedItem.item_variants_id == deletedItem.item_variants_id) {
            var found = this.gridDataPage.filter(
              (x) => x.item_variants_id == deletedItem.item_variants_id
            )[0];
            if (found != null || found != undefined) {
              found.Selected = 0;
              found.SelectedQty = 0;
              this.selecteditemsqty -= parseInt(selectedItem.quantity);
              if (this.isManageOffer == true) {
                this.added_items.splice(i, 1);
              } else {
                this.added_items = this.added_items.filter(
                  (x) => x.item_variants_id !== selectedItem.item_variants_id
                );
              }
            }
          }
        }

      });
    }

    if (this.IsDineInStiing && this.selectedCategory.value == '-1') {
      this.gridDataPage = this.gridDataPage.filter((record: any) => record.Selected != 0);
      this.totalCount = this.gridDataPage?.length;
    }
    this.gridDataPage.sort(function (a, b) { return b.SelectedQty - a.SelectedQty; });
    this.cdr.detectChanges();
  }

  get_stock_item_list(page) {
    this.showFilters = false;
    this.spinner = true;
    this.page = page;
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      this.gridDataPage = [];
      search = this.search;
    }
    var data: any = {
      store_id: (this.main.LoggedUserStoreInfo.store_id) ? this.main.LoggedUserStoreInfo.store_id : this.session_store_id,
      page: this.page,
      category_id: this.selectedCategory ? this.selectedCategory.value : 0,
      sub_category_id: this.selectedSubcategory ? this.selectedSubcategory.sub_category_id : 0,
      search_query: this.search
    };
    data.displaySpinner = true
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
          .filter((x) => x.is_checked == true)
          .map((x) => x.value)
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
    if (this.is_damage_stock) {
      data.stock_management_method = 3
    }
    this.isVoiceSearch = false;
    this.cdr.detectChanges()
    this._stockInwardService.getItemsListForStock(data).subscribe({
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

          this.categoryGridData.forEach(element => {
            element.items.forEach(itemData => {
              if (itemData.stock_management_method == 2) {

                // itemData.item_variants.forEach(itemVariant => {

                // });

                var itemdata = {
                  // unit_quantity: itemData.item_variants.length > 0 ? parseFloat(itemData.item_variants[0].unit_quantity) : 0,
                  unit_quantity: itemData.item_variants,
                  Selected: 0,
                  SelectedQty: 0,
                  item_image: itemData.item_image,
                  item_type: itemData.item_type,
                  category_name: element.category_name,
                  sub_category_name: itemData.sub_category_name,
                  brand_name: itemData.brand_name,
                  item_name: itemData.item_name,
                  item_id: itemData.item_id,

                  item_variants_id: itemData.item_variants.length > 0 ? itemData.item_variants[0].item_variants_id : 0,
                  item_price: itemData.item_variants.length > 0 ? itemData.item_variants[0].item_price : '',
                  discounted_price: itemData.item_variants.length > 0 ? itemData.item_variants[0].discounted_price : '',
                  packaging_id: itemData.item_variants.length > 0 ? itemData.item_variants[0].packaging_id : '',
                  packaging_name: itemData.item_variants.length > 0 ? itemData.item_variants[0].packaging_name : null,
                  unit_id: itemData.item_variants.length > 0 ? itemData.item_variants[0].unit_id : '',
                  unit_name: itemData.unit_name,

                  sku: itemData.item_variants.length > 0 ? itemData.item_variants[0].sku : '',
                  out_of_stock: itemData.item_variants.length > 0 ? itemData.item_variants[0].out_of_stock : '',
                  mask_price: itemData.item_variants.length > 0 ? itemData.item_variants[0].mask_price : '',
                  min_qty: itemData.item_variants.length > 0 ? itemData.item_variants[0].min_qty : '',
                  packaging: itemData.item_variants.length > 0 ? itemData.item_variants[0].packaging : '',
                  tax: itemData.item_variants.length > 0 ? itemData.item_variants[0].tax : '',
                  // tax_price: Number(Number(itemData.item_variants[0].item_price) * Number(itemData.item_variants[0].tax) / 100).toFixed(2),
                  tax_price: itemData.item_variants.length > 0 ? Number(Number(itemData.item_variants[0].discounted_price) * Number(itemData.item_variants[0].tax) / 100) : '',
                  max_qty: itemData.item_variants.length > 0 ? itemData.item_variants[0].max_qty : '',
                  is_choice_addon: itemData.item_variants.length > 0 ? itemData.item_variants[0].is_choice_addon : '',
                  ia_available_choice_addon: itemData.item_variants.length > 0 ? (itemData.item_variants[0].is_choice_addon == 0 ? "Choices/Addons Available" : itemData.item_variants[0].is_choice_addon == 1 ? "Choices Available" : itemData.item_variants[0].is_choice_addon == 2 ? "Addons Available" : "") : '',
                  choices: itemData.item_variants.length > 0 ? itemData.item_variants[0].choices : '',
                  addons: itemData.item_variants.length > 0 ? itemData.item_variants[0].addons : '',
                  prescription: itemData.prescription,
                  is_combo: itemData.is_combo,
                  stock_management_method: itemData.stock_management_method
                }


                this.gridData.push(itemdata);
              }
              else {
                itemData.item_variants.forEach(varient => {
                  var itemdata =
                  {
                    // unit_quantity: varient,
                    unit_quantity: parseFloat(varient.unit_quantity),
                    Selected: 0,
                    SelectedQty: 0,
                    item_image: itemData.item_image,
                    item_type: itemData.item_type,
                    category_name: element.category_name,
                    sub_category_name: itemData.sub_category_name,
                    brand_name: itemData.brand_name,
                    item_name: itemData.item_name,
                    item_id: itemData.item_id,
                    item_variants_id: varient.item_variants_id,
                    item_price: varient.item_price,
                    discounted_price: varient.discounted_price,
                    packaging_id: varient.packaging_id,
                    packaging_name: varient.packaging_name,
                    unit_id: varient.unit_id,
                    unit_name: itemData.unit_name,

                    sku: varient.sku,
                    out_of_stock: varient.out_of_stock,
                    mask_price: varient.mask_price,
                    min_qty: varient.min_qty,
                    packaging: varient.packaging,
                    tax: varient.tax,
                    // tax_price: Number(Number(varient.item_price) * Number(varient.tax) / 100).toFixed(2),
                    tax_price: Number(Number(varient.discounted_price) * Number(varient.tax) / 100),
                    max_qty: varient.max_qty,
                    is_choice_addon: varient.is_choice_addon,
                    ia_available_choice_addon: varient.is_choice_addon == 0 ? "Choices/Addons Available" : varient.is_choice_addon == 1 ? "Choices Available" : varient.is_choice_addon == 2 ? "Addons Available" : "",
                    choices: varient.choices,
                    addons: varient.addons,
                    prescription: itemData.prescription,
                    is_combo: itemData.is_combo,
                    stock_management_method: itemData.stock_management_method
                  };
                  if (itemData.stock_management_method != 1) {
                    this.gridData.push(itemdata);
                  }
                })
              }

            })
          })

          this.added_items.forEach((item) => {
            var found = this.gridData.filter(
              (x) => x.item_variants_id == item.item_variants_id
            )[0];

            if (found != null || found != undefined) {

              var found123 = this.added_items.filter(function (el) {
                return el.item_variants_id == item.item_variants_id;
              });
              if (found123.length > 1) {
                var qty = 0;
                for (var j = 0; j < found123.length; j++) {
                  qty += parseInt(item.quantity);
                }
                found.Selected = 1;
                found.SelectedQty = qty;
              }
              else {
                found.Selected = 1;
                found.SelectedQty = item.quantity;
              }
            }
          });

          this.gridData.reverse()
          this.gridData.forEach(element => {
            this.gridDataPage.push(element)
          });
          this.spinner = false
          this.cdr.detectChanges()

        } else {
          this.showFilters = true;
          this.init_filter_data = response.filter_data;
          this.toastr.error(this.translate.instant(response.message));
          this.spinner = false
          this.totalCount = 0;
          this.categoryGridData = [];
          this.gridDataPage = [];
          this.noData = true;
          this.cdr.detectChanges()
        }
      }
    })
  }

  validateThreeDigit(item) {
    if (this.is_damage) {
      if (item.SelectedQty.split(".").length > 1 && item.SelectedQty.split(".")[1] > 99) {
        item.SelectedQty = (Number(item.SelectedQty).toFixed(3))
      }
      if (Number(item.SelectedQty) > Number(item.current_stock)) {
        this.toastr.error(this.translate.instant('DAMAGED_QUANTITY_CANNOT_BE_GREATER_THAN_THE_CURRENT_STOCK'));
        item.SelectedQty = 0
        item.quantity = 0
      }
    }
    else if (this.is_outward) {
      if (item.SelectedQty.split(".").length > 1 && item.SelectedQty.split(".")[1] > 99) {
        item.SelectedQty = (Number(item.SelectedQty).toFixed(3))
      }
      if (Number(item.SelectedQty) > Number(item.current_stock)) {
        this.toastr.error(this.translate.instant('OUTWARD_QUANTITY_CANNOT_BE_GREATER_THAN_THE_CURRENT_STOCK'));
        item.SelectedQty = 0
        item.quantity = 0
      }
    }
    else {
      if (item.SelectedQty.split(".").length > 1 && item.SelectedQty.split(".")[1] > 99) {
        item.SelectedQty = (Number(item.SelectedQty).toFixed(3))
      }
    }
  }

  itemQuantityChnage(item) {
    if (!item.SelectedQty) {
      item.SelectedQty = 0
      var isexistingItem = this.added_items.filter(el => el.item_variants_id == item.item_variants_id)[0]
      if (isexistingItem) {
        this.added_items.splice(this.added_items.findIndex(a => a.item_variants_id === isexistingItem.item_variants_id), 1)
      }
      return
    }
    if (this.added_items.length == 0) {
      item.quantity = item.SelectedQty;
      this.added_items.push(item);
    }
    else {
      var isexistingItem = this.added_items.filter(el => el.item_variants_id == item.item_variants_id)[0]

      if (isexistingItem) {
        this.added_items.forEach(el => {
          if (el.item_variants_id == item.item_variants_id) {
            el.SelectedQty = item.SelectedQty;
            el.quantity = item.SelectedQty;
          }
        })
      } else {
        item.quantity = item.SelectedQty;
        this.added_items.push(item);
      }
    }
    this.added_items.forEach((element) => {
      this.selecteditemsqty += parseInt(element.quantity);
    });
  }

  Checksel(item) {
    var findSelectedComboItem = this.SelectedItemsCombo.filter(
      (x) => x.item_variants_id == item.item_variants_id
    );

    if (
      findSelectedComboItem != null &&
      findSelectedComboItem != undefined &&
      findSelectedComboItem.length > 0
    ) {
      return true;
    }
  }

  ngOnDestroy(): void {
    $(
      "<style>.card-body {  padding: 1.25rem !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.modal-content{ overflow: hidden; max-height: 600px;}</style>"
    ).appendTo("body");

  }

  getHight() {
    var count: any;
    if (this.tileview) {
      if (this.subCategoryList?.length == 0) {
        count = 1;
        return 'scrltile-' + count;
      } else {
        count = 2;
        return 'scrltile-' + count;
      }
    } else {
      if (this.subCategoryList?.length == 0) {
        count = 1;
        return 'scrl-' + count;
      } else {
        count = 2;
        return 'scrl-' + count;
      }
    }
  }

  dismiss() {
    if (JSON.stringify(this.SelectedItems) == JSON.stringify(this.existing_selectedItems)) {
      this.modal.dismiss();
    }
    else {
      Swal.fire({
        title: this.translate.instant("Do you want to discard the selected items?"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: this.translate.instant("YES"),
        cancelButtonText: this.translate.instant("NO"),
      }).then((result) => {
        if (result.value) {
          this.modal.dismiss();
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
    }
  }

  getUnites(allunit, unit_quantity, subItem, index) {
    var lastIndex = allunit.length - 1;
    if (lastIndex != index) {
      var unites: any = unit_quantity == 0 ? '' : unit_quantity + ' ' + subItem + ','
    } else {
      var unites: any = unit_quantity == 0 ? '' : unit_quantity + ' ' + subItem
    }
    return unites
  }

  stockMehodChange(event) {
    this.gridDataPage = [];
    this.getItemList(0)
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
