import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RefundinfoComponent } from '../refundinfo/refundinfo.component';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { GenerateRefundService } from 'src/app/services/generate-refund.service';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-view-refund',
  templateUrl: './view-refund.component.html',
  styleUrls: ['./view-refund.component.scss']
})
export class ViewRefundComponent implements OnInit {
  main: any;
  session: any;
  generalSetting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  global_currency = this.generalSetting.currency_symbol;
  global_timezone = this.generalSetting.timezone;
  PlatformSetting = JSON.parse(localStorage.getItem('_platform_setting'));
  business_model = this.PlatformSetting.business_model;
  sellerDetails = JSON.parse(localStorage.getItem('loginUserStore'));
  add_refund_module = false;
  view_refund_module = false
  orderId: any = undefined;
  selectedOrder: any = []
  vieworder: any = []
  oderdetaildiplayFlag = false;
  refund_no: any;
  isSuperAdmin = false
  refundorderId: any;
  refund_module: any;
  subscription_model: any
  orderdetail: any = {};
  DetailedOrder: any;
  refund_delivery_amount: any = 0;
  payment_type: any
  selecteditems = [];
  prescription: any = 0
  ItemTotalPrice: any;
  date: any = {};
  taxAndChargesTotalToolTip: any = '';

  orderStatusList: any = [
    { label: this.translate.instant('ORDER_PENDING'), value: 1 },
    { label: this.translate.instant('ORDER_ACCEPTED'), value: 2 },
    { label: this.translate.instant('ORDER_READY_FOR_PICKUP'), value: 3 },
    { label: this.translate.instant('ORDER_OUT_FOR_DELIVERY'), value: 4 },
    { label: this.translate.instant('ORDER_DELIVERED'), value: 5 },
    { label: this.translate.instant('ORDER_REJECTED'), value: 6 },
    { label: this.translate.instant('ORDER_UNDELIVEREDED'), value: 7 },
    { label: this.translate.instant('ORDER_CANCELLED'), value: 8 },
  ];
  selectedOrderStatus = this.orderStatusList[0];
  show_price_same_font: any;
  amount_seperator: any;

  constructor(
    public translate: TranslateService,
    private modalService: NgbModal,
    private appComponent: AppComponent,
    private generateRefundServices: GenerateRefundService,
    private toastr: ToastrService,
    private cryptoService: CryptoService,
    private router: Router,
    public commonService: CommonService

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    this.session = this.appComponent.sessionConfig()
    this.main.LoggedUserInfo = JSON.parse(
      this.session.getSessionLoginUser()
    );
    this.main.LoggedUserInfoStore = this.session.getSessionLoginUserStore();
    this.PlatformSetting = this.PlatformSetting == null ? this.main.platform_setting : this.PlatformSetting;
    this.generalSetting = this.generalSetting == null ? this.main : this.generalSetting;
    this.subscription_model = this.PlatformSetting.subscription_model;
    this.refund_module = this.generalSetting.refund_module;
    this.show_price_same_font = this.generalSetting.show_price_same_font;
    this.amount_seperator = this.generalSetting?.amount_seperator;
    if (Number(this.refund_module) != 0) {
      if (this.main.LoggedUserInfo.role_id == 6 || this.main.LoggedUserInfo.role_id == 1) {
        this.refund_module = ((this.subscription_model == 2 || this.subscription_model == 3) && this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6) ? true : ((this.subscription_model == 2 || this.subscription_model == 3) && (this.business_model == 2 || this.business_model == 3) && this.main.LoggedUserInfo.role_id == 1) ? true : false;
        this.add_refund_module = true;
      }
      else {
        this.add_refund_module = this.subscription_model == 1 ? true : false;
        this.view_refund_module = this.subscription_model != 1 ? true : false;
      }
    }

    if (this.main.LoggedUserInfo.role_id == this.main.UserRole.SuperAdmin || this.main.LoggedUserInfo.role_id == this.main.UserRole.Admin) {
      this.isSuperAdmin = true;
    }

    this.main.DateFormate = this.main.DateFormate != this.generalSetting.date_format_web ? this.generalSetting.date_format_web : this.main.DateFormate;

    if (this.isSuperAdmin == true) {
      this.refundorderId = this.session.decryptIdValue("order_cancellation_id" + this.main.LoggedUserInfo.role_id?.toString(), this.main.CryptoKey);
      this.session.clearCookie('order_cancellation_id' + this.main.LoggedUserInfo.role_id.toString());
    }
    else {
      this.refundorderId = this.session.decryptIdValue('order_cancellation_id' + this.sellerDetails.store_id?.toString(), this.main.CryptoKey);
      this.session.clearCookie('order_cancellation_id' + this.sellerDetails.store_id?.toString());
    }

    if (this.refundorderId != undefined) {
      this.getRefundOrderDetails()
    }
    else {
      this.router.navigate["/generate-refund"]
    }
  }

