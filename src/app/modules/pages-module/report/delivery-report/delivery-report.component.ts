import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { AppComponent } from "src/app/app.component";
import { StockInwardService } from "src/app/services/manage-stock/stock-inward.service";
import { environment } from "src/environments/environment";
import { DeliveryReportService } from "src/app/services/report/delivery-report.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: "app-delivery-report",
  templateUrl: "./delivery-report.component.html",
  styleUrls: ["./delivery-report.component.scss"],
})
export class DeliveryReportComponent implements OnInit {
  main;
  page: number = 1;
  count: number = 0;
  tableSize: number = environment.tableSize;
  no_data = true;
  formGroup: FormGroup;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  deliveryboy_label: string = this.generalSetting.deliveryboy_label;
  store_label: string = this.generalSetting.store_label;
  storeList: any = [];
  customerList: any = [];
  show_customer_details_to_store: boolean =
    this.generalSetting.show_customer_details_to_store == "1" ? true : false;
  global_currency: string = this.generalSetting.currency_symbol;
  orderStatusList: any = [];
  tempOrderDuringStatus: any = [];
  orderList: any = [];
  sortKey: string;
  isOrderBy: boolean;
  maxDatefrom: Date = new Date();
  maxDateto: Date = new Date();
  PlatformSetting: any;
  business_model: any;
  isReporsShow: any;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  show_price_same_font: any;
  amount_seperator: any;

