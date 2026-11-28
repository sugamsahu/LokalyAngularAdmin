import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
} from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { GenerateRefundService } from "src/app/services/generate-refund.service";
import { RefundinfoComponent } from "../refundinfo/refundinfo.component";
import Swal from "sweetalert2";
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-add-refund",
  templateUrl: "./add-refund.component.html",
  styleUrls: ["./add-refund.component.scss"],
})
export class AddRefundComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  global_currency = this.generalSetting.currency_symbol;
  session = this.appComponent.sessionConfig();

  main: any = {};
  oderdetailFlag = false;
  orderList: any = [];
  orderId: any = undefined;
  viewOrderId: any;
  previousoderdetailFlag = false;
  oderdetaildiplayFlag = false;
  orderListDetails: any = [];
  total_count: number = 0;
  previous_refund: any = [];
  isfull_refund = false;
  DetailedOrder: any;
  orderdetail: any = [];
  selectedOrder: any;
  order_tip: any;
  selecteditems: any = [];
  checkingItem: any;
  prescription: any = [];
  hide_refundvoucher = false;
  refundAllow = false;
  taxAndChargesTotalToolTip: any = "";
  ItemTotalPrice: any;
  refund_delivery_amount: any;
  OnlineRefundedAmount: any = 0.0;
  refund_validity: any;
  orderDate: any;
  date: any = {};
  packaging_item: any = 0;
  total_quntity = 0;
  refund_datee: any;
  global_timezone: any;
  refund_module: any;
  khata_label: any;
  show_price_same_font: any;
  total_refundquntity = 0;
  isSuperAdmin = false;
  voucher_startdate: any = new Date();
  voucher_enddate: any = new Date();
  _item_packing_cost: any;
  _itemOffer: any;
  _itemdiscount: any;
  enddate: any = new Date();

  refundOrderDetails: any = {
    refund_remarks: "",
    refund_tax: "0.00",
    refundQuantity: "0.00",
    refund_item_total: "0.00",
    refund_deliverycharge: "0.00",
    refund_taxcharge: "0.00",
    refund_tip: "0.00",
    refund_offerPromo: "0.00",
    refund_discount: "0.00",
    refund_Ordertotal: "0.00",
    afterDiscountPrice: "0.00",
    refund_packcharge: "0.00",
    refund_packaging_per_order: "0.00",
    refund_way: 0,
    refund_date: moment(new Date()).format("DD-MM-YYYY"),
  };

  orderStatusList = [
    { label: this.translate.instant("ORDER_PENDING"), value: 1 },
    { label: this.translate.instant("ORDER_ACCEPTED"), value: 2 },
    { label: this.translate.instant("ORDER_READY_FOR_PICKUP"), value: 3 },
    { label: this.translate.instant("ORDER_OUT_FOR_DELIVERY"), value: 4 },
    { label: this.translate.instant("ORDER_DELIVERED"), value: 5 },
    { label: this.translate.instant("ORDER_REJECTED"), value: 6 },
    { label: this.translate.instant("ORDER_UNDELIVEREDED"), value: 7 },
    { label: this.translate.instant("ORDER_CANCELLED"), value: 8 },
  ];
  amount_seperator: any;

  constructor(
    public cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private appComponent: AppComponent,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private generateRefundService: GenerateRefundService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    this.main.LoggedUserInfo = JSON.parse(this.session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    $(
      "<style>button.accordion-button.ng-star-inserted { background-color: " +
      this.generalSetting.css_button_business_default +
      " !important;border-color: " +
      this.generalSetting.css_button_business_default +
      " !important; }</style>"
    ).appendTo("body");

    if (this.generalSetting) {
      this.global_currency = this.generalSetting.currency_symbol;
      this.global_timezone = this.generalSetting.timezone;
      this.refund_module = this.generalSetting.refund_module;
      this.khata_label = this.generalSetting.khata_label;
      this.refund_validity = this.generalSetting.refund_validity;
      this.show_price_same_font = this.generalSetting.show_price_same_font;
      this.amount_seperator = this.generalSetting?.amount_seperator;
    } else {
      this.global_currency = this.main.currency_symbol;
      this.global_timezone = this.main.generalSetting.timezone;
      this.refund_module = this.main.refund_module;
      this.khata_label = this.main.khata_label;
      this.refund_validity = this.main.refund_validity;
      this.show_price_same_font = this.main.show_price_same_font;
      this.amount_seperator = this.generalSetting?.amount_seperator;

    }

    if (
      this.main.LoggedUserInfo.role_id == this.main.UserRole.SuperAdmin ||
      this.main.LoggedUserInfo.role_id == this.main.UserRole.Admin
    ) {
      this.isSuperAdmin = true;

    }

    if (location.href.toString().indexOf("/generate-refund/edit-refund") > -1) {
      if (this.isSuperAdmin == true) {
        this.orderId = this.session.decryptIdValue(
          "order_id" + this.main.LoggedUserInfo.role_id.toString(),
          this.main.CryptoKey
        );
        this.session.clearCookie(
          "order_id" + this.main.LoggedUserInfo.role_id.toString()
        );
      } else {
        this.orderId = this.session.decryptIdValue(
          "order_id" + this.sellerDetails.store_id.toString(),
          this.main.CryptoKey
        );
        this.session.clearCookie(
          "order_id" + this.sellerDetails.store_id?.toString()
        );
      }

      if (this.orderId == undefined) {
        this.router.navigate(["/generate-refund/add/"]);
      }
    }

    if (this.orderId != undefined) {
      this.oderdetailFlag = true;
      this.PageLoadData(this.orderId);
    } else {
      this.GetOrderList();
    }

    if (this.voucher_startdate) {
      this.voucher_startdate = moment(new Date()).format(
        this.DateFormateFromServerSide()
      );
      this.voucher_startdate = moment(
        this.voucher_startdate,
        this.DateFormateFromServerSide()
      ).format(this.main.DateFormate.split(" ")[0]);
    }

    var tempStartDate: any = new Date();
    if (this.voucher_enddate) {
      this.voucher_enddate = new Date(
        tempStartDate.setDate(
          tempStartDate.getDate() + Number(this.generalSetting.offer_validity)
        )
      );
      this.voucher_enddate = moment(this.voucher_enddate).format(
        this.DateFormateFromServerSide()
      );
      this.voucher_enddate = moment(
        this.voucher_enddate,
        this.DateFormateFromServerSide()
      ).format(this.main.DateFormate.split(" ")[0]);
    }
  }

  DateFormateFromServerSide() {
    return this.main.DateFormate.split(" ")[0];
  }
  /** Open RefundinfoComponent modal */
  openinfomodel(storeorderstatistics) {
    const modalRef = this.modalService.open(RefundinfoComponent, {
      size: "lg-600",
    });
  }

  async GetOrderList() {
    var data = {
      store_id: this.sellerDetails.store_id,
    };

    await this.generateRefundService.getOrderList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.orderList = response.data;
          this.total_count = response.count;
        } else {
          var orderStatistics = response.order_statistics;
          this.orderList = [];
          this.total_count = 0;
          this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  changeOrder(item) {
    this.orderId = item.order_id;
    // this.orderId 
    if (this.orderId == undefined) {
      this.toastr.error(
        this.translate.instant("PLEASE_ENTER_VALID_ORDER_NUMBER")
      );
    } else {
      this.PageLoadData(this.orderId);
    }
  }
  /** Get order details using service */
  PageLoadData(orderId) {
    this.refundOrderDetails = {
      refund_remarks: "",
      refund_tax: "0.00",
      refundQuantity: "0.00",
      refund_item_total: "0.00",
      refund_deliverycharge: "0.00",
      refund_taxcharge: "0.00",
      refund_tip: "0.00",
      refund_offerPromo: "0.00",
      refund_discount: "0.00",
      refund_Ordertotal: "0.00",
      afterDiscountPrice: "0.00",
      refund_packcharge: "0.00",
      refund_packaging_per_order: "0.00",
      refund_way: 0,
      refund_date: moment(new Date()).format("DD-MM-YYYY"),
    };
    var data = {
      order_id: orderId,
    };
    this.generateRefundService.orderDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.DetailedOrder = response.data;
          this.total_count = response.count;
          this.refund_datee = moment(new Date()).format(
            this.DateFormateFromServerSide()
          );
          this.orderDetailBinding(this.DetailedOrder);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  orderDetailBinding(details) {
    this.orderdetail = details;

    this.orderdetail.order_tip = Number(this.orderdetail.order_tip).toFixed(2);
    this.orderdetail.store_address = [
      this.orderdetail.store.store_address,
      this.orderdetail.store.store_address2,
      this.orderdetail.store.area_name,
      this.orderdetail.store.city_name,
      this.orderdetail.store.state_name,
      this.orderdetail.store.country_name,
      this.orderdetail.store.zipcode,
    ]
      .filter(Boolean)
      .join(", ");
    this.selectedOrder = this.orderdetail.order_no;
    this.oderdetaildiplayFlag = true;

    if (
      this.orderdetail.refund != undefined &&
      this.orderdetail.refund != null &&
      this.orderdetail.refund != ""
    ) {
      this.previousoderdetailFlag = true;
      this.previous_refund = this.orderdetail.refund.refund_details;
      this.previous_refund.forEach((item) => {
        item.refund_date = moment(item.refund_date).format(
          this.DateFormateFromServerSide()
        );
      });
    } else {
      this.previousoderdetailFlag = false;
    }

    this.hide_refundvoucher = false;
    if (
      this.orderdetail.is_wallet == 1 &&
      this.orderdetail.method_type_val == 0 &&
      this.orderdetail.order_status != 5
    ) {
      this.hide_refundvoucher = true;
    }

    this.refundAllow = false;
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
    // $(".tip-top").tooltip({
    //     placement: 'top'
    // });

    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
      this.global_currency,
      this.orderdetail.packaging_cost,
      this.orderdetail.order_tax
    );
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
    this.orderDate = new Date(
      moment(this.orderdetail.order_date).format(
        this.DateFormateFromServerSide()
      )
    );
    this.orderDate = this.orderDate.setDate(
      this.orderDate.getDate() + Number(this.refund_validity)
    );

    var a = new Date(this.orderDate);
    var b = new Date();
    if (a < b) {
      this.refundAllow = true;
    }

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
          this.date.revisedDateTime = new Date(
            moment(this.orderdetail.delivery_date).format(
              this.DateFormateFromServerSide()
            )
          );
        }
      }
    }

    this.date.revisedDateTime = "";
    if (this.orderdetail.order_status == 1) {
    }

    this.refund_delivery_amount = 0;
    if (this.orderdetail.refund != null) {
      this.refund_delivery_amount = Number(
        Number(this.orderdetail.refund.refund_amount)
      ).toFixed(2);
      this.orderdetail.refund.after_delivery_refund_amount = 0;
      this.orderdetail.refund.refund_details.forEach((refund) => {
        if (refund != undefined) {
          if (
            this.orderdetail.method_type_val == 1 ||
            (this.orderdetail.method_type_val == 2 &&
              this.orderdetail.pay_thru_wallet == 0)
          ) {
            this.orderdetail.delivery_charges = Number(
              Number(this.orderdetail.delivery_charges) -
              Number(refund.delivery_charges)
            ).toFixed(2);
            this.orderdetail.order_tax = Number(
              Number(this.orderdetail.order_tax) - Number(refund.order_tax)
            ).toFixed(2);
            this.orderdetail.packaging_per_order = Number(
              Number(this.orderdetail.packaging_per_order) -
              Number(refund.packaging_per_order)
            ).toFixed(2);
            this.orderdetail.offer_discount = Number(
              Number(this.orderdetail.offer_discount) -
              Number(refund.offer_discount)
            ).toFixed(2);
            this.orderdetail.discount = Number(
              Number(this.orderdetail.discount) - Number(refund.discount)
            ).toFixed(2);
            this.orderdetail.order_tip = Number(
              Number(this.orderdetail.order_tip) - Number(refund.order_tip)
            ).toFixed(2);
            this.orderdetail.otherCharges = Number(
              Number(this.orderdetail.otherCharges) -
              Number(refund.packaging_cost) -
              Number(refund.order_tax) -
              Number(refund.packaging_per_order)
            ).toFixed(2);
            this.orderdetail.refund.after_delivery_refund_amount += Number(
              refund.refund_amount
            );
            if (refund.refund_thru == 3) {
              this.OnlineRefundedAmount = Number(
                Number(
                  this.OnlineRefundedAmount == undefined
                    ? 0
                    : this.OnlineRefundedAmount
                ) + Number(refund.refund_amount)
              ).toFixed(2);
            }
          }
          if (
            (this.orderdetail.method_type_val == 3 &&
              refund.refund_order_status == 5) ||
            (this.orderdetail.pay_thru_wallet == 1 &&
              refund.refund_order_status == 5)
          ) {
            this.orderdetail.delivery_charges = Number(
              Number(this.orderdetail.delivery_charges) -
              Number(refund.delivery_charges)
            ).toFixed(2);
            this.orderdetail.order_tax = Number(
              Number(this.orderdetail.order_tax) - Number(refund.order_tax)
            ).toFixed(2);
            this.orderdetail.packaging_per_order = Number(
              Number(this.orderdetail.packaging_per_order) -
              Number(refund.packaging_per_order)
            ).toFixed(2);
            this.orderdetail.offer_discount = Number(
              Number(this.orderdetail.offer_discount) -
              Number(refund.offer_discount)
            ).toFixed(2);
            this.orderdetail.discount = Number(
              Number(this.orderdetail.discount) - Number(refund.discount)
            ).toFixed(2);
            this.orderdetail.order_tip = Number(
              Number(this.orderdetail.order_tip) - Number(refund.order_tip)
            ).toFixed(2);
            this.orderdetail.otherCharges = Number(
              Number(this.orderdetail.otherCharges) -
              Number(refund.packaging_cost) -
              Number(refund.order_tax) -
              Number(refund.packaging_per_order)
            ).toFixed(2);
            this.orderdetail.refund.after_delivery_refund_amount += Number(
              refund.refund_amount
            );
            if (refund.refund_thru == 3) {
              this.OnlineRefundedAmount = Number(
                Number(
                  this.OnlineRefundedAmount == undefined
                    ? 0
                    : this.OnlineRefundedAmount
                ) + Number(refund.refund_amount)
              ).toFixed(2);
            }
          }
        }
      });
      if (
        this.orderdetail.method_type_val == 1 ||
        (this.orderdetail.method_type_val == 2 &&
          this.orderdetail.pay_thru_wallet == 0)
      ) {
        this.orderdetail.OriginalOrderAmount = Number(
          Number(this.orderdetail.OriginalOrderAmount) -
          Number(this.orderdetail.refund.refund_amount)
        ).toFixed(2);
      }

      if (
        (this.orderdetail.method_type_val == 3 &&
          this.orderdetail.refund.refund_details[0].refund_order_status == 5) ||
        (this.orderdetail.pay_thru_wallet == 1 &&
          this.orderdetail.refund.refund_details[0].refund_order_status == 5)
      ) {
        this.orderdetail.OriginalOrderAmount = Number(
          Number(this.orderdetail.OriginalOrderAmount) -
          Number(this.orderdetail.refund.after_delivery_refund_amount)
        ).toFixed(2);
      }

      if (this.orderdetail.wallet_amount != undefined) {
        this.orderdetail.order_amount = Number(
          Number(this.orderdetail.OriginalOrderAmount) -
          Number(this.orderdetail.wallet_amount)
        ).toFixed(2);
        this.orderdetail.Original_order_amount = Number(
          Number(this.orderdetail.OriginalOrderAmount) -
          Number(this.orderdetail.wallet_amount) +
          Number(this.orderdetail.refund.refund_amount)
        ).toFixed(2);
      } else {
        this.orderdetail.order_amount = Number(
          Number(this.orderdetail.OriginalOrderAmount) -
          Number(this.orderdetail.wallet_amount)
        ).toFixed(2);
        this.orderdetail.Original_order_amount = Number(
          Number(this.orderdetail.OriginalOrderAmount) -
          Number(this.orderdetail.wallet_amount) +
          Number(this.orderdetail.refund.refund_amount)
        ).toFixed(2);
      }
    } else {
      this.orderdetail.order_amount = Number(
        Number(this.orderdetail.OriginalOrderAmount) -
        Number(this.orderdetail.wallet_amount)
      ).toFixed(2);
      this.orderdetail.Original_order_amount = Number(
        Number(this.orderdetail.OriginalOrderAmount) -
        Number(this.orderdetail.wallet_amount)
      ).toFixed(2);
    }

    var itemdetails = [];
    this.packaging_item = 0;
    this.orderdetail.items.forEach((Item) => {
      if (this.prescription != 1) {
        this.prescription = Item.prescription;
      }
      Item?.item_variants?.forEach((variant: any) => {
        if (variant.is_added == 1) {
          var item_data: any = {
            item_id: Item.item_id,
            item_variants_id: variant.item_variants_id,
            order_item_id: variant.order_item_id,
            item_name: Item.item_name,
            brand_name: Item.brand_name,
            packaging_name: variant.packaging_name,
            unit_name: variant.unit_name,
            quantity: Number(variant.quantity).toFixed(0),
            return_quantity: Number(variant.return_quantity).toFixed(0),
            unit_quantity: variant.unit_quantity,
            discounted_price: variant.discounted_price,
            price: variant.item_price,
            packaging: variant.packaging,
            tax: variant.tax,
            refundQuantity: 0,
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
              item_data?.combo_variants.forEach((combo) => {
                choices_addons = [];
                combo?.choices?.forEach((choice) => {
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

                combo?.addons?.forEach((addon) => {
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
          this.recalculateOrderDetail(item_data);
          itemdetails.push(item_data);
        }
      });
    });
    this.cdr.detectChanges();
    this.pakaging_calculate();
    this.selecteditems = itemdetails;
  }

  recalculateOrderDetail(item) {
    if (this.orderdetail.order_status != 5) {
      this.total_quntity = Number(this.total_quntity) + Number(item.quantity);
    } else {
      this.total_quntity =
        Number(this.total_quntity) +
        Number(item.quantity) -
        Number(item.return_quantity);
    }
    this.packaging_item = Number(
      Number(this.packaging_item) +
      Number(Number(item.packaging) * Number(item.quantity))
    ).toFixed(2);

    this.orderdetail.item_total = Number(
      Number(this.orderdetail.order_amount) -
      Number(this.orderdetail.delivery_charges) -
      Number(this.orderdetail.otherCharges) +
      Number(this.orderdetail.offer_discount) +
      Number(this.orderdetail.discount) +
      Number(this.orderdetail.wallet_amount) -
      this.orderdetail.order_tip
    ).toFixed(2);
    if (this.orderdetail.refund != undefined) {
      if (this.orderdetail.refund.refund_details[0].refund_order_status == 5) {
        item.quantity = item.quantity - item.return_quantity;
      }
    }
  }

  pakaging_calculate() {
    if (this.orderdetail.refund != undefined) {
      this.orderdetail.refund.refund_details.forEach((refund) => {
        if (
          this.orderdetail.method_type_val == 1 ||
          (this.orderdetail.method_type_val == 2 &&
            this.orderdetail.pay_thru_wallet == 0)
        ) {
          if (Number(this.packaging_item) > 0) {
            this.packaging_item = Number(
              Number(this.packaging_item) - Number(refund.packaging_cost)
            ).toFixed(2);
          }
        }
        // }
        if (
          (this.orderdetail.method_type_val == 3 &&
            refund.refund_order_status == 5) ||
          (this.orderdetail.pay_thru_wallet == 1 &&
            refund.refund_order_status == 5)
        ) {
          if (Number(this.packaging_item) > 0) {
            this.packaging_item = Number(
              Number(this.packaging_item) - Number(refund.packaging_cost)
            ).toFixed(2);
          }
        }
      });
    }
  }
  /** Decrement selected item  */
  decrementValue(selectedItem) {
    if (selectedItem.refundQuantity >= 1) {
      selectedItem.refundQuantity--;
      this.total_refundquntity--;
      this.refundOrderDetails.refund_item_total = Number(
        Number(this.refundOrderDetails.refund_item_total) -
        Number(selectedItem.price)
      ).toFixed(2);
      this.refundOrderDetails.refund_packcharge = Number(
        Number(this.refundOrderDetails.refund_packcharge) -
        Number(selectedItem.packaging)
      ).toFixed(2);
      this.refundOrderDetails.refund_tax = Number(
        Number(this.refundOrderDetails.refund_tax) -
        (Number(selectedItem.price) * selectedItem.tax) / 100
      ).toFixed(2);
      this.refundOrderDetails.refund_taxcharge = Number(
        Number(this.refundOrderDetails.refund_taxcharge) -
        (Number(selectedItem.price) * selectedItem.tax) / 100 -
        Number(selectedItem.packaging)
      ).toFixed(2);
      this.finalcalculation();
    }
  }
  /** Increment selected item  */

  incrementValue(selectedItem) {
    if (selectedItem.quantity > selectedItem.refundQuantity) {
      selectedItem.refundQuantity++;
      this.total_refundquntity++;
      this.cdr.detectChanges();
      var refund_total = Number(selectedItem.price);
      this.refundOrderDetails.refund_packcharge = Number(
        Number(this.refundOrderDetails.refund_packcharge) +
        Number(selectedItem.packaging)
      ).toFixed(2);
      this.refundOrderDetails.refund_tax = Number(
        Number(this.refundOrderDetails.refund_tax) +
        (Number(selectedItem.price) * Number(selectedItem.tax)) / 100
      ).toFixed(2);
      this.refundOrderDetails.refund_item_total = Number(
        Number(this.refundOrderDetails.refund_item_total) + Number(refund_total)
      ).toFixed(2);
      this.refundOrderDetails.refund_taxcharge = Number(
        Number(this.refundOrderDetails.refund_taxcharge) +
        (Number(selectedItem.price) * selectedItem.tax) / 100 +
        Number(selectedItem.packaging)
      ).toFixed(2);
      this.finalcalculation();
    }
  }

  getRefundQuantity(index) {
    return this.selecteditems[index].refundQuantity;
  }

  taxAndChargesToolTip(global_currency, packaging_cost, order_tax) {
    if (Number(packaging_cost) > 0 && Number(order_tax) <= 0) {
      this.taxAndChargesTotalToolTip =
        "<div>Store Packaging Cost: " +
        global_currency +
        " " +
        Number(packaging_cost).toFixed(2) +
        "</div>";
    } else if (Number(order_tax) > 0 && Number(packaging_cost) <= 0) {
      this.taxAndChargesTotalToolTip =
        "<div>" +
        this.generalSetting.store_tax_label +
        ": " +
        global_currency +
        " " +
        Number(order_tax).toFixed(2) +
        "</div>";
    } else {
      this.taxAndChargesTotalToolTip =
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
    return this.taxAndChargesTotalToolTip;
  }

  getrefunddate() {
    if (this.enddate.val() != "") {
      this.refundOrderDetails.refund_date = new Date(this.enddate.val());
    } else {
      this.refundOrderDetails.refund_date = undefined;
    }
  }

  addDileverycharge(refund_deliverycharge) {
    var _item_total;
    refund_deliverycharge = this.commonService.valideOnlyTwoDigitAfterDecimal(
      refund_deliverycharge
    );
    if (
      Number(refund_deliverycharge) > Number(this.orderdetail.delivery_charges)
    ) {
      this.refundOrderDetails.refund_deliverycharge =
        this.orderdetail.delivery_charges;
      this.finalcalculation();
    } else {
      this.refundOrderDetails.refund_deliverycharge = refund_deliverycharge;
      _item_total = Number(
        Number(this.refundOrderDetails.refund_item_total) +
        Number(refund_deliverycharge)
      ).toFixed(2);
      this.finalcalculation();
    }
  }
  /** Final refund calculation for order. */
  finalcalculation() {
    this.refundOrderDetails.refund_Ordertotal = Number(
      Number(this.refundOrderDetails.refund_item_total) +
      Number(this.refundOrderDetails.refund_deliverycharge) +
      Number(this.refundOrderDetails.refund_packaging_per_order) +
      Number(this.refundOrderDetails.refund_taxcharge) +
      Number(this.refundOrderDetails.refund_tip) -
      Number(this.refundOrderDetails.refund_offerPromo) -
      Number(this.refundOrderDetails.refund_discount)
    ).toFixed(2);
  }
  /** Add refund packaging per order */
  add_refund_packaging_per_order(refund_packaging_per_order) {
    refund_packaging_per_order = this.commonService.valideOnlyTwoDigitAfterDecimal(
      refund_packaging_per_order
    );
    if (
      Number(refund_packaging_per_order) >
      Number(this.orderdetail.packaging_per_order)
    ) {
      this.refundOrderDetails.refund_packaging_per_order =
        this.orderdetail.packaging_per_order;
      this.finalcalculation();
    } else {
      this.refundOrderDetails.refund_packaging_per_order =
        refund_packaging_per_order;
      this._item_packing_cost = Number(
        Number(this.refundOrderDetails.refund_item_total) +
        Number(refund_packaging_per_order)
      ).toFixed(2);
      this.finalcalculation();
    }
  }
  /** Add Offer. */
  addoffer(refund_offerPromo) {
    refund_offerPromo = this.commonService.valideOnlyTwoDigitAfterDecimal(refund_offerPromo);
    if (Number(refund_offerPromo) > Number(this.orderdetail.offer_discount)) {
      this.refundOrderDetails.refund_offerPromo =
        this.orderdetail.offer_discount;
      this.finalcalculation();
    } else {
      this.refundOrderDetails.refund_offerPromo = refund_offerPromo;
      this._itemOffer = Number(
        Number(this.refundOrderDetails.refund_item_total) -
        Number(refund_offerPromo)
      ).toFixed(2);
      this.finalcalculation();
    }
  }
  /** Add discount. */
  add_discount(refund_discount) {
    refund_discount = this.commonService.valideOnlyTwoDigitAfterDecimal(refund_discount);
    if (Number(refund_discount) > Number(this.orderdetail.discount)) {
      this.refundOrderDetails.refund_discount = this.orderdetail.discount;
      this.finalcalculation();
    } else {
      this.refundOrderDetails.refund_discount = refund_discount;
      this._itemdiscount = Number(
        Number(this.refundOrderDetails.refund_item_total) -
        Number(refund_discount)
      ).toFixed(2);
      this.finalcalculation();
    }
  }

  refund_total() {
    this.refundOrderDetails.refund_Ordertotal = Number(
      Number(this.refundOrderDetails.refund_item_total) +
      Number(this.refundOrderDetails.refund_deliverycharge) +
      Number(this.refundOrderDetails.refund_taxcharge) +
      Number(this.refundOrderDetails.refund_offerPromo) +
      Number(this.refundOrderDetails.refund_discount)
    ).toFixed(2);
  }

  add_tip(refund_tip) {
    refund_tip = this.commonService.valideOnlyTwoDigitAfterDecimal(refund_tip);
    if (Number(refund_tip) > Number(this.orderdetail.order_tip)) {
      this.refundOrderDetails.refund_tip = this.orderdetail.order_tip;
      this.finalcalculation();
    } else {
      this.refundOrderDetails.refund_tip = refund_tip;
      this._itemdiscount = Number(
        Number(this.refundOrderDetails.refund_item_total) - Number(refund_tip)
      ).toFixed(2);
      this.finalcalculation();
    }
  }
  /** Update refund  */
  noTe: any = "";
  noTE: any = "";
  note: any = "";
  UpdateRefund() {
    if (
      this.refundOrderDetails.refund_way == null ||
      this.refundOrderDetails.refund_way == ""
    ) {
      this.toastr.error(this.translate.instant("ENTER_ALL_REQUIRED_FIELDS"));
      return;
    }
    if (
      Number(this.refundOrderDetails.refund_Ordertotal) >
      Number(this.orderdetail.OriginalOrderAmount)
    ) {
      this.toastr.error(
        this.translate.instant(
          "REFUND_AMOUNT_CAN_NOT_BE_GREATER_THAN_ORDER_AMOUNT"
        )
      );
      return;
    }
    if (this.refundAllow == true && this.refundOrderDetails.refund_way == 3) {
      (this.noTe = this.translate.instant(
        "REFUND_THRU_ONLINE_MODE_CAN_BE_GENERATED_ONLY_WITHIN"
      ));
        (this.noTE = this.translate.instant("DAYS_AFTER_PAYMENT_DATE"));
        Swal.fire({
          title: this.noTe + " " + this.refund_validity + " " + this.noTE,
          icon: "warning",
          confirmButtonColor: "#DD6B55",
          confirmButtonText: this.translate.instant("Ok"),
        }).then((isConfirm) => {
          if (isConfirm) {
          }
        });
      return;
    }
    if (
      (this.orderdetail.method_type_val == 3 &&
        this.orderdetail.order_status != 5) ||
      (this.orderdetail.pay_thru_wallet == 1 &&
        this.orderdetail.order_status != 5)
    ) {
      if (this.total_refundquntity == this.total_quntity) {
        Swal.fire({
          title: this.translate.instant(
            "For pre-delivery orders which are done using online payment, you can only generate part refunds. In case you wish to generated refund for all items then you can cancel the item from Process Order screen."
          ),
          icon: "warning",
          confirmButtonColor: "#DD6B55",
          confirmButtonText: this.translate.instant("OK"),
        }).then((isConfirm) => {
          if (isConfirm) {
          }
        });
        return;
      }
    }
    if (this.total_refundquntity == this.total_quntity) {
      this.note = this.translate.instant(
        "YOU_HAVE_ADDED_ALL_THE_ITEM_IN_THE_REFUND_THIS_REFUND_WILL_BE_THE_LAST_REFUND_FOR_THIS_ORDER"
      );
    }

    if (this.refundOrderDetails.refund_way == 3) {
      if (
        this.refundOrderDetails.refund_Ordertotal <=
        Number(this.orderdetail.Original_order_amount) -
        Number(this.OnlineRefundedAmount)
      ) {
        Swal.fire({
          title:
            this.note +
            this.translate.instant(
              "ARE_YOU_SURE_YOU_WANT_TO_GENERATE_REFUND_FOR_THIS_CUSTOMER"
            ) +
            this.global_currency +
            " " +
            this.refundOrderDetails.refund_Ordertotal +
            "?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: this.translate.instant("OK"),
          cancelButtonText: this.translate.instant("CANCEL"),
        }).then((isConfirm) => {
          if (isConfirm.value) {
            this.generate_refund();
          } else if (isConfirm.dismiss === Swal.DismissReason.cancel) {
            this.note = "";
          }
        });
      } else {
        this.toastr.error(
          this.translate.instant("ONLINE_REFUND_CANT_ALLOW", "")
        );
        return false;
      }
    } else {
      Swal.fire({
        title:
          this.note +
          this.translate.instant(
            "ARE_YOU_SURE_YOU_WANT_TO_GENERATE_REFUND_FOR_THIS_CUSTOMER"
          ) +
          this.global_currency +
          " " +
          this.refundOrderDetails.refund_Ordertotal +
          "?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: this.translate.instant("OK"),
        cancelButtonText: this.translate.instant("CANCEL"),
      }).then((isConfirm) => {
        if (isConfirm.value) {
          this.generate_refund();
        } else if (isConfirm.dismiss === Swal.DismissReason.cancel) {
          this.note = "";
        }
      });
    }
  }
  /** clear button  */
  cancelbtn() {
    window.history.back();
  }

  getRefundOrderDetails(item) {
    if (this.isSuperAdmin == true) {
      this.session.clearCookie(
        "order_cancellation_id" + this.main.LoggedUserInfo.role_id.toString()
      );
      this.session.encryptIdValue(
        item.order_cancellation_id.toString(),
        "order_cancellation_id" +
        this.main.LoggedUserInfo.role_id.toString().toString(),
        this.main.CryptoKey
      );
    } else {
      this.session.clearCookie(
        "order_cancellation_id" + this.sellerDetails.store_id.toString()
      );
      this.session.encryptIdValue(
        item.order_cancellation_id.toString(),
        "order_cancellation_id" + this.sellerDetails.store_id.toString(),
        this.main.CryptoKey
      );
    }
    window.open("/generate-refund/view-refund", "_blank").focus();
  }

  editOrderDetail(orderId) {
    if (this.isSuperAdmin == true) {
      this.session.encryptIdValue(orderId.toString(), 'order_id' + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
    }
    else {
      this.session.encryptIdValue(orderId.toString(), 'order_id' + this.sellerDetails.store_id.toString(), this.main.CryptoKey);
    }
    window.open('/order/selller-process-order', '_blank').focus();
  }

  getRemainingAmount(): number {
    if (this.orderdetail && this.orderdetail.Original_order_amount && this.refund_delivery_amount) {
      return this.orderdetail.Original_order_amount - this.refund_delivery_amount;
    } else {
      return 0; // or some default value
    }
  }

  reset_Full_Refund() {
    this.isfull_refund = false;
    this.selecteditems.forEach((element) => {
      element.refundQuantity = 0;
    });

    this.refundOrderDetails = {
      refund_remarks: "",
      refund_tax: "0.00",
      refundQuantity: "0.00",
      refund_item_total: "0.00",
      refund_deliverycharge: "0.00",
      refund_taxcharge: "0.00",
      refund_tip: "0.00",
      refund_offerPromo: "0.00",
      refund_discount: "0.00",
      refund_Ordertotal: "0.00",
      afterDiscountPrice: "0.00",
      refund_packcharge: "0.00",
      refund_packaging_per_order: "0.00",
      refund_way: 0,
      refund_date: moment(new Date()).format("DD-MM-YYYY"),
    };
    this.total_refundquntity = 0;
  }

  generate_Full_Refund() {
    this.isfull_refund = true;
    this.selecteditems.forEach((element) => {
      element.refundQuantity = element.quantity;
      this.refundOrderDetails.refund_item_total = this.orderdetail.item_total;
      this.refundOrderDetails.refund_deliverycharge =
        this.orderdetail.delivery_charges;
      this.refundOrderDetails.refund_packaging_per_order =
        this.orderdetail.packaging_per_order;
      this.refundOrderDetails.refund_packcharge = this.packaging_item;
      this.refundOrderDetails.refund_tax = this.orderdetail.order_tax;
      this.refundOrderDetails.refund_taxcharge =
        Number(this.orderdetail.order_tax) + Number(this.packaging_item);
      this.refundOrderDetails.refund_offerPromo =
        this.orderdetail.offer_discount;
      this.refundOrderDetails.refund_discount = this.orderdetail.discount;
      this.refundOrderDetails.refund_tip = this.orderdetail.order_tip;
      this.refundOrderDetails.refund_Ordertotal =
        this.orderdetail.OriginalOrderAmount;
      this.total_refundquntity = this.total_quntity;
    });
  }

  total_refund_item: any = [];
  generate_refund() {
    for (var i = 0; i <= this.selecteditems.length; i++) {
      if (this.selecteditems[i] != undefined) {
        if (this.selecteditems[i].refundQuantity != 0) {
          this.selecteditems[i].return_quantity =
            this.selecteditems[i].refundQuantity;
          this.total_refund_item.push(this.selecteditems[i]);
        }
      }
    }
    let fd = new FormData();

    if (this.refundOrderDetails.refund_way == 4) {
      fd.append("wallet_amount", this.refundOrderDetails.refund_Ordertotal);
    }
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("order_id", this.orderId);
    fd.append("refund_date", this.refundOrderDetails.refund_date);
    fd.append("refund_amount", this.refundOrderDetails.refund_Ordertotal);
    fd.append(
      "delivery_charges",
      this.refundOrderDetails.refund_deliverycharge
    );
    fd.append("offer_discount", this.refundOrderDetails.refund_offerPromo);
    fd.append("order_tax", this.refundOrderDetails.refund_tax);
    fd.append("order_tip", this.refundOrderDetails.refund_tip);
    fd.append("packaging_cost", this.refundOrderDetails.refund_packcharge);
    fd.append(
      "packaging_per_order",
      this.refundOrderDetails.refund_packaging_per_order
    );
    fd.append("refund_remarks", this.refundOrderDetails.refund_remarks);
    fd.append("refund_thru", this.refundOrderDetails.refund_way);
    fd.append("discount", this.refundOrderDetails.refund_discount);
    fd.append("items", JSON.stringify(this.total_refund_item));

    var data = fd;

    this.generateRefundService.updateRefund(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.router.navigate([`/generate-refund`]);
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
  sortKey: any = "";
  isOrderBy: boolean = true;

  cancelClick() {
    history.back();
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.orderDetailBinding(this);
  }

  priceFormatter(value: any) {
    if (value) {
      var price = value.toString().split(".")[0];
      var decimal = value.toString().split(".")[1];
      if (this.show_price_same_font == 1) {
        return price + this.amount_seperator + decimal;
      } else {
        return price + "<span class='price-decimal'><small>" + this.amount_seperator + decimal + "</small></span>";
      }
    } else {
      return '0';
    }
  }
}
