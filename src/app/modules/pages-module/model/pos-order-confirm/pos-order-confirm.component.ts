import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { OrderService } from "src/app/services/order.service";
import * as moment from "moment";
import { AddOrderService } from 'src/app/services/add-order.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pos-order-confirm',
  templateUrl: './pos-order-confirm.component.html',
  styleUrls: ['./pos-order-confirm.component.scss']
})
export class PosOrderConfirmComponent implements OnInit, OnDestroy {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  global_currency: any;
  order_amount: any = 0.00;
  wallet_amount: any = 0.0;
  grandtotal: any = 0;
  selecteditemsqty: number = 0;
  receive_amount: any = 0.00;
  paymentMethod: any;
  balance_due: any = 0.0;
  itemtotal: any = 0.00;
  cus_Amount: any;
  ordeconfirm = {
    bill_type: "2",
    payment_transaction_id: null
  }
  paymentM;
  multipaymentList: any = [];
  mainpaymentMethodList: any = [];
  temp_paymentMethodList: any = [];
  paymentMethodList: any = [];
  settings: any = {};
  main: any;
  SelectedItems: any = [];
  sellerDetails: any;
  offer_code;
  offerPrice: any = 0.00;
  deliverycharge: any = 0;
  packagingCharges: any = 0;
  taxPrice: any = 0.00;
  newSellerOrder: any;
  is_cart: any;
  cart_group_id: any;
  @Output() _printData: EventEmitter<any> = new EventEmitter<any>();

  customerdetails: any;
  private destroy$ = new Subject();
  transaction_details: any;
  transaction_id: any;
  transaction_url: any;
  orderdetail: any;
  orderitemdetail: any;
  style_obj_pos_order_confirm: any;
  amount_seperator = this.generalSetting.amount_seperator;
  show_price_same_font = this.generalSetting.show_price_same_font;
  constructor(
    public modal: NgbActiveModal,
    private translate: TranslateService,
    private toastr: ToastrService,
    private OrderService: OrderService,
    private addOrderService: AddOrderService,
    private router: Router,
    public commonService: CommonService

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.customerdetails = JSON.parse(localStorage.getItem("customerdetails"));
  }

  ngOnInit(): void {
    this.style_obj_pos_order_confirm = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.multipaymentList = [];
    var data = {
      paymentMethod: null,
      payment_transaction_id: null,
      amount: null

    }
    this.multipaymentList.push(data);
  }

  itemPricecount(a, b) {
    var c = Number(Number(a) + Number(b)).toFixed(2)
    return c
  }

  priceFormatter(value: any) {
    if (value) {
      var price = value.toString().split(".")[0];
      var decimal = value.toString().split(".")[1];
      if (this.show_price_same_font == 1) {
        return this.global_currency + price + this.amount_seperator + decimal;
      } else {
        return this.global_currency + price + "<span class='price-decimal'><small><b>" + this.amount_seperator + decimal + "</b></small></span>";
      }
    } else {
      return '0';
    }
  }

  add_cus_Amount(amount) {
    if (this.wallet_amount > 0) {
      this.balance_due = Number(Number(amount) - Number(this.order_amount)).toFixed(2)
    } else {
      this.balance_due = Number(Number(amount) - Number(this.grandtotal)).toFixed(2)
    }

  }

  getSelectedPaymentMethod(item, boolean?) {
    this.paymentMethod = item;
    this.paymentM.selected = item;
    if (boolean != 'true') {
      if (item.name == 'Multiple') {
        var data = {
          paymentMethod: '',
          payment_transaction_id: '',
          amount: ''

        }
        this.multipaymentList = [];
        this.temp_paymentMethodList = [];
        this.multipaymentList.push(data);
        if (this.mainpaymentMethodList) {
          this.mainpaymentMethodList.forEach((item: any) => {
            item.added = 0;
          });
        }
      }
    }
  }

  on_slect_payment(Item) {
    this.mainpaymentMethodList = this.paymentMethodList.filter(x => x.name !== 'Multiple');
    this.temp_paymentMethodList = [];

    this.mainpaymentMethodList.forEach((item: any) => {
      this.multipaymentList.forEach((eventt: any) => {
        if (eventt.paymentMethod) {
          if (eventt.paymentMethod.id == item.id) {
            if (item.multipayment_allowed == 0) {
              item.added = 1;
            }
          }
        }
      });
    });

    this.mainpaymentMethodList.forEach((item: any) => {
      if (Item.paymentMethod?.id == item.id) {
        item.added = 0
      }
    });

    this.mainpaymentMethodList.forEach((item: any) => {
      if (item.added != 1) {
        this.temp_paymentMethodList.push(item)
      }
    });

    var amount = 0.00;
    this.multipaymentList.forEach((item: any) => {
      if (item.paymentMethod) {
        amount = amount + Number(item.amount)
      }
    });

    if (this.wallet_amount > 0) {
      this.balance_due = Number(Number(this.order_amount) - Number(amount)).toFixed(2)
    } else {
      this.balance_due = Number(Number(this.grandtotal) - Number(amount)).toFixed(2)
    }
  }

