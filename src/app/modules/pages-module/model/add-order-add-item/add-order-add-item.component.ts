import {
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
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-add-order-add-item",
  templateUrl: "./add-order-add-item.component.html",
  styleUrls: ["./add-order-add-item.component.scss"],
})
export class AddOrderAddItemComponent implements OnInit {
  @Input() main: any;
  @Output() SelectedItemFromStore: EventEmitter<any> = new EventEmitter();

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
  style_obj_add_order_add_item: any;

  constructor(
    public modal: NgbActiveModal,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private itemService: ItemService,
    private sortPipe: SortPipe,
    private modalService: NgbModal,
    public commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.style_obj_add_order_add_item = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    if (this.picker == 1) {
      this.SelectedItems.forEach((element) => {
        element.SelectedQty = element.quantity;
      });
    }
    if (this.SelectedItems != null || this.SelectedItems.length > 0) {
      this.patchSelectedValue();
    }
    this.iseatery = this.main.LoggedUserStoreInfo.iseatery;
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

  patchSelectedValue() {
    this.SelectedItems.forEach((item) => {
      this.selecteditemsqty += parseInt(item.quantity);
      var ch = {
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
        out_of_stock: 0,
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
      if (
        item.choices != null ||
        item.addons != null ||
        item.choices_addons != null
      ) {
        this.SelectedItemsAddOnsChoices.push(ch);
      }
      if (item.combo_variants != null) {
        this.SelectedItemsCombo.push(ch);
      }
    });
  }

  getCategoryList() {
    const data: any = {
      store_id: this.loginUserStore.store_id,
    };
    this.categoryService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          let categoryListLocal: any;
          categoryListLocal = response.data;
          var allCategory = {
            label: "All",
            value: 0,
          };
          this.categoryList.push(allCategory);
          categoryListLocal.forEach((item, i) => {
            if (item.count > 0) {
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

  changeCategory(category) {
    this.selectedCategory = category;
    this.getItemList(1);
  }

  getItemList(page) {
    this.page = page;
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    if (this.singlepicker == 1) {
      this.selectedCategory.label = "xyz";
      this.selectedCategory.value = this.categoryId;
    }
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id
        ? this.main.LoggedUserStoreInfo.store_id
        : this.session_store_id,
      page: this.page,
      categories: this.selectedCategory ? this.selectedCategory.value : 0,
      search_query: search,
      user_id: this.main.LoggedUserInfo.user_id,
      out_of_stock: 0,
      limit: 20,
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
      is_item_variant_level: 1,
      order_id:
        this.orderdetail == undefined ? undefined : this.orderdetail.order_id,
    };
    this.itemService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.noData = false;
          this.totalCount = response.count;
          this.count = response.count;
          this.categoryGridData = response.data;
          this.gridData = [];
          this.categoryGridData.forEach((category) => {
            category.item_variants.forEach((varient) => {
              var itemdata = {
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
                tax_price: Number(
                  (Number(varient.discounted_price) * Number(varient.tax)) / 100
                ).toFixed(2),
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
              };
              this.gridData.push(itemdata);
            });
          });
          this.SelectedItems.forEach((item) => {
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
              } else {
                found.Selected = 1;
                found.SelectedQty = item.quantity;
              }
            }
          });
          this.gridData = this.sortPipe.transform(
            this.gridData,
            "desc",
            "Selected"
          );
          this.gridDataPage = this.gridData;
        } else {
          this.totalCount = 0;
          this.categoryGridData = [];
          this.gridDataPage = [];
          this.noData = true;
        }
      },
    });
  }

  incrementValue(item, add, choice, newPage) {
    var itemdetails = JSON.stringify(item);
    this.modelNewItem = itemdetails;

    if (item.is_choice_addon != null) {
      var found123 = this.SelectedItemsAddOnsChoices.filter(
        (el) => el.item_variants_id == item.item_variants_id
      );
      if (found123 != null && found123 != undefined && found123.length > 0) {
        var found45 = found123[found123.length - 1];
        var found46 = JSON.stringify(found45);
        var found: any = JSON.parse(found46);
        var price =
          found.discounted_price != "" || found.discounted_price != undefined
            ? parseFloat(found.discounted_price)
            : parseFloat(found.item_price);
        var choices_addons = [];

        if (found.choices != null) {
          found.choices.forEach((choice) => {
            choice.choice_prices.forEach((choicePrice) => {
              if (choicePrice.is_added == true) {
                price += parseFloat(choicePrice.price);
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
      return;
    }

    if (item.is_combo == "1") {
      var findSelectedComboItem = this.SelectedItemsCombo.filter(
        (x) => x.item_variants_id == item.item_variants_id
      );
      if (
        findSelectedComboItem != null &&
        findSelectedComboItem != undefined &&
        findSelectedComboItem.length > 0
      ) {
        var findSelectedComboItem1 =
          findSelectedComboItem[findSelectedComboItem.length - 1];

        var price =
          findSelectedComboItem1.discounted_price != "" ||
            findSelectedComboItem1.discounted_price != undefined
            ? parseFloat(findSelectedComboItem1.discounted_price)
            : parseFloat(findSelectedComboItem1.item_price);

        if (findSelectedComboItem1.combo_variants.length > 0) {
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
    var value = parseInt(item.SelectedQty, 10);
    value = isNaN(value) ? 0 : value;
    value++;
    item.SelectedQty = value;
    this.changeItemQty(item);
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
      });

      this.selecteditemsqty += 1;
    } else {
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
      });
      if (item.is_choice_addon != null) {
        this.selecteditemsqty += 1;
      }
    }
    this.Getitems(newPage, addons, choices);
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
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO: compares instead of assigning; probably meant item.SelectedQty = 0 for unselected rows
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

  @Input() orderprocess;
  Submit() {
    if (this.orderprocess == 1) {
      this.saveandclose();
    } else {
      setTimeout(() => {
        this.SelectedItems.forEach((element) => {
          if (
            element.addons == null &&
            element.choices == null &&
            element.combo_variants == null
          ) {
            element.quantity = element.SelectedQty;
          }
          if (this.picker == 1) {
            if (
              element.is_new == 1 &&
              (element.choices_addons?.length == 0 ||
                element?.choices_addons == null)
            ) {
              element.picker_quantity = element.SelectedQty;
            }
          }
          if (this.picker == 1) {
            if (
              element.is_new == 1 &&
              element.picker_quantity != element.quantity
            ) {
              element.quantity = element.picker_quantity;
            }
          }
        });
      }, 1000);

      this.SelectedItemFromStore.emit(this.SelectedItems);
      this.modal.dismiss();
    }
  }

  saveandclose() {
    return new Promise((resolve) => {
      setTimeout(() => {
        var choices = [];
        var addons = [];
        if (this.SelectedItemsAddOnsChoices.length > 0) {
          this.SelectedItemsAddOnsChoices.forEach((item) => {
            this.SelectedItems = this.SelectedItems.filter(function (el) {
              return el.item_variants_id !== item.item_variants_id;
            });
          });
          this.SelectedItemsAddOnsChoices.forEach((itemAddonChoices) => {
            var addItem = {
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
            };
            this.SelectedItems.push(addItem);
          });
        }

        if (this.SelectedItemsCombo.length > 0) {
          this.SelectedItemsCombo.forEach((item) => {
            this.SelectedItems = this.SelectedItems.filter(function (el) {
              return el.item_variants_id !== item.item_variants_id;
            });
          });

          this.SelectedItemsCombo.forEach((item) => {
            var addItem = {
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
            };
            this.SelectedItems.push(addItem);
          });
        }
        this.SelectedItemFromStore.emit(this.SelectedItems);
        this.modal.dismiss();
      }, 1000);
    });
  }

  decrementValue(item, addon, choice) {
    if (item.is_choice_addon != null) {
      if (
        (addon != null || choice != null) &&
        this.SelectedItemsAddOnsChoices.length > 0
      ) {
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
      value--;
    }
    item.SelectedQty = value;

    if (value == 0) {
      this.deleteItem(item, addon, choice);
    }

    this.changeItemQty(item);
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
        (el) => el.item_variants_id != selected.item_variants_id
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
        this.SelectedItemsAddOnsChoices.push(
          this.selectedItemAddonChoicesLst[i]
        );
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
        item1.SelectedQty = 1;
        var tot: any = $("#item" + item1.item_variants_id.toString()).val();
        tot = Number(tot) + 1;
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
}
