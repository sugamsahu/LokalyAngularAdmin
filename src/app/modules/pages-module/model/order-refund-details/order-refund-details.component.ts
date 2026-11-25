import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';
import { CryptoService } from 'src/app/services/custom/crypto.service';

@Component({
  selector: 'app-order-refund-details',
  templateUrl: './order-refund-details.component.html',
  styleUrls: ['./order-refund-details.component.scss']
})
export class OrderRefundDetailsComponent implements OnInit {

  @Input() viewRefundDetail: any = [];
  @Input() main: any;
  @Input() session: any;
  total_count: number = 0;
  refundData: any = []
  page: number = 1;
  search: any
  sortKey: any = "";
  isOrderBy: boolean = true;
  isSuperAdmin = false;
  sellerDetails = JSON.parse(localStorage.getItem('loginUserStore'));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_order_refund_details: any;
  show_price_same_font: any;
  amount_seperator: any;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    private cryptoService: CryptoService,
    private router: Router,
    public commonService: CommonService

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    $(
      "<style>.modal-dialog { max-width: 800px }</style>"
    ).appendTo("body");
    this.show_price_same_font = this.generalSetting.show_price_same_font;
    this.amount_seperator = this.generalSetting?.amount_seperator;
    this.style_obj_order_refund_details = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.loadRefundData();
    if (this.main.LoggedUserInfo.role_id == this.main.UserRole.SuperAdmin || this.main.LoggedUserInfo.role_id == this.main.UserRole.Admin) {
      this.isSuperAdmin = true;
    }

  }

  loadRefundData() {
    this.refundData = this.viewRefundDetail
    this.total_count = this.viewRefundDetail.count
  }

  addRefundUsingOrder(orderId) {
    if (this.isSuperAdmin == true) {
      this.session.clearCookie('order_id' + this.main.LoggedUserInfo.role_id.toString());
      this.session.encryptIdValue(orderId.toString(), 'order_id' + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
    }
    else {
      this.session.clearCookie('order_id' + this.sellerDetails.store_id.toString());
      this.session.encryptIdValue(orderId.toString(), 'order_id' + this.sellerDetails.store_id.toString(), this.main.CryptoKey);
    }
    this.router.navigate(["/generate-refund/edit-refund/"]);
    this.activeModal.dismiss();
  }

  getRefundOrderDetails(item) {
    if (this.isSuperAdmin == true) {
      this.session.encryptIdValue(item.order_cancellation_id.toString(), 'order_cancellation_id' + this.main.LoggedUserInfo.role_id.toString().toString(), this.main.CryptoKey);
    }
    else {
      this.session.encryptIdValue(item.order_cancellation_id.toString(), 'order_cancellation_id' + this.sellerDetails.store_id.toString(), this.main.CryptoKey);

    }
    window.open("/generate-refund/view-refund", "_blank").focus();
  }



}


