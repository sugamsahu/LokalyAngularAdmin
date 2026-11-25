import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { AppComponent } from "src/app/app.component";
import { StockInwardService } from "src/app/services/manage-stock/stock-inward.service";
import { ItemWiseOrderService } from "src/app/services/report/item-wise-order.service";
import { KhataService } from "src/app/services/report/khata.service";
import { environment } from "src/environments/environment";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-item-wise-order",
  templateUrl: "./item-wise-order.component.html",
  styleUrls: ["./item-wise-order.component.scss"],
})
export class ItemWiseOrderComponent implements OnInit {
  main;
  page: number = 1;
  count: number = 0;
  tableSize: number = environment.tableSize;
  itemWoseOrderForm: FormGroup;
  generalSetting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  deliveryboy_label: string = this.generalSetting.deliveryboy_label;
  store_label: string = this.generalSetting.store_label;
  storeList: any = [];
  customerList: any = [];
  show_customer_details_to_store: boolean =
    this.generalSetting.show_customer_details_to_store == "1" ? true : false;
  global_currency: string = this.generalSetting.currency_symbol;
  dinein_module = this.generalSetting.dinein_module;
  amount_seperator = this.generalSetting?.amount_seperator;
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
  dienIn: any;
  pos: any;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private formBuilder: FormBuilder,
    private appComponent: AppComponent,
    private translate: TranslateService,
    private stockInwardService: StockInwardService,
    private khataService: KhataService,
    private itemWiseOrderService: ItemWiseOrderService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    this.main = this.appComponent.main;
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.dienIn = this.sellerDetails.dine_in
    this.pos = this.sellerDetails.pos
    this.loadForm();
    this.getHelpDetails();
  }

  loadForm() {
    this.itemWoseOrderForm = this.formBuilder.group({
      fromDate: new FormControl(new Date()),
      toDate: new FormControl(new Date()),
      selectedStoreItem: new FormControl(null),
      selectedCustomerItem: new FormControl(null),
      order_status: new FormControl(null),
    });
    var Ids = [1, 2, 9];
    this.itemWoseOrderForm.controls.order_status.setValue(Ids);
    this.itemWoseOrderForm.get("fromDate").valueChanges.subscribe((val) => {
      this.getDate(val);
    });
    this.itemWoseOrderForm.get("toDate").valueChanges.subscribe((val) => {
      this.getToDate(val);
    });
    this.translate.get(["ALL"]).subscribe((translations) => {
      this.storeList = [{ label: translations.ALL, value: 0 }];
    });
    this.translate.get(["ALL"]).subscribe((translations) => {
      this.customerList = [{ label: translations.ALL, value: 0 }];
    });
    this.translate
      .get([
        "ALL",
        "ORDER_PENDING",
        "ORDER_ACCEPTED",
        "ORDER_READY_FOR_PICKUP",
        "ORDER_OUT_FOR_DELIVERY",
        "PROCESSING",
        "READY_FOR_BILLING",
        "ORDER_DELIVERED",
        "ORDER_REJECTED",
        "ORDER_UNDELIVEREDED",
      ]).subscribe((translations) => {
        this.orderStatusList = [
          { label: translations.ALL, value: 0 },
          { label: translations.ORDER_PENDING, value: 1 },
          { label: translations.ORDER_ACCEPTED, value: 2 },
          { label: translations.ORDER_READY_FOR_PICKUP, value: 3 },
          { label: translations.ORDER_OUT_FOR_DELIVERY, value: 4 },
          { label: translations.PROCESSING, value: 9 },
          { label: translations.READY_FOR_BILLING, value: 10 },
          { label: translations.ORDER_DELIVERED, value: 5 },
          { label: translations.ORDER_REJECTED, value: 6 },
          { label: translations.ORDER_UNDELIVEREDED, value: 7 },
        ];
        if (this.dienIn == 0) {
          this.orderStatusList = this.orderStatusList.filter((x) => x.value != 9 && x.value != 10)
          var Ids = [1, 2];
          this.itemWoseOrderForm.controls.order_status.setValue(Ids);
        }
        if (this.pos == 0) {
          this.orderStatusList = this.orderStatusList.filter((x) => x.value != 11)
        }
      });

    this.getStoreList();
  }

  /** Get item wise order from-date using form */
  getDate(date) {
    if (date > this.itemWoseOrderForm.value.toDate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
  }
  /** Get item wise order to-date using form */
  getToDate(todate) {
    if (this.itemWoseOrderForm.value.fromDate > todate) {
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
          this.itemWoseOrderForm.controls.selectedStoreItem.setValue(
            this.storeList[0].value
          );
          this.storeList = this.storeList.sort((a, b) => a.label.localeCompare(b.label));
          this.getCustomerList();
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
    this.getCustomerList();
  }

  getCustomerList() {
    var data: any = {
      user_id: this.main.LoggedUserInfo.user_id,
    };
    if (this.itemWoseOrderForm.value.selectedStoreItem != 0) {
      data.store_ids = this.itemWoseOrderForm.value.selectedStoreItem;
    }
    this.khataService.getCustomerList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach((item) => {
            var data = { label: item.name, value: item.user_id };
            this.customerList.push(data);
          });
          this.itemWoseOrderForm.controls.selectedCustomerItem.setValue(
            this.customerList[0].value
          );
          this.getOrderList(this.page);
        } else {
          this.getOrderList(this.page);
        }
      },
    });
  }
  /** Select order status from dropdown of order status */
  onStatusSelect() {
    let len = this.itemWoseOrderForm.value.order_status.length - 1;
    if (this.itemWoseOrderForm.value.order_status[len] == 0) {
      this.tempOrderDuringStatus = [];

      this.orderStatusList.forEach((element) => {
        if (element.value != 0) {
          this.tempOrderDuringStatus.push(element.value);
        }
      });
      this.itemWoseOrderForm.controls["order_status"].setValue(
        this.tempOrderDuringStatus
      );
    }
  }

  SearchOrderReport() {
    this.getOrderList(this.page);
  }
  ClearOrderReport() {
    this.loadForm();
  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.main.DateFormate.split(" ")[0];
  }

  getOrderList(page) {
    this.page = page;
    var data: any = {
      from_date: moment(new Date(this.itemWoseOrderForm.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.itemWoseOrderForm.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      store_ids: this.itemWoseOrderForm.value.selectedStoreItem,
      customer_user_ids: this.itemWoseOrderForm.value.selectedCustomerItem,
      user_id: this.main.LoggedUserInfo.user_id,
      page: this.page,
      search_query: "",
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };

    if (this.itemWoseOrderForm.value.order_status.length > 0) {
      data.order_status = this.itemWoseOrderForm.value.order_status.toString();
    }

    this.itemWiseOrderService.orderItemSummary(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.orderList = response.data;
          this.orderList.forEach((element) => {
            element.total_quantity = parseFloat(element.total_quantity).toFixed(
              1
            );
            element.unit_quantity =
              parseFloat(element.unit_quantity) == 0
                ? "-"
                : parseFloat(element.unit_quantity);
            element.brand_name =
              element.brand_name == "" ? "-" : element.brand_name;
            element.packaging_name =
              element.packaging_name == "" ? "-" : element.packaging_name;
          });
          this.count = response.count;
        } else {
          this.orderList = [];
          this.count = 0;
          this.toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.getOrderList(this.page);
  }

  exportDataValidation() {
    if (this.count > 200000) {
      this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
    } else {
      this.exportData();
    }
  }

  /** Export item wise order report using service  */
  exportData() {
    var data: any = {
      from_date: moment(new Date(this.itemWoseOrderForm.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.itemWoseOrderForm.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      store_ids: this.itemWoseOrderForm.value.selectedStoreItem,
      customer_user_ids: this.itemWoseOrderForm.value.selectedCustomerItem,
      user_id: this.main.LoggedUserInfo.user_id,
      is_export: 1,
      current_store_id: this.sellerDetails.store_id
    };
    if (this.itemWoseOrderForm.value.order_status.length > 0) {
      data.order_status = this.itemWoseOrderForm.value.order_status.toString();
    }
    this.itemWiseOrderService.orderItemSummary(data).subscribe({
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
      data.module_key = '61'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '61'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '127'
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

  commaFormatter(value: any, amount_seperator: any) {
    if (value) {
      var price = value.toString().split(".")[0];
      var decimal = value.toString().split(".")[1];
      return price + amount_seperator + decimal;
    }
    else {
      return;
    }
  }
}
