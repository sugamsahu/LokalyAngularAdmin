import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from "rxjs";
import { CategoryService } from 'src/app/services/lookup/category.service';
import { StockInwardService } from 'src/app/services/manage-stock/stock-inward.service';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-stocks-select-item',
  templateUrl: './manage-stocks-select-item.component.html',
  styleUrls: ['./manage-stocks-select-item.component.scss']
})
export class ManageStocksSelectItemComponent implements OnInit {

  @Input() initialSelectedItems: any;
  @Output() selectedPopupItems: EventEmitter<any> = new EventEmitter();

  @Input() is_damage_stock: boolean = false;

  @Input() main: any

  @ViewChild("search", { static: true }) searchbox: ElementRef;
  selectedItemsQty: number = 0;

  selectedItems: any = [];
  categoryGridData: any = [];
  categoryList: any = [];
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  session_store_id = localStorage.getItem('adminselectedstore');
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
  gridData: any;
  gridDataPage: any = [];
  style_obj_manage_stocks_select_item:any;

  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    public translate: TranslateService,
    private categoryService: CategoryService,
    private _stockInwardService: StockInwardService,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_manage_stocks_select_item = {
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
          var allCategory = {
            label: "All",
            value: 0,
          };
          this.categoryList.push(allCategory);
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
  /** Get item list of manage stock */
  getItemList(page) {
    this.page = page;
    const data = {
      store_id: (this.main.LoggedUserStoreInfo.store_id) ? this.main.LoggedUserStoreInfo.store_id : this.session_store_id,
      page: this.page,
      category_id: this.selectedCategory ? this.selectedCategory.value : 0,
      search_query: this.search
    };
    console.log('data')
    this._stockInwardService.getItemsListForStock(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.noData = false;
          this.totalCount = response.count;
          this.categoryGridData = response.data;
          this.gridData = [];

          this.categoryGridData.forEach(element => {
            element.items.forEach(items => {

              if (items.stock_management_method == 2) {
                var itemdata = {
                  unit_quantity: items.item_variants.length > 0 ? parseFloat(items.item_variants[0].unit_quantity) : 0,
                  Selected: 0,
                  SelectedQty: 0,
                  item_image: items.item_image,
                  item_type: items.item_type,
                  category_name: element.category_name,
                  sub_category_name: items.sub_category_name,
                  brand_name: items.brand_name,
                  item_name: items.item_name,
                  item_id: items.item_id,

                  item_variants_id: items.item_variants.length > 0 ? items.item_variants[0].item_variants_id : 0,
                  item_price: items.item_variants.length > 0 ? items.item_variants[0].item_price : '',
                  discounted_price: items.item_variants.length > 0 ? items.item_variants[0].discounted_price : '',
                  packaging_id: items.item_variants.length > 0 ? items.item_variants[0].packaging_id : '',
                  packaging_name: items.item_variants.length > 0 ? items.item_variants[0].packaging_name : null,
                  unit_id: items.item_variants.length > 0 ? items.item_variants[0].unit_id : '',
                  unit_name: items.item_variants.length > 0 ? items.item_variants[0].unit_name : '',

                  sku: items.item_variants.length > 0 ? items.item_variants[0].sku : '',
                  out_of_stock: items.item_variants.length > 0 ? items.item_variants[0].out_of_stock : '',
                  mask_price: items.item_variants.length > 0 ? items.item_variants[0].mask_price : '',
                  min_qty: items.item_variants.length > 0 ? items.item_variants[0].min_qty : '',
                  packaging: items.item_variants.length > 0 ? items.item_variants[0].packaging : '',
                  tax: items.item_variants.length > 0 ? items.item_variants[0].tax : '',
                  tax_price: items.item_variants.length > 0 ? Number(Number(items.item_variants[0].discounted_price) * Number(items.item_variants[0].tax) / 100).toFixed(2) : '',
                  max_qty: items.item_variants.length > 0 ? items.item_variants[0].max_qty : '',
                  is_choice_addon: items.item_variants.length > 0 ? items.item_variants[0].is_choice_addon : '',
                  ia_available_choice_addon: items.item_variants.length > 0 ? (items.item_variants[0].is_choice_addon == 0 ? "Choices/Addons Available" : items.item_variants[0].is_choice_addon == 1 ? "Choices Available" : items.item_variants[0].is_choice_addon == 2 ? "Addons Available" : "") : '',
                  choices: items.item_variants.length > 0 ? items.item_variants[0].choices : '',
                  addons: items.item_variants.length > 0 ? items.item_variants[0].addons : '',
                  prescription: items.prescription,
                  is_combo: items.is_combo,
                  stock_management_method: items.stock_management_method
                }
                this.gridData.push(itemdata);
              }
              else {
                items.item_variants.forEach(varient => {
                  var itemdata =
                  {
                    unit_quantity: parseFloat(varient.unit_quantity),
                    Selected: 0,
                    SelectedQty: 0,
                    item_image: items.item_image,
                    item_type: items.item_type,
                    category_name: element.category_name,
                    sub_category_name: items.sub_category_name,
                    brand_name: items.brand_name,
                    item_name: items.item_name,
                    item_id: items.item_id,
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
                    tax_price: Number(Number(varient.discounted_price) * Number(varient.tax) / 100).toFixed(2),
                    max_qty: varient.max_qty,
                    is_choice_addon: varient.is_choice_addon,
                    ia_available_choice_addon: varient.is_choice_addon == 0 ? "Choices/Addons Available" : varient.is_choice_addon == 1 ? "Choices Available" : varient.is_choice_addon == 2 ? "Addons Available" : "",
                    choices: varient.choices,
                    addons: varient.addons,
                    prescription: items.prescription,
                    is_combo: items.is_combo,
                    stock_management_method: items.stock_management_method
                  };
                  if (items.stock_management_method != 1) {
                    this.gridData.push(itemdata);
                  }
                })
              }

            })
          })

          this.selectedItems.forEach((item) => {
            var found = this.gridData.filter(
              (x) => x.item_variants_id == item.item_variants_id
            )[0];

            if (found != null || found != undefined) {

              var found123 = this.selectedItems.filter(function (el) {
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

          this.gridDataPage = this.gridData
        } else {
          this.totalCount = 0;
          this.categoryGridData = [];
          this.gridDataPage = [];
        }
      }
    })
  }

  validateThreeDigit(item) {
    if (item.SelectedQty.split(".").length > 1 && item.SelectedQty.split(".")[1] > 99) {
      item.SelectedQty = (Number(item.SelectedQty).toFixed(3))
    }
  }

  itemQuantityChnage(item) {
    if (this.is_damage_stock == true) {
      if (Number(item.SelectedQty) > Number(item.opening_stock)) {
        this.toastr.error(this.translate.instant('DAMAGED_QUANTITY_CANNOT_BE_GREATER_THAN_THE_CURRENT_STOCK'));
        item.SelectedQty = 0
        item.quantity = 0
      }
    }

    if (this.selectedItems.length == 0) {
      item.quantity = item.SelectedQty;
      this.selectedItems.push(item);
    }
    else {
      var isexistingItem = this.selectedItems.filter(el => el.item_variants_id == item.item_variants_id)[0]

      if (isexistingItem) {
        this.selectedItems.forEach(el => {
          if (el.item_variants_id == item.item_variants_id) {
            el.SelectedQty = item.SelectedQty;
            el.quantity = item.SelectedQty;
          }
        })
      } else {
        item.quantity = item.SelectedQty;
        this.selectedItems.push(item);
      }
    }
  }

  changeCategory(category) {
    this.selectedCategory = category;
    this.getItemList(1);
  }

  save() {
    this.selectedPopupItems.emit(this.selectedItems);
    this.modal.close();
  }

}
