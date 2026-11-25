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
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-order-select-items",
  templateUrl: "./order-select-items.component.html",
  styleUrls: ["./order-select-items.component.scss"],
})
export class OrderSelectItemsComponent implements OnInit {
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  @Input() main: any;
  @Output() SelectedItemFromStore: EventEmitter<any> = new EventEmitter();
  tableSize: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  global_currency = this.generalSetting.currency_symbol;
  global_timezone = this.generalSetting.timezone;
  show_price_same_font = this.generalSetting.show_price_same_font;
  sessionConfig: any;
  session_store_id = localStorage.getItem("adminselectedstore");
  session_category_id = localStorage.getItem("adminselectedcategory");
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  categoryid = this.sellerDetails.category_id;
  CategoryGridData = [];
  search = "";
  sanketSearch = "";
  page = 1;
  total_count = 0;
  SelectedItems;
  selecteditemsqty = 0;
  SelectedItemsAddOnsChoices = [];
  SelectedItemsCombo = [];
  isNewAddCombo = false;
  fullScreenDisplay = false;
  item_tax_type = this.generalSetting.item_tax_type;
  iseatery: any;
  category_customer_icon: any;
  selectedCategoryId = 1;
  gridData: any;
  gridDataPage: any;
  orderdetail: any;
  picker_order_id: any;
  noData: boolean;
  totalCount: any;
  count: any;
  last_used_addon_choice: any;
  SelectedQty: number;
  selectedItemAddonChoicesLst: any;
  style_obj_order_select_items:any;

