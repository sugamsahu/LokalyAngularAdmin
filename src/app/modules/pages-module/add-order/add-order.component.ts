import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { Subject, takeUntil } from "rxjs";
import { AppComponent } from "src/app/app.component";
import { AddOrderService } from "src/app/services/add-order.service";
import { CustomerService } from "src/app/services/customer.service";
import { RepeatAddonChoiceComponent } from "../model/repeat-addon-choice/repeat-addon-choice.component";
import { SelectAddonChoicesComponent } from "../model/select-addon-choices/select-addon-choices.component";
import { RepeatComboItemsComponent } from "../model/repeat-combo-items/repeat-combo-items.component";
import { SelectComboItemsComponent } from "../model/select-combo-items/select-combo-items.component";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { AvailableOffersComponent } from "../model/available-offers/available-offers.component";
import { OrderService } from "src/app/services/order.service";
import { installHtmlTooltips, trustedTooltipHtml } from "src/app/utils/html-tooltip";
import { AddNoteComponent } from "../model/add-note/add-note.component";
import { AddSelectItemComponent } from "../model/add-select-item/add-select-item.component";
import { cloneDeep } from "lodash";
import { CommonService } from "src/app/services/common.service";
import { ViewMultipleImageComponent } from "../model/view-multiple-image/view-multiple-image.component";
import Swal from "sweetalert2";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-add-order",
  templateUrl: "./add-order.component.html",
  styleUrls: ["./add-order.component.scss"],
})
export class AddOrderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();
  addOrderForm: UntypedFormGroup;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  loginStore = JSON.parse(localStorage.getItem("loginUserStore"));
  global_currency: string = this.generalSetting.currency_symbol;
  show_price_same_font = this.generalSetting.show_price_same_font;
  is_eatery = this.loginStore.iseatery;
  item_tax_type = Number(this.generalSetting.item_tax_type);
  offer_module = this.generalSetting.offers_module;
  tax_recalculation_offer = this.generalSetting.tax_recalculation_offer;
  show_billing_address = this.generalSetting.show_billing_address;
  allow_order_tip = this.generalSetting.allow_order_tip;
  amount_seperator = this.generalSetting?.amount_seperator;
  main: any;
  selectedCustomer: any;
  customerList: any = [];
  settings: any = {};
  receivedSelectedItems: any[] = [];
  storedeliverysettings: any = [];
  deliveryAddressList: any = [];
  billingAddressList: any = [];
  modelNewItem: any = {};
  last_used_addon_choice: any = {};
  deliveryAddress: any = {};
  billingAddress: any = {};
  notProcessOrderMessage: string = "";
  deliverySlotList: any = [];
  deliverySlot: any;
  expressDeliverySlotList: any = [];
  expressDeliverySlot: any;
  pickupSlotList: any = [];
  pickupSlot: any;
  offerList: any = [];
  taxAndChargesTotalToolTip: any;
  itemtotal: any = 0;
  prescription: number = 0;
  deliverycharge: any = 0.0;
  taxAndChargesTotal: any = 0;
  offerPrice: number = 0;
  grandtotal: any = 0;
  offer_code: any;
  wallet_amount = 0.0;
  order_amount = 0.0;
  selecteditemscount: number = 0;
  taxPrice: number = 0;
  packagingCharges: number = 0;
  isNewAddCombo: boolean;
  isNotPlaceOrder: boolean = false;
  deliverydate1: any;
  pickupdate1: any;
  expressDeliveryoptions: number = 1;
  paymentMethodList: any = [];
  isdisplayWallet = this.generalSetting.allow_wallet;
  walletBalance: any = 0.0;
  originalWalletBalance = 0.0;
  walletMaxValue = this.generalSetting.max_payment;
  newSellerOrder = {
    remarks: "",
    offerCode: "",
    apply_Wallet: false,
  };
  paymentMethod = undefined;
  showOfferSuccessMessage = true;
  deliveryOptions = 1;
  schedulePickupDate = new Date();
  mindate: any;
  mainDeliveryCharge: any;
  dlt_all_Choice_adn: any = false;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  freeItems: any;
  order_tip: any = 0;
  disable_button: boolean = false;
  deliverySlotListData: any = [];
  availableOfferCode: string;
  textApplyOffer: string;

  constructor(
    private translate: TranslateService,
    private appComponent: AppComponent,
    private addOrderService: AddOrderService,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private formBuilder: UntypedFormBuilder,
    private OrderService: OrderService,
    private _snackbarService: ToastrService,
    public commonService: CommonService,
    private _helpService: BannerService,
    private router: Router,
    private cryptoService: CryptoService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    installHtmlTooltips(); // HTML only for tooltips built with trustedTooltipHtml()
    this.mindate = new Date();
    this.generalSetting =
      this.generalSetting == null || !this.generalSetting
        ? this.main
        : this.generalSetting;
    this.loadForm();
    this.getOrderSettings();
    this.getCustomerList();
    this.getHelpDetails();
  }

  loadForm() {
    this.addOrderForm = this.formBuilder.group({
      deliverytype: new UntypedFormControl("1"),
      deliveryoptions: new UntypedFormControl("1"),
      deliverySlot: new UntypedFormControl(null),
      deliverydate1: new UntypedFormControl(null),
      timepicker: new UntypedFormControl(null),
      expressDeliverySlot: new UntypedFormControl(null),
      pickupOptions: new UntypedFormControl("1"),
      pickupSlot: new UntypedFormControl(null),
      pickupdate1: new UntypedFormControl(null),
      pickuptimepicker: new UntypedFormControl(null),
      apply_Wallet: false,
      paymentMethod: new UntypedFormControl(null),
      deliveryAddress: new UntypedFormControl(null),
      billingAddress: new UntypedFormControl(null),
      offerCode: new UntypedFormControl(null),
      remarks: new UntypedFormControl(null),
    });
    this.addOrderForm.get("deliverydate1").valueChanges.subscribe((val) => {
      this.deliverydate1 = moment(val).format(
        this.main.DateFormate.split(" ")[0]
      );
    });
    this.addOrderForm.get("pickupdate1").valueChanges.subscribe((val) => {
      this.pickupdate1 = moment(val).format(
        this.main.DateFormate.split(" ")[0]
      );
    });
  }

  async getOrderSettings() {
    const data = {
      store_id: this.loginStore.store_id,
    };

    await this.addOrderService
      .getOrderSettings(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.settings = response.data;
            console.log(response.data)
            this.storedeliverysettings = response.data;
            this.processPaymentMethods(this.storedeliverysettings.store_payments);
          } else {
            this.settings.delivery = 0;
            this.settings.pickup = 0;
            this.settings.express_delivery = 0;
          }
        },
        error: (error) => { },
        complete: () => { },
      });
  }

  async deliverySlotListCall() {
    const data = {
      store_id: this.loginStore.store_id,
      user_id: this.selectedCustomer?.customer_user_id,
      order_type: Number(this.addOrderForm.get("deliverytype").value),
      cart_type: 1,
      is_seller: 1,
    };

    await this.addOrderService
      .getDeliverySlot(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.deliverySlotListData = response.data;

            if (this.deliverySlotListData.delivery_slots != null) {
              this.deliverySlotListData.delivery_slots.forEach((item) => {
                var a = item.from_time.split(" ")[1];
                item.from_time = moment(
                  item.from_time,
                  this.dateFormateFromServerSide()
                ).format(this.main.DateFormate.split(" ")[0]);
                item.from_time = item.from_time + " " + a;
              });
            }
            this.deliverySlotList =
              this.deliverySlotListData.delivery_slots == null
                ? []
                : this.deliverySlotListData.delivery_slots;

            this.deliverySlot = this.deliverySlotList[0];

            if (this.deliverySlotListData.pickup_slots != null) {
              this.deliverySlotListData.pickup_slots.forEach((item) => {
                var a = item.from_time.split(" ")[1];
                item.from_time = moment(
                  item.from_time,
                  this.dateFormateFromServerSide()
                ).format(this.main.DateFormate.split(" ")[0]);
                item.from_time = item.from_time + " " + a;
              });
            }

            this.pickupSlotList =
              this.deliverySlotListData.pickup_slots == null
                ? []
                : this.deliverySlotListData.pickup_slots;

            this.pickupSlot = this.pickupSlotList[0];

            this.expressDeliverySlotList =
              this.deliverySlotListData.express_delivery_slots == null
                ? []
                : this.deliverySlotListData.express_delivery_slots;
            this.expressDeliverySlot = this.expressDeliverySlotList[0];

          }
        },
        error: (error) => { },
        complete: () => { },
      });
  }
  /** Date format from server side */
  dateFormateFromServerSide() {
    return this.main.DateFormate;
  }

  async getCustomerList() {
    const data = {
      store_id: this.loginStore.store_id,
    };
    await this.customerService
      .getStoreCustomerList(data, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.customerList = response.data;
          } else {
            this.toastr.error(this.translate.instant(response.message));
          }
        },
        error: (error) => { },
        complete: () => { },
      });
  }

  selectCustomer() {
    this.processPaymentMethods(this.storedeliverysettings.store_payments);
    if (this.settings.pickup == 1) {
      this.addOrderForm.controls.deliverytype.setValue(
        this.settings.delivery == 1 ? "1" : "2"
      );
    } else {
      this.addOrderForm.controls.deliverytype.setValue(
        this.settings.delivery == 1 ? "1" : "4"
      );
    }

    this.addOrderForm.controls["deliverySlot"].setValue(
      this.deliverySlotList[0]?.slot
    );
    this.getCustomerAddressList();
    this.getOnGoingStoreOffers();
    if (this.isdisplayWallet) {
      this.getCustomerWalletBalance();
    }

    this.addOrderForm.controls["expressDeliverySlot"].setValue(
      this.expressDeliverySlotList[0]?.slot
    );

    this.addOrderForm.controls["pickupSlot"].setValue(
      this.pickupSlotList[0]?.slot
    );

    var deliveryTypeData = this.addOrderForm.get("deliverytype").value
    if (deliveryTypeData != null || deliveryTypeData != undefined) {
      this.deliverySlotListCall()
    }

  }

  async getCustomerAddressList() {
    const data: any = {
      user_id: this.selectedCustomer.customer_user_id,
    };
    if (this.selectedCustomer.is_confirm == 0) {
      data.store_id = this.loginStore.store_id;
    }

    await this.addOrderService
      .getCustomerAddressList(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.deliveryAddressList = []
            this.billingAddressList = []
            response.data.forEach((item) => {
              item.alias = item.alias.toUpperCase();
              item.fullAddress = [
                item.address,
                item.address2,
                item.area_name,
                item.city_name,
                item.zipcode,
              ]
                .filter(Boolean)
                .join(", ");

              this.deliveryAddressList.push(item);
              this.billingAddressList.push(item);
            });

            var defaultAdd = this.deliveryAddressList.filter((item) => item.is_default == 1)[0];
            if (defaultAdd) {
              this.selectedCustomer.address = defaultAdd.address;
              this.selectedCustomer.address2 = defaultAdd.address2;
              this.selectedCustomer.area_name = defaultAdd.area_name;
              this.selectedCustomer.city_name = defaultAdd.city_name;
              this.selectedCustomer.zipcode = defaultAdd.zipcode;

              this.deliveryAddress = defaultAdd;
              this.addOrderForm.controls["deliveryAddress"].setValue(defaultAdd);
            } else {
              this.deliveryAddress = this.deliveryAddressList[0];
              this.addOrderForm.controls["deliveryAddress"].setValue(
                this.deliveryAddress
              );
            }
            if (this.deliveryAddressList.length > 0) {
              this.getSelectedDeliveryAddress(this.deliveryAddress, 1);
            }

            var defaultbillingAdd = this.billingAddressList.filter(
              (item) => item.is_default == 1
            )[0];

            if (defaultbillingAdd != null) {
              this.billingAddress = defaultbillingAdd;
              this.addOrderForm.controls["billingAddress"].setValue(
                defaultbillingAdd
              );
            } else {
              this.billingAddress = this.billingAddressList[0];
              this.addOrderForm.controls["billingAddress"].setValue(
                this.billingAddress
              );
            }
          } else {
            this.toastr.error(this.translate.instant(response.message));
          }
        },
      });
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '107'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '107'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '107'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  async getSelectedDeliveryAddress(add, type) {
    if (type == 1) {
      this.deliveryAddress = add;
      if (this.addOrderForm.value.deliveryAddress.address == "" || this.addOrderForm.value.deliveryAddress.address == undefined || this.addOrderForm.value.deliveryAddress.address == 'undefined' || this.addOrderForm.value.deliveryAddress.address == null) {
        this.toastr.error(this.translate.instant('INCOMPLETE_DELIVERY_ADDRESS'));
      }
    } else {
      this.billingAddress = add;
      if (this.addOrderForm.value.billingAddress.address == "" || this.addOrderForm.value.billingAddress.address == undefined || this.addOrderForm.value.billingAddress.address == 'undefined' || this.addOrderForm.value.billingAddress.address == null) {
        this.toastr.error(this.translate.instant('INCOMPLETE_BILLING_ADDRESS'));
      }
    }
    this.deliveryAddress = add;
    const data = {
      customer_user_id: this.selectedCustomer.customer_user_id,
      store_id: this.loginStore.store_id,
      order_amount: Number(this.itemtotal),
      lat: this.deliveryAddress.lat,
      long: this.deliveryAddress.long,
      customer_address_id: this.deliveryAddress.customer_address_id,
      billing_address_id: this.billingAddress?.customer_address_id,
      order_type: Number(this.addOrderForm.get("deliverytype").value),
      items: JSON.stringify(this.receivedSelectedItems),
    };

    await this.addOrderService
      .getDeliveryCharges(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.isNotPlaceOrder = false;
            this.deliverycharge = response.data.delivery_charges;
            this.mainDeliveryCharge = response.data.delivery_charges;
            this.packagingCharges =
              this.storedeliverysettings.packaging_per_order;

            if (this.item_tax_type == 2) {
              this.taxPrice = 0;
              this.receivedSelectedItems.forEach((item) => {
                var data = response.data.tax_items.filter(
                  (el) => el.item_variants_id == item.item_variants_id
                )[0];

                if (data) {
                  item.tax = data.tax_group_percentage ? data.tax_group_percentage : 1;
                  item.tax_price = Number(
                    Number((Number(item.price) * Number(item.tax)) / 100) *
                    Number(item.quantity)
                  ).toFixed(2);
                  this.taxPrice = Number(this.taxPrice) + Number(item.tax_price);
                  this.packagingCharges =
                    Number(this.packagingCharges) +
                    Number(item.packaging) * Number(item.quantity);
                }
              });
            } else {
              this.receivedSelectedItems.forEach((item) => {
                this.packagingCharges =
                  Number(this.packagingCharges) +
                  Number(item.packaging) * Number(item.quantity);
              });
            }
            this.taxAndChargesTotal = (
              Number(this.packagingCharges) + Number(this.taxPrice)
            ).toFixed(2);

            this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
              this.global_currency,
              this.packagingCharges,
              this.taxPrice
            );
            this.deliverytypechangeCalculation();
          } else {
            this.toastr.error(response.message);
            this.isNotPlaceOrder = true;
            this.notProcessOrderMessage = this.translate.instant(
              response.message
            );
            this.deliverytypechangeCalculation();
          }
        },
        error: (err) => { },
        complete: () => { },
      });
  }
  /** Delivery type change calculation  */
  deliverytypechangeCalculation() {
    this.grandtotal = 0;
    this.selecteditemscount = 0;

    if (this.addOrderForm.get("deliverytype").value == "1") {
      if (this.storedeliverysettings.delivery_charge_type == 2) {
        if (
          Number(this.itemtotal) >=
          Number(this.storedeliverysettings.express_delivery_min_order_amount)
        ) {
          this.deliverycharge = 0.0;
        } else {
          // keep the current delivery charge
        }
      } else {
        // keep the current delivery charge
      }
      this.grandtotal = (
        Number(this.deliverycharge) +
        Number(this.itemtotal) +
        Number(this.taxAndChargesTotal) + Number(this.order_tip)
      ).toFixed(2);
    // eslint-disable-next-line no-dupe-else-if -- TODO: same condition as the branch above, so this never runs; possibly meant "4" (express delivery)
    } else if (this.addOrderForm.get("deliverytype").value == "1") {
      // eslint-disable-next-line no-self-assign -- TODO: see the duplicate branch condition above
      this.deliverycharge = this.deliverycharge;
      this.grandtotal = (
        Number(this.deliverycharge) +
        Number(this.itemtotal) +
        Number(this.taxAndChargesTotal) + Number(this.order_tip)
      ).toFixed(2);
    } else {
      this.deliverycharge = 0.0;
      this.grandtotal = (
        Number(this.itemtotal) + Number(this.taxAndChargesTotal) + Number(this.order_tip)
      ).toFixed(2);
    }

    if (this.offer_code) {
      this.validOfferCode(this.offer_code);
    } else {
      this.applyWalletAmount(this.newSellerOrder.apply_Wallet);
    }
  }

  /** Open AddOrderAddItemComponent */
  openSelectItemPopup() {
    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
      centered: true,
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.forAddOrder = 1;
    modalRef.componentInstance.SelectedItems = cloneDeep(this.receivedSelectedItems);
    modalRef.componentInstance.SelectedItemFromStore.subscribe(
      (selectedItem) => {
        this.getCustomerAddressList();
        this.receivedSelectedItemFunction(selectedItem);
      }
    );
  }

  receivedSelectedItemFunction(selectedItem) {
    this.deliverycharge = this.storedeliverysettings.delivery_charges;

    var tempItem = [];
    this.receivedSelectedItems = [];
    selectedItem.forEach((element) => {
      element.SelectedQty = element.quantity;
      var exist = false;
      tempItem.forEach((noDuplication) => {
        var ItemQuantity = element.quantity;
        delete element.quantity;
        var noDuplicationQuantity = noDuplication.quantity;
        delete noDuplication.quantity;

        if (JSON.stringify(element.item_variants_id) === JSON.stringify(noDuplication.item_variants_id) && (JSON.stringify(element?.addons) === JSON.stringify(noDuplication?.addons) && JSON.stringify(element?.choices) === JSON.stringify(noDuplication?.choices))) {
          if (element.is_combo == 0) {
            exist = true;
            noDuplication.quantity = noDuplicationQuantity + 1;
          } else {
            if (JSON.stringify(element.combo_variants) === JSON.stringify(noDuplication.combo_variants)) {
              exist = true;
              noDuplication.quantity = noDuplicationQuantity + 1;
            } else {
              element.quantity = ItemQuantity;
              noDuplication.quantity = noDuplicationQuantity;
            }
          }
        } else {
          element.quantity = ItemQuantity;
          noDuplication.quantity = noDuplicationQuantity;
        }
      });
      if (exist == false && element != "") {
        tempItem.push(element);
      }
    });
    selectedItem = tempItem;
    this.receivedSelectedItems = JSON.parse(JSON.stringify(selectedItem));
    this.receivedSelectedItems.forEach((item) => {
      var price: number = 0;
      var choices_addons: any = [];
      if (item.combo_variants != null) {
        item.combo_variants.forEach((combo) => {
          choices_addons = [];
          combo.choices?.forEach((choice) => {
            choice.choice_prices.forEach((choicePrice) => {
              if (choicePrice.is_added == true) {
                price = Number(price) + Number(choicePrice.price);
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
                price = Number(price) + Number(addonsPrice.price);
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
          combo.choices_addons = choices_addons;
        });
      }
      else {
        item.choices?.forEach((choice) => {
          choice.choice_prices.forEach((choicePrice) => {
            if (choicePrice.is_added == true) {
              price = Number(price) + Number(choicePrice.price);
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
              price = Number(price) + Number(addonsPrice.price);
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

      var dis_price = 0;
      if (item.discounted_price) {
        dis_price = item.discounted_price
      }
      if (item.discountedprice) {
        dis_price = item.discountedprice
      }
      item.price = Number(Number(dis_price) + Number(price)).toFixed(2);
    });

    this.itemtotal = 0;
    this.taxAndChargesTotal = 0;
    this.taxPrice = 0;
    this.packagingCharges = 0;
    this.grandtotal = 0;
    this.selecteditemscount = 0;
    selectedItem.forEach((item) => {
      if (this.prescription == 0) {
        this.prescription = item.prescription;
      }
      this.selecteditemscount = Number(this.selecteditemscount) + item.quantity;
      item.packaging = Number(item.packaging) * Number(item.quantity);
      item.tax_price = Number(item.tax_price) * Number(item.quantity);
      this.taxAndChargesTotal =
        Number(this.taxAndChargesTotal) +
        (Number(item.packaging) + Number(item.tax_price));
      this.taxPrice = Number(this.taxPrice) + Number(item.tax_price);
      this.packagingCharges = Number(this.packagingCharges) + Number(item.packaging);
      if (Number(item.discounted_price) > 0) {
        this.itemtotal =
          Number(this.itemtotal) +
          parseFloat(item.discounted_price) * item.quantity;
        item.price = Number(item.discounted_price);
      } else {
        this.itemtotal = Number(this.itemtotal) + Number(
          parseFloat(item.price) * parseInt(item.quantity)
        );
      }
      if (item?.combo_variants != null) {
        item.combo_variants.forEach((combo) => {
          if (combo.choices != undefined && combo.choices != null) {
            combo.choices.forEach((choices) => {
              choices.choice_prices.forEach((choicePrice) => {
                if (choicePrice.is_added == true) {
                  this.itemtotal =
                    Number(this.itemtotal) +
                    Number(choicePrice.price) * Number(item.quantity);
                  this.taxAndChargesTotal =
                    Number(this.taxAndChargesTotal) +
                    (Number(choicePrice.price) *
                      Number(item.quantity) *
                      Number(item.tax)) /
                    100;
                  this.taxPrice =
                    Number(this.taxPrice) +
                    (choicePrice.price * item.quantity * item.tax) / 100;
                }
              });
            });
          }

          if (combo.addons != undefined && combo.addons != null) {
            combo.addons.forEach((addon) => {
              addon.addon_prices.forEach((addonPrice) => {
                if (addonPrice.is_added == true) {
                  this.itemtotal =
                    Number(this.itemtotal) +
                    Number(addonPrice.price) * Number(item.quantity);
                  this.taxAndChargesTotal =
                    Number(this.taxAndChargesTotal) +
                    (addonPrice.price * item.quantity * item.tax) / 100;
                  this.taxPrice =
                    Number(this.taxPrice) +
                    (addonPrice.price * item.quantity * item.tax) / 100;
                }
              });
            });
          }
        });
      } else {
        if (item.choices != undefined && item.choices != null) {
          item.choices.forEach((choice) => {
            choice.choice_prices.forEach((choiceprice) => {
              if (choiceprice.is_added == true) {
                this.itemtotal = Number(this.itemtotal) + Number(choiceprice.price) * item.quantity;
                this.taxAndChargesTotal =
                  Number(this.taxAndChargesTotal) +
                  (choiceprice.price * item.quantity * item.tax) / 100;
                this.taxPrice =
                  Number(this.taxPrice) +
                  (choiceprice.price * item.quantity * item.tax) / 100;
              }
            });
          });
        }

        if (item.addons != undefined && item.addons != null) {
          item.addons.forEach((addons) => {
            addons.addon_prices.forEach((addonprices) => {
              if (addonprices.is_added == true) {
                this.itemtotal =
                  Number(this.itemtotal) +
                  Number(addonprices.price) * item.quantity;
                this.taxAndChargesTotal =
                  Number(this.taxAndChargesTotal) +
                  (addonprices.price * item.quantity * item.tax) / 100;
                this.taxPrice =
                  Number(this.taxPrice) +
                  (addonprices.price * item.quantity * item.tax) / 100;
              }
            });
          });
        }
      }
    });

    // to fix 2
    this.itemtotal = this.itemtotal.toFixed(2);
    this.taxAndChargesTotal = this.taxAndChargesTotal.toFixed(2);
    this.packagingCharges =
      Number(this.storedeliverysettings.packaging_per_order) +
      Number(this.packagingCharges);
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
      this.global_currency,
      this.packagingCharges,
      this.taxPrice
    );
    this.deliveryChargeCalculation();
  }

  /** Delivery charge calculation method */
  deliveryChargeCalculation() {
    if (this.addOrderForm.get("deliverytype").value == "1") {
      if (this.storedeliverysettings.delivery_charge_type == 1) {
        // keep the current delivery charge
      } else {
        if (
          this.itemtotal >=
          parseFloat(this.storedeliverysettings.min_order_amount)
        ) {
          this.deliverycharge = 0.0;
        } else {
          this.deliverycharge = this.mainDeliveryCharge;
        }
      }

      this.grandtotal = (
        Number(this.deliverycharge) +
        Number(this.itemtotal) +
        Number(this.taxAndChargesTotal) + Number(this.order_tip)
      ).toFixed(2);
    }
    // this.deliverytype == 4
    else if (this.addOrderForm.get("deliverytype").value == "4") {
      if (this.storedeliverysettings.express_delivery_charge_type == 1) {
        // keep the current delivery charge
      } else {
        if (
          Number(this.itemtotal) >=
          Number(this.storedeliverysettings.express_delivery_min_order_amount)
        ) {
          this.deliverycharge = 0.0;
        } else {
          this.deliverycharge = this.mainDeliveryCharge;
        }
      }
      this.grandtotal = (
        Number(this.deliverycharge) +
        Number(this.itemtotal) +
        Number(this.taxAndChargesTotal) + Number(this.order_tip)
      ).toFixed(2);
    } else {
      this.grandtotal = (
        Number(this.itemtotal) + Number(this.taxAndChargesTotal) + Number(this.order_tip)
      ).toFixed(2);
    }
  }

  removeItemOnOrder(selectedItem) {
    if (selectedItem.choices != null || selectedItem.addons != null) {
      const temp = this.receivedSelectedItems.reduce((totalQuantity, item) => {
        if (item.item_variants_id === selectedItem.item_variants_id) {
          return totalQuantity + item.quantity;
        }
        return totalQuantity;
      }, 0);

      if (temp == selectedItem.min_qty) {
        this.dlt_all_Choice_adn = true;
        Swal.fire({
          title: ('The minimum quantity for item is ' + selectedItem.min_qty + ', Do you wish to remove?'),
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: this.translate.instant("YES"),
          cancelButtonText: this.translate.instant("NO"),
        }).then((result) => {
          if (result.value) {
            this.removeItem(selectedItem);
          } else if (result.dismiss === Swal.DismissReason.cancel) {
          }
        });
      } else {
        this.removeItem(selectedItem);
      }
    } else {
      this.removeItem(selectedItem);
    }
  }

  removeItem(selectedItem) {
    var filterData = this.receivedSelectedItems.filter(
      (item) => item !== selectedItem
    );

    if (this.dlt_all_Choice_adn == true) {
      filterData = filterData.filter((x) => x.item_variants_id != selectedItem.item_variants_id);
      var temp_data = this.receivedSelectedItems.filter((x) => x.item_variants_id == selectedItem.item_variants_id);
      this.receivedSelectedItems = filterData;
      temp_data.forEach((element: any) => {

        this.itemtotal =
          Number(this.itemtotal) -
          Number(element.price) * Number(element.quantity); //tofixed
        this.taxPrice =
          Number(this.taxPrice) -
          (Number(element.price) *
            Number(element.tax) *
            Number(element.quantity)) /
          100;

        this.packagingCharges =
          Number(this.packagingCharges) -
          Number(element.packaging) * Number(element.quantity);
      });
    }
    else {
      this.receivedSelectedItems = filterData;

      this.itemtotal =
        Number(this.itemtotal) -
        Number(selectedItem.price) * Number(selectedItem.quantity); //tofixed

      this.taxPrice =
        Number(this.taxPrice) -
        (Number(selectedItem.price) *
          Number(selectedItem.tax) *
          Number(selectedItem.quantity)) /
        100;

      this.packagingCharges =
        Number(this.packagingCharges) -
        Number(selectedItem.packaging) * Number(selectedItem.quantity);

    }
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
      this.global_currency,
      this.packagingCharges,
      this.taxPrice
    );

    this.taxAndChargesTotal =
      Number(this.taxPrice) + Number(this.packagingCharges); //tofixed

    this.grandtotal =
      Number(this.itemtotal) + Number(this.taxAndChargesTotal); //tofixed

    this.deliveryChargeCalculation();
    if (this.offer_code) {
      this.validOfferCode(this.offer_code);
    }
    else {
      this.applyWalletAmount(this.newSellerOrder.apply_Wallet);
    }
    this.dlt_all_Choice_adn = false;

  }
  /** Tool tip, tax and charges  */
  taxAndChargesToolTip = function (global_currency, packaging_cost, order_tax) {
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
  /** Increament selected item value */
  incrementValue(selectedItem) {
    if (selectedItem.combo_variants) {
      this.Add_Item(selectedItem);
    } else {
      if (selectedItem.choices != null || selectedItem.addons != null) {
        const temp = this.receivedSelectedItems.reduce((totalQuantity, item) => {
          if (item.item_variants_id === selectedItem.item_variants_id) {
            return totalQuantity + item.quantity;
          }
          return totalQuantity;
        }, 0);

        if (temp == selectedItem.max_qty) {
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
          this.Add_Item(selectedItem);
        }
      } else {
        if (selectedItem.quantity == selectedItem.max_qty) {
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
          this.Add_Item(selectedItem);
        }
      }
    }
  }

  Add_Item(selectedItem) {
    if (selectedItem.combo_variants) {
      this.modelNewItem = {};
      this.modelNewItem = JSON.parse(JSON.stringify(selectedItem));
      this.last_used_addon_choice = selectedItem;
      this.openLastCombo();
    } else if (selectedItem.choices != null || selectedItem.addons != null) {
      this.modelNewItem = {};
      this.modelNewItem = JSON.parse(JSON.stringify(selectedItem));
      this.last_used_addon_choice = selectedItem;
      this.openLastAddOnChoice();
    } else {
      selectedItem.quantity++;
      this.itemtotal = (
        Number(this.itemtotal) + Number(selectedItem.price)
      ).toFixed(2);
      this.packagingCharges =
        Number(this.packagingCharges) + Number(selectedItem.packaging);
      this.taxPrice =
        Number(this.taxPrice) +
        (Number(selectedItem.price) * Number(selectedItem.tax)) / 100;
      this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
        this.global_currency,
        this.packagingCharges,
        this.taxPrice
      );
      this.taxAndChargesTotal = (
        Number(this.taxPrice) + Number(this.packagingCharges)
      ).toFixed(2);
      var price =
        Number(selectedItem.discounted_price) +
        (Number(selectedItem.price) * Number(selectedItem.tax)) / 100 +
        Number(selectedItem.packaging);
      this.grandtotal = (Number(this.grandtotal) + Number(price)).toFixed(2);
      this.deliveryChargeCalculation();
      if (this.offer_code) {
        this.showOfferSuccessMessage = false;
        this.validOfferCode(this.offer_code);
      } else {
        this.applyWalletAmount(this.newSellerOrder.apply_Wallet);
      }
    }
  }
  /** open RepeatComboItemsComponent modal*/
  openLastCombo() {
    const modalRef = this.modalService.open(RepeatComboItemsComponent, {
      size: "md",
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
    this.openSelectComboItems(this.modelNewItem);
  }
  /** Open SelectComboItemsComponent modal */
  openSelectComboItems(item) {
    const modalRef = this.modalService.open(SelectComboItemsComponent, {
      size: "w-1300",
      centered: true,
    });

    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.SelectedItems = item;

    modalRef.componentInstance.SelectedComboItems.subscribe(
      (userSelectedCombo) => {
        var item = {
          discountedprice: userSelectedCombo.discounted_price,
          discounted_price: userSelectedCombo.discounted_price,
          item_id: userSelectedCombo.item_id,
          item_name: userSelectedCombo.item_name,
          item_image: userSelectedCombo.item_image,
          category_id: userSelectedCombo.category_id,
          category_name: userSelectedCombo.category_name,
          sub_category_id: userSelectedCombo.sub_category_id,
          sub_category_name: userSelectedCombo.sub_category_name,
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
          is_combo: userSelectedCombo.is_combo,
          min_qty: userSelectedCombo.min_qty,
          max_qty: userSelectedCombo.max_qty
        };

        var price = Number(userSelectedCombo.item_variants[0].item_price);
        var choices_addons = [];

        if (item.combo_variants) {
          item.combo_variants.forEach((combo) => {
            choices_addons = [];
            combo.choices?.forEach((choice) => {
              choice.choice_prices.forEach((choicePrice) => {
                if (choicePrice.is_added == true) {
                  price = Number(price) + Number(choicePrice.price);
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
                  price = Number(price) + Number(addonsPrice.price);
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
        } else {
          item.choices?.forEach((choice) => {
            choice.choice_prices.forEach((choicePrice) => {
              if (choicePrice.is_added == true) {
                price = Number(price) + Number(choicePrice.price);
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
                price = Number(price) + Number(addonsPrice.price);
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

        item.discounted_price = Number(price).toFixed(2);
        item.discountedprice = Number(price).toFixed(2);
        item.price = Number(price).toFixed(2);
        if (item.combo_variants.length > 0) {
          this.receivedSelectedItems.push(item);
          this.checkUniqueItem(this.receivedSelectedItems);
          this.itemtotal = (
            Number(this.itemtotal) + Number(item.price)
          ).toFixed(2);
          this.packagingCharges =
            Number(this.packagingCharges) + Number(item.packaging);
          this.taxPrice =
            Number(this.taxPrice) +
            (Number(item.price) * Number(item.tax)) / 100;
          this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
            this.global_currency,
            this.packagingCharges,
            this.taxPrice
          );
          this.taxAndChargesTotal = (
            Number(this.taxPrice) + Number(this.packagingCharges)
          ).toFixed(2);
          var price =
            Number(item.discounted_price) +
            (Number(item.price) * Number(item.tax)) / 100 +
            Number(item.packaging);
          this.grandtotal = (Number(this.grandtotal) + Number(price)).toFixed(
            2
          );
          this.deliveryChargeCalculation();
          if (this.offer_code) {
            this.validOfferCode(this.offer_code);
          } else {
            this.applyWalletAmount(this.newSellerOrder.apply_Wallet);
          }
        }
      }
    );
  }
  /** Repeat combo item */
  repeatCombo(selectedItem) {
    selectedItem.quantity++;
    this.itemtotal = (
      Number(this.itemtotal) + Number(selectedItem.price)
    ).toFixed(2);
    this.packagingCharges =
      Number(this.packagingCharges) + Number(selectedItem.packaging);
    this.taxPrice =
      Number(this.taxPrice) +
      (Number(selectedItem.price) * Number(selectedItem.tax)) / 100;
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
      this.global_currency,
      this.packagingCharges,
      this.taxPrice
    );
    this.taxAndChargesTotal = (
      Number(this.taxPrice) + Number(this.packagingCharges)
    ).toFixed(2);

    var price =
      Number(selectedItem.discounted_price) +
      (Number(selectedItem.price) * Number(selectedItem.tax)) / 100 +
      Number(selectedItem.packaging);
    this.grandtotal = (Number(this.grandtotal) + Number(price)).toFixed(2);

    this.deliveryChargeCalculation();

    if (this.offer_code) {
      this.validOfferCode(this.offer_code);
    } else {
      this.applyWalletAmount(this.newSellerOrder.apply_Wallet);
    }
  }
  /** Open RepeatAddonChoiceComponent modal */
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
    this.openSelectAddonChoices(this.modelNewItem);
  }

  /** Open SelectAddonChoicesComponent modal */
  openSelectAddonChoices(item) {
    const modalRef = this.modalService.open(SelectAddonChoicesComponent, {
      size: "lg",
      centered: true,
      animation: true,
    });

    modalRef.componentInstance.SelectedItems = this.fetchSelectAddonsData(item);
    modalRef.componentInstance.SelectedAddonChoicesItem.subscribe(
      (addonChoicesItem) => {
        var item = {
          discountedprice: addonChoicesItem.discounted_price,
          discounted_price: addonChoicesItem.discounted_price,
          item_id: addonChoicesItem.item_id,
          item_name: addonChoicesItem.item_name,
          item_image: addonChoicesItem.item_image,
          category_id: addonChoicesItem.category_id,
          category_name: addonChoicesItem.category_name,
          sub_category_id: addonChoicesItem.sub_category_id,
          sub_category_name: addonChoicesItem.sub_category_name,
          item_variants_id: addonChoicesItem.item_variants_id,
          packaging: addonChoicesItem.packaging,
          price: addonChoicesItem.price,
          quantity: addonChoicesItem.min_qty == 0 ? 1 : addonChoicesItem.min_qty,
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
          is_choice_addon: addonChoicesItem.is_choice_addon,
          min_qty: addonChoicesItem.min_qty,
          max_qty: addonChoicesItem.max_qty
        };
        var price = Number(addonChoicesItem.discounted_price);
        var choices_addons = [];
        item.choices?.forEach((choice) => {
          choice.choice_prices.forEach((choicePrice) => {
            if (choicePrice.is_added == true) {
              price = Number(price) + Number(choicePrice.price);
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
              price = Number(price) + Number(addonsPrice.price);
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
        item.price = Number(price).toFixed(2);

        this.receivedSelectedItems.push(item);
        this.checkUniqueItem(this.receivedSelectedItems);

        this.itemtotal = (Number(this.itemtotal) + Number(item.price)).toFixed(
          2
        );
        this.packagingCharges =
          Number(this.packagingCharges) + Number(item.packaging);
        this.taxPrice =
          Number(this.taxPrice) + (Number(item.price) * Number(item.tax)) / 100;
        this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
          this.global_currency,
          this.packagingCharges,
          this.taxPrice
        );
        this.taxAndChargesTotal = (
          Number(this.taxPrice) + Number(this.packagingCharges)
        ).toFixed(2);

        var price =
          Number(item.price) +
          (Number(item.price) * Number(item.tax)) / 100 +
          Number(item.packaging);
        this.grandtotal = (Number(this.grandtotal) + Number(price)).toFixed(2);

        this.deliveryChargeCalculation();

        if (this.offer_code) {
          this.validOfferCode(this.offer_code);
        } else {
          this.applyWalletAmount(this.newSellerOrder.apply_Wallet);
        }
      }
    );
  }

  fetchSelectAddonsData(item) {
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

  repeatAddOnChoice(selectedItem) {
    selectedItem.quantity++;
    this.itemtotal = (
      Number(this.itemtotal) + Number(selectedItem.price)
    ).toFixed(2);
    this.packagingCharges =
      Number(this.packagingCharges) + Number(selectedItem.packaging);
    this.taxPrice =
      Number(this.taxPrice) +
      (Number(selectedItem.price) * Number(selectedItem.tax)) / 100;
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
      this.global_currency,
      this.packagingCharges,
      this.taxPrice
    );
    this.taxAndChargesTotal = (
      Number(this.taxPrice) + Number(this.packagingCharges)
    ).toFixed(2);

    var price =
      Number(selectedItem.discounted_price) +
      (Number(selectedItem.price) * Number(selectedItem.tax)) / 100 +
      Number(selectedItem.packaging);
    this.grandtotal = (Number(this.grandtotal) + Number(price)).toFixed(2);
    this.deliveryChargeCalculation();

    if (this.offer_code) {
      this.validOfferCode(this.offer_code);
    } else {
      this.applyWalletAmount(this.newSellerOrder.apply_Wallet);
    }
  }
  /** Decrement selected item value */
  decrementValue(selectedItem) {
    if (selectedItem.combo_variants) {
      this.deleteItem(selectedItem);
    } else {
      if (selectedItem.choices != null || selectedItem.addons != null) {
        const temp = this.receivedSelectedItems.reduce((totalQuantity, item) => {
          if (item.item_variants_id === selectedItem.item_variants_id) {
            return totalQuantity + item.quantity;
          }
          return totalQuantity;
        }, 0);

        if (temp == selectedItem.min_qty) {
          this.dlt_all_Choice_adn = true;
          this.removeItemOnOrder(selectedItem);
        } else {
          this.deleteItem(selectedItem);
        }
      } else {
        if (selectedItem.quantity == selectedItem.min_qty) {
          Swal.fire({
            title: ('The minimum quantity for item is ' + selectedItem.min_qty + ', Do you wish to remove?'),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: this.translate.instant("YES"),
            cancelButtonText: this.translate.instant("NO"),
          }).then((result) => {
            if (result.value) {
              this.removeItemOnOrder(selectedItem);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
          });
        } else {
          this.deleteItem(selectedItem);
        }
      }
    }
  }

  deleteItem(selectedItem) {
    if (selectedItem.quantity > 1) {
      selectedItem.quantity--;
      this.itemtotal = (
        Number(this.itemtotal) - Number(selectedItem.price)
      ).toFixed(2);
      this.packagingCharges =
        Number(this.packagingCharges) - Number(selectedItem.packaging);
      this.taxPrice =
        Number(this.taxPrice) -
        (Number(selectedItem.price) * Number(selectedItem.tax)) / 100;
      this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
        this.global_currency,
        this.packagingCharges,
        this.taxPrice
      );
      this.taxAndChargesTotal = (
        Number(this.taxPrice) + Number(this.packagingCharges)
      ).toFixed(2);

      var price =
        Number(selectedItem.discounted_price) +
        (Number(selectedItem.price) * Number(selectedItem.tax)) / 100 +
        Number(selectedItem.packaging);
      this.grandtotal = (Number(this.grandtotal) - Number(price)).toFixed(2);

      this.deliveryChargeCalculation();

      if (this.offer_code) {
        this.showOfferSuccessMessage = false;
        this.validOfferCode(this.offer_code);
      } else {
        this.applyWalletAmount(this.newSellerOrder.apply_Wallet);
      }
    }

  }

  deliveryTypeChange() {
    if (this.addOrderForm.get("deliverytype").value == "2") {
      this.getVariantWiseTaxes();
    } else {
      this.getSelectedDeliveryAddress(this.deliveryAddress, 1);
    }

    var deliveryTypeData = this.addOrderForm.get("deliverytype").value
    if (deliveryTypeData != null || deliveryTypeData != undefined) {
      this.deliverySlotListCall()
    }

  }
  /** Get variant wise taxes by  AddOrderService*/
  async getVariantWiseTaxes() {
    const data = {
      customer_user_id: this.selectedCustomer.customer_user_id,
      order_type: Number(this.addOrderForm.get("deliverytype").value),
      store_id: this.loginStore.store_id,
      items: JSON.stringify(this.receivedSelectedItems),
    };

    await this.addOrderService
      .getVariantWiseTaxes(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.isNotPlaceOrder = false;
            this.deliverycharge = response.data.delivery_charges;
            this.packagingCharges = Number(
              this.storedeliverysettings.packaging_per_order
            );

            if (this.item_tax_type == 2) {
              this.taxPrice = 0;
              this.receivedSelectedItems.forEach((item) => {
                var data = response.data.tax_items.filter(
                  (el) => el.item_variants_id == item.item_variants_id
                )[0];
                if (data) {
                  item.tax = data.tax_group_percentage ? data.tax_group_percentage : 1;
                  item.tax_price = Number(
                    Number((Number(item.price) * Number(item.tax)) / 100) *
                    Number(item.quantity)
                  ).toFixed(2);

                  this.taxPrice = Number(this.taxPrice) + Number(item.tax_price);
                  this.packagingCharges =
                    Number(this.packagingCharges) +
                    Number(item.packaging) * Number(item.quantity);
                }
              });
            } else {
              this.receivedSelectedItems.forEach((item) => {
                this.packagingCharges =
                  Number(this.packagingCharges) +
                  Number(item.packaging) * Number(item.quantity);
              });
            }
            this.taxAndChargesTotal = (
              Number(this.packagingCharges) + Number(this.taxPrice)
            ).toFixed(2);
            this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
              this.global_currency,
              this.packagingCharges,
              this.taxPrice
            );
            this.deliverytypechangeCalculation();
          } else {
            this.toastr.error(this.translate.instant(response.message));
            this.isNotPlaceOrder = true;
            this.notProcessOrderMessage = this.translate.instant(
              response.message
            );
            this.deliverytypechangeCalculation();
          }
        },
        error: (err) => { },
        complete: () => { },
      });
  }

  deliveryOptionSelect(value) {
    this.deliveryOptions = value;
  }

  getSelectedDeliverySlot() {
    this.deliverySlot = this.deliverySlotList.filter(
      (el) => el.slot == this.addOrderForm.get("deliverySlot").value
    )[0];
  }

  getSelectedExpressDeliverySlot() {
    this.expressDeliverySlot = this.expressDeliverySlotList.filter(
      (el) => el.slot == this.addOrderForm.get("expressDeliverySlot").value
    )[0];
  }

  getSelectedPickupSlot() {
    this.pickupSlot = this.pickupSlotList.filter(
      (el) => el.slot == this.addOrderForm.get("pickupSlot").value
    )[0];
  }

  getOnGoingStoreOffers() {
    const data = {
      is_store_listing: 0,
      store_id: this.loginStore.store_id,
      user_id: this.selectedCustomer.customer_user_id,
    };
    this.addOrderService
      .getOnGoingStoreOffersList(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.offerList = response.data;
            this.offerList.forEach((item) => {
              var from = item.validity.split(" ")[0];
              var fromDate = "";
              if (this.main.DateFormate.split(" ")[0] == "DD-MM-YYYY") {
                fromDate = item.validity.substr(5, 11);
                fromDate = moment(fromDate).format("DD-MM-YYYY");
              }
              if (item.validity.length == 31) {
                var to = item.validity.substr(17, 18);
                to = to.split(" ")[0];
                if (this.main.DateFormate.split(" ")[0] == "DD-MM-YYYY") {
                  var todate = item.validity.substr(20, 31);
                } else {
                  todate = new Date(item.validity.substr(20, 31));
                  todate = moment(todate).format(
                    this.main.DateFormate.split(" ")[0]
                  );
                }
              }
              if (fromDate != "") {
                item.validity = from + " " + fromDate;
              }
              if (todate != undefined) {
                item.validity = item.validity + " " + to + " " + todate;
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

    modalRef.componentInstance.offerCode.subscribe((offerCode) => {
      this.addOrderForm.controls["offerCode"].setValue(offerCode);

      if (this.addOrderForm.value.offerCode !== this.availableOfferCode) {
        this.validOfferCode(offerCode);
        this.availableOfferCode = offerCode;
        this.newSellerOrder.offerCode = offerCode;
      }
    });
  }

  processPaymentMethods(payments) {
    this.paymentMethodList = [];
    payments.forEach((value) => {
      if (value.method_type_val == 1 || value.method_type_val == 2) {
        var payoption = {
          id: value.payment_method_id,
          name: value.method_name,
          maxordervalue: value.max_order_value,
        };
        if (value.payment_method_id == 0) {
          if (this.selectedCustomer?.is_khata == 1) {
            this.paymentMethodList.push(payoption);
          }
        } else {
          this.paymentMethodList.push(payoption);
        }
      }
    });
  }

  clearOfferCode() {
    this.newSellerOrder.offerCode = "";
    this.addOrderForm.controls["offerCode"].setValue(
      this.newSellerOrder.offerCode
    );
    this.offer_code = "";
    this.clearOfferCodeRecalculate();
  }

  validOfferCode(offerCode: any) {
    this.textApplyOffer = offerCode;
    var data = {
      amount: this.itemtotal,
      discount_code: offerCode,
      order_type: this.addOrderForm.value.deliverytype,
      store_id: this.loginStore.store_id,
      user_id: this.selectedCustomer.customer_user_id,
      payment_method:
        this.paymentMethod != undefined ? this.paymentMethod.id : "",
      customer_address_id: this.deliveryAddress.customer_address_id,
      items: JSON.stringify(this.receivedSelectedItems),
    };
    this.OrderService.getValidOfferCode(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.offer_code = offerCode;
            let valid_offer_code = response.data;
            this.freeItems = response.data?.offer_remarks;
            if (this.tax_recalculation_offer == 1) {
              if (
                valid_offer_code.sub_offer_type_id == 4 ||
                valid_offer_code.sub_offer_type_id == 5 ||
                valid_offer_code.sub_offer_type_id == 13
              ) {
                this.taxPrice = 0;
                var applied_offer: any = this.offerList.filter((offer) => offer.discount_code == this.offer_code)[0];
                if (response.data.offer_applicable_ids[0]) {
                  var applicable_ids: any = response.data.offer_applicable_ids[0].ids.split(',');
                }
                this.receivedSelectedItems.forEach((item) => {
                  var found: any;
                  var offer_amount: any;
                  if (response.data.offer_applicable_ids[0]) {
                    if (response.data.offer_applicable_ids[0].type == 1) {
                      found = applicable_ids.filter((ids: any) => ids == item.item_variants_id)[0];
                    }
                    if (response.data.offer_applicable_ids[0].type == 2) {
                      found = applicable_ids.filter((ids: any) => ids == item.category_id)[0];
                    }
                    if (response.data.offer_applicable_ids[0].type == 3) {
                      found = applicable_ids.filter((ids: any) => ids == item.sub_category_id)[0];
                    }

                    if (found) {
                      offer_amount = Number(Number(Number(item.price) * Number(applied_offer.discount)) / 100);
                      offer_amount = Number(Number(offer_amount) * Number(item.quantity)).toFixed(2);
                      item.price_after_offer = Number((Number(item.price) * Number(item.quantity)) - Number(offer_amount)).toFixed(2);
                      item.postTaxItemPrice = Number(Number(Number(item.price_after_offer) * Number(item.tax)) / 100).toFixed(2);
                      this.taxPrice = Number(this.taxPrice) + Number(item.postTaxItemPrice);
                    } else {
                      item.price_after_offer = Number(Number(item.price) * Number(item.quantity)).toFixed(2);
                      item.postTaxItemPrice = Number(Number(Number(item.price_after_offer) * Number(item.tax)) / 100).toFixed(2);
                      this.taxPrice = Number(this.taxPrice) + Number(item.postTaxItemPrice);
                    }
                  } else {
                    offer_amount = Number(Number(Number(item.price) * Number(applied_offer.discount)) / 100);
                    offer_amount = Number(Number(offer_amount) * Number(item.quantity)).toFixed(2);
                    item.price_after_offer = Number((Number(item.price) * Number(item.quantity)) - Number(offer_amount)).toFixed(2);
                    item.postTaxItemPrice = Number(Number(Number(item.price_after_offer) * Number(item.tax)) / 100).toFixed(2);
                    this.taxPrice = Number(this.taxPrice) + Number(item.postTaxItemPrice);
                  }
                });
                this.taxPrice = Number(this.taxPrice);
                this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
                  this.global_currency,
                  this.packagingCharges,
                  this.taxPrice
                );
                this.taxAndChargesTotal = Number(
                  Number(this.taxPrice) + Number(this.packagingCharges)
                ).toFixed(2);
                this.grandtotal = (
                  parseFloat(this.deliverycharge) +
                  parseFloat(this.itemtotal) +
                  parseFloat(this.taxAndChargesTotal)
                ).toFixed(2);
              }
            }
            var DiffranceOfferDicount = Number(valid_offer_code.offer_discount);
            this.offerPrice = Number(valid_offer_code.offer_discount);
            this.deliveryChargeCalculation();
            this.grandtotal = Number(
              Number(this.grandtotal) - Number(DiffranceOfferDicount)
            ).toFixed(2);
            this.applyWalletAmount(this.newSellerOrder.apply_Wallet);
            if (this.showOfferSuccessMessage == true) {
              this.toastr.success(response.message);
            }
            else {
              this.showOfferSuccessMessage = true;
            }
          }
          else {
            this.addOrderForm.controls["offerCode"].setValue('');
            this.offer_code = "";
            this.freeItems = undefined;
            this.clearOfferCodeRecalculate();
            this.toastr.error(response.message);
          }
        },
        error: (err) => { },
        complete: () => { },
      });
  }

  tipChanges(tips) {
    if (!this.order_tip) {
      this.order_tip = 0
    }
    this.clearOfferCodeRecalculate()
  }

  // payment method
  getSelectedPaymentMethod(item) {
    this.paymentMethod = item;
  }

  // get customer wallet balance
  getCustomerWalletBalance() {
    var data = {
      user_id: this.selectedCustomer.customer_user_id,
      page: 1,
    };
    this.addOrderService
      .getCustomerWalletBalance(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.walletBalance = response.data.balance;
            this.originalWalletBalance = response.data.balance;
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (err) => { },
        complete: () => { },
      });
  }

  //apply wallet
  applyWalletAmount(isChecked: any) {
    this.newSellerOrder.apply_Wallet = isChecked;
    if (this.newSellerOrder.apply_Wallet) {
      if (this.walletMaxValue == 0) {
        var wallet_amount =
          Number(
            Number(this.walletMaxValue) == 0
              ? this.originalWalletBalance
              : this.walletMaxValue
          ) >= Number(this.grandtotal)
            ? this.grandtotal
            : this.originalWalletBalance;
      } else {
        var wallet_amount =
          Number(this.walletMaxValue) == 0
            ? this.originalWalletBalance
            : this.walletMaxValue >= Number(this.grandtotal)
              ? this.grandtotal
              : this.walletMaxValue;
      }
      this.wallet_amount =
        Number(this.originalWalletBalance) > Number(wallet_amount)
          ? wallet_amount
          : this.originalWalletBalance;
      this.order_amount = Number(this.grandtotal) - Number(this.wallet_amount);

      this.walletBalance = Number(
        Number(this.originalWalletBalance) - Number(this.wallet_amount)
      );
    } else {
      this.walletBalance = this.originalWalletBalance;
      this.wallet_amount = 0.0;
    }
    this.order_amount = Number(this.grandtotal) - Number(this.wallet_amount);
  }

  clearOfferCodeRecalculate() {
    this.taxPrice = 0;
    this.availableOfferCode = ''
    this.textApplyOffer = ''
    this.receivedSelectedItems.forEach((item) => {
      this.taxPrice = Number(this.taxPrice) + Number(
        Number(
          Number(Number(item.tax) / 100) *
          Number(Number(item.price * item.quantity))
        )
      );
    });
    this.grandtotal = Number(
      Number(this.grandtotal) + Number(this.offerPrice)
    ).toFixed(2);
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
      this.global_currency,
      this.packagingCharges,
      this.taxPrice
    );
    this.taxAndChargesTotal = Number(
      Number(this.taxPrice) + Number(this.packagingCharges)
    ).toFixed(2);
    this.grandtotal = (
      parseFloat(this.deliverycharge) +
      parseFloat(this.itemtotal) +
      parseFloat(this.taxAndChargesTotal) + parseFloat(this.order_tip)
    ).toFixed(2);
    this.offerPrice = 0;
    this.applyWalletAmount(this.newSellerOrder.apply_Wallet);
  }

  applyOfferCode(offerCode, isModelOpen) {
    if (this.availableOfferCode !== this.addOrderForm.value.offerCode && this.textApplyOffer !== this.addOrderForm.value.offerCode) {
      this.newSellerOrder.offerCode = offerCode;
      if (offerCode) {
        this.validOfferCode(offerCode);
      }
    }
  }

  async submitOrder() {
    if (this.addOrderForm.value.deliveryAddress.address == "" || this.addOrderForm.value.deliveryAddress.address == undefined || this.addOrderForm.value.deliveryAddress.address == 'undefined' || this.addOrderForm.value.deliveryAddress.address == null) {
      this.toastr.error(this.translate.instant('INCOMPLETE_DELIVERY_ADDRESS'));
      return;
    }
    if (this.show_billing_address == '1') {
      if (this.addOrderForm.value.billingAddress.address == "" || this.addOrderForm.value.billingAddress.address == undefined || this.addOrderForm.value.billingAddress.address == 'undefined' || this.addOrderForm.value.billingAddress.address == null) {
        this.toastr.error(this.translate.instant('INCOMPLETE_BILLING_ADDRESS'));
        return;
      }
    }
    if (this.addOrderForm.value.deliverytype == 1) {
      if (this.isNotPlaceOrder == true) {
        this.toastr.error(this.notProcessOrderMessage);
        return;
      }
    }

    if (this.addOrderForm.value.deliverytype == 4) {
      if (this.isNotPlaceOrder == true) {
        this.toastr.error(this.notProcessOrderMessage);
        return;
      }
    }

    if (this.receivedSelectedItems.length == 0) {
      this.toastr.error(this.translate.instant("ITMES_VALIDATE"));
      return;
    }

    if (this.paymentMethod == undefined) {
      if (this.order_amount > 0) {
        this.toastr.error(
          this.translate.instant("PLEASE_SELECT_PAYMENT_METHOD")
        );
        return;
      }
    }

    if (this.addOrderForm.value.deliverytype == 1) {
      if (this.storedeliverysettings.min_order_amount > 0) {
        if (
          parseFloat(this.storedeliverysettings.min_order_amount) >
          parseFloat(this.itemtotal)
        ) {
          this.toastr.error(
            this.translate.instant(
              "ORDER_VALUE_SHOULD_BE_ABOVE_MINIMUM_ORDERVALUE"
            ) +
            "(" +
            this.global_currency +
            " " +
            this.storedeliverysettings.min_order_amount +
            ")"
          );
          return;
        }
      }
    }

    if (this.addOrderForm.value.deliverytype == 4) {
      if (this.storedeliverysettings.express_delivery_min_order_amount > 0) {
        if (
          parseFloat(
            this.storedeliverysettings.express_delivery_min_order_amount
          ) > parseFloat(this.itemtotal)
        ) {
          this.toastr.error(
            this.translate.instant(
              "ORDER_VALUE_SHOULD_BE_ABOVE_MINIMUM_ORDERVALUE"
            ) +
            "(" +
            this.global_currency +
            " " +
            this.storedeliverysettings.express_delivery_min_order_amount +
            ")"
          );
          return;
        }
      }
    }
    if (this.paymentMethod) {
      if (
        (parseFloat(this.itemtotal) > parseFloat(this.paymentMethod.maxordervalue) && this.paymentMethod.maxordervalue > 0)
      ) {
        this.toastr.error(
          this.translate.instant("ORDER_AMOUNT_EXCEED_MAXIMUM_ORDER_VALUE")
        );
        return;
      }
    }
    if (this.addOrderForm.value.deliverytype == 1) {
      if (this.deliveryOptions == 2) {
        if (
          this.addOrderForm.value.timepicker == null ||
          this.addOrderForm.value.deliverydate1 == null
        ) {
          this.toastr.error(
            this.translate.instant("SELECT_DELIVERY_DATE_TIME")
          );
          return;
        }
      }
    } else {
      if (this.addOrderForm.value.pickupOptions == 2) {
        if (
          this.addOrderForm.value.pickuptimepicker == null ||
          this.addOrderForm.value.pickupdate1 == null
        ) {
          this.toastr.error(this.translate.instant("SELECT_PICKUP_DATE_TIME"));
          return;
        }
      }
    }
    if (
      this.addOrderForm.value.deliverytype == 1 &&
      (this.deliveryAddress == "undefined" || this.deliveryAddress == null)
    ) {
      this.toastr.error(this.translate.instant("CUSTOMER_ADDRESS_VALIDATE"));
      return;
    }
    if (
      this.addOrderForm.value.deliverytype == 4 &&
      (this.deliveryAddress == "undefined" || this.deliveryAddress == null)
    ) {
      this.toastr.error(this.translate.instant("CUSTOMER_ADDRESS_VALIDATE"));
      return;
    }
    if (this.show_billing_address == "1") {
      if (
        this.addOrderForm.value.deliverytype == 1 &&
        (this.billingAddress == "undefined" || this.billingAddress == null)
      ) {
        this.toastr.error(this.translate.instant("CUSTOMER_ADDRESS_VALIDATE"));
        return;
      }
    }
    this.receivedSelectedItems.forEach(function (v) {
      delete v.discountedprice;
    });
    var odate = moment(new Date()).format(this.main.DateFormate.split(" ")[0]);
    var fd = new FormData();
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("store_id", this.loginStore.store_id);
    fd.append("date", odate);
    fd.append("items", JSON.stringify(this.receivedSelectedItems));
    fd.append("amount", this.grandtotal);
    fd.append("packaging_cost", this.packagingCharges.toString());
    fd.append("order_tax", this.taxPrice.toString());
    fd.append("remarks", this.addOrderForm.value.remarks == null || this.addOrderForm.value.remarks == 'null' ? '' : this.addOrderForm.value.remarks);
    fd.append("order_type", this.addOrderForm.value.deliverytype);
    if (this.grandtotal == this.wallet_amount) {
      this.paymentMethod = "";
    }
    if (this.paymentMethod) {
      fd.append("payment_method_id", this.paymentMethod.id);
    }
    if (this.offer_code) {
      fd.append("offer_code", this.offer_code);
      fd.append("offer_discount", this.offerPrice.toString());
    }
    fd.append(
      "pay_thru_wallet",
      this.addOrderForm.value.apply_Wallet == true ? "1" : "0"
    );
    fd.append("wallet_amount", this.wallet_amount.toString());
    if (this.show_billing_address == "1") {
      fd.append("billing_address_id", this.billingAddress.customer_address_id);
    }
    if (this.addOrderForm.value.deliverytype == 1) {
      fd.append(
        "customer_address_id",
        this.deliveryAddress.customer_address_id
      );
      fd.append("delivery_charges", this.deliverycharge);
    }
    if (this.addOrderForm.value.deliverytype == 4) {
      fd.append(
        "customer_address_id",
        this.deliveryAddress.customer_address_id
      );
      fd.append("delivery_charges", this.deliverycharge);
    }
    if (this.addOrderForm.value.deliverytype == 1) {
      if (this.storedeliverysettings.allow_scheduling == 1) {
        if (this.deliveryOptions == 1) {
          if (this.storedeliverysettings.delivery_time_type == 1) {
            fd.append("is_scheduled", "0");
            fd.append("delivery_slot_from", this.deliverySlot.from_time);
            fd.append("delivery_slot_to", this.deliverySlot.to_time);
          }
        } else if (this.deliveryOptions == 2) {
          fd.append("is_scheduled", "1");
          var sdate = moment(this.addOrderForm.value.deliverydate1).format(
            this.main.DateFormate.split(" ")[0]
          );
          sdate += " " + this.addOrderForm.value.timepicker + ":00";
          fd.append("scheduled_delivery_date", sdate);
        }
      } else {
        if (this.deliveryOptions == 1) {
          if (this.storedeliverysettings.delivery_time_type == 1) {
            fd.append("is_scheduled", "0");
            fd.append("delivery_slot_from", this.deliverySlot.from_time);
            fd.append("delivery_slot_to", this.deliverySlot.to_time);
          }
        }
      }
    } else if (this.addOrderForm.value.deliverytype == 4) {
      if (this.expressDeliveryoptions == 1) {
        if (this.storedeliverysettings.express_delivery_time_type == 1) {
          fd.append("is_scheduled", "0");
          fd.append("delivery_slot_from", this.expressDeliverySlot.from_time);
          fd.append("delivery_slot_to", this.expressDeliverySlot.to_time);
        }
      }
    } else {
      if (this.storedeliverysettings.pickup_scheduling == 1) {
        if (this.addOrderForm.value.pickupOptions == 1) {
          if (this.storedeliverysettings.pickup_time_type == 1) {
            fd.append("is_scheduled", "0");
            fd.append("pickup_slot_from", this.pickupSlot.from_time);
            fd.append("pickup_slot_to", this.pickupSlot.to_time);
          }
        } else if (this.addOrderForm.value.pickupOptions == 2) {
          fd.append("is_scheduled", "1");
          var sdate = moment(this.schedulePickupDate).format(
            this.main.DateFormate.split(" ")[0]
          );
          sdate += " " + this.addOrderForm.value.pickuptimepicker + ":00";
          fd.append("scheduled_delivery_date", sdate);
        }
      } else {
        if (this.storedeliverysettings.pickup_time_type == 1) {
          fd.append("is_scheduled", "0");
          fd.append("pickup_slot_from", this.pickupSlot.from_time);
          fd.append("pickup_slot_to", this.pickupSlot.to_time);
        }
      }
    }
    fd.append("customer_user_id", this.selectedCustomer.customer_user_id);
    fd.append("order_tip", this.order_tip);
    var data = fd;
    this.disable_button = true;
    await this.addOrderService
      .addSellerCustomerOrder(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.disable_button = false;
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.selectedCustomer = undefined;
            this.clearOrder();
            this.orderChatCreate(response.data.order_id);
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (err) => {
          this.disable_button = false;
        },
        complete: () => {
          this.disable_button = false;
        },
      });
  }

  clearOrder() {
    // this.loadForm();
    // this.getOrderSettings()
    this.addOrderForm.controls["remarks"].setValue(null);
    this.addOrderForm.controls["paymentMethod"].setValue(null);
    this.paymentMethod = undefined;
    this.receivedSelectedItems = [];
    this.itemtotal = 0;
    this.grandtotal = 0;
    this.taxAndChargesTotal = 0;
    this.taxPrice = 0;
    this.packagingCharges = 0;
    this.selecteditemscount = 0;
    this.addOrderForm.controls["deliveryoptions"].setValue("1");
    this.deliveryOptions = 1;
    this.expressDeliveryoptions = 1;
    this.addOrderForm.controls["pickupOptions"].setValue("1");
    // this.addOrderForm.controls["deliverytype"].setValue("1");
    this.addOrderForm.controls["timepicker"].setValue(null);
    this.addOrderForm.controls["pickuptimepicker"].setValue(null);
    this.offer_code = "";
    this.newSellerOrder.offerCode = "";
    this.offerPrice = 0.0;
    this.wallet_amount = 0.0;
    this.addOrderForm.controls["deliveryoptions"].setValue(false);
    this.newSellerOrder.apply_Wallet = false;
  }

  orderChatCreate(orderId) {
    var data = {
      order_id: orderId,
      user_id: this.main.LoggedUserInfo.user_id,
    };
    this.addOrderService
      .orderChatCreate(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
          }
        },
      });
  }

  /** Open AddNoteComponent modal */
  addNote(item, index) {
    const modalRef = this.modalService.open(AddNoteComponent, {
      size: "md",
      centered: true,
      animation: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.item = item;
    modalRef.componentInstance.Note.subscribe((note) => {

      this.receivedSelectedItems[index].item_remark = note;
    });
  }

  checkUniqueItem(selectedItem) {
    var tempItem = [];
    this.receivedSelectedItems = [];
    selectedItem.forEach((element) => {
      element.SelectedQty = element.quantity;
      var exist = false;
      tempItem.forEach((noDuplication) => {
        var ItemQuantity = element.quantity;
        delete element.quantity;
        var noDuplicationQuantity = noDuplication.quantity;
        delete noDuplication.quantity;
        if (JSON.stringify(element.item_variants_id) === JSON.stringify(noDuplication.item_variants_id) && (JSON.stringify(element?.addons) === JSON.stringify(noDuplication?.addons) && JSON.stringify(element?.choices) === JSON.stringify(noDuplication?.choices))) {
          if (element.is_combo == 0) {
            exist = true;
            noDuplication.quantity = noDuplicationQuantity + 1;
          } else {
            if (JSON.stringify(element.combo_variants) === JSON.stringify(noDuplication.combo_variants)) {
              exist = true;
              noDuplication.quantity = noDuplicationQuantity + 1;
            } else {
              element.quantity = ItemQuantity;
              noDuplication.quantity = noDuplicationQuantity;
            }
          }
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
    this.receivedSelectedItems = selectedItem;
  }

  //View multiple img
  openImageView(multiple_img, item_name) {
    var images: any = [];
    var single_img = 'assets/img/restaurant04.png'
    if (multiple_img == undefined) {
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

  itemPrice(itemPrice: any) {
    var itemPriceData = cloneDeep(itemPrice)
    if (itemPriceData !== undefined && itemPriceData !== 0) {
      return Number(itemPrice).toFixed(2);
    } else if (Number(itemPrice) === 0) {
      return "0.00";
    }
  }

  addCustomer() {
    window.open('/manage-customer/add', "_blank");
  }

  editCustomer(cid, customerUserId) {
    this.cryptoService.encryptIdValue(
      cid.toString(),
      "customer_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.encryptIdValue(
      customerUserId.toString(),
      "customer_User_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    window.open('/manage-customer/edit', "_blank");
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}