  refundOrderDetails = {
    refund_remarks: "",
    refund_tax: '0.00',
    refundQuantity: '0.00',
    refund_item_total: '0.00',
    refund_deliverycharge: '0.00',
    refund_taxcharge: '0.00',
    refund_offerPromo: '0.00',
    refund_discount: '0.00',
    refund_tip: '0.00',
    refund_Ordertotal: '0.00',
    afterDiscountPrice: '0.00',
    refund_packcharge: '0.00',
    packaging_per_order: '0.00',
    packaging_cost: '0.00',
    refund_way: 0,
    refund_date: new Date(),
  };


  DateFormateFromServerSide() {
    return this.main.DateFormate;
  }
  DateFormateFromServerSideOnlyDateReturn() {
    return this.generalSetting.date_format_web.split(" ")[0];
  }

  getRefundOrderDetails() {
    var data = {
      order_cancellation_id: this.refundorderId,
    }
    this.generateRefundServices.getRefundOrderDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.vieworder = response.data

          if (this.vieworder != null) {
            this.vieworder.items?.forEach(Item => {
              if (Item != undefined) {
                var refund_total = Number(Number(Item.item_quantity) * Number(Item.price)).toFixed(2)
                this.refundOrderDetails.refund_item_total = Number(Number(this.refundOrderDetails.refund_item_total) + Number(refund_total)).toFixed(2)
                Item.item_quantity = Number(Item.item_quantity).toFixed(0);
              }
            });
          }

          this.refundOrderDetails.refund_deliverycharge = Number(this.vieworder.delivery_charges).toFixed(2);
          this.refundOrderDetails.refund_tax = Number(Number(this.vieworder.order_tax)).toFixed(2);
          this.refundOrderDetails.packaging_per_order = Number(this.vieworder.packaging_per_order).toFixed(2);
          this.refundOrderDetails.packaging_cost = Number(this.vieworder.packaging_cost).toFixed(2);
          this.refundOrderDetails.refund_offerPromo = Number(this.vieworder.offer_discount).toFixed(2);
          this.refundOrderDetails.refund_discount = Number(this.vieworder.discount).toFixed(2);
          this.refundOrderDetails.refund_tip = Number(this.vieworder.order_tip).toFixed(2);
          this.refundOrderDetails.refund_Ordertotal = Number(this.vieworder.refund_amount).toFixed(2);
          this.refundOrderDetails.refund_date = this.vieworder.refund_date;
          this.vieworder.refund_remarks = this.vieworder.refund_remarks == null || this.vieworder.refund_remarks == undefined ? '' : this.vieworder.refund_remarks;
          this.refundOrderDetails.refund_remarks = [this.vieworder.refund_remarks, this.vieworder.payment_remarks].filter(Boolean).join(". ");
          this.refund_no = this.vieworder.refund_no;
          this.PageLoadData(Number(this.vieworder.order_id).toFixed(0))
        }
        else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }
  /** Add refund using orderid */
  addRefundUsingOrder(orderId) {
    if (this.isSuperAdmin == true) {
      this.session.encryptIdValue(orderId.toString(), 'order_id' + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
    }
    else {
      this.session.encryptIdValue(orderId.toString(), 'order_id' + this.sellerDetails.store_id.toString(), this.main.CryptoKey);
    }
    this.router.navigate(["/generate-refund/edit-refund/"]);
  }

  openinfomodel(storeorderstatistics) {
    const modalRef = this.modalService.open(RefundinfoComponent, {
      size: "lg-600",
    });
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
  /** Get order details using service */
  PageLoadData(orderId) {
    var data = {
      order_id: orderId,
    }
    this.generateRefundServices.getOrderDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.DetailedOrder = response.data;
          this.orderDetailBinding(this.DetailedOrder);
        }
        else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }
  /** Order details bind with model */
  orderDetailBinding(details) {
    this.orderdetail = details;
    this.selectedOrder = this.orderdetail.order_no;
    this.oderdetaildiplayFlag = true;
    this.orderdetail.PaymentType = this.orderdetail.payment_method_name;
    this.orderdetail.DeliveryType = this.orderdetail.delivery_type_val;
    this.orderdetail.OrderStatus = this.orderdetail.order_status_val;
    this.orderdetail.order_amount = Number(this.orderdetail.order_amount || 0).toFixed(2);
    this.orderdetail.offer_discount = Number(this.orderdetail.offer_discount || 0).toFixed(2);
    this.orderdetail.discount = this.orderdetail.order_status == 1 ? Number(this.orderdetail.discount || 0).toFixed(2) : Number(this.orderdetail.discount || 0).toFixed(2);
    if (this.orderdetail.delivery_type == 2) {
      this.orderdetail.delivery_charges = '0.00';
    }
    this.orderdetail.delivery_charges = Number(this.orderdetail.delivery_charges || 0).toFixed(2);
    this.orderdetail.otherCharges = Number(Number(this.orderdetail.order_tax) + Number(this.orderdetail.packaging_cost)).toFixed(2);
    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.orderdetail.packaging_cost, this.orderdetail.order_tax);
    this.orderdetail.OriginalOrderAmount = Number(this.orderdetail.order_amount).toFixed(2);
    this.orderdetail.item_total = Number(Number(this.orderdetail.order_amount) - Number(this.orderdetail.delivery_charges) - Number(this.orderdetail.otherCharges) + Number(this.orderdetail.offer_discount) + Number(this.orderdetail.discount)).toFixed(2);
    this.orderdetail.order_amount = Number(this.orderdetail.order_amount - Number(this.orderdetail.wallet_amount)).toFixed(2)
    this.ItemTotalPrice = this.orderdetail.order_amount;
    this.sellerDetails = this.orderdetail.store;
    this.sellerDetails.fullAddress = [this.orderdetail.store.store_address, this.orderdetail.store.store_address2, this.orderdetail.store.area_name, this.orderdetail.store.city_name, this.orderdetail.store.state_name, this.orderdetail.store.zipcode, this.orderdetail.store.country_name].filter(Boolean).join(", ");
    this.orderdetail.IsScheduledOrder = false;

    if (this.orderdetail.delivery_type == 1) {
      if (this.orderdetail.delivery_time_type == 1) {
        if (this.orderdetail.scheduled_delivery_date == '') {

        }
        else {
          this.orderdetail.IsScheduledOrder = true;
          if (this.orderdetail.order_status != 5) {
            this.orderdetail.delivery_date = this.orderdetail.scheduled_delivery_date;
            this.date.revisedDateTime = this.orderdetail.delivery_date;
            this.date.revisedDateTimeTemp = this.orderdetail.delivery_date;
          }
        }
      }
      else {
        var OrderDate = new Date(this.orderdetail.order_date);
        if (this.orderdetail.scheduled_delivery_date == '') {
          this.orderdetail.delivery_date = this.orderdetail.delivery_date
        }
        else {
          this.orderdetail.IsScheduledOrder = true;
          this.orderdetail.delivery_date = this.orderdetail.scheduled_delivery_date;
          this.date.revisedDateTime = this.orderdetail.delivery_date;
        }

      }
    }
    else {
      if (this.orderdetail.pickup_time_type == 1) {
        if (this.orderdetail.scheduled_delivery_date == '') {

        }
        else {
          this.orderdetail.IsScheduledOrder = true;
          if (this.orderdetail.order_status != 5) {
            this.orderdetail.delivery_date = this.orderdetail.scheduled_delivery_date;
            this.date.revisedDateTime = this.orderdetail.delivery_date;
            this.date.revisedDateTimeTemp = this.orderdetail.delivery_date;
          }
        }
      }
      else {
        var OrderDate = new Date(this.orderdetail.order_date);
        if (this.orderdetail.scheduled_delivery_date == '') {
          this.orderdetail.delivery_date = new Date(OrderDate.setMinutes(OrderDate.getMinutes() + Number(this.orderdetail.pickup_to == '0' ? this.orderdetail.pickup_from : this.orderdetail.pickup_to)));
          this.date.revisedDateTime = this.orderdetail.delivery_date;
        }
        else {
          this.orderdetail.IsScheduledOrder = true;
          this.orderdetail.delivery_date = this.orderdetail.scheduled_delivery_date;
          this.date.revisedDateTime = new Date(moment(this.orderdetail.delivery_date).format(this.DateFormateFromServerSide()));
        }
      }
    }

    if (this.orderdetail.refund != null) {
      this.refund_delivery_amount = Number(Number(this.orderdetail.refund.refund_amount)).toFixed(2);
      if (this.orderdetail.wallet_amount != undefined) {
        this.orderdetail.order_amount = Number(Number(this.orderdetail.OriginalOrderAmount) - Number(this.orderdetail.wallet_amount)).toFixed(2);
        this.orderdetail.Original_order_amount = Number((Number(this.orderdetail.OriginalOrderAmount) - Number(this.orderdetail.wallet_amount)) + Number(this.orderdetail.refund.refund_amount)).toFixed(2);
      }
      else {
        this.orderdetail.order_amount = Number(Number(this.orderdetail.OriginalOrderAmount) - Number(this.orderdetail.wallet_amount)).toFixed(2);
        this.orderdetail.Original_order_amount = Number((Number(this.orderdetail.OriginalOrderAmount) - Number(this.orderdetail.wallet_amount)) + Number(this.orderdetail.refund.refund_amount)).toFixed(2);
      }
    }
    else {
      this.orderdetail.order_amount = Number(Number(this.orderdetail.OriginalOrderAmount) - Number(this.orderdetail.wallet_amount)).toFixed(2);
      this.orderdetail.Original_order_amount = Number(Number(this.orderdetail.OriginalOrderAmount) - Number(this.orderdetail.wallet_amount)).toFixed(2);
    }

    this.date.revisedDateTime = '';
    if (this.orderdetail.order_status == 1) { }

    var itemdetails = [];
    if (this.vieworder.refund_thru == 1) {
      this.payment_type = 'Payment Credit In ' + this.generalSetting.khata_label;
    }
    else if (this.vieworder.refund_thru == 2) {
      this.payment_type = 'Refund Voucher';
    }
    else if (this.vieworder.refund_thru == 3) {
      this.payment_type = 'Online Refund';
    }
    else if (this.vieworder.refund_thru == 4) {
      this.payment_type = 'Wallet';
    }
    else if (this.vieworder.refund_thru == 5) {
      this.payment_type = 'Cash';
    }

    this.vieworder.items?.forEach(Item => {

      if (this.prescription != 1) {
        this.prescription = Item.prescription;
      }
      Item.item_variants?.forEach(variant => {
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
          }
          if (variant.choices_addons != null) {
            item_data.choices_addons = variant.choices_addons;
          } else {
            item_data.choices_addons = null;
          }

          if (Item.combo_variants != null) {
            item_data.combo_variants = Item.combo_variants;
          }
          else {
            item_data.combo_variants = null;
          }
        }
      });

    });
    this.selecteditems = itemdetails;
  }

  cancelClick() {
    history.back();
  }

  taxAndChargesToolTip(global_currency, packaging_cost, order_tax) {
    if (Number(packaging_cost) > 0 && Number(order_tax) <= 0) {
      this.taxAndChargesTotalToolTip = "<div>Store Packaging Cost: " + global_currency + " " + Number(packaging_cost).toFixed(2) + "</div>";
    }
    else if (Number(order_tax) > 0 && Number(packaging_cost) <= 0) {
      this.taxAndChargesTotalToolTip = "<div>" + this.generalSetting.store_tax_label + ": " + global_currency + ' ' + Number(order_tax).toFixed(2) + '</div>';
    }
    else {
      this.taxAndChargesTotalToolTip = "<div style='width:100%;'><div style='float:left; text-align:left;'>" + this.generalSetting.store_label + " Packaging Cost: </div><div style='float:right;'> " + global_currency + " " + Number(packaging_cost).toFixed(2) + "</div> </div><div style='width:100%;clear:both;'><div style='width:calc(100% - 50px); float:left; text-align:left;'> " + this.generalSetting.store_tax_label + ": </div><div style='float:right;'>" + global_currency + ' ' + Number(order_tax).toFixed(2) + "</div>";
    }
    return this.taxAndChargesTotalToolTip;
  }
  openimage(order_image) {

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
