import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { OrderService } from "src/app/services/order.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import * as moment from "moment";
import { AddSelectItemComponent } from "../model/add-select-item/add-select-item.component";
import { cloneDeep } from "lodash";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-pick-order-process",
  templateUrl: "./pick-order-process.component.html",
  styleUrls: ["./pick-order-process.component.scss"],
})
export class PickOrderProcessComponent implements OnInit {
  main: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  orderId: any = 0;
  cart_item_total: any;
  cart_item_total_quantity: any;
  item_category_count: any;
  cart_order_amount: any;
  currentDate: Date;
  dateOptions = {
    minDate: new Date(),
  };
  picker_order_id: any;
  packing_note: any;
  number_of_box: any;
  serverSideButtonDivHide = false;
  serverSideEditButton = false;
  order_allowed_update_statuses =
    this.general_setting.order_allowed_update_statuses.split(",");
  prescription: number;
  count = 1;
  picker_order_categories = this.general_setting.picker_order_categories;
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  tempselecteditems: any;
  orderitem: any = {};
  pickerorderStatusList = [
    { label: "ALL", value: 0 },
    { label: "Pending", value: 1 },
    { label: "In-Progress", value: 2 },
    { label: "Completed", value: 3 },
    { label: "New", value: 4 },
  ];
  pick_completed = false;
  searchText: string;
  orderStatusList = [];
  selectedOrderStatus: any;
  addsubitem: any;
  index: any;
  flag = false;
  old_array: any;
  taxPrice: number = 0;
  packagingCharges: number = 0;
  selecteditemscount: number = 0;
  itemtotal: any = 0;
  taxAndChargesTotalToolTip;
  global_currency = this.general_setting.currency_symbol;

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    private OrderService: OrderService,
    private modalService: NgbModal,
    private cryptoService: CryptoService,
    private router: Router,
    private _snackbarService: ToastrService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    this.orderId = this.cryptoService.decryptIdValue(
      "order_id" + this.main.LoggedUserInfo.role_id?.toString(),
      this.main.CryptoKey
    );
    if (this.orderId == undefined) {
      this.router.navigate(["/pickerorder"]);
    }
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfoStore = JSON.parse(
      session.getSessionLoginUserStore()
    );
    this.orderitem.status = [1, 2, 3, 4];
    var orderList = this.general_setting.order_status_list;
    orderList.forEach((Item) => {
      var data = { label: Item.name, value: Number(Item.id) };
      this.orderStatusList.push(data);
    });
    this.selectedOrderStatus = this.orderStatusList[0];
    this.PageLoadData();
  }

  //get 1st data
  PageLoadData() {
    var data = {
      order_id: this.orderId,
      is_edit: 1,
    };
    this.OrderService.getPickerOrderDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.cart_item_total = response.data.item_total;
          this.cart_item_total_quantity = response.data.item_total_quantity;
          this.item_category_count = response.data.item_category_count;
          this.cart_order_amount = response.data.order_amount;
          this.orderDetailBinding(response.data);
          this.currentDate = new Date(response.data.current_datetime);
          this.dateOptions.minDate = this.currentDate;
        } else {
        }
      },
      error: (error: any) => {
      },
    });
  }

  orderdetail: any;
  selecteditems: any = [];
  orderDetailBinding(details) {
    this.selecteditems = [];
    this.orderdetail = details;
    this.picker_order_id = details.order_id;
    this.orderdetail.OrderStatus = this.orderdetail.order_status_val;
    this.orderdetail.DeliveryType = this.orderdetail.delivery_type_val;
    this.packing_note = this.orderdetail.picker_remarks;
    this.number_of_box = this.orderdetail.no_of_box_packed;
    this.isOrderEditableorNot(this.orderdetail.order_status);
    var itemdetails = [];

    this.orderdetail.items.forEach((Item) => {
      //doubt
      if (this.prescription != 1) {
        this.prescription = Item.prescription;
      }
      //doubt
      this.count = 0;
      Item.item_variants.forEach((variant) => {
        if (variant.is_added == 1) {
          var item_data = {
            item_id: Item.item_id,
            category_id: Item.category_id,
            location:
              Item.location == "" ||
                Item.location == null ||
                Item.location == undefined
                ? ""
                : Item.location,
            item_variants_id: variant.item_variants_id,
            order_item_id: Item.order_item_id,
            item_name: Item.item_name,
            item_image: Item.item_image,
            item_pickup_status: variant.item_pickup_status,
            brand_name: Item.brand_name,
            category_name: Item.category_name,
            packaging_name: variant.packaging_name,
            unit_name: variant.unit_name,
            quantity: Number(variant.quantity),
            picker_quantity: Number(variant.picker_quantity),
            is_new: 0,
            unit_quantity: variant.unit_quantity,
            discounted_price: variant.discounted_price,
            price: variant.item_price,
            packaging: variant.packaging,
            tax: variant.tax,
            is_combo: Item.is_combo,
            is_picker_add: variant.is_picker_add,
            // added by me
            choices_addons: null,
            combo_variants: null,
          };
          if (variant.choices_addons != null) {
            item_data.choices_addons = variant.choices_addons;
          } else {
            item_data.choices_addons = null;
          }

          var choices_addons = [];
          if (Item.combo_variants != null) {
            item_data.combo_variants = Item.combo_variants;
            if (item_data.combo_variants) {
              item_data.combo_variants.forEach((combo) => {
                choices_addons = [];
                combo.choices?.forEach((choice) => {
                  choice.choice_prices.forEach((choicePrice) => {
                    if (choicePrice.is_added == true) {
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
                      addonName =
                        addonName == ""
                          ? addonsPrice.variant_sub_addon_name
                          : addonName +
                          ", " +
                          addonsPrice.variant_sub_addon_name;
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
          }

          itemdetails.push(item_data);
        }
      });
    });

    this.selecteditems = itemdetails;
    if (this.picker_order_categories == 1) {
      this.selecteditems.sort((a, b) => a.category_id - b.category_id);
    } else {
      this.selecteditems.sort((a, b) => a.location - b.location);
    }
    this.tempselecteditems = this.selecteditems;
  }

  isOrderEditableorNot(status) {
    if (this.serverSideButtonDivHide == true) {
      this.serverSideEditButton = true;
    } else {
      var result = this.order_allowed_update_statuses.filter(
        (value) => value == status.toString()
      );
      this.serverSideEditButton = result.length > 0 ? false : true;
    }
  }

  retunShowItems(item) {
    var details = this.orderitem.status.filter(
      (event) => event == item.item_pickup_status,
      true
    )[0];
    if (details) {
      this.count = 1;
      return true;
    } else {
      this.count = this.count + 1;
      item.remove = "yes";
      return false;
    }
  }
  /** Increment selected item */
  incrementValue(selectedItem, add, choice) {
    if (selectedItem.is_new == 1) {
      selectedItem.picker_quantity++;
      selectedItem.quantity++;
    } else {
      selectedItem.picker_quantity++;
    }

    if (selectedItem.picker_quantity >= selectedItem.quantity) {
      selectedItem.item_pickup_status = 3;
    } else if (
      selectedItem.picker_quantity < selectedItem.quantity &&
      selectedItem.picker_quantity != 0
    ) {
      selectedItem.item_pickup_status = 2;
    } else if (selectedItem.picker_quantity == 0) {
      selectedItem.item_pickup_status = 1;
    }
  }
  /** Decrement selected item */

  decrementValue(selectedItem, addon, choice) {
    if (selectedItem.picker_quantity > 0) {
      if (selectedItem.is_new == 1) {
        selectedItem.picker_quantity--;
        selectedItem.quantity--;
      } else {
        selectedItem.picker_quantity--;
      }

      if (selectedItem.picker_quantity >= selectedItem.quantity) {
        selectedItem.item_pickup_status = 3;
      } else if (
        selectedItem.picker_quantity < selectedItem.quantity &&
        selectedItem.picker_quantity != 0
      ) {
        selectedItem.item_pickup_status = 2;
      } else if (selectedItem.picker_quantity == 0) {
        selectedItem.item_pickup_status = 1;
      }
    }
  }

  ChangeOrderStatus(item: any) {
    item.forEach((element) => {
      if (element == 0) {
        this.orderitem.status = [];
        this.pickerorderStatusList.forEach((status: any) => {
          if (status.value != 0) {
            this.orderitem.status.push(status.value);
          }
        });
      }
    });
  }
  /** update order status */
  ManageOrderDetails() {
    this.UpdateOrderStatus();
  }

  UpdateOrderStatus() {
    var mainQuntity = 0;
    var pickQuntity = 0;

    this.selecteditems.forEach((Item) => {
      mainQuntity = mainQuntity + Number(Item.quantity);
      pickQuntity = pickQuntity + Number(Item.picker_quantity);
    });

    if (mainQuntity == pickQuntity) {
      this.UpdateOrderStatuspicker();
    } else {
      if (
        this.pick_completed == true &&
        this.orderdetail.order_packed_percentage != 100
      ) {
        Swal.fire({
          title: this.translate.instant("THE_ORDER_IS_NOT_COMPLETELY_PICKED"),
          text: this.translate.instant("DO_YOU_STILL_WANT_TO_PROCEED"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          cancelButtonText: this.translate.instant("NO"),
          confirmButtonText: this.translate.instant("YES"),
        }).then((result) => {
          if (result.value) {
            this.UpdateOrderStatuspicker();
          } else if (result.dismiss === Swal.DismissReason.cancel) {
          }
        });
      } else {
        this.UpdateOrderStatuspicker();
      }
    }
  }
  /** Update order status picker using service */
  UpdateOrderStatuspicker() {
    var fd = new FormData();

    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("store_id", this.main.LoggedUserInfoStore.store_id);
    fd.append("order_id", this.orderId);
    fd.append("customer_id", this.orderdetail.customer.cust_user_id);
    fd.append("order_status", this.selectedOrderStatus.value);
    fd.append("picker_remarks", this.packing_note);
    fd.append("no_of_box_packed", this.number_of_box);
    fd.append("is_picker_complete", this.pick_completed == true ? "1" : "0");
    fd.append("picked_by", this.main.LoggedUserInfo.user_id);
    fd.append("amount", this.cart_order_amount);
    fd.append(
      "date",
      moment(new Date()).format(this.DateFormateFromServerSideOnlyDateReturn())
    );
    fd.append("items", JSON.stringify(this.selecteditems));

    var data = fd;

    this.OrderService.manageOrderStatuspicker(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          if (this.pick_completed == true) {
            this.router.navigate(["/pickerorder"]);
          } else {
            this.PageLoadData();
          }
        } else {
          this._snackbarService.error(response.message);
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => { },
    });
  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.general_setting.date_format_web.split(" ")[0];
  }
  /** Open AddOrderAddItemComponent modal */
  openSelectItem() {
    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
      centered: true,
    });
    console.log(this.selecteditems)
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.SelectedItems = cloneDeep(this.selecteditems);
    modalRef.componentInstance.picker = 1;
    modalRef.componentInstance.SelectedItemFromStore.subscribe(
      (selectedItem) => {
        this.receivedSelectedItemFunction(selectedItem);
      }
    );
  }
  /** Open AddOrderAddItemComponent modal and get data from modal by event emitter */
  openSelectItemlist(index, flag, item) {
    this.addsubitem = item;
    if (this.picker_order_categories == 1) {
      localStorage.setItem("picker_category_id", item.category_id);
    } else {
      localStorage.setItem("picker_location", item.location);
    }
    this.index = index;
    this.flag = flag;
    this.old_array = this.selecteditems.length;

    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
      centered: true,
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.picker = 1;
    modalRef.componentInstance.SelectedItems = cloneDeep(this.selecteditems);
    modalRef.componentInstance.singlepicker = 1;
    modalRef.componentInstance.categoryId = item.category_id;
    modalRef.componentInstance.SelectedItemFromStore.subscribe(
      (selectedItem) => {
        this.receivedSelectedItemFunction(selectedItem);
      }
    );
  }
  /** Bind data by getting from modal  */
  receivedSelectedItemFunction(selectedItem) {
    var tempItem = [];
    this.selecteditems = [];

    selectedItem.forEach((element) => {
      element.SelectedQty = element.quantity;
      var exist = false;
      tempItem.forEach((noDuplication) => {
        var ItemQuantity = element.quantity;
        delete element.quantity;
        var noDuplicationQuantity = noDuplication.quantity;
        delete noDuplication.quantity;

        if (JSON.stringify(element.item_variants_id) === JSON.stringify(noDuplication.item_variants_id) && (JSON.stringify(element?.addons) === JSON.stringify(noDuplication?.addons) && JSON.stringify(element?.choices) === JSON.stringify(noDuplication?.choices))) {
          exist = true;
          noDuplication.quantity = noDuplicationQuantity + 1;
        } else {
          element.quantity = ItemQuantity;
          noDuplication.quantity = noDuplicationQuantity;
        }
      });
      if (exist == false && element != "") {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO: compares instead of assigning; decide whether new items should get quantity 1
        element.quantity == 1;
        tempItem.push(element);
      }
    });

    selectedItem = tempItem;
    this.selecteditems = selectedItem;

    // for single type
    var difference;
    if (this.flag == true) {
      difference = this.selecteditems.length - this.old_array;

      for (var i = 0; i < this.selecteditems.length; i++) {
        if (this.selecteditems[i].picker_quantity == undefined) {
          this.selecteditems[i].picker_quantity =
            this.selecteditems[i].quantity;
          this.selecteditems[i].is_new = 1;
          this.selecteditems[i].item_pickup_status = 4;
          this.selecteditems[i].is_picker_add = 1;
          this.selecteditems[i].referance_item_id =
            this.addsubitem.order_item_id;
          if (Number(this.index) != this.selecteditems.length - 2) {
            this.selecteditems.splice(
              Number(this.index) + 1,
              0,
              this.selecteditems[i]
            );
          }
        }
      }

      for (var i = 0; i < difference; i++) {
        if (Number(this.index) != this.selecteditems.length - 2) {
          this.selecteditems.pop();
        }
      }
    }

    this.flag = false;
    if (this.picker_order_categories == 1) {
      this.selecteditems.sort((a, b) => a.category_id - b.category_id);
    } else {
      this.selecteditems.sort((a, b) => a.location - b.location);
    }
    // for single type
    this.selecteditems.forEach((item) => {
      if (item.picker_quantity == undefined) {
        item.picker_quantity = item.quantity;
        item.is_new = 1;
        item.item_pickup_status = 4;
      }
      var price: number = 0;
      var choices_addons: any[] = [];

      if (item.combo_variants != null) {
        //for combo
      } else {
        if (item.order_item_id > 0) {
        } else {
          item.choices?.forEach((choice) => {
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

          item.addons?.forEach((addon) => {
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
              choices_addons.push(addon.variant_addon_name + " : " + addonName);
            }
          });

          item.choices_addons = choices_addons;
        }
      }

      if (item.order_item_id > 0) {
        if (item.is_combo == "1") {
          item.price = Number(item.discountedprice).toFixed(2);
        }
      } else {
        item.price = Number(Number(item.discountedprice) + price).toFixed(2);
      }
    });

    var item_total = 0;
    this.orderdetail.otherCharges = 0;
    this.taxPrice = 0;
    this.packagingCharges = 0;

    for (var i = 0; i < selectedItem.length; i++) {
      if (this.prescription == 0) {
        this.prescription = selectedItem[i].prescription;
      }

      this.selecteditemscount += Number(selectedItem[i].quantity);
      selectedItem[i].packaging =
        Number(selectedItem[i].packaging) * Number(selectedItem[i].quantity);
      selectedItem[i].tax_price =
        Number(
          (Number(selectedItem[i].discounted_price) * selectedItem[i].tax) / 100
        ) * Number(selectedItem[i].quantity);
      this.orderdetail.otherCharges +=
        Number(selectedItem[i].packaging) + Number(selectedItem[i].tax_price);
      this.taxPrice += parseFloat(selectedItem[i].tax_price);
      this.packagingCharges += parseFloat(selectedItem[i].packaging);

      if (selectedItem[i].combo_variants) {
        selectedItem[i].combo_variants.forEach((combo) => {
          if (combo.choices != undefined && combo.choices != null) {
            for (var j = 0; j < combo.choices.length; j++) {
              for (var k = 0; k < combo.choices[j].choice_prices.length; k++) {
                if (combo.choices[j].choice_prices[k].is_added == true) {
                  if (selectedItem[i].order_item_id > 0) {
                    item_total += 0;
                  } else {
                    item_total += Number(
                      parseFloat(combo.choices[j].choice_prices[k].price) *
                      parseInt(selectedItem[i].quantity)
                    );
                  }

                  this.orderdetail.otherCharges += Number(
                    (parseFloat(combo.choices[j].choice_prices[k].price) *
                      parseInt(selectedItem[i].quantity) *
                      selectedItem[i].tax) /
                    100
                  );
                  if (selectedItem[i].order_item_id == undefined) {
                    this.taxPrice += Number(
                      (parseFloat(combo.choices[j].choice_prices[k].price) *
                        parseInt(selectedItem[i].quantity) *
                        selectedItem[i].tax) /
                      100
                    );
                  }
                }
              }
            }
          }

          if (combo.addons != undefined && combo.addons != null) {
            for (var j = 0; j < combo.addons.length; j++) {
              for (var k = 0; k < combo.addons[j].addon_prices.length; k++) {
                if (combo.addons[j].addon_prices[k].is_added == true) {
                  if (selectedItem[i].order_item_id > 0) {
                    item_total += 0;
                  } else {
                    this.itemtotal += Number(
                      parseFloat(combo.addons[j].addon_prices[k].price) *
                      parseInt(selectedItem[i].quantity)
                    );
                  }
                  this.orderdetail.otherCharges += Number(
                    (parseFloat(combo.addons[j].addon_prices[k].price) *
                      parseInt(selectedItem[i].quantity) *
                      selectedItem[i].tax) /
                    100
                  );
                  if (selectedItem[i].order_item_id == undefined) {
                    this.taxPrice += Number(
                      (parseFloat(combo.addons[j].addon_prices[k].price) *
                        parseInt(selectedItem[i].quantity) *
                        selectedItem[i].tax) /
                      100
                    );
                  }
                }
              }
            }
          }
        });
      } else {
        if (
          selectedItem[i].choices != undefined &&
          selectedItem[i].choices != null
        ) {
          for (var j = 0; j < selectedItem[i].choices.length; j++) {
            for (
              var k = 0;
              k < selectedItem[i].choices[j].choice_prices.length;
              k++
            ) {
              if (
                selectedItem[i].choices[j].choice_prices[k].is_added == true
              ) {
                item_total += Number(
                  selectedItem[i].choices[j].choice_prices[k].price *
                  parseInt(selectedItem[i].quantity)
                );

                this.orderdetail.otherCharges += Number(
                  (selectedItem[i].choices[j].choice_prices[k].price *
                    parseInt(selectedItem[i].quantity) *
                    selectedItem[i].tax) /
                  100
                );
                this.taxPrice += Number(
                  (selectedItem[i].choices[j].choice_prices[k].price *
                    parseInt(selectedItem[i].quantity) *
                    selectedItem[i].tax) /
                  100
                );
              }
            }
          }
        }

        if (
          selectedItem[i].addons != undefined &&
          selectedItem[i].addons != null
        ) {
          for (var j = 0; j < selectedItem[i].addons.length; j++) {
            for (
              var k = 0;
              k < selectedItem[i].addons[j].addon_prices.length;
              k++
            ) {
              if (selectedItem[i].addons[j].addon_prices[k].is_added == true) {
                item_total += Number(
                  selectedItem[i].addons[j].addon_prices[k].price *
                  parseInt(selectedItem[i].quantity)
                );

                this.orderdetail.otherCharges += Number(
                  (selectedItem[i].addons[j].addon_prices[k].price *
                    parseInt(selectedItem[i].quantity) *
                    selectedItem[i].tax) /
                  100
                );
                this.taxPrice += Number(
                  (selectedItem[i].addons[j].addon_prices[k].price *
                    parseInt(selectedItem[i].quantity) *
                    selectedItem[i].tax) /
                  100
                );
              }
            }
          }
        }
      }
    }

    this.orderdetail.otherCharges = Number(
      Number(Number(this.taxPrice) + Number(this.packagingCharges))
    ).toFixed(2);

    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
      this.global_currency,
      this.packagingCharges,
      this.taxPrice
    );
    this.orderdetail.item_total = Number(item_total).toFixed(2);
    console.log(this.selecteditems)
  }

  cancelClick() {
    history.back();
  }

  taxAndChargesToolTip = function (global_currency, packaging_cost, order_tax) {
    var taxAndChargesTotalToolTip = "";
    if (Number(packaging_cost) > 0 && Number(order_tax) <= 0) {
      taxAndChargesTotalToolTip =
        "Store Packaging Cost: " +
        global_currency +
        " " +
        Number(packaging_cost).toFixed(2);
    } else if (Number(order_tax) > 0 && Number(packaging_cost) <= 0) {
      taxAndChargesTotalToolTip =
        this.general_setting.store_tax_label +
        ": " +
        global_currency +
        " " +
        Number(order_tax).toFixed(2);
    } else {
      taxAndChargesTotalToolTip =
        this.general_setting.store_label +
        " Packaging Cost: > " +
        global_currency +
        " " +
        Number(packaging_cost).toFixed(2) +
        this.general_setting.store_tax_label +
        global_currency +
        " " +
        Number(order_tax).toFixed(2);
    }
    return taxAndChargesTotalToolTip;
  };
}