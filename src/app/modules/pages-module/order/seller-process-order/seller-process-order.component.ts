import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { Subject, takeUntil } from "rxjs";
import { AppComponent } from "src/app/app.component";
import { CommonService } from "src/app/services/common.service";
import Swal from "sweetalert2";

import { ThemePalette } from "@angular/material/core";
import { OrderService } from "src/app/services/order.service";
import * as $ from "jquery";
import * as moment from "moment";
import { OrderRefundDetailsComponent } from "../../model/order-refund-details/order-refund-details.component";
import { cloneDeep } from "lodash";

import { RepeatAddonChoiceComponent } from "../../model/repeat-addon-choice/repeat-addon-choice.component";
import { SelectAddonChoicesComponent } from "../../model/select-addon-choices/select-addon-choices.component";
import { AddOrderService } from "src/app/services/add-order.service";
import { AvailableOffersComponent } from "../../model/available-offers/available-offers.component";
import { RepeatComboItemsComponent } from "../../model/repeat-combo-items/repeat-combo-items.component";
import { SelectComboItemsComponent } from "../../model/select-combo-items/select-combo-items.component";
import { installHtmlTooltips, trustedTooltipHtml } from "src/app/utils/html-tooltip";
import { AddSelectItemComponent } from "../../model/add-select-item/add-select-item.component";
import { ViewMultipleImageComponent } from "../../model/view-multiple-image/view-multiple-image.component";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { ToastrService } from "ngx-toastr";
import { CryptoService } from "src/app/services/custom/crypto.service";
export const MY_FORMATS = {
  parse: {
    dateInput: "YYYY/MM/DD",
  },
  display: {
    dateInput: "MM/DD/YYYY",
    monthYearLabel: "MMMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@Component({
  selector: "app-seller-process-order",
  templateUrl: "./seller-process-order.component.html",
  styleUrls: ["./seller-process-order.component.scss"],
})
export class SellerProcessOrderComponent implements OnInit, OnDestroy {
  @Input() from_seller_list: any;
  @Output() map_order_details_page: EventEmitter<any> = new EventEmitter();
  private destroy$ = new Subject();
  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = false;
  public minDate: moment.Moment;
  public maxDate: moment.Moment;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public color: ThemePalette = "primary";

  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  main: any;
  order_allowed_update_statuses =
    this.generalSetting.order_allowed_update_statuses.split(",");
  global_currency = this.generalSetting.currency_symbol;
  global_timezone = this.generalSetting.timezone;
  deliveryboy_label = this.generalSetting.deliveryboy_label;
  store_tax_label = this.generalSetting.store_tax_label;
  driver_module = this.generalSetting.driver_module;
  is_pod_mandatory = this.generalSetting.is_pod_mandatory;
  show_price_same_font = this.generalSetting.show_price_same_font;
  amount_seperator = this.generalSetting?.amount_seperator;
  tax_recalculation_offer = this.generalSetting.tax_recalculation_offer;
  isdisplayWallet = this.generalSetting.allow_wallet;
  walletMaxValue = this.generalSetting.max_payment;
  delivery_model: any = this.PlatformSetting.delivery_model;
  pos_module = this.generalSetting.pos_module;
  order_process_on_less_stock = this.generalSetting.order_process_on_less_stock;
  dinein_module = this.generalSetting.dinein_module;
  isDeliveryModelPlatForm = true;
  business_model = this.PlatformSetting.business_model;
  currentDate = new Date();
  show_customer_details_to_store =
    this.generalSetting.show_customer_details_to_store == "1" ? true : false;
  search = "";
  subscription_model = this.PlatformSetting.subscription_model;
  refund_module: any = this.generalSetting.refund_module;
  stock_mgmt = this.generalSetting.stock_mgmt;
  add_refund_module = false;
  view_refund_module = false;
  isSuperAdmin = false;
  giveDiscountShow: boolean = true;
  deliveryBoyListDisable = false;
  deliveryNoteDisable = false;
  afterDiscountPrice = "0.00";
  orderStatusList = [];
  isOrderDetailChnage = false;
  iseatery: any;
  sessionConfig = this.appComponent.sessionConfig();
  orderId: any;
  date: any;
  dateOptions: any;
  ItemTotalPrice: any = 0.0;
  orderdetail: any;
  multipaymentList: any;
  walletBalance: any;
  originalWalletBalance: any;
  packaging_per_order: number;
  taxPrice: any;
  taxAndChargesTotalToolTip: any;
  selectedOrderStatus: any;
  serverSideButtonDivHide: boolean;
  acceptOrderDivShow: boolean;
  readyForPicupDivShow: boolean;
  outForDeliveryDivShow: boolean;
  serverSideEditButton: boolean;
  prescription: any = 0;
  selecteditems: any = [];
  RejectedResionList: any[];
  UnDeliverdResionList: any[];
  rejectOrderDropdown: boolean;
  selectedRejectedResion: any;
  UnDeliveredResionDivShow: boolean;
  selectedUnDeliveredResion: any;
  CancellationResonList: any;
  CancellationResionDivShow: boolean;
  selectedCancellationReson: any;
  dine_in_setting: any;
  paymentMethodList: any = [];
  paymentMethod: any;
  deliveryBoyList: any;
  selectedDeliveryBoy: any;
  selectedDeliverySlot: any;
  delivery_slots: any;
  viewRefundDetail: any;
  DeliveryDivShow = false;
  accetpRejectBtnHideShow = true;
  selectedDeliveryLocation: any;
  session = this.appComponent.sessionConfig();
  packagingCharges: any = 0;
  deliveryLocationList: any = [];
  new_pod_images = [];
  file: any;
  isvalid: boolean;
  new_order_imagecount = 0;
  new_order_images = [];
  new_pod_imagecount = 0;
  selectedPickupSlot: any;
  last_used_addon_choice: any;
  modelNewItem: any;
  selecteditemscount: any;
  itemtotal: any;
  deliverycharge: any;
  order_payment_methods: any[];
  Revised_Date_Time: any;
  offerList: any = [];
  stockLess: boolean = false;
  mapLink: any;
  dlt_all_ChsAdn: any = false;
  is_revise_time_error: boolean = false;
  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    public commonService: CommonService,
    private modalService: NgbModal,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private addOrderService: AddOrderService,
    private spinner: SpinnerService,
    private cryptoService: CryptoService,

  ) {
    this.main = this.appComponent.main;
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    installHtmlTooltips(); // HTML only for tooltips built with trustedTooltipHtml()


    if (this.refund_module != 0) {
      if (
        this.main.LoggedUserInfo.role_id == 6 ||
        this.main.LoggedUserInfo.role_id == 1
      ) {
        this.refund_module =
          (this.subscription_model == 2 || this.subscription_model == 3) &&
            this.business_model == 1 &&
            this.main.LoggedUserInfo.role_id == 6
            ? true
            : (this.subscription_model == 2 || this.subscription_model == 3) &&
              (this.business_model == 2 || this.business_model == 3) &&
              this.main.LoggedUserInfo.role_id == 1
              ? true
              : false;
        this.add_refund_module = true;
      } else {
        this.add_refund_module = this.subscription_model == 1 ? true : false;
        this.view_refund_module = this.subscription_model != 1 ? true : false;
      }
    }
    if (this.delivery_model == 2 || this.delivery_model == 4) {
      this.isSuperAdmin = true;
      this.isDeliveryModelPlatForm =
        this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
          ? true
          : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
              ? true
              : false;
    }
    this.giveDiscountShow = this.subscription_model == 2 ? false : true;

    var orderList = this.generalSetting.order_status_list;
    orderList.forEach((Item: any) => {
      var data = { label: Item.name, value: Number(Item.id) };
      this.orderStatusList.push(data);
    });
    if (this.dinein_module == 0) {
      this.orderStatusList = this.orderStatusList.filter((x) => x.value !== 9);
      this.orderStatusList = this.orderStatusList.filter((x) => x.value !== 10);
      this.orderStatusList = this.orderStatusList.filter((x) => x.value !== 11);
    }

    if (this.isSuperAdmin == true) {
      var objSellerDetail = JSON.parse(
        localStorage.getItem("seller_Order_obj")
      );
      if (objSellerDetail) {
        this.main.LoggedUserInfoStore = objSellerDetail.sellerDetails;
        this.sellerDetails = objSellerDetail.sellerDetails;
        this.iseatery = this.sellerDetails.iseatery;
      }
    } else {
      this.main.LoggedUserInfoStore = JSON.parse(
        this.sessionConfig.getSessionLoginUserStore()
      );
      this.sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
      this.iseatery = this.sellerDetails.iseatery;
    }

    this.isSuperAdmin = false;
    if (
      this.main.LoggedUserInfo.role_id == this.main.UserRole.SuperAdmin ||
      this.main.LoggedUserInfo.role_id == this.main.UserRole.Admin
    ) {
      this.isSuperAdmin = true;
    }

    if (this.isSuperAdmin == true) {
      this.orderId = this.sessionConfig.decryptIdValue(
        "order_id" + this.main.LoggedUserInfo.role_id.toString(),
        this.main.CryptoKey
      );
      this.session.clearCookie(
        "order_id" + this.main.LoggedUserInfo.role_id.toString()
      );
    }
    else {
      this.orderId = this.sessionConfig.decryptIdValue(
        "order_id" + this.sellerDetails?.store_id.toString(),
        this.main.CryptoKey
      );
      this.session.clearCookie("order_id" + this.sellerDetails.store_id.toString())
    }

    if (this.orderId == undefined) {
      this.router.navigate(["/order"]);
    }

    this.date = {};
    this.dateOptions = {
      minDate: new Date(), // restrict maximum date to today
    };
    this.date.revisedDateTime = "";
    this.main.DateFormate = this.generalSetting.date_format_web;
    if (this.orderId != undefined) {
      this.PageLoadData(this.orderId);
    }
  }

  removeOrderStatusFromList(removeArrayIndex) {
    this.orderStatusList = [];
    this.generalSetting.order_status_list.forEach((Item) => {
      var data = { label: Item.name, value: Number(Item.id) };
      this.orderStatusList.push(data);
    });
    for (var i = removeArrayIndex.length - 1; i >= 0; i--) {
      this.orderStatusList.splice(removeArrayIndex[i], 1);
    }
    return this.orderStatusList;
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
    return trustedTooltipHtml(taxAndChargesTotalToolTip);
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

  orderDetailBinding(details) {
    this.orderdetail = details;
    if (this.orderdetail.offer_code) {
      this.GetOnGoingStoreOffers()
    }
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

    if (this.orderdetail.is_multiple_payment == 1) {
      this.multipaymentList = this.orderdetail.order_payment_methods;
    }

    this.walletBalance = this.orderdetail.customer.wallet_balance;
    this.originalWalletBalance = this.orderdetail.customer.wallet_balance;

    this.orderdetail.delivery_charges = Number(
      this.orderdetail.delivery_charges || 0
    ).toFixed(2);
    this.packagingCharges = Number(this.orderdetail.packaging_cost).toFixed(2);
    this.packaging_per_order = Number(this.orderdetail.packaging_per_order);
    this.taxPrice = this.orderdetail.order_tax;
    this.orderdetail.otherCharges = Number(
      Number(this.taxPrice) + Number(this.packagingCharges)
    ).toFixed(2);

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

    this.orderdetail.OriginalWalletAmount = this.orderdetail.wallet_amount;
    this.orderdetail.OriginalOnlineAmount = 0;
    if (this.orderdetail.method_type_val == 3) {
      this.orderdetail.OriginalOnlineAmount = this.orderdetail.order_amount;
    }

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

    if (
      this.orderdetail.delivery_type == 1 ||
      this.orderdetail.delivery_type == 4
    ) {
      if (this.orderdetail.delivery_time_type == 1) {
        if (this.orderdetail.scheduled_delivery_date == "") {
        } else {
          this.orderdetail.IsScheduledOrder = true;
          if (this.orderdetail.order_status != 5) {
            this.orderdetail.delivery_date =
              this.orderdetail.scheduled_delivery_date;
            var tampDate =
              this.orderdetail.revised_delivery_date == ""
                ? this.orderdetail.scheduled_delivery_date
                : this.orderdetail.revised_delivery_date;
            this.date.revisedDateTimeTemp = tampDate; //verifyDate
            this.date.revisedDateTimeTemp = moment(
              tampDate,
              this.DateFormateFromServerSide()
            );
            this.date.revisedDateTimeTemp = new Date(
              this.date.revisedDateTimeTemp
            );
          }
        }
      } else {
        if (this.orderdetail.scheduled_delivery_date == "") {
          if (this.orderdetail.order_status != 5) {
            this.orderdetail.delivery_date =
              this.orderdetail.revised_delivery_date == ""
                ? this.orderdetail.delivery_date_to_time
                : this.orderdetail.revised_delivery_date;
            this.date.revisedDateTimeTemp = moment(
              this.orderdetail.delivery_date,
              this.DateFormateFromServerSide()
            );
            this.date.revisedDateTimeTemp = new Date(
              this.date.revisedDateTimeTemp
            );
          }
        } else {
          this.orderdetail.IsScheduledOrder = true;
          this.orderdetail.delivery_date =
            this.orderdetail.scheduled_delivery_date;
          var tampDate =
            this.orderdetail.revised_delivery_date == ""
              ? this.orderdetail.scheduled_delivery_date
              : this.orderdetail.revised_delivery_date;
          this.date.revisedDateTimeTemp = moment(
            tampDate,
            this.DateFormateFromServerSide()
          );
          this.date.revisedDateTimeTemp = new Date(
            this.date.revisedDateTimeTemp
          );
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
            var tampDate =
              this.orderdetail.revised_delivery_date == ""
                ? this.orderdetail.scheduled_delivery_date
                : this.orderdetail.revised_delivery_date;
            this.date.revisedDateTimeTemp = moment(
              tampDate,
              this.DateFormateFromServerSide()
            );
            this.date.revisedDateTimeTemp = new Date(
              this.date.revisedDateTimeTemp
            );
          }
        }
      } else {
        if (this.orderdetail.scheduled_delivery_date == "") {
          if (this.orderdetail.order_status != 5) {
            this.orderdetail.delivery_date =
              this.orderdetail.revised_delivery_date == ""
                ? this.orderdetail.pickup_date_to_time
                : this.orderdetail.revised_delivery_date;
            this.date.revisedDateTimeTemp = moment(
              this.orderdetail.delivery_date,
              this.DateFormateFromServerSide()
            );
            this.date.revisedDateTimeTemp = new Date(
              this.date.revisedDateTimeTemp
            );
          }
        } else {
          this.orderdetail.IsScheduledOrder = true;
          this.orderdetail.delivery_date =
            this.orderdetail.scheduled_delivery_date;
          var tampDate =
            this.orderdetail.revised_delivery_date == ""
              ? this.orderdetail.scheduled_delivery_date
              : this.orderdetail.revised_delivery_date;
          this.date.revisedDateTimeTemp = moment(
            tampDate,
            this.DateFormateFromServerSide()
          );
          this.date.revisedDateTimeTemp = new Date(
            this.date.revisedDateTimeTemp
          );
        }
      }
      // Pick Time  End
    }
    this.date.revisedDateTime = "";
    this.selectedOrderStatus = this.orderStatusList.filter(
      (item) => item.value == this.orderdetail.order_status
    )[0];
    var removeValFromIndex = [];

    if (this.orderdetail.order_status == 1) {
      if (this.orderdetail.delivery_type == 5) {
        this.serverSideButtonDivHide = true;
      } else {
        this.acceptOrderDivShow = true;
      }
      removeValFromIndex = [2, 3, 4, 6, 7, 8, 9, 10];
      this.removeOrderStatusFromList(removeValFromIndex);
    } else if (this.orderdetail.order_status == 2) {
      this.acceptOrderDivShow = true;
      removeValFromIndex = [];
      if (
        this.orderdetail.delivery_type == 1 ||
        this.orderdetail.delivery_type == 4
      ) {
        if (this.isDeliveryModelPlatForm == false) {
          removeValFromIndex = [0, 1, 2, 3, 4, 6, 7];
          this.serverSideButtonDivHide = true;
        } else {
          removeValFromIndex = [0, 1, 2, 8, 9, 10];
        }
      } else {
        removeValFromIndex = [0, 1, 3, 8, 9, 10];
      }
      this.removeOrderStatusFromList(removeValFromIndex);
    } else if (this.orderdetail.order_status == 3) {
      this.acceptOrderDivShow = true;
      this.readyForPicupDivShow = false;
      var removeValFromIndex = [];
      if (
        this.orderdetail.delivery_type == 1 ||
        this.orderdetail.delivery_type == 4
      ) {
        if (this.isDeliveryModelPlatForm == false) {
          removeValFromIndex = [0, 1, 2, 3, 4, 6, 7];
          this.serverSideButtonDivHide = true;
        } else {
          removeValFromIndex = [0, 1, 2, 3, 7, 8, 9, 10];
        }
      } else {
        if (this.orderdetail.delivery_type == 2) {
          removeValFromIndex = [0, 1, 2, 3, 7, 8, 9, 10];
        }
        if (this.orderdetail.delivery_type == 5) {
          removeValFromIndex = [0, 1, 2, 3, 7];
        }
      }
      this.removeOrderStatusFromList(removeValFromIndex);
    } else if (this.orderdetail.order_status == 4) {
      this.deliveryBoyListDisable = true;
      this.acceptOrderDivShow = true;
      var removeValFromIndex = [];
      if (
        this.orderdetail.delivery_type == 1 ||
        this.orderdetail.delivery_type == 4
      ) {
        if (this.isDeliveryModelPlatForm == false) {
          removeValFromIndex = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10];
          this.serverSideButtonDivHide = true;
        } else {
          removeValFromIndex = [0, 1, 2, 3, 7, 8, 9, 10];
        }
      } else {
        removeValFromIndex = [0, 1, 2, 3, 7, 8, 9, 10];
      }
      this.removeOrderStatusFromList(removeValFromIndex);
      if (this.delivery_model <= 2) {
        this.GetDeliveryBoyList();
      } else {
        this.deliveryNoteDisable = false;
        this.outForDeliveryDivShow = true;
      }
    } else if (this.orderdetail.order_status == 5) {
      this.serverSideButtonDivHide = true;
    } else if (this.orderdetail.order_status == 6) {
      this.serverSideButtonDivHide = true;
      this.GetRejectResonList();
    } else if (this.orderdetail.order_status == 7) {
      this.acceptOrderDivShow = true;
      var removeValFromIndex = [];
      if (
        this.orderdetail.delivery_type == 1 ||
        this.orderdetail.delivery_type == 4
      ) {
        if (this.isDeliveryModelPlatForm == false) {
          removeValFromIndex = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10];
          this.serverSideButtonDivHide = true;
        } else {
          removeValFromIndex = [0, 1, 2, 8, 9, 10];
        }
      } else {
        removeValFromIndex = [0, 1, 3, 8, 9, 10];
      }
      this.removeOrderStatusFromList(removeValFromIndex);
      this.GetRejectResonList();
    } else if (this.orderdetail.order_status == 8) {
      this.serverSideButtonDivHide = true;
      this.GetCancellationResonList();
    } else if (this.orderdetail.order_status == 9) {
      if (this.orderdetail.all_sub_order_completed == 0) {
        this.serverSideButtonDivHide = true;
      } else {
        this.serverSideEditButton = false;
      }
      removeValFromIndex = [0, 1, 2, 3, 4, 5, 6, 7, 10, 11];
      this.removeOrderStatusFromList(removeValFromIndex);
    } else if (this.orderdetail.order_status == 10) {
      this.acceptOrderDivShow = false;

      removeValFromIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 11];
      this.removeOrderStatusFromList(removeValFromIndex);
    } else if (this.orderdetail.order_status == 11) {
      this.serverSideButtonDivHide = true;
    }
    this.isOrderEditableorNot(this.orderdetail.order_status);
    var itemdetails = [];

    this.orderdetail.items.forEach((Item) => {
      if (this.prescription != 1) {
        this.prescription = Item.prescription;
      }

      Item.item_variants.forEach((variant) => {
        if (variant.is_added == 1) {
          var item_data: any = {
            item_image: variant.variant_image,
            item_id: Item.item_id,
            item_remark: variant.item_remark,
            item_variants_id: variant.item_variants_id,
            order_item_id: variant.order_item_id,
            item_name: Item.item_name,
            brand_name: Item.brand_name,
            packaging_name: variant.packaging_name,
            unit_name: variant.unit_name,
            quantity: Number(variant.quantity).toFixed(0),
            unit_quantity: variant.unit_quantity,
            discounted_price: variant.discounted_price,
            price: variant.item_price,
            packaging: variant.packaging,
            tax: variant.tax,
            is_combo: Item.is_combo,
            sub_category_id: Item.sub_category_id,
            sub_category_name: Item.sub_category_name,
            category_id: Item.category_id,
            category_name: Item.category_name,
            current_stock: Item?.stock_management_method == 1 ? (variant?.out_of_stock == 1 ? 'Out' : 'In') : Item?.stock_management_method == 2 ? Number(Item?.current_stock).toFixed(2) : Number(variant?.current_stock).toFixed(0),
            stock_management_method: Item?.stock_management_method,
            out_stock_qty: variant?.out_stock_qty,
            stock_unit: Item?.stock_management_method == 2 ? Item?.unit_name : variant?.unit_name,
            min_qty: variant.min_qty,
            max_qty: variant.max_qty
          };
          if (variant.choices_addons != null) {
            (item_data.choices = variant.choices);
              (item_data.addons = variant.addons);
              (item_data.choices_addons = variant.choices_addons);
          } else {
            item_data.choices_addons = null;
          }

          var choices_addons = [];
          if (Item.combo_variants != null) {
            item_data.combo_variants = Item.combo_variants;
            if (item_data.combo_variants) {
              item_data.combo_variants.forEach((combo) => {
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
          itemdetails.push(item_data);
        }
      });
    });

    if (this.orderdetail.delivery_type == 5) {
      this.get_pos_settings();
    }

    this.selecteditems = itemdetails;
    this.cdr.detectChanges();
  }

  getImageName = function (url) {
    return url.substring(url.lastIndexOf("/") + 1);
  };

  multipayment(item) {
    if (item) {
      var data = {
        paymentMethod: "",
        payment_transaction_id: "",
        amount: Number(""),
      };
      this.multipaymentList = [];
      this.multipaymentList.push(data);
    }
  }

  getSelectedPaymentMethod(item) {
    this.paymentMethod = item;
  }

  openimage = function (url) {
    window.open(url, "_blank");
  };

  PageLoadData(orderId) {
    var data = {
      order_id: orderId,
      is_edit: 1,
    };
    this.orderService.getOrderDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.orderDetailBinding(response.data);
          this.currentDate = new Date(response.data.current_datetime);          
          this.dateOptions.minDate = this.currentDate;
          // Removed a setInterval(function () { this.currentDate = new Date(); }, 1000) here:
          // `this` was undefined inside it, so it threw every second, never updated
          // currentDate, and a new one started each time an order was loaded.
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      },
    });
  }

  GetRejectResonList() {
    var data = {
      order_id: this.orderId,
    };
    this.orderService.getRejectResonList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.RejectedResionList = [];
          this.UnDeliverdResionList = [];
          this.RejectedResionList = response.data.rejected;
          this.UnDeliverdResionList = response.data.undelivered;

          if (this.selectedOrderStatus.value == 6) {
            this.rejectOrderDropdown = true;
            this.selectedRejectedResion = this.RejectedResionList.filter(
              (x) => x.reason == this.orderdetail.reject_reason
            );
          } else if (this.selectedOrderStatus.value == 7) {
            this.UnDeliveredResionDivShow = true;
            this.selectedUnDeliveredResion = this.UnDeliverdResionList.filter(
              (x) => x.reason == this.orderdetail.reject_reason
            )[0];
          } else {
            this.selectedRejectedResion = this.RejectedResionList[0];
            this.selectedUnDeliveredResion = this.UnDeliverdResionList[0];
          }
        } else {
          this.RejectedResionList = [];
          this.UnDeliverdResionList = [];
          this.toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }

  GetCancellationResonList() {
    this.orderService.getCancellationResonList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.CancellationResonList = response.data.cancelled;
          if (this.orderdetail.order_status == 8) {
            this.CancellationResionDivShow = true;
            this.selectedCancellationReson = this.CancellationResonList.filter(
              (reason) => reason == this.orderdetail.reason
            );
          } else {
            this.selectedCancellationReson = this.CancellationResonList[0];
          }
        } else {
          this.CancellationResonList = [];
          this.toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }

  GetOnGoingStoreOffers() {
    const data: any = {
      is_store_listing: 0,
      store_id: this.sellerDetails.store_id,
    };
    if (this.orderdetail.delivery_type == 5) {
      data.is_dine_in = 1;
    }

    this.addOrderService
      .getOnGoingStoreOffersList(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.offerList = response.data;
            this.offerList.forEach((item) => {
              var from = item.validity.split(" ")[0];
              var fromDate: any = "";
              if (this.main.DateFormate.split(" ")[0] == "DD-MM-YYYY") {
                fromDate = item.validity.substr(5, 11);
              } else {
                fromDate = new Date(item.validity.substr(5, 11));
                fromDate = moment(fromDate).format(
                  this.main.DateFormate.split(" ")[0]
                );
              }

              if (item.validity.length == 31) {
                var to = item.validity.substr(17, 18);
                to = to.split(" ")[0];
                var todate: any;
                if (this.main.DateFormate.split(" ")[0] == "DD-MM-YYYY") {
                  todate = item.validity.substr(20, 31);
                } else {
                  todate = new Date(item.validity.substr(20, 31));
                  todate = moment(todate).format(
                    this.main.DateFormate.split(" ")[0]
                  );
                }
              }
              item.validity = from + " " + fromDate;
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
    this.GetOnGoingStoreOffers();
    const modalRef = this.modalService.open(AvailableOffersComponent, {
      size: "lg",
      centered: true,
    });
    modalRef.componentInstance.offerList = this.offerList;
    modalRef.componentInstance.itemtotal = this.itemtotal;

    modalRef.componentInstance.offerCode.subscribe((offerCode) => {
      this.ValidOfferCode(offerCode);
      this.orderdetail.offerCode = offerCode;
    });
  }

  applyOfferCode(offerCode, isModelOpen) {
    this.orderdetail.offerCode = offerCode;
    if (offerCode) {
      this.ValidOfferCode(offerCode);
    }
  }
  /** Get dine in setting using service. */
  get_pos_settings() {
    var data = {
      store_id: this.sellerDetails.store_id,
    };
    this.orderService.getDineInSettings(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.dine_in_setting = response.data;
          this.dine_in_setting.dine_in_payment_methods.forEach((Item) => {
            if (Item.is_added == 1) {
              if (Item.max_order_value > 0.0) {
                Item.name =
                  Item.pos_method_name +
                  " " +
                  "(Max : " +
                  this.global_currency +
                  Item.max_order_value +
                  ")";
              } else {
                Item.name = Item.pos_method_name;
              }
              this.paymentMethodList.push(Item);
            }
          });
          if (this.orderdetail.payment_mode) {
            this.paymentMethod =
              this.dine_in_setting.dine_in_payment_methods.filter(
                (reason) =>
                  reason.payment_method_id == this.orderdetail.payment_mode
              );
          } else {
            this.paymentMethod = this.paymentMethodList[0];
          }
        } else {
          this.CancellationResonList = [];
          this.toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }

  GetDeliveryBoyList() {
    var data = {
      store_id: this.sellerDetails.store_id,
    };
    this.orderService.getDeliveryBoyList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.deliveryBoyList = []
          if (this.driver_module == "1") {
            this.deliveryBoyList = response.data;
          } else {
            response.data.forEach((item) => {
              if (item.role_id != 3) {
                this.deliveryBoyList.push(item);
              }
            });
          }

          if (this.orderdetail.deliveryboy_id != 0) {
            this.outForDeliveryDivShow = true;
            this.selectedDeliveryBoy = this.deliveryBoyList.filter(
              (reason) => reason.user_id == this.orderdetail.deliveryboy_id
            )[0];
          } else {
            this.selectedDeliveryBoy = this.deliveryBoyList[0];
          }

        } else {
          this.deliveryBoyList = [];
          this.toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }

  selectDeliverySloat(slot) {
    this.selectedDeliverySlot = slot;
    this.dateValidationDeliverySlot(this.selectedDeliverySlot);
  }

  dateValidationDeliverySlot(slot) {
    var currentDateTime = this.currentDate;
    var deliverySloatFromTime = "";
    deliverySloatFromTime = slot.to_time; //verifyDate
    var date_format = this.generalSetting.date_format == 'MM-dd-yyyy HH:mm:ss' ? 'MM-DD-yyyy HH:mm' : 'DD-MM-yyyy HH:mm'

    if (new Date() >= new Date(moment(deliverySloatFromTime).format(date_format))) {
      this.toastr.error(
        this.translate.instant("DELIVERY_SLOT_BE_GRATER_THEN_CURRENT_DATE_TIME")
      );
      return false;
    } else {
      return true;
    }
  }
  /** Open OrderRefundDetailsComponent modal */
  viewRefund(item: any) {
    this.viewRefundDetail = item;
    this.viewRefundDetail.add_refund_module = this.add_refund_module;
    const modalRef = this.modalService.open(OrderRefundDetailsComponent, {
      size: "lg",
      centered: true,
    });

    modalRef.componentInstance.viewRefundDetail = this.viewRefundDetail;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.session = this.session;
  }

  discountPriceChnage() {
    this.orderdetail.discount = this.commonService.valideOnlyTwoDigitAfterDecimal(
      this.orderdetail.discount
    );
    this.orderdetail.order_amount = Number(
      Number(this.orderdetail.item_total) +
      Number(this.orderdetail.otherCharges) +
      (Number(this.orderdetail.delivery_charges) -
        Number(this.orderdetail.offer_discount) -
        Number(this.orderdetail.discount) -
        Number(this.orderdetail.wallet_amount))
    ).toFixed(2);
    this.orderdetail.OriginalOrderAmount = Number(
      Number(this.orderdetail.item_total) +
      Number(this.orderdetail.otherCharges) +
      (Number(this.orderdetail.delivery_charges) -
        Number(this.orderdetail.offer_discount) -
        Number(this.orderdetail.discount))
    ).toFixed(2);
    this.ItemTotalPrice = this.orderdetail.order_amount;
    this.OrderAmountCalculation();

    var final_order_amount = this.orderdetail.is_wallet == true ? this.orderdetail.order_amount : this.orderdetail.OriginalOrderAmount;
    if (final_order_amount < 0) {
      this.orderdetail.discount = "0";
      this.toastr.error(
        this.translate.instant(
          "FINAL_AMOUNT_CANNOT_BE_LESS_THAN_0"
        )
      );
      return this.discountPriceChnage()
    }

    if (Number(this.orderdetail.order_amount) < 0) {
      if (Number(this.orderdetail.wallet_amount) > 0) {
        this.toastr.error(
          this.translate.instant("DISCOUNT_CANNOT_BE_GRATER_THAN_FINAL_AMOUNT")
        );
      } else {
        this.toastr.error(
          this.translate.instant("DISCOUNT_CANNOT_BE_GRATER_THAN_ORDER_AMOUNT")
        );
      }
      this.orderdetail.discount = "";
      this.OrderAmountCalculation();
      return false;
    }
  }

  OrderAmountCalculation(label?: any) {
    if (this.orderdetail.offer_code) {
      this.isOrderDetailChnage = true;
    }

    if (this.tax_recalculation_offer == 1) {
      if (
        this.orderdetail.sub_offer_type_id == 4 ||
        this.orderdetail.sub_offer_type_id == 5 ||
        this.orderdetail.sub_offer_type_id == 13
      ) {
        this.taxPrice = 0;
        this.selecteditems.forEach((item) => {
          if (label == "remove_offer") {
            this.taxPrice = Number(this.taxPrice) + Number(
              Number(
                Number(Number(item.tax) / 100) *
                Number(Number(item.price * item.quantity))
              )
            );
          } else {
            item.offerItemAmountPer = Number(
              (Number(this.orderdetail.offer_discount) /
                Number(Number(this.orderdetail.item_total))) *
              Number(item.price * item.quantity)
            ); //Offer (Actual)
            item.postDiscountItemPrice = Number(
              Number(item.price * item.quantity) - Number(item.offerItemAmountPer)
            ); //Total Item Price (Post - Discount
            item.itemTextAmount = Number(
              Number(Number(item.tax) / 100) * Number(item.postDiscountItemPrice)
            ); //Tax Amt
            this.taxPrice += Number(item.itemTextAmount);
          }
        });

        this.taxPrice = Number(this.taxPrice).toFixed(2);
        this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
          this.global_currency,
          this.packagingCharges,
          this.taxPrice
        );
        this.orderdetail.otherCharges = Number(
          Number(this.taxPrice) + Number(this.packagingCharges)
        ).toFixed(2);
      }
    }
    this.finalOrderAmountCalculation();
    // }
  }

  finalOrderAmountCalculation() {
    this.orderdetail.order_amount = Number(
      Number(this.orderdetail.item_total) +
      Number(this.orderdetail.otherCharges) +
      (Number(this.orderdetail.delivery_charges) +
        Number(this.orderdetail.order_tip) -
        Number(this.orderdetail.offer_discount) -
        Number(this.orderdetail.discount) -
        Number(this.orderdetail.OriginalWalletAmount))
    ).toFixed(2);
    this.orderdetail.OriginalOrderAmount = Number(
      Number(this.orderdetail.item_total) +
      Number(this.orderdetail.otherCharges) +
      (Number(this.orderdetail.delivery_charges) +
        Number(this.orderdetail.order_tip) -
        Number(this.orderdetail.offer_discount) -
        Number(this.orderdetail.discount))
    ).toFixed(2);

    if (this.orderdetail.method_type_val == 3) {
      if (Number(this.orderdetail.OriginalWalletAmount) == 0) {
        this.orderdetail.refund_online_thru = Number(
          Number(this.orderdetail.OriginalOnlineAmount) -
          Number(this.orderdetail.order_amount)
        ).toFixed(2);
      } else if (
        Number(this.orderdetail.order_amount) <
        Number(this.orderdetail.OriginalWalletAmount)
      ) {
        var totalOnlineRefund = Number(
          Number(this.orderdetail.OriginalOnlineAmount) -
          Number(this.orderdetail.order_amount)
        ).toFixed(2);
        var paidByOnline = Number(
          this.orderdetail.OriginalOnlineAmount
        ).toFixed(2);
        if (Number(totalOnlineRefund) >= Number(paidByOnline)) {
          this.orderdetail.refund_wallate_thru = Number(
            Number(totalOnlineRefund) - Number(paidByOnline)
          ).toFixed(2);
          this.orderdetail.refund_online_thru = paidByOnline;
        } else {
          this.orderdetail.refund_wallate_thru = Number(0).toFixed(2);
          this.orderdetail.refund_online_thru = totalOnlineRefund;
        }
      } else {
        this.orderdetail.wallet_amount = Number(
          this.orderdetail.OriginalWalletAmount
        ).toFixed(2);
        var totalOnlineRefund = Number(
          Number(this.orderdetail.OriginalOnlineAmount) -
          Number(this.orderdetail.order_amount)
        ).toFixed(2);
        var paidByOnline = Number(
          Number(this.orderdetail.OriginalOnlineAmount) -
          Number(this.orderdetail.OriginalWalletAmount)
        ).toFixed(2);
        if (totalOnlineRefund >= paidByOnline) {
          this.orderdetail.refund_wallate_thru = Number(
            Number(totalOnlineRefund) - Number(paidByOnline)
          ).toFixed(2);
          this.orderdetail.refund_online_thru = paidByOnline;
        } else {
          this.orderdetail.refund_wallate_thru = Number(0).toFixed(2);
          this.orderdetail.refund_online_thru = totalOnlineRefund;
        }
      }
    } else {
      if (this.orderdetail.order_amount <= 0) {
        this.orderdetail.wallet_amount = Number(
          Number(this.orderdetail.OriginalWalletAmount) +
          Number(this.orderdetail.order_amount)
        ).toFixed(2);
      } else {
        if (
          this.orderdetail.OriginalWalletAmount !=
          this.orderdetail.wallet_amount
        ) {
          this.orderdetail.wallet_amount = Number(
            Number(this.orderdetail.order_amount) +
            Number(this.orderdetail.wallet_amount)
          ).toFixed(2);

          if (
            this.orderdetail.OriginalOrderAmount >
            this.orderdetail.OriginalWalletAmount
          ) {
            this.orderdetail.wallet_amount = Number(
              this.orderdetail.OriginalWalletAmount
            ).toFixed(2);
          }
        }
      }
      this.orderdetail.refund_wallate_thru = Number(
        Number(this.orderdetail.OriginalWalletAmount) -
        Number(this.orderdetail.wallet_amount)
      ).toFixed(2);
      if (
        Number(this.orderdetail.refund_wallate_thru) >
        Number(this.orderdetail.OriginalWalletAmount)
      ) {
        this.orderdetail.refund_wallate_thru = Number(
          this.orderdetail.OriginalWalletAmount
        ).toFixed(2);
      }
    }

    if (this.orderdetail.order_amount <= 0) {
      this.orderdetail.wallet_amount = Number(
        Number(this.orderdetail.OriginalWalletAmount) +
        Number(this.orderdetail.order_amount)
      ).toFixed(2);
    } else {
      if (
        this.orderdetail.OriginalWalletAmount != this.orderdetail.wallet_amount
      ) {
        this.orderdetail.wallet_amount = Number(
          Number(this.orderdetail.order_amount) +
          Number(this.orderdetail.wallet_amount)
        ).toFixed(2);

        if (
          this.orderdetail.OriginalOrderAmount >
          this.orderdetail.OriginalWalletAmount
        ) {
          this.orderdetail.wallet_amount = Number(
            this.orderdetail.OriginalWalletAmount
          ).toFixed(2);
        }
      }
    }

    this.orderdetail.order_amount = Number(
      Number(this.orderdetail.item_total) +
      Number(this.orderdetail.otherCharges) +
      Number(
        Number(this.orderdetail.delivery_charges) +
        Number(this.orderdetail.order_tip) -
        Number(this.orderdetail.offer_discount) -
        Number(this.orderdetail.discount) -
        Number(this.orderdetail.wallet_amount)
      )
    ).toFixed(2);
    this.orderdetail.OriginalOrderAmount = Number(
      Number(this.orderdetail.item_total) +
      Number(this.orderdetail.otherCharges) +
      (Number(this.orderdetail.delivery_charges) +
        Number(this.orderdetail.order_tip) -
        Number(this.orderdetail.offer_discount) -
        Number(this.orderdetail.discount))
    ).toFixed(2);
    this.ItemTotalPrice = Number(this.orderdetail.order_amount).toFixed(2);
    this.cdr.detectChanges();
  }

  removeOfferCode = function () {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("ARE_YOU_SURE_TO_REMOVE_OFFER_CODE"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("YES"),
      cancelButtonText: this.translate.instant("NO"),
    }).then((result) => {
      if (result.value) {
        this.orderdetail.offer_discount = 0;
        this.orderdetail.offer_code = "";
        this.orderdetail.offer_remarks = undefined;
        this.OrderAmountCalculation('remove_offer');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  };

  ValidOfferCode(offerCode) {
    this.isOrderDetailChnage = false;
    var data = {
      amount: this.orderdetail.item_total,
      discount_code: offerCode,
      order_type: this.orderdetail.delivery_type,
      store_id: this.sellerDetails.store_id,
      user_id: this.orderdetail.user_id,
      payment_method: this.orderdetail.payment_mode,
      order_id: this.orderId,
      items: JSON.stringify(this.selecteditems),
    };
    this.orderService.getValidOfferCode(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.orderdetail.offer_code = offerCode;
          var ValidOfferCode = response.data;
          this.orderdetail.offer_remarks = ValidOfferCode.offer_remarks;

          if (this.tax_recalculation_offer == 1) {
            if (
              ValidOfferCode.sub_offer_type_id == 4 ||
              ValidOfferCode.sub_offer_type_id == 5 ||
              ValidOfferCode.sub_offer_type_id == 13
            ) {
              this.taxPrice = 0;
              var applied_offer: any = this.offerList.filter((offer) => offer.discount_code == this.orderdetail.offer_code)[0];
              if (response.data.offer_applicable_ids[0]) {
                var applicable_ids: any = response.data.offer_applicable_ids[0].ids.split(',');
              }
              this.selecteditems.forEach((item) => {
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
                    offer_amount = Number(Number(Number(item.price) * Number(applied_offer.discount)) / 100)
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
                  offer_amount = Number(Number(Number(item.price) * Number(applied_offer.discount)) / 100)
                  offer_amount = Number(Number(offer_amount) * Number(item.quantity)).toFixed(2);
                  item.price_after_offer = Number((Number(item.price) * Number(item.quantity)) - Number(offer_amount)).toFixed(2);
                  item.postTaxItemPrice = Number(Number(Number(item.price_after_offer) * Number(item.tax)) / 100).toFixed(2);
                  this.taxPrice = Number(this.taxPrice) + Number(item.postTaxItemPrice);
                }
              });

              this.taxPrice = Number(this.taxPrice).toFixed(2);
              this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
                this.global_currency,
                this.packagingCharges,
                this.taxPrice
              );
              this.orderdetail.otherCharges = Number(
                Number(this.taxPrice) + Number(this.packagingCharges)
              ).toFixed(2);
            }
          }

          var DiffranceOfferDicount =
            Number(ValidOfferCode.offer_discount) -
            Number(this.orderdetail.offer_discount);
          this.orderdetail.offer_discount = Number(
            ValidOfferCode.offer_discount
          ).toFixed(2);
          this.orderdetail.OriginalOrderAmount = Number(
            Number(this.orderdetail.OriginalOrderAmount) -
            Number(DiffranceOfferDicount)
          ).toFixed(2);

          this.finalOrderAmountCalculation();
        } else {
          this.orderdetail.offer_discount = 0;
          this.orderdetail.offer_remarks = undefined;
          this.OrderAmountCalculation();
          this.isOrderDetailChnage = false;
          this.toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }

  GetDeliveryLocationList() {
    var data = {
      order_type:
        this.orderdetail.delivery_type == 4
          ? 1
          : this.orderdetail.delivery_type,
    };
    this.orderService.getDeliveryLocationList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var data = {
            pod_location_id: 0,
            pod_location_name: "Select Delivery Location",
          };
          this.deliveryLocationList.push(data);

          response.data.forEach((item) => {
            this.deliveryLocationList.push(item);
          });
          if (
            this.orderdetail.pod_delivery_location == null ||
            this.orderdetail.pod_delivery_location == ""
          ) {
            this.selectedDeliveryLocation = this.deliveryLocationList[0];
          } else {
            this.selectedDeliveryLocation = this.deliveryLocationList.filter(
              (item) =>
                item.pod_location_name == this.orderdetail.pod_delivery_location
            )[0];
          }
        } else {
          this.deliveryLocationList = [];
          this.toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }

  resetRejectResionSetting() {
    this.rejectOrderDropdown = false;
    this.acceptOrderDivShow = false;
    this.outForDeliveryDivShow = false;
    this.UnDeliveredResionDivShow = false;
    this.CancellationResionDivShow = false;
    if (this.orderdetail.order_status == 1) {
      this.accetpRejectBtnHideShow = true;
    }
    this.selectedRejectedResion = undefined;
    this.selectedUnDeliveredResion = undefined;
    this.selectedDeliveryLocation = undefined;
  }

  acceptOrder() {
    this.ItemTotalPrice =
      Number(this.orderdetail.order_amount) +
      Number(this.orderdetail.wallet_amount);
    if (
      this.orderdetail.payment_method_name == null ||
      this.orderdetail.payment_method_name == undefined ||
      this.orderdetail.payment_method_name == ""
    ) {
      if (
        Number(this.orderdetail.OriginalWalletAmount) <
        Number(this.orderdetail.OriginalOrderAmount)
      ) {
        this.toastr.error(
          this.translate.instant(
            "ORDER_AMOUNT_FOR_CANNOT_BE_GREATER_THAN_THE_AMOUNT_PAID_BY_WALLET"
          )
        );
        return;
      }
    }
    if (this.selecteditems.length == 0) {
      if (Number(this.orderdetail.wallet_amount) > 0) {
        this.toastr.error(
          this.translate.instant("FINAL_AMOUNT_CANNOT_BE_LESS_THAN_0")
        );
      } else {
        this.toastr.error(
          this.translate.instant("ORDER_AMOUNT_CANNOT_BE_LESS_THAN_0")
        );
      }
      return;
    }

    if (Number(this.ItemTotalPrice) < 0) {
      if (Number(this.orderdetail.wallet_amount) > 0) {
        this.toastr.error(
          this.translate.instant("FINAL_AMOUNT_CANNOT_BE_LESS_THAN_0")
        );
      } else {
        this.toastr.error(
          this.translate.instant("ORDER_AMOUNT_CANNOT_BE_LESS_THAN_0")
        );
      }
      return;
    }
    this.acceptOrderDivShow = true;
    this.accetpRejectBtnHideShow = false;
    // }
  }

  rejectOrder() {
    this.rejectOrderDropdown = true;
    this.accetpRejectBtnHideShow = false;
    this.GetRejectResonList();
  }

  ChangeOrderStatus(item) {
    this.DeliveryDivShow = false;
    if (item.value == 1) {
      this.resetRejectResionSetting();
      this.acceptOrderDivShow = true;
    } else if (item.value == 2) {
      this.resetRejectResionSetting();
      if (this.orderdetail.delivery_type != 5) {
        this.acceptOrder();
      }
      this.acceptOrderDivShow = true;
    } else if (item.value == 3) {
      this.resetRejectResionSetting();
      this.readyForPicupDivShow = true;
      this.acceptOrderDivShow = true;
    } else if (item.value == 4) {
      this.resetRejectResionSetting();
      this.GetDeliveryBoyList();
      this.acceptOrderDivShow = true;
      this.outForDeliveryDivShow = true;
    } else if (item.value == 6) {
      this.resetRejectResionSetting();
      this.rejectOrder();
      this.GetRejectResonList();
      this.rejectOrderDropdown = true;
    } else if (item.value == 5) {
      this.resetRejectResionSetting();
      this.GetDeliveryLocationList();
      this.DeliveryDivShow = true;
    } else if (item.value == 7) {
      this.resetRejectResionSetting();
      this.GetRejectResonList();
      this.acceptOrderDivShow = true;
      this.UnDeliveredResionDivShow = true;
    } else if (item.value == 8) {
      this.resetRejectResionSetting();
      this.GetCancellationResonList();
      this.CancellationResionDivShow = true;
    } else if (item.value == 11) {
      this.get_pos_settings();
    } else if (item.value == 10) {
      this.orderdetail.order_tip = "";
      this.tipPriceChnage();
      this.taxtCalculation();
    } else if (item.value == 9) {
      this.taxPrice = 0;
      this.packagingCharges = 0;
      this.orderdetail.otherCharges = 0;
      this.OrderAmountCalculation();
    }

    this.selectedOrderStatus = item;
  }

  taxtCalculation() {
    this.taxPrice = 0;
    if (this.orderdetail.delivery_type != 5) {
      this.selecteditems.forEach((item) => {
        this.taxPrice += Number(
          (Number(item.price * item.quantity) * item.tax) / 100
        );
      });
      this.taxPrice = Number(this.taxPrice).toFixed(2);
      this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
        this.global_currency,
        this.packagingCharges,
        this.taxPrice
      );
      this.orderdetail.otherCharges = Number(
        Number(this.taxPrice) + Number(this.packagingCharges)
      ).toFixed(2);

      //aaded for tax
      this.OrderAmountCalculation();
    } else {
      this.packagingCharges = this.orderdetail.packaging_per_order;
      this.selecteditems.forEach((item) => {
        this.taxPrice += Number(
          (Number(item.price * item.quantity) * item.tax) / 100
        );
        this.packagingCharges = Number(
          Number(this.packagingCharges) + Number(item.packaging)
        ).toFixed(2);
      });
      this.taxPrice = Number(this.taxPrice).toFixed(2);
      this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
        this.global_currency,
        this.packagingCharges,
        this.taxPrice
      );
      this.orderdetail.otherCharges = Number(
        Number(this.taxPrice) + Number(this.packagingCharges)
      ).toFixed(2);
      this.OrderAmountCalculation();
    }
  }

  tipPriceChnage() {
    this.orderdetail.order_tip = this.commonService.valideOnlyTwoDigitAfterDecimal(
      this.orderdetail.order_tip
    );
    this.orderdetail.order_amount = Number(
      Number(this.orderdetail.item_total) +
      Number(this.orderdetail.otherCharges) +
      (Number(this.orderdetail.delivery_charges) -
        Number(this.orderdetail.offer_discount) -
        Number(this.orderdetail.discount) -
        Number(this.orderdetail.wallet_amount) +
        Number(this.orderdetail.order_tip))
    ).toFixed(2);
    this.orderdetail.OriginalOrderAmount = Number(
      Number(this.orderdetail.item_total) +
      Number(this.orderdetail.otherCharges) +
      (Number(this.orderdetail.delivery_charges) -
        Number(this.orderdetail.offer_discount) -
        Number(this.orderdetail.discount) +
        Number(this.orderdetail.order_tip))
    ).toFixed(2);
    this.ItemTotalPrice = this.orderdetail.order_amount;
  }

  ChangeDeliveryBoy = function (item) {
    this.selectedDeliveryBoy = item;
  };

  ChangeDeliveryLocation(item) {
    this.selectedDeliveryLocation = item;
  }

  uploadimage = function () {
    $("#LogoInput").click();
  };

  fileNameChanged(evt, type) {
    var file = evt.currentTarget.files[0];
    this.file = file;

    if (this.file.size / 1024 / 1024 > 5) {
      this.toastr.error(
        this.translate.instant("IMAGE_SIZE_SHOULD_BE_LESS_THAN_5_MB")
      );
      this.isvalid = false;
      return false;
    }
    if (this.file.name.indexOf(".") > -1) {
      var extension = this.file.name.split(".").pop().toLowerCase();
    } else {
      var extension = this.file.name.split("/").pop().toLowerCase();
    }
    if ($.inArray(extension, ["png", "PNG", "jpg", "jpeg"]) == -1) {
      this.toastr.error(
        this.translate.instant(
          "PLEASE_SELECT_JPG_JPEG_PNG_FORMAT_FOR_USER_PICTURE"
        )
      );
      this.isvalid = false;
      return false;
    } else {
      if (type == "prescription") {
        this.new_order_images.push(file);
        this.new_order_imagecount++;
      } else {
        this.new_pod_images.push(file);
        this.new_pod_imagecount++;
      }

    }
    $("input[type='file").val(null);
  }

  removeImage(i: any, type: any) {
    if (type == "prescription") {
      this.new_order_images.splice(i, 1); //remove image from selected image array
    } else {
      this.new_pod_images.splice(i, 1); //remove image from selected image array
    }
  }

  selectPickupSloat(slot) {
    this.selectedPickupSlot = slot;
    this.dateValidationDeliverySlot(this.selectedPickupSlot);
  }

  /** Decrement selected item value */
  decrementValue(selectedItem, chs?, adns?) {
    if (selectedItem.combo_variants) {
      this.Delete_item(selectedItem);
    } else {
      if (selectedItem.choices != null || selectedItem.addons != null) {
        const temp = this.selecteditems.reduce((totalQuantity, item) => {
          if (item.item_variants_id === selectedItem.item_variants_id) {
            return totalQuantity + item.quantity;
          }
          return totalQuantity;
        }, 0);

        if (temp == selectedItem.min_qty) {
          this.dlt_all_ChsAdn = true;
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
          this.Delete_item(selectedItem);
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
          this.Delete_item(selectedItem);
        }
      }
    }
  }

  Delete_item(selectedItem) {
    if (selectedItem.quantity > 1) {
      //All Item Text Calculation start
      selectedItem.quantity--;
      //for min max
      if (!selectedItem.editedCount) {
        this.packagingCharges = Number(
          Number(this.packagingCharges) - Number(selectedItem.packaging)
        ).toFixed(2);
        this.orderdetail.item_total = Number(
          Number(this.orderdetail.item_total) -
          Number(selectedItem.price)
        ).toFixed(2);
      }
      if (selectedItem.editedCount > 0) {
        this.packagingCharges = Number(
          Number(this.packagingCharges) - (Number(selectedItem.packaging) * Number(selectedItem.editedCount))
        ).toFixed(2);
        this.orderdetail.item_total = Number(
          Number(this.orderdetail.item_total) -
          (Number(selectedItem.price) * Number(selectedItem.editedCount))
        ).toFixed(2);
        selectedItem.editedCount = ''
      }

      // Added for tax
      this.taxtCalculation();
    }
  }

  addNewAddOnChoice() {
    var found = this.modelNewItem;
    this.openSelectAddonChoices(found, found.addons, found.choices);
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

    modalRef.componentInstance.SelectedItems = this.func(item, addons, choices);

    modalRef.componentInstance.SelectedAddonChoicesItem.subscribe(
      (addonChoicesItem) => {
        var addItem = {
          discountedprice: addonChoicesItem.discounted_price,
          discounted_price: addonChoicesItem.discounted_price,
          item_id: addonChoicesItem.item_id,
          item_name: addonChoicesItem.item_name,
          item_variants_id: addonChoicesItem.item_variants_id,
          packaging: addonChoicesItem.packaging,
          price: addonChoicesItem.price,
          quantity: 1,
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
          category_id: addonChoicesItem.category_id,
          category_name: addonChoicesItem.category_name,
          sub_category_id: addonChoicesItem.sub_category_id,
          sub_category_name: addonChoicesItem.sub_category_name,
          min_qty: addonChoicesItem.min_qty,
          max_qty: addonChoicesItem.max_qty
        };

        var price = Number(addonChoicesItem.discounted_price);
        var choices_addons = [];

        addItem?.choices?.forEach((choice) => {
          choice?.choice_prices?.forEach((choicePrice) => {
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

        addItem?.addons?.forEach((addon) => {
          var addonName = "";
          addon?.addon_prices?.forEach((addonsPrice) => {
            if (addonsPrice.is_added == true) {
              price += Number(addonsPrice.price);
              addonName =
                addonName == ""
                  ? addonsPrice.variant_sub_addon_name
                  : addonName + ", " + addonsPrice.variant_sub_addon_name;
            }
          });
          choices_addons.push(addon.variant_addon_name + " : " + addonName);
        });
        addItem.choices_addons = choices_addons;
        addItem.price = Number(price).toFixed(2);

        this.selecteditems.push(addItem);
        this.checUniqueItem(this.selecteditems);

        this.packagingCharges = Number(
          Number(this.packagingCharges) + Number(addItem.packaging)
        ).toFixed(2);
        this.taxPrice = Number(
          Number(this.taxPrice) + (Number(addItem.price) * addItem.tax) / 100
        ).toFixed(2);
        this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
          this.global_currency,
          this.packagingCharges,
          this.taxPrice
        );
        this.orderdetail.otherCharges = Number(
          Number(this.taxPrice) + Number(this.packagingCharges)
        ).toFixed(2);
        this.orderdetail.item_total = Number(
          Number(this.orderdetail.item_total) + Number(addItem.price)
        ).toFixed(2);
        this.OrderAmountCalculation();
      }
    );
  }
  /** Open RepeatAddonChoiceComponent modal */
  openLastAddOnChoice(item: any) {
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
        if (item.editedCount > 0) {
          item.quantity = item.originalQuantity
          item.editedCount = ''
        }
        this.addNewAddOnChoice();
      } else {
        this.repeatAddOnChoice(x);
      }
    });
  }

  repeatAddOnChoice(selectedItem) {
    selectedItem.discounted_price = selectedItem.price;
    selectedItem.quantity++;
    if (!selectedItem.editedCount) {
      this.packagingCharges = Number(
        Number(this.packagingCharges) + Number(selectedItem.packaging)
      ).toFixed(2);
      this.taxPrice = Number(
        Number(this.taxPrice) +
        (Number(selectedItem.price) * selectedItem.tax) / 100
      ).toFixed(2);
    }
    if (selectedItem.editedCount > 0) {
      this.packagingCharges = Number(
        Number(this.packagingCharges) + (Number(selectedItem.packaging) * Number(selectedItem.editedCount))
      ).toFixed(2);
      this.taxPrice = Number(
        Number(this.taxPrice) +
        (((Number(selectedItem.price) * selectedItem.tax) / 100) * Number(selectedItem.editedCount))
      ).toFixed(2);
    }
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(
      this.global_currency,
      this.packagingCharges,
      this.taxPrice
    );
    this.orderdetail.otherCharges = Number(
      Number(this.taxPrice) + Number(this.packagingCharges)
    ).toFixed(2);
    if (!selectedItem.editedCount) {
      this.orderdetail.item_total = Number(
        Number(this.orderdetail.item_total) + Number(selectedItem.price)
      ).toFixed(2);
    }
    if (selectedItem.editedCount > 0) {
      this.orderdetail.item_total = Number(
        Number(this.orderdetail.item_total) + (Number(selectedItem.price) * Number(selectedItem.editedCount))
      ).toFixed(2);
      selectedItem.editedCount = ''
    }
    this.OrderAmountCalculation();
  }
  /** Open AddOrderAddItemComponent modal */
  openSelectItem() {
    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
      centered: true,
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.SelectedItems = cloneDeep(this.selecteditems);
    modalRef.componentInstance.sessionConfig = this.sessionConfig;
    modalRef.componentInstance.orderdetail = this.orderdetail;
    modalRef.componentInstance.orderprocess = 1;
    modalRef.componentInstance.SelectedItemFromStore.subscribe(
      (selectedItem) => {
        var tempItem = [];
        this.selecteditems = [];
        selectedItem.forEach((element) => {
          if (element.ImageObject) {
            element.item_image = element.ImageObject[0].image;
          }
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

        this.selecteditems = selectedItem;
        this.selecteditems.forEach((item) => {
          var price = 0;
          var choices_addons = [];
          if (item.combo_variants) {
            item.combo_variants.forEach((combo) => {
              choices_addons = [];
              combo?.choices?.forEach((choice) => {
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

              combo?.addons?.forEach((addon) => {
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
                if (addonName) {
                  choices_addons.push(
                    addon.variant_addon_name + " : " + addonName
                  );
                }
              });
              combo.choices_addons = choices_addons;
            });
          } else {
            if (item.order_item_id > 0) {
            } else {
              item?.choices?.forEach((choice) => {
                choice?.choice_prices?.forEach((choicePrice) => {
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
              item?.addons?.forEach((addon) => {
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
              item.choices_addons = choices_addons;
            }
          }

          if (item.order_item_id > 0) {
            if (item.is_combo == "1") {
              item.price = Number(item.discountedprice).toFixed(2);
            }
          } else {
            item.price = Number(Number(item.discountedprice) + price).toFixed(
              2
            );
          }
        });

        var item_total = 0;
        this.orderdetail.otherCharges = 0;
        this.taxPrice = 0;
        this.packagingCharges = 0;

        this.packagingCharges = Number(this.packaging_per_order);

        for (var i = 0; i < selectedItem.length; i++) {
          if (this.prescription == 0) {
            this.prescription = selectedItem[i].prescription;
          }
          if (
            this.dine_in_setting &&
            this.dine_in_setting.dinein_allow_item_packaging == 0
          ) {
            selectedItem[i].packaging = 0;
          }
          this.selecteditemscount += Number(selectedItem[i].quantity);
          selectedItem[i].packaging =
            Number(selectedItem[i].packaging) *
            Number(selectedItem[i].quantity);
          selectedItem[i].tax_price =
            Number(
              (Number(selectedItem[i].discounted_price) * selectedItem[i].tax) /
              100
            ) * Number(selectedItem[i].quantity);
          this.orderdetail.otherCharges +=
            Number(selectedItem[i].packaging) +
            Number(selectedItem[i].tax_price);
          this.taxPrice += parseFloat(selectedItem[i].tax_price);
          this.packagingCharges += parseFloat(selectedItem[i].packaging);
          if (selectedItem[i].discounted_price > 0) {
            item_total +=
              parseFloat(selectedItem[i].discounted_price) *
              parseInt(selectedItem[i].quantity);
          } else {
            item_total +=
              parseFloat(selectedItem[i].price) *
              parseInt(selectedItem[i].quantity);
          }

          if (selectedItem[i].combo_variants) {
            selectedItem[i].combo_variants.forEach((combo) => {
              if (combo.choices != undefined && combo.choices != null) {
                for (var j = 0; j < combo.choices.length; j++) {
                  for (
                    var k = 0;
                    k < combo.choices[j].choice_prices.length;
                    k++
                  ) {
                    if (combo.choices[j].choice_prices[k].is_added == true) {
                      if (selectedItem[i].order_item_id > 0) {
                        item_total += 0;
                      } else {
                        item_total +=
                          parseFloat(combo.choices[j].choice_prices[k].price) *
                          parseInt(selectedItem[i].quantity);
                      }

                      this.orderdetail.otherCharges +=
                        (parseFloat(combo.choices[j].choice_prices[k].price) *
                          parseInt(selectedItem[i].quantity) *
                          selectedItem[i].tax) /
                        100;
                      if (selectedItem[i].order_item_id == undefined) {
                        this.taxPrice +=
                          (parseFloat(combo.choices[j].choice_prices[k].price) *
                            parseInt(selectedItem[i].quantity) *
                            selectedItem[i].tax) /
                          100;
                      }
                    }
                  }
                }
              }

              if (combo.addons != undefined && combo.addons != null) {
                for (var j = 0; j < combo.addons.length; j++) {
                  for (
                    var k = 0;
                    k < combo.addons[j].addon_prices.length;
                    k++
                  ) {
                    if (combo.addons[j].addon_prices[k].is_added == true) {
                      if (selectedItem[i].order_item_id > 0) {
                        item_total += 0;
                      } else {
                        this.itemtotal +=
                          parseFloat(combo.addons[j].addon_prices[k].price) *
                          parseInt(selectedItem[i].quantity);
                      }
                      this.orderdetail.otherCharges +=
                        (parseFloat(combo.addons[j].addon_prices[k].price) *
                          parseInt(selectedItem[i].quantity) *
                          selectedItem[i].tax) /
                        100;
                      if (selectedItem[i].order_item_id == undefined) {
                        this.taxPrice +=
                          (parseFloat(combo.addons[j].addon_prices[k].price) *
                            parseInt(selectedItem[i].quantity) *
                            selectedItem[i].tax) /
                          100;
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
                    item_total +=
                      selectedItem[i].choices[j].choice_prices[k].price *
                      parseInt(selectedItem[i].quantity);

                    this.orderdetail.otherCharges +=
                      (selectedItem[i].choices[j].choice_prices[k].price *
                        parseInt(selectedItem[i].quantity) *
                        selectedItem[i].tax) /
                      100;
                    this.taxPrice +=
                      (selectedItem[i].choices[j].choice_prices[k].price *
                        parseInt(selectedItem[i].quantity) *
                        selectedItem[i].tax) /
                      100;
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
                  if (
                    selectedItem[i].addons[j].addon_prices[k].is_added == true
                  ) {
                    item_total +=
                      selectedItem[i].addons[j].addon_prices[k].price *
                      parseInt(selectedItem[i].quantity);

                    this.orderdetail.otherCharges +=
                      (selectedItem[i].addons[j].addon_prices[k].price *
                        parseInt(selectedItem[i].quantity) *
                        selectedItem[i].tax) /
                      100;
                    this.taxPrice +=
                      (selectedItem[i].addons[j].addon_prices[k].price *
                        parseInt(selectedItem[i].quantity) *
                        selectedItem[i].tax) /
                      100;
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

        this.OrderAmountCalculation();
      }
    );
  }

  /** Increament selected item value */
  incrementValue(selectedItem, add, choice) {
    if (selectedItem.combo_variants) {
      this.Add_Item(selectedItem);
    } else {
      if (selectedItem.choices != null || selectedItem.addons != null) {
        const temp = this.selecteditems.reduce((totalQuantity, item) => {
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
      this.openLastAddOnChoice(selectedItem);
    } else {
      //All Item Text Calculation start
      selectedItem.quantity++;
      if (!selectedItem.editedCount) {
        this.packagingCharges = Number(
          Number(this.packagingCharges) + Number(selectedItem.packaging)
        ).toFixed(2);
        this.orderdetail.item_total = Number(
          Number(this.orderdetail.item_total) +
          Number(selectedItem.discounted_price)
        ).toFixed(2);
      }
      if (selectedItem.editedCount > 0) {
        this.packagingCharges = Number(
          Number(this.packagingCharges) + (Number(selectedItem.packaging) * Number(selectedItem.editedCount))
        ).toFixed(2);
        this.orderdetail.item_total = Number(
          Number(this.orderdetail.item_total) +
          (Number(selectedItem.discounted_price) * Number(selectedItem.editedCount))
        ).toFixed(2);
        //Added for tax 
        selectedItem.editedCount = ''
      }

      //Added for tax 
      this.taxtCalculation();
    }
  }
  /** Open RepeatComboItemsComponent modal */
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
    this.openSelectComboItems(this.modelNewItem);
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
        var item = {
          discountedprice: userSelectedCombo.discounted_price,
          discounted_price: userSelectedCombo.discounted_price,
          item_id: userSelectedCombo.item_id,
          item_name: userSelectedCombo.item_name,
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
          category_id: userSelectedCombo.category_id,
          category_name: userSelectedCombo.category_name,
          sub_category_id: userSelectedCombo.sub_category_id,
          sub_category_name: userSelectedCombo.sub_category_name,
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

        item.discounted_price = Number(price).toFixed(2);
        item.discountedprice = Number(price).toFixed(2);
        item.price = Number(price).toFixed(2);

        if (item.combo_variants.length > 0) {
          this.selecteditems.push(item);
          this.checUniqueItem(this.selecteditems);

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
          this.orderdetail.otherCharges = (
            Number(this.taxPrice) + Number(this.packagingCharges)
          ).toFixed(2);

          var price =
            Number(item.discounted_price) +
            (Number(item.price) * Number(item.tax)) / 100 +
            Number(item.packaging);
          this.orderdetail.item_total = (
            Number(this.orderdetail.item_total) + Number(price)
          ).toFixed(2);

          this.OrderAmountCalculation();
        }
      }
    );
  }

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
    this.orderdetail.otherCharges = (
      Number(this.taxPrice) + Number(this.packagingCharges)
    ).toFixed(2);

    var price =
      Number(selectedItem.discounted_price) +
      (Number(selectedItem.price) * Number(selectedItem.tax)) / 100 +
      Number(selectedItem.packaging);
    this.orderdetail.item_total = (
      Number(this.orderdetail.item_total) + Number(price)
    ).toFixed(2);

    this.OrderAmountCalculation();

  }

  DateFormateFromServerSide() {
    return this.main.DateFormate;
  }

  revisedTimeChanged() {

    this.dateValidation();
  }
  dateValidation() {
    var currentDateTime: any = this.currentDate;
    var Delivery_Date: any = moment(this.orderdetail.delivery_date, this.DateFormateFromServerSide());
    Delivery_Date = new Date(this.orderdetail.delivery_date);

    var localRevised_Date_Time: any = "";

    if (this.date.revisedDateTime) {
      localRevised_Date_Time = new Date(
        moment(this.date.revisedDateTime).format("MM-DD-YYYY") + " " + this.date.revisedDateTime_time
      );

    } else {
      localRevised_Date_Time =
        this.date.revisedDateTimeTemp == ""
          ? ""
          : this.date.revisedDateTimeTemp;
    }

    this.Revised_Date_Time = localRevised_Date_Time;

    if (localRevised_Date_Time == "") {
      if (Delivery_Date < this.date.revisedDateTimeTemp) {
        this.toastr.error(
          this.translate.instant("PLEASE_SELECT_REVISED_DATE_TIME")
        );

        return false;
      }
    }
    if (
      this.orderdetail.scheduled_delivery_date == null ||
      this.orderdetail.scheduled_delivery_date == ""
    ) {

      if (localRevised_Date_Time != "") {
        if (this.Revised_Date_Time == 'Invalid Date' && !this.date.revisedDateTime_time) {
          // this.toastr.error(this.translate.instant("Please select Revised Time"));
          // return
          this.is_revise_time_error = true;
        } else {
          this.is_revise_time_error = false;
        }
       
        if (
          this.orderdetail.order_date >= moment(localRevised_Date_Time).format(
            this.DateFormateFromServerSide()) ||
          currentDateTime >= moment(localRevised_Date_Time).format(
            this.DateFormateFromServerSide())
        ) {
          if (moment(localRevised_Date_Time).format("HH:mm:ss") != "00:00:00") {
            this.toastr.error(
              this.translate.instant(
                "REVISED_DATE_TIME_BE_GRATER_THEN_ORDER_DATE_TIME"
              )
            );
          } else {
            this.date.revisedDateTime =
              this.date.revisedDateTime != null ? this.currentDate : null;

          }
          // this.date.revisedDateTime = currentDateTime;
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      if (localRevised_Date_Time != "") {
        if (this.Revised_Date_Time == 'Invalid Date' && !this.date.revisedDateTime_time) {
          // this.toastr.error(this.translate.instant("Please select Revised Time"));
          // return
          this.is_revise_time_error = true;
        } else {
          this.is_revise_time_error = false;
        }
        if (currentDateTime >= localRevised_Date_Time) {
          if (moment(localRevised_Date_Time).format("HH:mm:ss") != "00:00:00") {
            this.toastr.error(
              this.translate.instant(
                "REVISED_DATE_TIME_BE_GRATER_THEN_ORDER_DATE_TIME"
              )
            );
          } else {
            this.date.revisedDateTime = currentDateTime;
          }
          return false;
        } else {
          return true;
        }
      } else {
        if (this.orderdetail.IsScheduledOrder == true) {
          if (currentDateTime > Delivery_Date) {
            this.toastr.error(
              this.translate.instant("PLEASE_SELECT_REVISED_DATE_TIME")
            );
            return false;
          }
        }

        return true;
      }
    }

  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.main.DateFormate.split(" ")[0];
  }

  ItemUpdateBindDormData(fd) {
    fd.append("items", JSON.stringify(this.selecteditems));
    this.ItemTotalPrice =
      this.orderdetail.order_amount + Number(this.orderdetail.wallet_amount);
    fd.append("amount", this.ItemTotalPrice);
    fd.append(
      "date",
      moment(new Date()).format(this.DateFormateFromServerSideOnlyDateReturn())
    );
    fd.append("payment_method_id", this.orderdetail.payment_mode);
    fd.append("discount", Number(this.orderdetail.discount).toFixed(2));
  }

  revisedDateTimeBindFormData(fd) {
    if (this.orderdetail.delivery_type == 2) {
      if (this.orderdetail.pickup_time_type == 1) {
        if (this.orderdetail.IsScheduledOrder == true) {
          fd.append(
            "revised_delivery_date",
            this.Revised_Date_Time == ""
              ? ""
              : moment(this.Revised_Date_Time).format(
                this.DateFormateFromServerSide()
              )
          );
        } else {
          if (this.selectedPickupSlot) {
            fd.append("pickup_slot_from", this.selectedPickupSlot.from_time);
            fd.append("pickup_slot_to", this.selectedPickupSlot.to_time);
          }
        }
      } else {
        fd.append(
          "revised_delivery_date",
          this.Revised_Date_Time == "" || this.Revised_Date_Time == null
            ? ""
            : moment(this.Revised_Date_Time).format(
              this.DateFormateFromServerSide()
            )
        );
      }
    } else {
      if (this.orderdetail.delivery_time_type == 1) {
        if (this.orderdetail.IsScheduledOrder == true) {
          fd.append(
            "revised_delivery_date",
            this.Revised_Date_Time == "" || this.Revised_Date_Time == null
              ? ""
              : moment(this.Revised_Date_Time).format(
                this.DateFormateFromServerSide()
              )
          );
        } else {

          if (this.selectedDeliverySlot) {
            fd.append(
              "delivery_slot_from",
              this.selectedDeliverySlot.from_time
            );
            fd.append("delivery_slot_to", this.selectedDeliverySlot.to_time);
          }
        }
      } else {
        if (this.Revised_Date_Time == "" || this.Revised_Date_Time == null) {
          this.Revised_Date_Time = "";
        }
        else {
          this.Revised_Date_Time = moment(this.Revised_Date_Time).format(this.DateFormateFromServerSide())
        }
        fd.append("revised_delivery_date", this.Revised_Date_Time)
      }
    }
  }

  returnDateValidation() {
    var dateValidation = true;
    if (
      this.orderdetail.delivery_type == 1 ||
      this.orderdetail.delivery_type == 4
    ) {
      if (this.orderdetail.delivery_time_type == 1) {
        if (this.orderdetail.IsScheduledOrder == true) {
          dateValidation = this.dateValidation();
        } else {
          if (this.selectedDeliverySlot) {
            dateValidation = this.dateValidationDeliverySlot(
              this.selectedDeliverySlot
            );
          } else {
            var dateValidation = this.dateValidationDeliverySlot(
              this.orderdetail.revised_delivery_slot == null
                ? this.orderdetail.delivery_slot
                : this.orderdetail.revised_delivery_slot
            );
          }
        }
      } else {
        dateValidation = this.dateValidation();
      }
    } else {
      if (this.orderdetail.pickup_time_type == 1) {
        if (this.orderdetail.IsScheduledOrder == true) {
          dateValidation = this.dateValidation();
        } else {
          if (this.selectedPickupSlot) {
            dateValidation = this.dateValidationDeliverySlot(
              this.selectedPickupSlot
            );
          } else {
            dateValidation = this.dateValidationDeliverySlot(
              this.orderdetail.pickup_slot
            );
          }
        }
      } else {
        dateValidation = this.dateValidation();
      }
    }
    return dateValidation;
  }

  UpdateOrderStatus() {
    if (
      this.selectedOrderStatus.value == 11 &&
      this.orderdetail.delivery_type == 5
    ) {
      if (this.orderdetail.is_multiple_payment == true) {
        var overlimit: any = false;
        var namemethod = [];
        var amount = 0.0;
        var final_order_amount =
          this.orderdetail.is_wallet == true
            ? this.orderdetail.order_amount
            : this.orderdetail.OriginalOrderAmount;
        this.multipaymentList.forEach((item) => {
          if (item.paymentMethod) {
            if (
              item.paymentMethod.multipayment_allowed == 1 &&
              item.payment_overlimit == true
            ) {
              overlimit = true;
              namemethod.push(item.paymentMethod.pos_method_name);
              name = namemethod.toString();
            }
            if (item.paymentMethod.multipayment_allowed == 0) {
              if (
                parseFloat(item.paymentMethod.max_order_value) > 0 &&
                parseFloat(item.amount) >
                parseFloat(item.paymentMethod.max_order_value)
              ) {
                overlimit = true;
                namemethod.push(item.paymentMethod.pos_method_name);
                name = namemethod.toString();
              }
            }
            amount = amount + Number(item.amount);
          }
        });

        if (overlimit == true) {
          this.toastr.error(
            this.translate.instant(
              "MAX_LIMIT_FOR_PAYMENT_METHOD (" + name + ") HAS_EXCEEDED"
            )
          );
          return;
        }

        if (amount < final_order_amount) {
          var temp_amount = Number(
            Number(final_order_amount) - Number(amount)
          ).toFixed(2);
          this.toastr.error(
            this.translate.instant("PENDING_AMOUNT_OF" + temp_amount + "IS_DUE")
          );
          return;
        }

        if (amount > final_order_amount) {
          var temp_amount = Number(
            Number(amount) - Number(final_order_amount)
          ).toFixed(2);
          this.toastr.error(
            this.translate.instant(
              "AMOUNT_RECEIVED_IS_MORE_THAN_THE_BILL_AMOUNT"
            )
          );
          return;
        }
      }

      if (this.orderdetail.is_multiple_payment == false) {
        var final_order_amount =
          this.orderdetail.is_wallet == true
            ? this.orderdetail.order_amount
            : this.orderdetail.OriginalOrderAmount;
        if (this.paymentMethod) {
          if (
            parseFloat(this.paymentMethod.max_order_value) > 0 &&
            parseFloat(final_order_amount) >
            parseFloat(this.paymentMethod.max_order_value)
          ) {
            var name = this.paymentMethod.pos_method_name;
            this.toastr.error(
              this.translate.instant(
                "MAX_LIMIT_FOR_PAYMENT_METHOD (" + name + ") HAS_EXCEEDED"
              )
            );
            return;
          }
        }
      }
    }

    var final_order_amount =
      this.orderdetail.is_wallet == true
        ? this.orderdetail.order_amount
        : this.orderdetail.OriginalOrderAmount;

    if (final_order_amount < 0) {
      this.toastr.error(
        this.translate.instant(
          "FINAL_AMOUNT_CANNOT_BE_LESS_THAN_0"
        )
      );
      return;
    }

    var fd = new FormData();

    if (this.new_order_images.length > 0) {
      for (var i = 0; i < this.new_order_images.length; i++) {
        fd.append("prescription_images[]", this.new_order_images[i]);
      }
    }

    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("store_id", this.sellerDetails.store_id);
    fd.append("order_id", this.orderId);
    fd.append("current_order_status", this.orderdetail.order_status);
    fd.append(
      "offer_code",
      this.orderdetail.offer_code == null ? "" : this.orderdetail.offer_code
    );
    fd.append("offer_discount", this.orderdetail.offer_discount);
    fd.append("order_tax", this.taxPrice);
    fd.append("packaging_cost", this.packagingCharges);
    fd.append("source", "1");
    fd.append(
      "order_tip",
      this.orderdetail.order_tip == "" ? 0 : this.orderdetail.order_tip
    );

    if (
      this.selectedOrderStatus.value == 11 &&
      this.orderdetail.delivery_type == 5
    ) {
      if (this.orderdetail.is_multiple_payment == true) {
        this.order_payment_methods = [];
        this.multipaymentList.forEach((item) => {
          if (item.paymentMethod) {
            item.payment_method_id = item.paymentMethod.payment_method_id;
          }
        });
        fd.append(
          "order_payment_methods",
          final_order_amount == 0 ? "" : JSON.stringify(this.multipaymentList)
        );
        // fd.append('order_tip', this.orderdetail.order_tip);
        fd.append(
          "pay_thru_wallet",
          this.orderdetail.is_wallet == true ? "1" : "0"
        );
        fd.append("wallet_amount", this.orderdetail.wallet_amount);
      } else {
        fd.append(
          "payment_mode",
          final_order_amount == 0 ? "" : this.paymentMethod.payment_method_id
        );
        fd.append("transaction_id", this.orderdetail.transaction_id);
        // fd.append('order_tip', this.orderdetail.order_tip);
        fd.append(
          "pay_thru_wallet",
          this.orderdetail.is_wallet == true ? "1" : "0"
        );
        fd.append("wallet_amount", this.orderdetail.wallet_amount);
      }
    }
    if (Number(this.orderdetail.refund_wallate_thru) > 0) {
      fd.append(
        "refund_wallet_amount",
        Number(this.orderdetail.refund_wallate_thru).toFixed(2)
      );
    }

    if (Number(this.orderdetail.refund_online_thru) > 0) {
      fd.append(
        "refund_amount",
        Number(this.orderdetail.refund_online_thru).toFixed(2)
      );
    }
    fd.append("order_status", this.selectedOrderStatus.value);
    if (this.orderdetail.delivery_type != 5) {
      if (
        this.orderdetail.payment_method_name == null ||
        this.orderdetail.payment_method_name == undefined ||
        this.orderdetail.payment_method_name == ""
      ) {
        if (
          Number(this.orderdetail.OriginalWalletAmount) <
          Number(this.orderdetail.OriginalOrderAmount)
        ) {
          this.toastr.error(
            this.translate.instant(
              "ORDER_AMOUNT_FOR_CANNOT_BE_GREATER_THAN_THE_AMOUNT_PAID_BY_WALLET"
            )
          );
          return;
        }
      }
    }

    if (this.orderdetail.method_type_val == 3) {
      if (
        Number(this.orderdetail.OriginalOnlineAmount) <
        Number(this.orderdetail.order_amount)
      ) {
        this.toastr.error(
          this.translate.instant(
            "ORDER_AMOUNT_FOR_CANNOT_BE_GREATER_THAN_THE_AMOUNT_PAID_BY_ONLINE"
          )
        );
        return;
      }
    }
    var dateValidation = true;
    if (this.rejectOrderDropdown == true) {
      if (this.selectedRejectedResion) {
        fd.append("reason_id", this.selectedRejectedResion.reason_id);
        this.updateOrderStatus(fd);
      } else {
        this.toastr.error(this.translate.instant("SELECT_REASON"));
        return;
      }
    } else if (this.outForDeliveryDivShow == true) {
      dateValidation = this.returnDateValidation();
      if (dateValidation) {
        if (this.delivery_model <= 2) {
          fd.append(
            "remarks_for_deliveryboy",
            this.orderdetail.remarks_for_deliveryboy == null
              ? ""
              : this.orderdetail.remarks_for_deliveryboy
          );
          fd.append("deliveryboy_id", this.selectedDeliveryBoy.user_id ? this.selectedDeliveryBoy.user_id : '');
        } else {
          fd.append(
            "delivery_notes",
            this.orderdetail.delivery_notes == null
              ? ""
              : this.orderdetail.delivery_notes
          );
          fd.append(
            "tracking_url",
            this.orderdetail.tracking_url == null
              ? ""
              : this.orderdetail.tracking_url
          );
        }

        this.ItemUpdateBindDormData(fd);

        this.revisedDateTimeBindFormData(fd);
        this.manageOrderStatus(fd);
      } else {
        return false;
      }
    } else if (this.DeliveryDivShow == true) {
      if (this.new_pod_images.length > 0) {
        for (var i = 0; i < this.new_pod_images.length; i++) {
          fd.append("pod_images[]", this.new_pod_images[i]);
        }
      } else {
        if (this.is_pod_mandatory == "1") {
          this.toastr.error(
            this.translate.instant("PLEASE_SELECT_PROOF_OF_DELIVERY_IMAGE")
          );
          return;
        }
      }

      if (this.orderdetail.method_type_val == 2) {
        if (this.orderdetail.pod_payment == false) {
          this.toastr.error(this.translate.instant("SELECT_PAYMENT_RECEIVED"));
          return;
        }
      }

      fd.append(
        "pod_delivery_location",
        this.selectedDeliveryLocation.pod_location_id != 0
          ? this.selectedDeliveryLocation.pod_location_name
          : ""
      );
      fd.append(
        "pod_notes",
        this.orderdetail.pod_notes == null ? "" : this.orderdetail.pod_notes
      );
      fd.append(
        "pod_payment",
        this.orderdetail.pod_payment == true ? "1" : "0"
      );
      this.updateOrderStatus(fd);
    } else if (this.UnDeliveredResionDivShow == true) {
      dateValidation = this.returnDateValidation();
      if (dateValidation) {
        if (this.selectedUnDeliveredResion) {
          this.ItemUpdateBindDormData(fd);
          fd.append("reason_id", this.selectedUnDeliveredResion.reason_id);
          this.revisedDateTimeBindFormData(fd);
          this.manageOrderStatus(fd);
        } else {
          this.toastr.error(this.translate.instant("SELECT_REASON"));
          return;
        }
      } else {
        return false;
      }
    } else if (this.CancellationResionDivShow == true) {
      if (this.selectedCancellationReson) {
        fd.append("reason_id", this.selectedCancellationReson.reason_id);
        this.updateOrderStatus(fd);
      } else {
        this.toastr.error(this.translate.instant("SELECT_REASON"));
        return;
      }
    } else if (this.readyForPicupDivShow == true) {
      dateValidation = this.returnDateValidation();
      if (dateValidation) {
        this.ItemUpdateBindDormData(fd);
        this.revisedDateTimeBindFormData(fd);
        this.manageOrderStatus(fd);
      } else {
        return false;
      }
    } else if (this.acceptOrderDivShow == true) {
      dateValidation = this.returnDateValidation();
      if (dateValidation) {
        fd.append(
          "remarks_for_customer",
          this.orderdetail.messageForCustomer == undefined
            ? ""
            : this.orderdetail.messageForCustomer
        );
        this.ItemUpdateBindDormData(fd);

        this.revisedDateTimeBindFormData(fd);
        this.manageOrderStatus(fd);
      } else {
        return false;
      }
    } else {
      if (this.orderdetail.delivery_type == 5) {
        this.ItemUpdateBindDormData(fd);
        dateValidation = true;
        fd.append("is_dine_in", "1");
      } else {
        dateValidation = this.returnDateValidation();
      }
      if (dateValidation) {
        this.revisedDateTimeBindFormData(fd);
        if (this.orderdetail.delivery_type == 5) {
          this.manageOrderStatus(fd);
        } else {
          this.updateOrderStatus(fd);
        }
      } else {
        return false;
      }
    }
  }

  manageOrderStatus(data: any) {
    this.orderService.manageOrderStatus(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
          this.router.navigate([`/order`]);
        } else {
          this.toastr.error(response.message)
        }
      },
    });
  }

  updateOrderStatus(data: any) {
    this.orderService.updateOrderStatus(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
          this.router.navigate([`/order`]);
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }

  getOrderStatus() {
    if (this.is_revise_time_error) {
      this.toastr.error(this.translate.instant("Please select Revised Time"));
      return
    }

    if(this.selectedOrderStatus.value == 6 && this.selectedRejectedResion == ''){
      this.toastr.error(this.translate.instant("Please select Rejection reason"));
      return
    }

    if(this.selectedOrderStatus.value == 8 && this.selectedCancellationReson == '' ){
      this.toastr.error(this.translate.instant("Please select Cancellation reason"));
      return
    }

    if(this.selectedOrderStatus.value == 7 && this.selectedUnDeliveredResion == '' ){
      this.toastr.error(this.translate.instant("Please select Undelivered reason"));
      return
    }
    this.spinner.show()
    var data = {
      order_id: this.orderId
    }
    this.orderService.get_order_status(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (response.data.order_status <= this.selectedOrderStatus.value) {
            this.ManageOrderDetails()
            this.spinner.hide()
          } else if ((response.data.order_status == 7 && this.selectedOrderStatus.value == 4) || (response.data.order_status == 7 && this.selectedOrderStatus.value == 5)) {
            this.ManageOrderDetails()
            this.spinner.hide()
          }
          else {
            this.toastr.error('Select valid status.');
            this.spinner.hide()
          }
          setTimeout(() => {
            this.map_order_details_page.emit();
          }, 2000);
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error(err) {
        this.toastr.error(this.translate.instant(err));
      },
    });
  }

  ManageOrderDetails() {
    if (this.selectedOrderStatus.value == 2 && this.order_process_on_less_stock == 1) {
      var flag = false
      this.selecteditems.forEach(element => {
        if (element.stockLess == true) {
          flag = true
        }
      });
      if (flag) {
        var note = "<ul><li>Order cannot be processed as Ordered Quantity is greater than Current Stock Balance. Adjust the ordered quantity as per the stock before processing the order.</li><li>Item with stock issue are:</li><br><li>1. Items marked in Red (if any)</li></ul>"
        this.toastr.error(note)
        return
      }
    }
    if (this.isOrderDetailChnage == true) {
      Swal.fire({
        title: this.translate.instant("ARE_YOU_SURE"),
        text: this.translate.instant("SURE_TO_PROCEED_ORDER"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: this.translate.instant("YES"),
        cancelButtonText: this.translate.instant("NO"),
      }).then((result) => {
        if (result.value) {
          this.UpdateOrderStatus();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
    } else {
      this.UpdateOrderStatus();
    }
  }

  // ManageOrderDetails() {
  //   if (this.selectedOrderStatus.value == 2 && this.order_process_on_less_stock == 1) {
  //     var flag = false
  //     this.selecteditems.forEach(element => {
  //       if (element.stockLess == true) {
  //         flag = true
  //       }
  //     });
  //     if (flag) {
  //       var note = "<ul><li>Order cannot be processed as Ordered Quantity is greater than Current Stock Balance. Adjust the ordered quantity as per the stock before processing the order.</li><li>Item with stock issue are:</li><br><li>1. Items marked in Red (if any)</li></ul>"
  //       this.toastr.error(note)
  //       return
  //     }
  //   }
  //   if (this.isOrderDetailChnage == true) {
  //     Swal.fire({
  //       title: this.translate.instant("ARE_YOU_SURE"),
  //       text: this.translate.instant("SURE_TO_PROCEED_ORDER"),
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonColor: "#DD6B55",
  //       confirmButtonText: this.translate.instant("YES"),
  //       cancelButtonText: this.translate.instant("NO"),
  //     }).then((result) => {
  //       if (result.value) {
  //         this.UpdateOrderStatus();
  //       } else if (result.dismiss === Swal.DismissReason.cancel) {
  //       }
  //     });
  //   } else {
  //     this.UpdateOrderStatus();
  //   }
  // }

  removeItemOnOrder(removeItem) {
    var filterData = this.selecteditems.filter((item) => item.item_variants_id !== removeItem.item_variants_id);
    var deleted_item: any = this.selecteditems.filter((item) => item.item_variants_id == removeItem.item_variants_id);
    var deleted_item_price: any = 0;
    var deleted_item_packing_price: any = 0;
    deleted_item.forEach(element => {
      deleted_item_price = Number(Number(Number(deleted_item_price) + Number(element.price)) * Number(element.quantity));
      deleted_item_packing_price = Number(Number(Number(deleted_item_packing_price) + Number(element.packaging)) * Number(element.quantity));
    });
    if (filterData.length > 0) {
      this.selecteditems = filterData;
      this.packagingCharges = Number(
        Number(this.packagingCharges) -
        Number(deleted_item_packing_price)
      ).toFixed(2);

      this.orderdetail.item_total = Number(
        Number(this.orderdetail.item_total) -
        Number(deleted_item_price)
      ).toFixed(2);

      //All Item Text Calculation start
      if (this.orderdetail.offer_code) {
        if (
          this.orderdetail.sub_offer_type_id != 4 &&
          this.orderdetail.sub_offer_type_id != 5 &&
          this.orderdetail.sub_offer_type_id != 13
        ) {
          this.taxtCalculation();
        }
      } else {
        this.taxtCalculation();
      }
      //All Item Text Calculation End

      this.OrderAmountCalculation();
    } else {
      this.toastr.error(
        this.translate.instant("ORDER_NEEDS_TO_CONTAIN_MINIMUM_ONE_ITEM")
      );
    }
  }

  addmultipayment(item) {
    if (item.paymentMethod == "") {
      this.toastr.error(this.translate.instant("SELECT_PAYMENT_METHOD"));
      return;
    }
    if (item.amount == "") {
      this.toastr.error(this.translate.instant("ENTER_AMOUNT"));
      return;
    }
    var overlimit: any = false;
    var name = "";
    var amount = 0.0;
    var final_order_amount =
      this.orderdetail.is_wallet == true
        ? this.orderdetail.order_amount
        : this.orderdetail.OriginalOrderAmount;
    this.multipaymentList.forEach((item) => {
      if (item.paymentMethod) {
        if (
          item.paymentMethod.multipayment_allowed == 1 &&
          item.payment_overlimit == true
        ) {
          overlimit = true;
          name = item.paymentMethod.pos_method_name;
        }
        if (item.paymentMethod.multipayment_allowed == 0) {
          if (
            parseFloat(item.paymentMethod.max_order_value) > 0 &&
            parseFloat(item.amount) >
            parseFloat(item.paymentMethod.max_order_value)
          ) {
            overlimit = true;
            name = item.paymentMethod.pos_method_name;
          }
        }
        amount = amount + Number(item.amount);
      }
    });

    if (overlimit == true) {
      this.toastr.error(
        this.translate.instant(
          "MAX_LIMIT_FOR_PAYMENT_METHOD (" + name + ") HAS_EXCEEDED"
        )
      );
      return;
    }
    var data = {
      paymentMethod: "",
      payment_transaction_id: "",
      amount: Number(""),
    };
    this.multipaymentList.push(data);
  }

  clearStartDate() {
    this.date.revisedDateTime = null;
    $('.startdate').val('')
  }

  cancelClick() {
    history.back();
  }

  stockCheck(item) {
    // this.stockLess = false
    if (this.orderdetail.order_status == 1 && Number(item.quantity) > Number(item.current_stock) && item.stock_management_method == 3) {
      item.stockLess = true
      return 'stock-less'
    } else if (this.orderdetail.order_status == 1 && item.stock_management_method == 2) {
      if ((Number(item.quantity) * Number(item.out_stock_qty)) > Number(item.current_stock)) {
        item.stockLess = true
        return 'stock-less'
      } else {
        item.stockLess = false
        return ''
      }
    } else if (this.orderdetail.order_status == 1 && item.current_stock == 'Out' && item.stock_management_method == 1) {
      item.stockLess = true
      return 'stock-less'
    }
    else {
      item.stockLess = false
      return ''
    }
  }

  open_img_view(multiple_img, item_name) {
    var images: any = [];
    var single_img = 'assets/img/restaurant04.png'
    if (multiple_img == undefined) {
      var img = {
        image: single_img
      }
      images[0] = img
    } else {
      images[0] = {
        image: multiple_img
      }
    }
    const modalRef = this.modalService.open(ViewMultipleImageComponent, {
      size: "md",
    });
    modalRef.componentInstance.images = images;
    modalRef.componentInstance.item_name = item_name;
  }

  editQuntity(item) {
    if (item.quantity == 0) {
      item.quantity = item.originalQuantity
    }
    if (item.originalQuantity < item.quantity) {
      var count = Number(item.quantity) - item.originalQuantity
      item.editedCount = count
      item.quantity = Number(item.quantity) - 1
      this.incrementValue(item, item.addons, item.choices)
    }
    if (item.originalQuantity > item.quantity) {
      var count = Number(item.originalQuantity) - Number(item.quantity)
      item.editedCount = count
      item.quantity = Number(item.quantity) + 1
      this.decrementValue(item, item.addons, item.choices)
    }
  }

  enabledInputFiled(item) {
    item.originalQuantity = item.quantity
  }

  checUniqueItem(selectedItem) {
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
    this.selecteditems = selectedItem;
  }
  openOrderDetailsOrderWise() {
    this.ngOnInit();
  }
  editCustomer(cid, customerUserId) {
    this.cryptoService.encryptIdValue(
      cid.toString(),
      "customer_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.encryptIdValue(
      customerUserId?.toString(),
      "customer_User_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    window.open('/manage-customer/edit', "_blank");
  }

  orderLocationClick(googleMap?: any) {
    if (this.generalSetting.use_google_map == 1) {
      if (googleMap.delivery_type == 1 || googleMap.delivery_type == 4) {
        this.mapLink =
          'https://www.google.com/maps/search/?api=1&query=' +
          googleMap?.to_latitude +
          ',' +
          googleMap?.to_longitude;
      }

      if (googleMap.delivery_type == 2) {
        this.mapLink =
          'https://www.google.com/maps/search/?api=1&query=' +
          googleMap?.from_latitude +
          ',' +
          googleMap?.from_longitude;
      }

    }

  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
