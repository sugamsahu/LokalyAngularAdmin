import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { WebCamComponent } from '../web-cam/web-cam.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeep } from "lodash";
import { NgSelectComponent } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { RepeatAddonChoiceComponent } from '../repeat-addon-choice/repeat-addon-choice.component';
import { installHtmlTooltips, trustedTooltipHtml } from "src/app/utils/html-tooltip";
import { OrderService } from "src/app/services/order.service";
import { Subject, debounceTime, distinctUntilChanged, filter, fromEvent, takeUntil, tap } from 'rxjs';
import { SelectAddonChoicesComponent } from '../select-addon-choices/select-addon-choices.component';
import { RepeatComboItemsComponent } from '../repeat-combo-items/repeat-combo-items.component';
import { SelectComboItemsComponent } from '../select-combo-items/select-combo-items.component';
import { AvailableOffersComponent } from '../available-offers/available-offers.component';
import { PosOrderConfirmComponent } from '../pos-order-confirm/pos-order-confirm.component';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { UntypedFormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ItemService } from 'src/app/services/item.service';
import { SpinnerService } from 'src/app/services/custom/spinner.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-pos-view-bill',
  templateUrl: './pos-view-bill.component.html',
  styleUrls: ['./pos-view-bill.component.scss']
})
export class PosViewBillComponent implements OnInit, OnDestroy {
  generalSetting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  customerdetails: any;
  selecteditemsqty: number;
  category_customer_icon: any;
  SelectedAdminSeller: any = null;
  gridData: any = [];
  global_currency: any;
  @ViewChild(NgSelectComponent) ngSelectComponent: NgSelectComponent;
  searchItem: boolean = false;
  modelNewItem: any;
  SelectedItemsAddOnsChoices: any = [];
  last_used_addon_choice: any;
  settings: any = {};
  SelectedItemsCombo: any = [];
  SelectedItems: any = [];
  gridDataPage: any = [];
  itemtotal: any = 0.00;
  packagingCharges: any = 0;
  taxPrice: any = 0.00;
  taxAndChargesTotalToolTip;
  taxAndChargesTotal: any = 0;
  grandtotal: any = 0;
  offer_code;
  newSellerOrder = {
    remarks: '',
    offerCode: '',
    apply_Wallet: false
  }
  sellerDetails: any;
  paymentMethod: any;
  private destroy$ = new Subject();
  offerPrice: any = 0.00;
  tax_recalculation_offer: any;
  deliverycharge: any = 0;
  walletMaxValue: any;
  originalWalletBalance = 0.0;
  wallet_amount = 0.0;
  order_amount: any = 0.00;
  walletBalance: any = 0.0;
  isNewAddCombo: boolean = false;
  deliverytype = 1;
  storedeliverysettings: any = [];
  main: any;
  isdisplayWallet: any;
  offerList = [];
  paymentM = {
    selected: null
  }
  paymentMethodList: any = [];
  @Output() updatedData: EventEmitter<any> = new EventEmitter<any>();
  balance_due: any = 0.0;
  multipaymentList: any = [];
  mainpaymentMethodList: any = [];
  temp_paymentMethodList: any = [];
  is_cart: any;
  cart_group_id: any;
  myControl = new UntypedFormControl("");
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  item_tax_type: any;
  style_obj_pos_view_bill: any;
  allow_destroy: boolean = true;
  amount_seperator = this.generalSetting.amount_seperator;
  show_price_same_font = this.generalSetting.show_price_same_font;
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  constructor(
    public translate: TranslateService,
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    private OrderService: OrderService,
    private toastr: ToastrService,
    private router: Router,
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private itemService: ItemService,
    private spinner: SpinnerService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.customerdetails = JSON.parse(localStorage.getItem("customerdetails"));
  }

