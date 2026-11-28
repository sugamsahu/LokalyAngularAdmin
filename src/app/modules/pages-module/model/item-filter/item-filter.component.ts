import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Options } from "@angular-slider/ngx-slider";
import { TranslateService } from "@ngx-translate/core";
import { CryptoService } from "src/app/services/custom/crypto.service";

@Component({
  selector: "app-item-filter",
  templateUrl: "./item-filter.component.html",
  styleUrls: ["./item-filter.component.scss"],
})
export class ItemFilterComponent implements OnInit, OnDestroy {
  loginUserStore: any;
  category_name: any;
  @Input() init_filter_data: any;
  @Input() filters: any;
  @Output() appliedFilters: EventEmitter<any> = new EventEmitter();
  @Output() filterCleared: EventEmitter<any> = new EventEmitter();
  @Output() sort: EventEmitter<any> = new EventEmitter();
  @Input() selectedsort: any;
  @Input() selectedcat: any;
  @Input() Hide_Category;
  @Input() selected_sub_cat;
  @Input() itemFlag;
  @Input() postFilter;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  selectedCategory: any = [];
  selectedSubCategory: number[];
  selectedTag: string[];
  selectedBrands: string[];
  selectedAttributeColor: any;
  item_type = [];
  item_type_pharma = [];
  item_avaibility = [];
  item_attribute = [];
  priceValue: number;
  priceHighValue: number;
  priceOptions: Options;
  discountedPriceValue: number;
  discountedPriceHighValue: number;
  discountedPriceOptions: Options;
  default_item_avaibility = [
    { label: "IN_STOCK_ITMES", value: 0, is_checked: false },
    { label: "OUT_OF_STOCK", value: 1, is_checked: false },
  ];

  default_item_type_pharma = [
    { label: "Not Required", value: 0, is_checked: false },
    { label: "Required", value: 1, is_checked: false },
  ];

  default_item_type = [
    { label: "Veg", value: 1, is_checked: false },
    { label: "Non-Veg", value: 2, is_checked: false },
    { label: "Egg", value: 3, is_checked: false },
  ];

  SortingOptions = [
    { label: "Name: A to Z", value: 1 },
    { label: "Name: Z to A", value: 0 },
    { label: "Price: Lo to Hi", value: 2 },
    { label: "Price: Hi to Lo", value: 3 },
  ];
  //For validation
  @Input() forAddOrder;
  //for items
  @Input() hide_price_filter;
  @Input() hide_sub_category;