  change_due_amount() {
    var amount = 0.00;
    var ids = [];
    var paid_amount: any = 0.00;

    this.multipaymentList.forEach((item: any) => {
      if (item.paymentMethod) {
        item.payment_overlimit = false
        var found = ids.filter(x => x == item.paymentMethod.id)[0]
        if (found == undefined) {
          ids.push(item.paymentMethod.id)
          if (parseFloat(item.paymentMethod.maxordervalue) > 0 && parseFloat(item.amount) > parseFloat(item.paymentMethod.maxordervalue)) {
            item.payment_overlimit = true
          } else {
            item.payment_overlimit = false
          }
        } else {
          var a = this.multipaymentList.filter(x => x.paymentMethod.id == found)
          a.forEach((event: any) => {
            paid_amount = Number(Number(paid_amount) + Number(event.amount)).toFixed(2)
            if (parseFloat(event.paymentMethod.maxordervalue) > 0 && parseFloat(paid_amount) > parseFloat(event.paymentMethod.maxordervalue)) {
              item.payment_overlimit = true
            } else {
              item.payment_overlimit = false
            }
          });
        }
        amount = amount + Number(item.amount)

      }
    });

    this.receive_amount = Number(amount).toFixed(2)
    if (this.wallet_amount > 0) {
      this.balance_due = Number(Number(this.order_amount) - Number(amount)).toFixed(2)
    } else {
      this.balance_due = Number(Number(this.grandtotal) - Number(amount)).toFixed(2)
    }
  }

  removesupplier(element) {
    this.paymentMethodList.forEach((item: any) => {
      if (element.paymentMethod.id == item.id) {
        item.added = 0
      }
    });
  }

  addmultipayment(item) {
    if (!item.paymentMethod || item.paymentMethod == '') {
      this.toastr.error(this.translate.instant("Select Payment Method"));
      return
    }
    if (!item.amount || item.amount == '') {
      this.toastr.error(this.translate.instant("Enter Amount"));
      return
    }

    var name = '';
    var overlimit: any = false;
    this.multipaymentList.forEach((item: any) => {
      if (item.paymentMethod) {
        if (item.paymentMethod.multipayment_allowed == 1 && item.payment_overlimit == true) {
          overlimit = true
          name = item.paymentMethod.name.split('(')[0]
          name = name.split(' ')[0]
        }
        if (item.paymentMethod.multipayment_allowed == 0) {
          if (parseFloat(item.paymentMethod.maxordervalue) > 0 && parseFloat(item.amount) > parseFloat(item.paymentMethod.maxordervalue)) {
            name = item.paymentMethod.name.split('(')[0]
            name = name.split(' ')[0]
            overlimit = true
          }
        }
      }
    });

    if (overlimit == true) {
      this.toastr.error(this.translate.instant('Max limit for Payment Method (' + name + ') has exceeded'));
      return;
    }

    var data = {
      paymentMethod: null,
      payment_transaction_id: null,
      amount: null
    }
    this.multipaymentList.push(data);
  }