  ngOnInit(): void {

    this.style_obj_pos_view_bill = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.getItemList()
    $(
      "<style>#pos-bill .modal-content{ height: 34.25rem;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-form-field-appearance-outline .mat-form-field-outline {  margin-top:" +
      "0px" +
      " !important;  margin-bottom:" +
      "0px" +
      " !important;}</style>"
    ).appendTo("body");
    installHtmlTooltips(); // HTML only for tooltips built with trustedTooltipHtml()
    this.SelectedItems.reverse();

    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.getItemList(this.searchbox.nativeElement.value);
        })
      )
      .subscribe();
  }

  opencam() {
    const modalRef = this.modalService.open(WebCamComponent, {
      size: "md",
      centered: true,
    });
    modalRef.componentInstance.BarCode.subscribe(
      (barcodeValue) => {
      }
    );
  }

  incrementValue(item) {
    this.myControl.setValue(null)
    this.SelectedItems.reverse(); //for reverse
    this.SelectedAdminSeller = null;
    this.ngSelectComponent.handleClearClick();
    if (item) {
      var itemdetails = JSON.stringify(item);
      this.modelNewItem = itemdetails;
      if (this.searchItem == true) {
      }
      else {
        if (item.quantity < 1) {
          this.updateItemQuantity(item, item.addons, item.choices);
        } else {
          this.increasequantity(item);
        }
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

  ApplyWallateAmount(isChecked) {
    console.log("pay")
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
    console.log(this.order_amount)
    if (this.order_amount == 0) { // When all amount pay through wallet, Payment method will undefined
      console.log("in")
      this.paymentMethod = undefined;
      this.paymentM.selected = null;
    }
    this.SelectedItems.reverse(); //for reverse
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

  incrementValuess(selectedItem) {
    this.SelectedItems.reverse(); //for reverse

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

  decrementValue(selectedItem) {
    this.SelectedItems.reverse(); //for reverse

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

  removeItemOnOrder(selectedItem) {
    this.SelectedItems.reverse(); //for reverse

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

  getSelectedPaymentMethod(item) {
    this.paymentMethod = item;
    this.paymentM.selected = item;
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

  }

  continue() {
    this.allow_destroy = false;
    var data: any = {};
    data.selecteditemsqty = this.selecteditemsqty;
    data.SelectedAdminSeller = this.SelectedAdminSeller;
    data.gridData = this.gridData;
    data.searchItem = this.searchItem;
    data.modelNewItem = this.modelNewItem;
    data.SelectedItemsAddOnsChoices = this.SelectedItemsAddOnsChoices;
    data.last_used_addon_choice = this.last_used_addon_choice;
    data.settings = this.settings;
    data.SelectedItemsCombo = this.SelectedItemsCombo;
    data.SelectedItems = this.SelectedItems.reverse();
    data.gridDataPage = this.gridDataPage;
    data.itemtotal = this.itemtotal;
    data.packagingCharges = this.packagingCharges;
    data.taxPrice = this.taxPrice;
    data.taxAndChargesTotalToolTip = this.taxAndChargesTotalToolTip;
    data.taxAndChargesTotal = this.taxAndChargesTotal;
    data.grandtotal = this.grandtotal;
    data.offer_code = this.offer_code;
    data.newSellerOrder = this.newSellerOrder;
    data.sellerDetails = this.sellerDetails;
    data.paymentMethod = this.paymentMethod;
    data.offerPrice = this.offerPrice;
    data.tax_recalculation_offer = this.tax_recalculation_offer;
    data.deliverycharge = this.deliverycharge;
    data.walletMaxValue = this.walletMaxValue;
    data.originalWalletBalance = this.originalWalletBalance;
    data.wallet_amount = this.wallet_amount;
    data.order_amount = this.order_amount;
    data.walletBalance = this.walletBalance;
    data.isNewAddCombo = this.isNewAddCombo;
    data.deliverytype = this.deliverytype;
    data.storedeliverysettings = this.storedeliverysettings;
    data.isdisplayWallet = this.isdisplayWallet;
    data.offerList = this.offerList;
    data.paymentM = this.paymentM;
    data.balance_due = this.balance_due;
    data.multipaymentList = this.multipaymentList;
    data.mainpaymentMethodList = this.mainpaymentMethodList;
    data.temp_paymentMethodList = this.temp_paymentMethodList;
    data.is_cart = this.is_cart;
    data.cart_group_id = this.cart_group_id;

    this.updatedData.emit(data);
    this.modal.dismiss();
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
          this.toastr.error(this.translate.instant('Max limit for Payment Method (' + name + ') has exceeded'));
          return;
        }
      }
    }
    this.OrderConformPopUp();
  }

  OrderConformPopUp() {
    this.allow_destroy = false;
    const modalRef = this.modalService.open(PosOrderConfirmComponent, {
      size: "md",
    });
    modalRef.componentInstance.global_currency = this.global_currency;
    modalRef.componentInstance.order_amount = this.order_amount;
    modalRef.componentInstance.wallet_amount = this.wallet_amount;
    modalRef.componentInstance.grandtotal = this.grandtotal;
    modalRef.componentInstance.selecteditemsqty = this.selecteditemsqty;
    modalRef.componentInstance.paymentMethod = this.paymentMethod;
    modalRef.componentInstance.balance_due = this.balance_due;
    modalRef.componentInstance.paymentM = this.paymentM;
    modalRef.componentInstance.multipaymentList = this.multipaymentList;
    modalRef.componentInstance.mainpaymentMethodList = this.mainpaymentMethodList;
    modalRef.componentInstance.temp_paymentMethodList = this.temp_paymentMethodList;
    modalRef.componentInstance.paymentMethodList = this.paymentMethodList;
    modalRef.componentInstance.settings = this.settings;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.SelectedItems = this.SelectedItems;
    modalRef.componentInstance.sellerDetails = this.sellerDetails;
    modalRef.componentInstance.offer_code = this.offer_code;
    modalRef.componentInstance.offerPrice = this.offerPrice;
    modalRef.componentInstance.deliverycharge = this.deliverycharge;
    modalRef.componentInstance.packagingCharges = this.packagingCharges;
    modalRef.componentInstance.taxPrice = this.taxPrice;
    modalRef.componentInstance.newSellerOrder = this.newSellerOrder;
    modalRef.componentInstance.is_cart = this.is_cart;
    modalRef.componentInstance.cart_group_id = this.cart_group_id;
    modalRef.componentInstance.itemtotal = this.itemtotal;

    modalRef.componentInstance._printData.subscribe((printData) => {
      this.updatedData.emit(printData);
      this.modal.dismiss();
    });

  }

  get_selected_items() {
    var tem_selected_items: any = [];
    tem_selected_items = this.SelectedItems.reverse();
    return tem_selected_items;
  }

  getItemList(search?) {
    this.spinner.show();
    var data: any = {
      store_id: this.loginUserStore.store_id,
      page: 1,
      categories: 0,
      search_query: search ? search : '',
      user_id: this.main.LoggedUserInfo.user_id,
      is_item_variant_level: 0,
      out_of_stock: '0',
      limit: 24,
      mask_price: 0,
      order_type: 3,
      is_pos: 1,
      search_type: 1,
    };

    this.itemService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          var categoryGridData = response.data;
          this.gridData = [];

          categoryGridData.forEach((category) => {
            category.item_variants.forEach((varient) => {
              var found = this.SelectedItems.filter(item => item.item_variants_id === varient.item_variants_id)[0];
              var default_image: any;
              if (varient.item_image_ids) {
                var variant_image: any = varient.item_image_ids.split(',');
                default_image = category.item_images.filter((img: any) => img.item_image_id == variant_image[0])[0];
              }
              var itemdata: any = {
                item_images: category?.item_images,
                unit_quantity: parseFloat(varient.unit_quantity),
                Selected: 0,
                SelectedQty: found != undefined ? found.quantity : 0,
                quantity: found != undefined ? found.quantity : 0,
                item_image: default_image ? default_image.image : "",
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
          this.cdr.detectChanges();
        } else {
          this.gridData = [];
          this.spinner.hide();
          this.toastr.error(this.translate.instant(response.message));
          this.cdr.detectChanges()
        }
      },
    });
  }

  isFullscreen() {
    if (window.screenTop == 0) {
      return true;
    } else {
      return false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
    if (this.allow_destroy) {
      this.continue();
    }
  }
}
