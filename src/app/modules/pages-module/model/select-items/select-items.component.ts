import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  tap,
} from "rxjs";
import { CategoryService } from "src/app/services/lookup/category.service";
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
import { ItemFilterComponent } from "../item-filter/item-filter.component";
import { PriceService } from "src/app/services/price.service";
import { SortPipe } from "../../util/sort.pipe";
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-select-items",
  templateUrl: "./select-items.component.html",
  styleUrls: ["./select-items.component.scss"],
})
export class SelectItemsComponent implements OnInit {
  @Input() comboItemSelection: boolean = false;
  @Input() isOfferItemSelection: boolean = false;
  @Input() initialSelectedItems: any;
  @Input() comboItemId: number = 0;
  //dinein
  @Input() IsDineInStiing: any;
  //dinein
  @Output() selectedPopupItems: EventEmitter<any> = new EventEmitter();

  //manage offer (start)
  @Input() isManageOffer: boolean = false;
  //manage offer (end)

  @ViewChild("search", { static: true }) searchbox: ElementRef;
  selectedItemsQty: number = 0;

  selectedItems: any = [];
  categoryGridData: any = [];
  categoryList: any = [];
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));

  count: number = 0;
  tableSize: number = 20;
  tableSizes: any = [3, 6, 9, 12];
  search: string = "";
  page = 1;
  sortKey: any = "";
  isOrderBy: boolean = true;
  noData: boolean = true;
  init_filter_data: any;
  filters: any;
  clearFilter: any = true;
  showFilters: boolean = false;
  selectedCategory: any = {
    label: "",
    value: "",
  };
  totalCount: number = 0;
  global_currency: any;
  showPriceSameFont: any;
  showvariant: any;
  @Input() foritemgrouping
  @Input() foritemcollection
  @Input() item_recommend_id
  @Input() seller_item_collection_id;
  style_obj_select_items: any;
  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    public translate: TranslateService,
    private itemService: ItemService,
    private modalService: NgbModal,
    private categoryService: CategoryService,
    private priceService: PriceService,
    private cdr: ChangeDetectorRef,
    private sortPipe: SortPipe,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_select_items = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.global_currency = this.generalSetting.currency_symbol;
    this.showPriceSameFont = this.generalSetting.show_price_same_font;
    if (this.initialSelectedItems?.length > 0) {
      this.selectedItems = this.initialSelectedItems;
      this.calculateSelectedItem();
    }

    this.getCategoryList();

    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(1000),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getItemList(1);
        })
      )
      .subscribe();
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getItemList(1);
    }
  }
  calculateSelectedItem() {
    this.selectedItems.forEach((element) => {
      this.selectedItemsQty += parseInt(element.quantity);
    });
  }

  getCategoryList() {
    let data: any = {
      store_id: this.loginUserStore.store_id,
    };

    this.categoryService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          //#region this logic will eliminate the category where there is no count in item
          for (var i = 0; i < response.data.length; i++) {
            if (
              response.data[i].count == 0 ||
              response.data[i].category_id == 1 ||
              response.data[i].category_id == 2
            ) {
              response.data.splice(i, 1);
              i--; //re-adjust the counter.
            }
          }
          //#endregion
          let categoryListLocal: any;
          categoryListLocal = response.data;
          //for dineIn Setting
          if (this.IsDineInStiing == 1) {
            var selectCategory = {
              label: "Excluded Items",
              value: -1,
            };
            this.categoryList.push(selectCategory);

            var allcatforDineIn = {
              label: "All",
              value: 0,
            };
            this.categoryList.push(allcatforDineIn);
          }
          //for dineIn Setting

          //manage offer (start)
          else if (this.showvariant && this.isManageOffer == true) {
            var allcatforManageOffer = {
              label: "All",
              value: 0,
            };
            this.categoryList.push(allcatforManageOffer);

          }
          //manage offer (end)
          
          else {
            var allCategory = {
              label: "All",
              value: 0,
            };
            this.categoryList.push(allCategory);
          }

          categoryListLocal.forEach((item, i) => {
            if (item.category_id != 1) {
              var categoryLable = item.category_name;
              var data = { label: categoryLable, value: item.category_id };
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
        // handle error
      },
      complete: () => { },
    });
  }

  getItemList(page) {
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
      limit: this.tableSize,
      user_id: this.loginUserStore.user_id,
      search_type: 1,
    };

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

    data.store_id = this.loginUserStore.store_id;

    if (
      this.filters &&
      this.filters.selectedCategory &&
      this.filters.selectedCategory.length > 0
    ) {
      data.categories = this.filters.selectedCategory
        .map((x) => x.category_id)
        .toString();
    } else {
      data.categories = this.selectedCategory ? this.selectedCategory.value : 0;
    }
    if (this.foritemgrouping == 1) {
      if (this.item_recommend_id) {
        data.item_recommend_id = this.item_recommend_id
      }
    }
    if (this.foritemcollection == 1) {
      if (this.seller_item_collection_id) {
        data.seller_item_collection_id = this.seller_item_collection_id
      }
      data.is_sort = 1
    }
    this.itemService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.showFilters = true;
          this.categoryGridData = [];
          this.noData = false;
          this.count = response.count;
          this.totalCount = response.count;

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
            filterData.brands.splice(0, 0, "All")
          }

          this.init_filter_data = filterData;

          if (this.comboItemSelection == true || this.showvariant == true) {
            response.data.forEach((category) => {
              if (category.category_id != 0) {
                category.item_variants.forEach((varient) => {
                  var itemdata = {
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
                  };
                  this.categoryGridData.push(itemdata);
                });
              }
            });
            this.selectedItems.forEach((item) => {
              var found = this.categoryGridData.filter(
                (x) => x.item_variants_id == item.item_variants_id
              )[0];
              if (found != null || found != undefined) {
                found.Selected = 1;
                found.SelectedQty = item.quantity;
              }
            });

            //manage offer (start)
            if (this.isManageOffer == true && this.showvariant && this.selectedCategory.value == -1) {
              this.categoryGridData = [];
              this.categoryGridData = this.initialSelectedItems;
              this.count = this.categoryGridData.length;
              this.totalCount = this.categoryGridData.length
            }
            //manage offer (end)

          } else {
            response.data.forEach((Category) => {
              var itemdata = {
                Selected: 0,
                SelectedQty: 0,
                item_image: Category.item_image,
                item_type: Category.item_type,
                category_name: Category.category_name,
                sub_category_name: Category.sub_category_name,
                brand_name: Category.brand_name,
                item_name: Category.item_name,
                item_id: Category.item_id,
              };
              this.categoryGridData.push(itemdata);
            });
            //for dineIn Setting
            if (this.IsDineInStiing == 1 && this.selectedCategory.value == -1) {
              this.categoryGridData = [];
              this.categoryGridData = this.initialSelectedItems;
              this.count = this.categoryGridData.length;
              this.totalCount = this.categoryGridData.length;
            }
            //for dineIn Setting

            //manage offer (start)
            if (this.isManageOffer == true && this.selectedCategory.value == -1) {
              this.categoryGridData = [];
              this.categoryGridData = this.initialSelectedItems;
              this.count = this.categoryGridData.length;
              this.totalCount = this.categoryGridData.length;
            }
            //manage offer (end)

            this.selectedItems.forEach((item) => {
              var found = this.categoryGridData.filter(
                (x) => x.item_id == item.item_id
              )[0];

              if (found != null || found != undefined) {
                found.Selected = 1;
                found.SelectedQty = item.quantity;
              }
            });
          }

          //for selected item at top
          if (this.foritemgrouping == 1 || this.foritemcollection == 1) {
            this.categoryGridData = this.sortPipe.transform(
              this.categoryGridData,
              "desc",
              "Selected"
            );
          }
        } else {
          this.showFilters = true;
          this.init_filter_data = response.filter_data;
          this.toastr.error(this.translate.instant(response.message));
          this.noData = true;
          this.count = 0;
          this.categoryGridData = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  changeCategory(category) {
    this.selectedCategory = category;
    this.getItemList(1);
  }

  discountPriceCondition(discountPrice, price) {
    return this.priceService.discountPriceCondition(discountPrice, price);
  }

  selectItem(item) {
    if (this.comboItemSelection || this.showvariant == true && this.isManageOffer == false) {
      this.selectedItems.push({
        //try
        item_id: item.item_id,
        item_variants_id: item.item_variants_id,
        quantity: 1,
        price: item.item_price,
        discountedprice: item.discounted_price,
        packaging: 0
      });
    }
    //manage offer (start)
    else if (this.isManageOffer == true && this.showvariant) {
      this.selectedItems.push({
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
        quantity: 1
      })
    }
    //manage offer (end)
    else {
      if (this.IsDineInStiing == 1) {
        this.selectedItems.push({
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
        });
      }
      //manage offer (start)
      else if (this.isManageOffer == true) {
        this.selectedItems.push({
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
        this.selectedItems.push({ item_id: item.item_id, quantity: 1 });
      }
    }
    this.selectedItemsQty += 1;

    if (this.comboItemSelection || this.showvariant == true) {
      this.selectedItems.forEach((item) => {
        var found = this.categoryGridData.filter(
          (x) => x.item_variants_id == item.item_variants_id
        )[0];
        if (found != null || found != undefined) {
          found.Selected = 1;
          found.SelectedQty = item.quantity;
        }
      });
    } else {
      this.selectedItems.forEach((item) => {
        var found = this.categoryGridData.filter(
          (x) => x.item_id == item.item_id
        )[0];

        if (found != null || found != undefined) {
          found.Selected = 1;
          found.SelectedQty = item.quantity;
        }
      });
    }
    this.cdr.detectChanges();
  }

  save() {
    this.selectedPopupItems.emit(this.selectedItems);
    this.modal.close();
  }

  deleteItem(deletedItem) {
    //need to go to if and work
    if (this.comboItemSelection == true || this.showvariant == true) {
      this.selectedItems.forEach((selectedItem, i) => {
        var found = this.categoryGridData.filter(
          (x) => x.item_variants_id == deletedItem.item_variants_id
        )[0];
        if (found != null || found != undefined) {
          found.Selected = 0;
          found.SelectedQty = 0;
          this.selectedItemsQty -= selectedItem.quantity;
          this.selectedItems.splice(i, 1);
        }
      });
    } else {
      this.selectedItems.forEach((selectedItem, i) => {
        if (selectedItem.item_id == deletedItem.item_id) {
          var found = this.categoryGridData.filter(
            (x) => x.item_id == deletedItem.item_id
          )[0];
          if (found != null || found != undefined) {
            found.Selected = 0;
            found.SelectedQty = 0;
            this.selectedItemsQty -= selectedItem.quantity;
            if (this.isManageOffer == true) {
              this.selectedItems.splice(i, 1);
            } else {
              this.selectedItems = this.selectedItems.filter(
                (x) => x.item_id !== selectedItem.item_id
              );
            }
          }
        }
      });
    }
  }

  openfilter() {
    const modalRef = this.modalService.open(ItemFilterComponent, {
      size: "md",
      backdrop: 'static'

    });
    modalRef.componentInstance.init_filter_data = this.init_filter_data;
    modalRef.componentInstance.filters = this.filters;
    modalRef.componentInstance.appliedFilters.subscribe((filterData) => {
      this.filters = filterData;
      this.clearFilter = false;
    });
    modalRef.componentInstance.filterCleared.subscribe((data) => {
      this.clearFilter = data;
      this.filters = {};
    });
    modalRef.result.then((data) => {
      this.getItemList(1);
    });
  }
}
