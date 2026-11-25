import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { OrdersService } from "src/app/services/report/orders.service";
import { OrderService } from "src/app/services/order.service";
import { OrderDetailsModalComponent } from "../../model/order-details/order-details.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.scss"],
})
export class OrdersComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  tableSize = environment.tableSize;
  search: any;
  no_data = true;
  main: any;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  global_currency = this.generalSetting.currency_symbol;
  amount_seperator = this.generalSetting?.amount_seperator;
  show_price_same_font = this.generalSetting.show_price_same_font;
  dinein_module = this.generalSetting.dinein_module;
  selectedOrderStatusItem: any;
  Orderlist: any = [];
  orderStatusList: any = [{ label: "All", value: 0 }];
  orderList = this.generalSetting.order_status_list;
  isdisplayKhata: any;
  khata_label: any;
  store_label: any;
  iseatery = 1;
  session = this.appComponent.sessionConfig();
  orderdetail: any;
  date: any = {};
  ItemTotalPrice: any;
  orderitemdetail: any[];
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    private OrdersService: OrdersService,
    private orderService: OrderService,
    private modalService: NgbModal,
    private _helpService: BannerService,
    private router: Router,
    public commonService: CommonService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    this.orderList.forEach((Item) => {
      var data = { label: Item.name, value: Number(Item.id) };
      this.orderStatusList.push(data);
    });
    if (this.dinein_module == 0) {
      this.orderStatusList = this.orderStatusList.filter((x) => x.value !== 9);
      this.orderStatusList = this.orderStatusList.filter((x) => x.value !== 10);
      this.orderStatusList = this.orderStatusList.filter((x) => x.value !== 11);
    }
    this.selectedOrderStatusItem = this.orderStatusList[1];
    if (this.generalSetting) {
      this.isdisplayKhata = parseInt(this.generalSetting.allow_khata);
      this.khata_label = this.generalSetting.khata_label;
      this.store_label = this.generalSetting.store_label;
    } else {
      this.isdisplayKhata = parseInt(this.main.allow_khata);
      this.khata_label = this.main.khata_label;
      this.store_label = this.main.store_label;
    }
  }

  ngOnInit(): void {
    this.getKOrdersReport(1);
    this.getHelpDetails();
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
  }

  orderStatus() {
    this.getKOrdersReport(1);
  }
  //get orders list
  /** Get orders list using service. */
  getKOrdersReport(page) {
    this.page = page;
    var data = {};
    data = {
      user_id: this.main.LoggedUserInfo.user_id,
      page: this.page,
      order_status: this.selectedOrderStatusItem.value.toString(),
    };
    this.OrdersService.getOrderList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.Orderlist = [];
          this.Orderlist = response.data;
          this.Orderlist.forEach((Item) => {
            Item.isMenushow = false;
            Item.OrderStatus =
              Item.order_status == 1
                ? this.translate.instant("ORDER_PENDING")
                : Item.order_status == 2
                  ? this.translate.instant("ORDER_ACCEPTED")
                  : Item.order_status == 3
                    ? this.translate.instant("ORDER_READY_FOR_PICKUP")
                    : Item.order_status == 4
                      ? this.translate.instant("ORDER_OUT_FOR_DELIVERY")
                      : Item.order_status == 5
                        ? this.translate.instant("ORDER_DELIVERED")
                        : Item.order_status == 6
                          ? this.translate.instant("ORDER_REJECTED")
                          : Item.order_status == 7
                            ? this.translate.instant("ORDER_UNDELIVEREDED")
                            : this.translate.instant("ORDER_CANCELLED");
            Item.OrderType =
              Item.delivery_type == 1
                ? this.translate.instant("ORDER_TYPE_DELIVERY")
                : Item.delivery_type == 2
                  ? this.translate.instant(
                    this.iseatery == 1 ? "TAKE_AWAY" : "ORDER_TYPE_PICKUP"
                  )
                  : "POS";
            Item.Number = "";
            Item.CustomerName =
              Item.name + (Item.Number != "" ? " (" + Item.Number + ")" : "");
          });
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.Orderlist = [];
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  viewOrder: boolean = false;
  viewCustomerOrderDetail(details: any, flag) {
    this.viewOrder = flag;
    var data = {
      order_id: details.order_id,
    };
    this.orderService.getOrderDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.orderDetailBinding(response.data, 0);
          this.orderDetailsModal(response.data);
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      },
    });
  }
  /** Open OrderDetailsModalComponent modal */
  taxAndChargesTotalToolTip: any;
  closeResult: any;
  orderDetailsModal(data: any) {
    const modalRef = this.modalService.open(OrderDetailsModalComponent, {
      size: "lg-950",
    });
    modalRef.componentInstance.orderdetail = data;
    modalRef.componentInstance.forReport = 1;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.session = this.session;
    modalRef.componentInstance.viewOrder = this.viewOrder;
    modalRef.componentInstance.taxAndChargesTotalToolTip = this.taxAndChargesTotalToolTip;
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
      }
    );
  }

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
    return taxAndChargesTotalToolTip;
  }

  orderDetailBinding(details: any, isordersummary: any) {
    this.orderdetail = details;
    this.orderdetail.order_tip = Number(
      this.orderdetail.order_tip || 0
    ).toFixed(2);
    this.orderdetail.PaymentType = this.orderdetail.payment_method_name;
    this.orderdetail.DeliveryType = this.orderdetail.delivery_type_val;
    this.orderdetail.OrderStatus = this.orderdetail.order_status_val;
    this.orderdetail.order_amount = Number(
      this.orderdetail.order_amount || 0
    ).toFixed(2);
    this.orderdetail.offer_discount = Number(
      this.orderdetail.offer_discount || 0
    ).toFixed(2);
    this.orderdetail.discount =
      this.orderdetail.order_status == 1
        ? Number(this.orderdetail.discount || 0).toFixed(2)
        : Number(this.orderdetail.discount || 0).toFixed(2);

    if (this.orderdetail.delivery_type == 2) {
      this.orderdetail.delivery_charges = "0.00";
    }

    this.orderdetail.delivery_charges = Number(
      this.orderdetail.delivery_charges || 0
    ).toFixed(2);
    this.orderdetail.otherCharges = Number(
      Number(this.orderdetail.order_tax) +
      Number(this.orderdetail.packaging_cost)
    ).toFixed(2);

    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.orderdetail.packaging_cost, this.orderdetail.order_tax);
    this.orderdetail.OriginalOrderAmount = Number(
      this.orderdetail.order_amount
    ).toFixed(2);
    this.orderdetail.item_total = Number(
      Number(this.orderdetail.order_amount) -
      Number(this.orderdetail.delivery_charges) -
      Number(this.orderdetail.otherCharges) +
      Number(this.orderdetail.offer_discount) +
      Number(this.orderdetail.discount) -
      Number(this.orderdetail.order_tip)
    ).toFixed(2);
    this.orderdetail.order_amount = Number(
      this.orderdetail.order_amount - Number(this.orderdetail.wallet_amount)
    ).toFixed(2);
    this.ItemTotalPrice = this.orderdetail.order_amount;
    this.sellerDetails = this.orderdetail.store;
    this.sellerDetails.fullAddress = [
      this.orderdetail.store.store_address,
      this.orderdetail.store.store_address2,
      this.orderdetail.store.area_name,
      this.orderdetail.store.city_name,
      this.orderdetail.store.state_name,
      this.orderdetail.store.zipcode,
      this.orderdetail.store.country_name,
    ]
      .filter(Boolean)
      .join(", ");

    this.orderdetail.IsScheduledOrder = false;
    if (this.orderdetail.delivery_type == 1) {
      if (this.orderdetail.delivery_time_type == 1) {
        if (this.orderdetail.scheduled_delivery_date == "") {
        } else {
          this.orderdetail.IsScheduledOrder = true;
          if (this.orderdetail.order_status != 5) {
            this.orderdetail.delivery_date =
              this.orderdetail.scheduled_delivery_date;
            this.date.revisedDateTime = this.orderdetail.delivery_date;
            this.date.revisedDateTimeTemp = this.orderdetail.delivery_date;
          }
        }
      } else {
        var OrderDate = new Date(this.orderdetail.order_date);
        if (this.orderdetail.scheduled_delivery_date == "") {
        } else {
          this.orderdetail.IsScheduledOrder = true;
          this.orderdetail.delivery_date =
            this.orderdetail.scheduled_delivery_date;
          this.date.revisedDateTime = this.orderdetail.delivery_date;
        }
      }
    } else {
      // Pick Time  start
      if (this.orderdetail.pickup_time_type == 1) {
        if (this.orderdetail.scheduled_delivery_date == "") {
        } else {
          this.orderdetail.IsScheduledOrder = true;
          if (this.orderdetail.order_status != 5) {
            this.orderdetail.delivery_date =
              this.orderdetail.scheduled_delivery_date;
            this.date.revisedDateTime = this.orderdetail.delivery_date;
            this.date.revisedDateTimeTemp = this.orderdetail.delivery_date;
          }
        }
      } else {
        var OrderDate = new Date(this.orderdetail.order_date);
        if (this.orderdetail.scheduled_delivery_date == "") {
        } else {
          this.orderdetail.IsScheduledOrder = true;
          this.orderdetail.delivery_date =
            this.orderdetail.scheduled_delivery_date;
        }
      }
      // Pick Time  End
    }

    var itemdetails = [];
    this.orderdetail.items.forEach((Item: any) => {
      Item.item_variants.forEach((variant: any) => {
        if (variant.is_added == 1) {
          var item_data: any = {
            item_name: Item.item_name,
            location: Item.location,
            item_remark: variant.item_remark,
            brand_name: Item.brand_name,
            packaging_name:
              variant.packaging_name == "NULL" ? "" : variant.packaging_name,
            unit_name: variant.unit_name == "NULL" ? "" : variant.unit_name,
            quantity: variant.quantity,
            picker_quantity: variant.picker_quantity,
            item_pickup_status: variant.item_pickup_status,
            is_picker_add: variant.is_picker_add,
            referance_item_id: variant.referance_item_id,
            unit_quantity: variant.unit_quantity,
            discounted_price: variant.discounted_price,
            item_price: variant.item_price,
            packaging: variant.packaging,
            category_name: Item.category_name,
            sub_category_name: Item.sub_category_name,
            display_id: Item.display_id,
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
              item_data.combo_variants.forEach((combo: any) => {
                choices_addons = [];
                if (combo.choices) {
                  combo.choices.forEach((choice: any) => {
                    choice.choice_prices.forEach((choicePrice: any) => {
                      if (
                        choicePrice.is_added == true ||
                        choicePrice.is_added == 1
                      ) {
                        choices_addons.push(
                          choice.variant_choice_name +
                          " : " +
                          choicePrice.variant_sub_choice_name
                        );
                      }
                    });
                  });
                }
                if (combo.addons) {
                  combo.addons.forEach((addon: any) => {
                    var addonName = "";
                    addon.addon_prices.forEach((addonsPrice) => {
                      if (
                        addonsPrice.is_added == true ||
                        addonsPrice.is_added == 1
                      ) {
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
                }
                combo.choices_addons = choices_addons;
              });
            }
          }

          itemdetails.push(item_data);
        }
      });
    });

    if (isordersummary == 3) {
    } else {
      this.orderitemdetail = itemdetails;
    }
    console.log(this.orderitemdetail);

    this.orderitemdetail = itemdetails;
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
      data.module_key = '57'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '57'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '57'
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
}