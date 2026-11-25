import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { OrderService } from "src/app/services/order.service";
import { TooltipComponent } from "@angular/material/tooltip";
import { proofOfDeliveryListComponent } from "../proof-of-delivery-list/proof-of-delivery-list.component";
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-order-history",
  templateUrl: "./order-history.component.html",
  styleUrls: ["./order-history.component.scss"],
})
export class OrderHistoryComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.generalSetting.store_label;
  deliveryboy_label = this.generalSetting.deliveryboy_label;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  show_customer_details_to_store =
    this.generalSetting.show_customer_details_to_store == "1" ? true : false;
  show_price_same_font = this.generalSetting.show_price_same_font;
  amount_seperator = this.generalSetting?.amount_seperator;
  global_currency = this.generalSetting.currency_symbol;
  taxAndChargesTotalToolTip: any;
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  delivery_model = this.PlatformSetting.delivery_model;
  refund_module = this.generalSetting.refund_module;
  business_model = this.PlatformSetting.business_model;
  subscription_model = this.PlatformSetting.subscription_model;
  add_refund_module = false;
  view_refund_module: any;
  @Input() orderid;
  @Input() OrderDetails: any;
  @Input() main: any;
  @Input() session: any;
  orderhistory: any = [];
  viewRefundDetail: any;
  proofdetails = {
    pod_images: null
  }
  style_obj_order_history:any;
  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    public translate: TranslateService,
    private modalService: NgbModal,
    private router: Router,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    public commonService : CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.style_obj_order_history = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.getOrderHistory();
    Object.defineProperty(TooltipComponent.prototype, "message", {
      set(v: any) {
        const el = document.querySelectorAll(".mat-tooltip");

        if (el) {
          el[el.length - 1].innerHTML = v;
        }
      },
    });

    if (Number(this.refund_module) != 0) {
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
  }
  // get order history
  status:any
  async getOrderHistory() {
    var data = {
      order_id: this.OrderDetails.order_id,
    };
    await this.orderService.getOrderHistory(data).subscribe({
      next: (response: any) => {
        this.orderhistory = [];
        if (response?.status == 1) {
          this.orderhistory = response.data.order_history;
          this.orderhistory.forEach((data:any) => {
            var item_total: any = 0;
            //Handle items
            data?.items.forEach((element) => {
              //handle item price
              item_total = (
                Number(item_total) + Number(element.item_price)
              ).toFixed(2);
              
              //handle combo
              if (element.combo_variants.length > 0) {
                element.combo_variants.forEach((combo) => {
                  combo.packaging_name =
                    combo.packaging_name == "NULL"
                      ? null
                      : combo.packaging_name;
                  combo.unit_name =
                    combo.unit_name == "NULL" ? null : combo.unit_name;
                });
              }
            });
            data.order.item_total = item_total;

            //Handle final amount
            if (data.order.wallet_amount > 0) {
              data.order.final_amount = (
                Number(data.order.order_amount) -
                Number(data.order.wallet_amount)
              ).toFixed(2);
            }

            //hande total tax
            if (data.order.order_tax > 0 || data.order.packaging_cost > 0) {
              data.order.otherCharges = (
                Number(data.order.order_tax) + Number(data.order.packaging_cost)
              ).toFixed(2);
            }
          });
          this.status=null
          if(this.orderhistory[0].order.order_status_name){
            this.status=this.orderhistory[0].order.order_status_name
          }else{
            this.orderhistory.forEach(element => {
              if(element.order.order_status_name){
                if(!this.status){
                  this.status=element.order.order_status_name
                }
              }
            });
          }
        } else {
          this.toastr.error(this.translate.instant(response?.message));
        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      },
    });
  }

  editOrderDetail(orderId) {
    this.session.encryptIdValue(
      orderId.toString(),
      "order_id" + this.sellerDetails.store_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/order/selller-process-order"]);
    this.modal.dismiss();
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

  viewProofOfDeliveryImageList(image) {
    this.proofdetails.pod_images=image
    const modalRef = this.modalService.open(proofOfDeliveryListComponent, {
      size: "lg",
    });
    modalRef.componentInstance.orderdetail = this.proofdetails;
  }

  refresh(){
    this.getOrderHistory();
  }

  openid = 0
  getEvnt(data) {
    this.openid = data.panelId
  }
}