  async getTransactionId() {
    var hostSSL = window.location.host == 'localhost:3000' ? 'http://' : 'https://';
    var data = {
      user_id: this.main.LoggedUserInfo.user_id,
      store_id: this.main.LoggedUserStoreInfo.store_id,
      amount: this.grandtotal,
      payment_method_id: this.paymentMethod.id,
      source: 1,
      call_back_url: hostSSL + window.location.host + '/pos/add-pos/',
    }

    await this.OrderService.getTransactionId(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.transaction_details = response.data;
            this.transaction_id = this.transaction_details.transaction_id;

            this.transaction_url = this.transaction_details.transaction_url;
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (err) => { },
        complete: () => { },
      });
  }

  confirm_order() {
    if (this.settings.pos_allowed == 0) {
      this.toastr.error(this.translate.instant("POS module is disabled."));
      return;
    }
    if (this.order_amount != 0) {
      if (this.paymentMethod.id == 4 || this.paymentMethod.id == 5) {
        this.getTransactionId();
      }
      else {
        this.submitOrder()
      }
    }
    else {
      this.submitOrder()
    }
  }

  async submitOrder() {
    this.SelectedItems.forEach((element: any) => {
      delete element.discountedprice;
    });

    var odate = moment(new Date()).format(this.main.DateFormate.split(' ')[0]);
    this.SelectedItems = this.SelectedItems.filter(item => item.quantity != 0);

    if (this.paymentMethod) {
      if (this.paymentMethod.name == 'Multiple') {
        var overlimit: any = false;
        var namemethod = [];
        var name = '';

        this.multipaymentList.forEach((item: any) => {
          if (item.paymentMethod) {
            if (item.paymentMethod.multipayment_allowed == 1 && item.payment_overlimit == true) {
              overlimit = true
              name = item.paymentMethod.name.split('(')[0]
              name = name.split(' ')[0]
              namemethod.push(name)

            }
            if (item.paymentMethod.multipayment_allowed == 0) {
              if (parseFloat(item.paymentMethod.maxordervalue) > 0 && parseFloat(item.amount) > parseFloat(item.paymentMethod.maxordervalue)) {
                overlimit = true
                name = item.paymentMethod.name.split('(')[0]
                name = name.split(' ')[0]
                namemethod.push(name)
              }
            }
          }
        });

        if (overlimit == true) {
          this.toastr.error(this.translate.instant('Max limit for Payment Method (' + namemethod.toString() + ') has exceeded'));
          return;
        }

        if (this.balance_due > 0) {
          this.toastr.error(this.translate.instant('Pending Amount of ' + this.global_currency + this.balance_due + ' is Due.'));
          return;
        }
        if (0 > this.balance_due) {
          this.toastr.error(this.translate.instant("Amount received is more than Bill Amount"));
          return;
        }
      }
    }

    var fd = new FormData();

    fd.append('user_id', this.main.LoggedUserInfo.user_id);
    fd.append('customer_user_id', this.customerdetails.customer_user_id == 0 ? this.generalSetting.guest_user_id : this.customerdetails.customer_user_id);
    fd.append('store_id', this.sellerDetails.store_id);
    fd.append('date', odate);
    fd.append('items', JSON.stringify(this.SelectedItems));
    fd.append('amount', this.grandtotal);
    fd.append('transaction_id', this.transaction_id);
    if (this.paymentMethod) {
      if (this.paymentMethod.name == 'Multiple') {
        this.multipaymentList.forEach((item: any) => {
          item.payment_method_id = item.paymentMethod.id;
        });
        fd.append('order_payment_methods', JSON.stringify(this.multipaymentList));
      }
      else {
        fd.append('payment_method_id', this.paymentMethod.id);
        fd.append('payment_transaction_id', this.ordeconfirm.payment_transaction_id);
      }
    }

    if (this.offer_code) {
      fd.append('offer_code', this.offer_code);
      fd.append('offer_discount', this.offerPrice);
    }

    var order_type: any = 3;
    var is_scheduled: any = 0;
    fd.append('email', this.customerdetails.email);
    fd.append('delivery_charges', this.deliverycharge);
    fd.append('order_type', order_type);
    fd.append('is_scheduled', is_scheduled);
    fd.append('packaging_cost', this.packagingCharges);
    fd.append('order_tax', this.taxPrice);
    fd.append('wallet_amount', this.wallet_amount);
    var one: any = 1;
    var zero: any = 0;
    fd.append('pay_thru_wallet', this.newSellerOrder.apply_Wallet == true ? one : zero);
    if (this.is_cart = true) {
      fd.append('cart_group_id', this.cart_group_id);
      var cart_type: any = 3;
      fd.append('cart_type', cart_type);
    }

    var data = fd;
    await this.addOrderService
      .addSellerCustomerOrder(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(this.translate.instant("Order placed successfully"));
            this.orderdetail = response.data
            this.sellerDetails.fullAddress = [this.orderdetail.store.store_address, this.orderdetail.store.store_address2, this.orderdetail.store.area_name, this.orderdetail.store.city_name, this.orderdetail.store.state_name, this.orderdetail.store.zipcode, this.orderdetail.store.country_name].filter(Boolean).join(", ");
            this.orderitemdetail = this.SelectedItems;
            if (this.ordeconfirm.bill_type == "2") {
              var temp_data: any = {};
              temp_data.orderdetail = this.orderdetail;
              temp_data.fullAddress = this.sellerDetails.fullAddress;
              temp_data.orderitemdetail = this.orderitemdetail;
              temp_data.itemtotal = this.itemtotal;
              temp_data.orderdetail.final_amount = this.balance_due;
              this._printData.emit(temp_data);
              this.modal.dismiss();
            } else {
              this.modal.dismiss();
              this.router.navigate(["/pos/"]);
            }
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (err) => { },
        complete: () => { },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