  @Input() appComponent;
  main: any = { LoggedUserInfo: {} };
  categoryId;
  selectedData = []
  @Input() Hide_CategoryItemList;
  is_DisplayAvaibility: boolean = true;
  @Input() forPOS;
  filter_main_prices: any;
  selectedAttribute: any;
  style_obj_item_filter:any;
  constructor(
    private translate: TranslateService,
    private cryptoService: CryptoService,
    public activeModal: NgbActiveModal,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnDestroy(): void {
    $(
      "<style>.modal-content { }</style>"
    ).appendTo("body");
  }

  ngOnInit(): void {
    this.style_obj_item_filter = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    if (!this.filters) {
      localStorage.setItem('filter_main_prices', JSON.stringify(this.init_filter_data));
      this.filter_main_prices = this.init_filter_data;
    } else {
      this.filter_main_prices = JSON.parse(localStorage.getItem('filter_main_prices'));
    }
    $(
      "<style>.modal-content { overflow-x:hidden !important; overflow-y:auto !important}</style>"
    ).appendTo("body");

    if (this.forAddOrder || this.forPOS) {
      this.is_DisplayAvaibility = false;
    }
    if (this.itemFlag) {
      this.main = this.appComponent.main;
      this.categoryId = this.cryptoService.decryptIdValue(
        "urlcategoryid" + this.main.LoggedUserStoreInfo.store_id?.toString(),
        this.main.CryptoKey
      );
    }
    this.loginUserStore = localStorage.getItem("loginUserStore");

    this.category_name = this.loginUserStore.category_name;

    if (this.hide_sub_category) {
      this.selectedSubCategory = this.selected_sub_cat;
    }


    if (this.filters) {
      this.selectedCategory = this.filters.selectedCategory;
      this.selectedBrands = this.filters?.selectedBrands;
      this.selectedTag = this.filters?.selectedTag;
      this.selectedSubCategory = this.filters.selectedSubCategory;
    } else {
      if (this.selectedcat) {
        this.selectedCategory = this.selectedcat;
      }
    }

    if (this.filters && this.filters?.item_attributes) {
      this.filters.item_attributes = JSON.parse(this.filters?.item_attributes)
      this.item_attribute = this.filters?.item_attributes;
    } else {
      this.item_attribute = this.init_filter_data?.item_attributes;
    }

    if (this.hide_price_filter) {
      this.SortingOptions = this.SortingOptions?.filter((sort) => sort.value != 2 && sort.value != 3)
    }

    this.item_avaibility = this.filters?.item_avaibility
      ? this.filters.item_avaibility
      : this.default_item_avaibility;

    this.item_type_pharma = this.filters?.item_type_pharma
      ? this.filters.item_type_pharma
      : this.default_item_type_pharma;

    this.item_type = this.init_filter_data?.food_type;

    if (this.init_filter_data?.post_data_filter.food_type.length > 0) {
      this.item_type.forEach((element: any) => {
       
        this.init_filter_data.post_data_filter.food_type.forEach((item) => {
          if (item.is_added == 1) {
            if (item.id == element.id) {
              element.is_added = true;
            }
          }
        })
      });

    }

    if (this.filters == undefined) {
      this.priceHighValue = this.init_filter_data?.max_price
      this.priceValue = this.init_filter_data?.min_price
      this.discountedPriceHighValue = this.init_filter_data?.max_discount
      this.discountedPriceValue = this.init_filter_data?.min_discount
    } else {
      if (this.postFilter) {
        var temp_cat = []
        this.init_filter_data?.post_data_filter?.categories?.forEach(element => {
          var found = this.init_filter_data.categories.filter((item: any) => item.category_id == Number(element))[0]
          if (found) {
            temp_cat.push(found)
          }
        });
        this.selectedCategory = temp_cat;
        
        this.selectedTag = this.init_filter_data?.post_data_filter.item_tags;
        this.selectedBrands = this.init_filter_data?.post_data_filter.brands;
      } else {
      }
    }
    this.priceOptions = {
      floor: this.filter_main_prices?.min_price,
      ceil: this.filter_main_prices?.max_price,
    };
    this.discountedPriceOptions = {
      floor: this.filter_main_prices?.min_discount,
      ceil: this.filter_main_prices?.max_discount,
    };
    this.priceHighValue = this.init_filter_data.post_data_filter.max_price ? this.init_filter_data.post_data_filter.max_price : this.init_filter_data.max_price;
    this.priceValue = this.init_filter_data.post_data_filter.min_price ? this.init_filter_data.post_data_filter.min_price : this.init_filter_data.min_price;
    this.discountedPriceHighValue = this.init_filter_data.post_data_filter.max_discount ? this.init_filter_data.post_data_filter.max_discount : this.init_filter_data.max_discount;
    this.discountedPriceValue = this.init_filter_data.post_data_filter.min_discount ? this.init_filter_data.post_data_filter.min_discount : this.init_filter_data.min_discount;
  }

  sortType: any = "";
  changeSort(item: any) {
    if (item == 1 || item == 2) {
      this.sortType = 1
    }
    else {
      this.sortType = 2
    }

  }

  filterItemAttribute(attribute_index: any, sub_attribute_index: any, e: any) {
    if (this.item_attribute.length >= 0) {
      if (e.target.checked == true) {
        this.item_attribute[attribute_index].sub_item_attributes[sub_attribute_index].is_added = 1;
      } else {
        this.item_attribute[attribute_index].sub_item_attributes[sub_attribute_index].is_added = 0;
      }
    }

  }
  filterItemAttributeColor(attribute_index: any, sub_attribute_index: any, e: any) {
    if (e.target.checked == true) {
      this.item_attribute[attribute_index].sub_item_attributes[sub_attribute_index].is_added = 1;
    } else {
      this.item_attribute[attribute_index].sub_item_attributes[sub_attribute_index].is_added = 0;
    }
  }

  submitFilters() {
    let appliedFilters: any = {};
    appliedFilters.item_type = this.item_type;
    appliedFilters.item_avaibility = this.item_avaibility;
    appliedFilters.item_type_pharma = this.item_type_pharma;
    appliedFilters.selectedCategory = this.selectedCategory;
    appliedFilters.selectedTag = this.selectedTag;
    appliedFilters.selectedBrands = this.selectedBrands;
    appliedFilters.priceValue = this.priceValue;
    appliedFilters.priceHighValue = this.priceHighValue;
    appliedFilters.discountedPriceValue = this.discountedPriceValue;
    appliedFilters.discountedPriceHighValue = this.discountedPriceHighValue;
    appliedFilters.selectedSubCategory = this.selectedSubCategory;
    appliedFilters.sortType = this.sortType;
    appliedFilters.item_attributes = this.item_attribute.length != 0 ? JSON.stringify(this.item_attribute) : '';
      this.sort.emit(this.selectedsort)
    this.appliedFilters.emit(appliedFilters);
    this.selectedCategory = []
    this.itemFlag = false
    this.activeModal.close();
  }
  dismiss() {
    this.activeModal.close();
  }

  clearFilters() {
    this.selectedCategory = [];
    this.selectedTag = [];
    this.selectedBrands = [];
    this.selectedSubCategory = [];
    this.postFilter = false
    this.item_type = this.default_item_type;
    this.item_type_pharma = this.default_item_type_pharma;
    this.item_avaibility = this.default_item_avaibility;

    this.priceHighValue = this.init_filter_data?.max_price;
    this.priceValue = this.init_filter_data?.min_price;

    this.discountedPriceHighValue = this.init_filter_data?.max_discount;
    this.discountedPriceValue = this.init_filter_data?.min_discount;
    this.selectedsort = 1
    this.sort.emit(this.selectedsort);
    this.filterCleared.emit(true);
    this.activeModal.close();
  }

  onSelectionChangeCategory(e) {
    e.forEach(element => {
      if (element.category_id == "All") {
        this.selectedCategory = [];
        this.init_filter_data?.categories.forEach((status: any) => {
          if (status.category_id != "All") {
            this.selectedCategory.push(status);
          }
        });
      }
    })
  }

  onSelectionChangeSubCategory(e) {
  }

  onSelectionChangeTag(e) {
    e.forEach(element => {
      if (element == 'All') {
        this.selectedTag = [];
        this.init_filter_data?.item_tags?.forEach((status) => {
          if (status != "All") {
            this.selectedTag.push(status);
          }
        });
      }
    });
  }

  onSelectionChangeBrand(e) {
    e.forEach(element => {
      if (element == "All") {
        this.selectedBrands = [];
        this.init_filter_data?.brands?.forEach((status: any) => {
          if (status != "All") {
            this.selectedBrands.push(status);
          }
        });
      }
    })
  }

  markItemType(e, item) {
    this.item_type.filter((x) => x.id == item.id)[0].is_added =
      e.target.checked;
  }

  markPrescription(e, item) {
    this.item_type_pharma.filter((x) => x.value == item.value)[0].is_checked =
      e.target.checked;
  }

  markItemAvaibility(e, item) {
    this.item_avaibility.filter((x) => x.value == item.value)[0].is_checked =
      e.target.checked;
  }

  ClearPrice() {
    this.priceValue = this.init_filter_data?.min_price;
    this.priceHighValue = this.init_filter_data?.max_price
  }

  ClearDiscount() {
    this.discountedPriceValue = this.init_filter_data?.min_discount;
    this.discountedPriceHighValue = this.init_filter_data?.max_discount
  }
}
