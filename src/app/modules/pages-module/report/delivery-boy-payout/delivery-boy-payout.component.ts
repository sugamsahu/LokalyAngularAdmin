import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AppComponent } from 'src/app/app.component';
import { StockInwardService } from 'src/app/services/manage-stock/stock-inward.service';
import { DeliveryBoyPayoutService } from 'src/app/services/report/delivery-boy-payout.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-delivery-boy-payout',
  templateUrl: './delivery-boy-payout.component.html',
  styleUrls: ['./delivery-boy-payout.component.scss']
})
export class DeliveryBoyPayoutComponent implements OnInit {

  main;
  page: number = 1;
  count: number = 0;
  deliveryBoyPayoutForm: UntypedFormGroup;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting: any = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  deliveryboy_label: string = this.generalSetting.deliveryboy_label;
  store_label: string = this.generalSetting.store_label;
  maxDatefrom: Date = new Date();
  maxDateto: Date = new Date();
  storeList: any = [];
  deliveryBoyList: any = [];
  orderStatusList: any = [];
  sortKey: string;
  isOrderBy: boolean;
  deliveryReportConsolidatedList: any = [];
  deliveryReportDetailedList: any = [];
  show_customer_details_to_store: boolean;
  pageSize: number = 10;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  show_price_same_font: any;
  amount_seperator: any;

  constructor(
    private delliveryBoyPayoutService: DeliveryBoyPayoutService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private fb: UntypedFormBuilder,
    private siService: StockInwardService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private router: Router,
    public commonService: CommonService,
  ) {
    this.main = this.appComponent.main;
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.show_price_same_font = this.generalSetting.show_price_same_font;
    this.amount_seperator = this.generalSetting?.amount_seperator;
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.show_customer_details_to_store = this.generalSetting.show_customer_details_to_store == '1' ? true : false;
    this.loadForm();
    this.getStore();
    this.getHelpDetails();
  }

  loadForm() {
    this.deliveryBoyPayoutForm = this.fb.group({
      fromDate: new UntypedFormControl(new Date()),
      toDate: new UntypedFormControl(new Date()),
      selectedStoreItem: new UntypedFormControl(null),
      selectedDeliveryBoyItem: new UntypedFormControl(null),
      order_status: new UntypedFormControl(null),
      selectedViewType: new UntypedFormControl('1')
    })

    this.deliveryBoyPayoutForm.get("fromDate").valueChanges.subscribe((val) => {
      this.getDate(val);
    });

    this.deliveryBoyPayoutForm.get("toDate").valueChanges.subscribe((val) => {
      this.getToDate(val);
    });

    this.translate.get(["ALL"]).subscribe((translations) => {
      this.storeList = [{ label: translations.ALL, value: 0 }]
    });
    this.translate.get(["ALL"]).subscribe((translations) => {
      this.deliveryBoyList = [{ label: translations.ALL, value: 0 }]
    });
    this.translate.get(["ALL",
      "ORDER_OUT_FOR_DELIVERY",
      "ORDER_DELIVERED", ,
      "ORDER_REJECTED",
      "ORDER_UNDELIVEREDED"]).subscribe((translations) => {
        this.orderStatusList = [{ label: translations.ALL, value: 0 },
        { label: translations.ORDER_OUT_FOR_DELIVERY, value: 4 },
        { label: translations.ORDER_DELIVERED, value: 5 },
        { label: translations.ORDER_REJECTED, value: 6 },
        { label: translations.ORDER_UNDELIVEREDED, value: 7 }
        ]
      });
    this.deliveryBoyPayoutForm.controls.order_status.setValue([5])
  }

  /** Get delivery boy payout from-date.  */
  getDate(date) {
    if (date > this.deliveryBoyPayoutForm.value.toDate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
  }

  /** Get delivery boy payout to-date.  */
  getToDate(todate) {
    if (this.deliveryBoyPayoutForm.value.fromDate > todate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
  }

  changeOrderStatus() {
    var temp = [];
    let len = this.deliveryBoyPayoutForm.value.order_status.length;
    if (this.deliveryBoyPayoutForm.value.order_status[Number(len) - 1] == 0) {
      this.orderStatusList.filter((x) => x.value !== 0).forEach(el => {
        temp.push(el.value);
      })
      this.deliveryBoyPayoutForm.controls['order_status'].setValue(temp);
    }
  }

  getStore() {
    const data = {
      user_id: this.main.LoggedUserInfo.user_id
    }
    this.siService.getStoreList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var stores = response.data.filter((item) => item.role_id == 2 && item.khata_user == 0);
          stores.forEach(el => {
            if (el.role_id == 2) {
              var data = { label: el.store_name + '(' + el.name + ')', value: el.store_id };
              this.storeList.push(data);
            }
          })
          this.deliveryBoyPayoutForm.controls.selectedStoreItem.setValue(this.storeList[0].value)
          this.storeList = this.storeList.sort((a, b) => a.label.localeCompare(b.label));
          this.getDeliveryBoyList()
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => { },
      complete: () => { }
    })
  }