  constructor(
    private formBuilder: FormBuilder,
    private appComponent: AppComponent,
    private translate: TranslateService,
    private stockInwardService: StockInwardService,
    private toastr: ToastrService,
    private DeliveryReportService: DeliveryReportService,
    private cdr: ChangeDetectorRef, private _helpService: BannerService,
    private modalService: NgbModal,
    private router: Router,
    public commonService: CommonService
  ) {
    this.main = this.appComponent.main;
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.show_price_same_font = this.generalSetting.show_price_same_font;
    this.amount_seperator = this.generalSetting?.amount_seperator;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadForm();
    this.getStoreList();
    this.getHelpDetails();
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      fromDate: new FormControl(new Date()),
      toDate: new FormControl(new Date()),
      selectedStoreItem: new FormControl(null),
      selectedDeliveryBoyItem: new FormControl(null),
      order_status: new FormControl(null),
      deliveryList: this.formBuilder.array([]),
    });
    this.formGroup.get("fromDate").valueChanges.subscribe((val) => {
      this.getDate(val);
    });
    this.formGroup.get("toDate").valueChanges.subscribe((val) => {
      this.getToDate(val);
    });
    this.translate.get(["ALL"]).subscribe((translations) => {
      this.storeList = [{ label: translations.ALL, value: 0 }];
    });
    this.translate.get(["ALL"]).subscribe((translations) => {
      this.deliveryBoyList = [{ label: translations.ALL, value: 0 }];
    });
    this.translate
      .get([
        "ALL",
        "ORDER_OUT_FOR_DELIVERY",
        "ORDER_DELIVERED",
        "ORDER_REJECTED",
        "ORDER_UNDELIVEREDED",
      ])
      .subscribe((translations) => {
        this.orderStatusList = [
          { label: translations.ALL, value: 0 },
          { label: translations.ORDER_OUT_FOR_DELIVERY, value: 4 },
          { label: translations.ORDER_DELIVERED, value: 5 },
          { label: translations.ORDER_REJECTED, value: 6 },
          { label: translations.ORDER_UNDELIVEREDED, value: 7 },
        ];
      });
    var Ids = [4];
    this.formGroup.controls.order_status.setValue(Ids);
  }

  /** Get delivery report from-date */
  getDate(date) {
    if (date > this.formGroup.value.toDate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
  }

  /** Get delivery report to-date */
  getToDate(todate) {
    if (this.formGroup.value.fromDate > todate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
  }

  getStoreList() {
    const data = {
      user_id: this.main.LoggedUserInfo.user_id,
    };
    this.stockInwardService.getStoreList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var stores = response.data.filter(
            (item) => item.role_id == 2 && item.khata_user == 0
          );

          stores.forEach((el) => {
            if (el.role_id == 2) {
              var data = {
                label: el.store_name + "(" + el.name + ")",
                value: el.store_id,
              };
              this.storeList.push(data);

            }
          });
          this.formGroup.controls.selectedStoreItem.setValue(
            this.storeList[0].value
          );

          this.storeList = this.storeList.sort((a, b) => a.label.localeCompare(b.label));
          this.cdr.detectChanges();
          this.GetDeliveryBoyList();
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }

  storeChange() {
    this.customerList = [];
    this.translate.get(["ALL"]).subscribe((translations) => {
      this.customerList = [{ label: translations.ALL, value: 0 }];
    });
    this.page = 1;
    this.GetDeliveryBoyList();
  }

  onStatusSelect() {
    let len = this.formGroup.value.order_status.length - 1;
    if (this.formGroup.value.order_status[len] == 0) {
      this.tempOrderDuringStatus = [];
      this.orderStatusList.forEach((element) => {
        if (element.value != 0) {
          this.tempOrderDuringStatus.push(element.value);
        }
      });
      this.formGroup.controls["order_status"].setValue(
        this.tempOrderDuringStatus
      );
    }
  }

  searchOrderReport() {
    this.getDreliveryList(this.page);
  }

  clearOrderReport() {
    this.loadForm();
    this.getStoreList();
  }

  //get deliveryboy list
  deliveryBoyList: any = [];
  GetDeliveryBoyList() {
    var data: any = {};

    if (this.formGroup.value.selectedStoreItem == 0) {
      data.store_id = this.main.LoggedUserStoreInfo.store_id;
    } else {
      data.store_id = this.formGroup.value.selectedStoreItem;
    }

    this.DeliveryReportService.getDeliveryBoyList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.deliveryBoyList = this.deliveryBoyList.filter(x => x.value == 0)
          response.data.forEach((element) => {
            var data = {};

            if (element.role_id == 2) {
              data = {
                label: element.name + " (Store Owner)",
                value: element.user_id,
              };
            } else if (element.role_id == 5) {
              data = {
                label: element.name + " (Store Manager)",
                value: element.user_id,
              };
            } else {
              data = { label: element.name, value: element.user_id };
            }
            this.deliveryBoyList.push(data);

          });
          this.formGroup.controls.selectedDeliveryBoyItem.setValue(
            this.deliveryBoyList[0]
          );
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }


  selectedDeliId: any;
  selectedDeliveryBoyItemId(data) {
    this.selectedDeliId = data
  }


  //Get delivery report list
  DateFormateFromServerSideOnlyDateReturn() {
    return this.generalSetting.date_format_web.split(" ")[0];
  }

  DateFormateFromServerSide() {
    return this.generalSetting.date_format_web;
  }
  getDreliveryList(page) {
    this.page = page;
    var data = {};
    data = {
      from_date: moment(new Date(this.formGroup.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.formGroup.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      store_ids: this.formGroup.value.selectedStoreItem,
      deliveryboy_ids: this.selectedDeliId,
      user_id: this.main.LoggedUserInfo.user_id,
      page: this.page,
      order_status: this.formGroup.value.order_status.toString(),
    };
    this.DeliveryReportService.getDeliveryReportItemsList(data).subscribe({
      next: (response: any) => {
        this.formGroup.value.deliveryList = [];
        if (response.status == 1) {
          this.formGroup.value.deliveryList = response.data;
          this.formGroup.value.deliveryList.forEach((delivery) => {
            delivery.orders.forEach((order) => {
              order.sign = "";
              order.order_Date = moment(
                order.transaction_date,
                this.DateFormateFromServerSide()
              ).format(this.DateFormateFromServerSideOnlyDateReturn());
              order.order_detail = "(" + order.order_no + ", " + order.order_Date + ")";
              order.customer_detail = "(" + order.name + ", " + order.phone + ")";
            });
          });
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.formGroup.value.deliveryList = [];
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.getDreliveryList(this.page);
  }

  exportDataValidation() {
    if (this.count > 200000) {
      this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
    } else {
      this.exportData();
    }
  }

  /** Export delivery report using service*/
  exportData() {
    var data = {};
    data = {
      from_date: moment(new Date(this.formGroup.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.formGroup.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      store_ids: this.formGroup.value.selectedStoreItem,
      deliveryboy_ids: this.selectedDeliId,
      user_id: this.main.LoggedUserInfo.user_id,
      order_status: this.formGroup.value.order_status.toString(),
      is_export: 1,
      current_store_id: this.sellerDetails.store_id
    };

    this.DeliveryReportService.getDeliveryReportItemsList(data).subscribe({
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
      data.module_key = '128'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '128'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '128'
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

  itemPrice(itemPrice: any) {
    let price: any;
    if (itemPrice != undefined && itemPrice != 0) {
      price = itemPrice.toString().split(".");
      return price;
    } else if (Number(itemPrice) == 0) {
      price = ["0", "00"];
      return price;
    }
  }
}