  constructor(
    public modal: NgbActiveModal,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private itemService: ItemService,
    private sortPipe: SortPipe,
    private modalService: NgbModal,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.style_obj_order_select_items = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.main.LoggedUserInfo = JSON.parse(
      this.sessionConfig.getSessionLoginUser()
    );
    this.main.LoggedUserStoreInfo = JSON.parse(
      this.sessionConfig.getSessionLoginUserStore()
    );
    this.category_customer_icon =
      this.main.LoggedUserStoreInfo.category_customer_icon;
    this.iseatery = this.main.LoggedUserStoreInfo.iseatery;
    this.show_price_same_font = this.generalSetting.show_price_same_font;
    this.global_currency = this.generalSetting.currency_symbol;
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
    this.getCategoryList();
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getItemsList(this.selectedCategoryId, 1);
        })
      )
      .subscribe();
  }

  categoryList: any = [];
  getCategoryList() {
    const data: any = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
    };

    this.categoryService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var allCategory = {
            category_description: "All",
            category_id: 0,
            category_name: "All",
            count: 0,
            sub_categories: [],
            variants_count: 0,
          };
          this.categoryList.push(allCategory);

          response.data.forEach((item) => {
            if (item.count > 0) {
              this.categoryList.push(item);
            }
          });

          this.selectedCategoryId = this.categoryList[0].category_id;
          if (this.selectedCategoryId == -1) {
            this.gridData = this.SelectedItems;
            this.total_count = this.SelectedItems.length;
            this.gridDataPage = this.gridData;
          } else {
            this.getItemsList(this.categoryList[0].category_id, 1);
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

  getItemsList(categoryId, pageNo) {
    this.page = pageNo;

    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    var data: any = {
      store_id: this.main.LoggedUserStoreInfo.store_id
        ? this.main.LoggedUserStoreInfo.store_id
        : this.session_store_id,
      page: pageNo,
      categories: categoryId,
      search_query: this.search,
      user_id: this.main.LoggedUserInfo.user_id,
      out_of_stock: 0,
      limit: 20,
      mask_price: 0,
      is_item_variant_level: 1,
      order_id:
        this.orderdetail == undefined ? undefined : this.orderdetail.order_id,
    };
    if (this.sellerDetails.role_id == 8) {
      data.is_picker = 1;
      data.order_id = this.picker_order_id;
    }

    this.itemService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.noData = false;
          this.totalCount = response.count;
          this.count = response.count;
          this.CategoryGridData = response.data;
          this.gridData = [];

          this.CategoryGridData.forEach((category) => {
            category.item_variants.forEach((varient) => {
              var itemdata: any = {
                unit_quantity: parseFloat(varient.unit_quantity),
                Selected: 0,
                SelectedQty: 0,
                item_image: category.item_image,
                item_type: category.item_type,
                category_name: category.category_name,
                category_id: category.category_id,
                sub_category_name: category.sub_category_name,
                brand_name: category.brand_name,
                item_name: category.item_name,
                item_id: category.item_id,
                item_variants_id: varient.item_variants_id,
                item_price: varient.item_price,
                discounted_price: varient.discounted_price,
                packaging_id: varient.packaging_id,
                location:
                  varient.location == undefined ||
                    varient.location == "" ||
                    varient.location == null
                    ? ""
                    : varient.location,
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
              itemdata.tax =
                this.item_tax_type == 1
                  ? varient.tax
                  : varient.tax_group_percentage;
              itemdata.tax_price = Number(
                (Number(varient.discounted_price) * Number(itemdata.tax)) / 100
              ).toFixed(2);
              this.gridData.push(itemdata);
            });
          });

          this.SelectedItems.forEach((item) => {
            var found = this.gridData.filter(
              (x) => x.item_variants_id == item.item_variants_id
            )[0];

            if (found != null || found != undefined) {
              var found123 = this.SelectedItems.filter(function (el) {
                return el.item_variants_id == item.item_variants_id;
              });
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

          this.gridDataPage = this.gridData;
        } else {
          this.totalCount = 0;
          this.CategoryGridData = [];
          this.gridDataPage = [];
        }
      },
    });
  }
  /** Increment item  */
  modelNewItem: any = [];
  incrementValue(item, add, choice) {
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
        (el) => el.item_variants_id == item.item_variants_id
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
            combo.choices.forEach((choice) => {
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

            combo.addons.forEach((addon) => {
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
            combo.choices_addons = choices_addons;
          });
        }
        this.last_used_addon_choice = findSelectedComboItem1;
        return;
      } else {
        this.isNewAddCombo = true;
        this.openSelectComboItems(item);
      }
      return;
    }
    if (item.SelectedQty == 0 || item.SelectedQty == undefined) {
      this.selectItem(item, add, choice);
    }

    var value = parseInt(item.SelectedQty, 10);
    value = isNaN(value) ? 0 : value;
    value++;
    item.SelectedQty = value;
    this.changeItemQty(item);
  }

  openSelectComboItems(item) {
    const modalRef = this.modalService.open(SelectComboItemsComponent, {
      size: "w-1300",
      centered: true,
      animation: true,
    });

    modalRef.componentInstance.SelectedItems = item;

    modalRef.componentInstance.SelectedComboItems.subscribe(
      (userSelectedCombo) => {
        if (userSelectedCombo.combo_variants.length > 0) {
          this.SelectedItemsCombo.push(userSelectedCombo);
          this.SelectedItems.push(userSelectedCombo);
          if (this.isNewAddCombo == true) {
            var tot: any = $("#item" + userSelectedCombo.item_variants_id)
              .val()
              .toString();
            tot = tot + 1;
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

  selectItem(item, addons, choices) {
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
    this.Getitems(1, addons, choices);
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
        this.SelectedQty = 0;
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
    this.gridData = this.sortPipe.transform(this.gridData, "desc", "Selected");

    var start = newPage * 20 - 20;
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
  }

  Submit() {
    
  }
  /** Decrement item */
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
      return;
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
  /** Get total price */
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

    modalRef.componentInstance.SelectedItems = this.func(item, addons, choices);

    modalRef.componentInstance.SelectedAddonChoicesItem.subscribe((item1) => {
      if (item1.is_choice_addon != null) {
        item1.SelectedQty += 1;
        this.selectItem(item1, addons, choices);
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
        lastaddonchoice.choices
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
      this.deleteAddOnChoices(selected);
    });
  }

  deleteAddOnChoices(selected) {
    this.SelectedItems = [];
    this.selecteditemsqty -= 1;
    this.SelectedItemsAddOnsChoices = [];
    this.selectedItemAddonChoicesLst.splice(selected.index, 1); //SelectedItemsAddOnsChoices
    this.SelectedItemsAddOnsChoices.push(this.selectedItemAddonChoicesLst);

    this.selectedItemAddonChoicesLst.forEach((element) => {
      var item = {
        item_id: element.item_id,
        item_variants_id: element.item_variants_id,
        item_name: element.item_name,
        price: element.item_price,
        discountedprice: element.discounted_price,
        quantity: element.SelectedQty,
        packaging: element.packaging,
        addons: element.addons,
        choices: element.choices,
      };
      this.SelectedItems.push(item);
    });

    this.gridData.forEach((element) => {
      var found = this.SelectedItems.filter(
        (i) => i.item_variants_id == element.item_variants_id
      )[0];
      if (found != null || found != undefined) {
        element.SelectedQty -= 1;
        element.Selected = 1;
      }
    });
  }

  setlocation(category, event) {
    $(".navbar-nav li").click(function () {
      $(this).addClass("active").siblings().removeClass("active");
    });
    this.selectedCategoryId = category.category_id;

    if (this.selectedCategoryId == -1) {
      this.gridData = this.SelectedItems;
      this.total_count = this.SelectedItems.length;
      this.gridDataPage = this.gridData;
    } else {
      this.getItemsList(category.category_id, 1);
    }
  }

  ok() {
    this.saveandclose();
  }

  saveandclose = function () {
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
  };
}
