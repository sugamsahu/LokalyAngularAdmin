import {
  Component,
  OnInit,
  Output,
  ChangeDetectorRef,
  EventEmitter,
  Input,
} from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { CustomerService } from "src/app/services/customer.service";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import { UntypedFormGroup } from "@angular/forms";
import { CommonService } from "src/app/services/common.service";
import { OrderService } from "src/app/services/order.service";
import { OrderDetailsModalComponent } from "../order-details/order-details.component";
import { PaymentDetailComponent } from "../payment-detail/payment-detail.component";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-customer-details",
  templateUrl: "./customer-details.component.html",
  styleUrls: ["./customer-details.component.scss"],
})
export class customerDetailComponent implements OnInit {
  @Output() shareURL: EventEmitter<any> = new EventEmitter();
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.generalSetting.store_label;
  show_price_same_font = this.generalSetting.show_price_same_font;
  global_currency = this.generalSetting.currency_symbol;
  amount_seperator = this.generalSetting.amount_seperator;
  @Input() isSuperAdmin: boolean;
  @Input() sessionConfig: any;
  tableSize: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  @Input() sellerDetails: any;
  @Input() cid: any;
  pageKhata: number = 1;
  pageMonthly: number = 1;
  @Input() totaloverdue = 0;
  isdetails = 1;
  @Input() customer_user_id: any;
  khataListcount: number = 0;
  monthlyListCount: number = 0;
  khataList: any;
  monthlyList: any = [];
  no_data: boolean;
  page: number = 1;
  orderitemdetail: any[];
  orderdetail: any;
  taxAndChargesTotalToolTip: any;
  activityLogslist: any[];
  date: any = {}
  @Input() session: any;
  viewOrder: any;
  closeResult: any;
  ItemTotalPrice: any;
  @Input() main:any;
  isPayment: any = false;
  paymentDetail: any;
  style_obj_customer_details:any;
  constructor(
    public activeModal: NgbActiveModal,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private orderService: OrderService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }
  formGroup: UntypedFormGroup
  ngOnInit() {
    this.style_obj_customer_details = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.page = 1;
    this.get_customer_details()
    this.cdr.detectChanges();
  }
  /** Get customer details */
  get_customer_details() {
    var data = {}
    if (this.isSuperAdmin == false) {
      data = {
        store_id: this.sellerDetails.store_id,
        customer_id: this.cid,
        customer_user_id: this.customer_user_id,
      };
    } else {
      data = {
        customer_user_id: this.customer_user_id,
      };
    }
    this.customerService.getStoreCustomerDetails(data).subscribe({
      next: (response: any) => {

        if (response.status == 1) {
          this.khataList = response.data.khata;
          this.paymentDetail = response.data.customer
          if (this.khataList) {
            this.khataList.forEach(element => {
              element.date = moment(element.date, this.DateFormateFromServerSide()).format(this.DateFormateFromServerSideOnlyDateReturn());
            });
          }

          if (!response.data.monthly) {
            this.monthlyList = [];
          }
          else {
            this.monthlyList = response.data.monthly;
          }

          this.monthlyListCount = this.monthlyList.length;

          this.no_data = false;
          if (response.data.khata != null) {
            this.khataListcount = Number(response.data.khata.length);
          } else {
            this.khataListcount = 0;
          }

        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.khataListcount = 0;
          this.khataList = [];
        }
      },
      error: (error) => {
        // handle error

      },
      complete: () => {
        ;
      },
    });
  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.generalSetting.date_format_web.split(' ')[0];
  }

  DateFormateFromServerSide() {
    return this.generalSetting.date_format_web;
  }

  viewCustomerOrderDetail(details: any, flag) {
    console.log(details);
    this.viewOrder = flag;
    var data = {
      order_id: details.order_id,
    };
    this.orderService.getOrderDetails(data).subscribe({
      next: (response: any) => {
        this.activityLogslist = [];
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

  orderDetailsModal(data: any) {
    const modalRef = this.modalService.open(OrderDetailsModalComponent, {
      size: "lg-950",
    });
    modalRef.componentInstance.orderdetail = data;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.session = this.sessionConfig;
    modalRef.componentInstance.viewOrder = this.viewOrder;
    modalRef.componentInstance.taxAndChargesTotalToolTip = this.taxAndChargesTotalToolTip;
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
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
    this.orderitemdetail = itemdetails;
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

  viewPaymentDetail(data :any){
    const modalRef = this.modalService.open(PaymentDetailComponent, {
      size: "lg-950",
    });
    modalRef.componentInstance.khataList = data;
    modalRef.componentInstance.paymentList = this.paymentDetail;

  }

}