  storeChange() {
    this.deliveryBoyList = [];
    this.translate.get(["ALL"]).subscribe((translations) => {
      this.deliveryBoyList = [{ label: translations.ALL, value: 0 }]
    });
    this.page = 1;
    this.getDeliveryBoyList()
  }

  async getDeliveryBoyList() {
    var data: any = {};

    if (this.deliveryBoyPayoutForm.value.selectedStoreItem == 0) {
      data.store_id = this.main.LoggedUserStoreInfo.store_id;
    }
    else {
      data.store_id = this.deliveryBoyPayoutForm.value.selectedStoreItem;
    }

    await this.delliveryBoyPayoutService.orderDeliveryBoys(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach(element => {
            var data = {};

            if (element.role_id == 2) {
              data = { label: element.name + ' (Store Owner)', value: element.user_id };
            }
            else if (element.role_id == 5) {
              data = { label: element.name + ' (Store Manager)', value: element.user_id };
            }
            else {
              data = { label: element.name, value: element.user_id };
            }
            this.deliveryBoyList.push(data)
          })
          this.deliveryBoyPayoutForm.controls.selectedDeliveryBoyItem.setValue(this.deliveryBoyList[0].value)
          this.getDeliveryBoyReportList();
        } else {
          this.toastr.error(this.translate.instant(response.message))
        }
      },
      error: (error) => { },
      complete: () => { }
    })
  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.generalSetting.date_format_web.split(" ")[0];
  }

  getDeliveryBoyReportList(page?: number) {
    this.page = page
    this.deliveryReportConsolidatedList = [];
    this.deliveryReportDetailedList = [];

    var data: any = {
      from_date: moment(new Date(this.deliveryBoyPayoutForm.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.deliveryBoyPayoutForm.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      store_ids: this.deliveryBoyPayoutForm.value.selectedStoreItem,
      deliveryboy_ids: this.deliveryBoyPayoutForm.value.selectedDeliveryBoyItem,
      user_id: this.main.LoggedUserInfo.user_id,
      order_status: this.deliveryBoyPayoutForm.value.order_status.toString(),
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2
    }
    if (this.deliveryBoyPayoutForm.value.selectedViewType == 1) {
      data.is_consolidated = 1
    }

    this.delliveryBoyPayoutService.deliveryBoyPayout(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.deliveryReportConsolidatedList = response.data;
          this.deliveryReportConsolidatedList.forEach(el => {
            el.orders.forEach(order => {
              var data: any = {};
              data.user_picture = el.user_picture;
              data.name = el.name;
              data.order_Date = order.transaction_date.split(' ')[0];
              data.order_detail = '(' + order.order_no + ' , ' + data.order_Date + ')';
              data.customer_detail = '(' + order.name + ' , ' + order.phone + ')';
              data.delivery_area = order.delivery_area;
              data.item_count = Number(order.item_count);
              data.total_distance = order.total_distance;
              data.payment_method = order.payment_method;
              data.amount = parseFloat(order.amount).toFixed(2);
              el.total_amount = el.total_amount
              el.total_cod_amount = el.total_cod_amount
              el.order_count = Number(el.order_count)
              this.deliveryReportDetailedList.push(data);
            })
          })
        } else {
          this.deliveryReportConsolidatedList = [];
          this.deliveryReportDetailedList = [];
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => { },
      complete: () => { }
    })
  }

  SearchDeliveryReport() {
    this.getDeliveryBoyReportList()
  }

  ClearDeliveryReport() {
    this.loadForm();
    this.getStore();
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.getDeliveryBoyList();
  }

  exportDataValidation() {
    if (this.count > 200000) {
      this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
    } else {
      this.exportData();
    }
  }

  /** Export delivery boy payout report using service*/
  exportData() {
    var data: any = {
      from_date: moment(new Date(this.deliveryBoyPayoutForm.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.deliveryBoyPayoutForm.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      store_ids: this.deliveryBoyPayoutForm.value.selectedStoreItem,
      deliveryboy_ids: this.deliveryBoyPayoutForm.value.selectedDeliveryBoyItem,
      user_id: this.main.LoggedUserInfo.user_id,
      order_status: this.deliveryBoyPayoutForm.value.order_status.toString(),
      is_export: 1,
      current_store_id: this.sellerDetails.store_id
    };
    if (this.deliveryBoyPayoutForm.value.selectedViewType == 1) {
      data.is_consolidated = 1
    }

    this.delliveryBoyPayoutService.deliveryBoyPayout(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
        } else {
          this.toastr.error(this.translate.instant(response.message))
        }
      },
      error: (err) => { },
      complete: () => { }
    })
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
      data.module_key = '129'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '129'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '129'
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
