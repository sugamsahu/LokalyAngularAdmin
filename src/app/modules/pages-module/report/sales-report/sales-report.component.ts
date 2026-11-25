import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AppComponent } from 'src/app/app.component';
import { StockInwardService } from 'src/app/services/manage-stock/stock-inward.service';
import { OrderService } from 'src/app/services/order.service';
import { KhataService } from 'src/app/services/report/khata.service';
import { SalesReportService } from 'src/app/services/report/sales-report.service';
import { environment } from "src/environments/environment";
import { OrderDetailsModalComponent } from '../../model/order-details/order-details.component';
import { ProofOfDeliveryComponent } from '../../model/proof-of-delivery/proof-of-delivery.component';
import { CommonService } from 'src/app/services/common.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss']
})
export class SalesReportComponent implements OnInit {

  main: any;
  salesForm: FormGroup;
  maxDatefrom: Date = new Date();
  maxDateto: Date = new Date();
  generalSetting: any = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  deliveryboy_label: string = this.generalSetting.deliveryboy_label;
  store_label: string = this.generalSetting.store_label;
  offers_module = this.generalSetting.offers_module;
  storeList: any = [];
  customerList: any = [];
  page: number = 1;
  offerCodeList: any = [];
  salesList: any = [];
  count: number = 0;
  sortKey: string;
  isOrderBy: boolean;
  store_tax_label = this.generalSetting.store_tax_label;
  show_customer_details_to_store: boolean = this.generalSetting.show_customer_details_to_store == '1' ? true : false;
  tableSize: number = environment.tableSize;
  viewOrder: boolean = false;
  session: any;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  show_price_same_font: any;
  amount_seperator: any;
  constructor(
    private translate: TranslateService,
    private appComponent: AppComponent,
    private fb: FormBuilder,
    private siService: StockInwardService,
    private toastr: ToastrService,
    private khataService: KhataService,
    private salesreportService: SalesReportService,
    private modalService: NgbModal,
    private orderService: OrderService,
    public commonService: CommonService,
    private _helpService: BannerService,
  ) {
    this.main = this.appComponent.main;
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.show_price_same_font = this.generalSetting.show_price_same_font;
    this.amount_seperator = this.generalSetting?.amount_seperator;
    this.session = this.appComponent.sessionConfig();
    this.loadForm();
    this.getStoreList();
    this.getHelpDetails();
  }

  loadForm() {
    this.salesForm = this.fb.group({
      filterOn: new FormControl('order_date'),
      fromDate: new FormControl(new Date()),
      toDate: new FormControl(new Date()),
      selectedStoreItem: new FormControl(null),
      selectedCustomerItem: new FormControl(null),
      selectedOfferCodeItem: new FormControl(null)
    })

    this.salesForm.get("fromDate").valueChanges.subscribe((val) => {
      this.getDate(val);
    });

    this.salesForm.get("toDate").valueChanges.subscribe((val) => {
      this.getToDate(val);
    });

    this.translate.get(["ALL"]).subscribe((translations) => {
      this.storeList = [{ label: translations.ALL, value: 0 }]
    });
    this.translate.get(["ALL"]).subscribe((translations) => {
      this.customerList = [{ label: translations.ALL, value: 0 }]
    });
    this.translate.get(["ALL"]).subscribe((translations) => {
      this.offerCodeList = [{ label: translations.ALL, value: 0 }]
    });
  }
  /** From date of sale report from form */
  getDate(date) {
    if (date > this.salesForm.value.toDate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
  }
  /** Get to-date of sale report from form */
  getToDate(todate) {
    if (this.salesForm.value.fromDate > todate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
  }


  getStoreList() {
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
            else if (el.role_id == 2 || el.role_id == 5) {
              var data = { label: el.store_name + '(' + el.name + ')', value: el.store_id };
              this.storeList.push(data);
            }
          })
          this.salesForm.controls.selectedStoreItem.setValue(this.storeList[0].value)
          this.storeList = this.storeList.sort((a, b) => a.label.localeCompare(b.label));
          this.getCustomerList()
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (err) => { },
      complete: () => { }
    })
  }

  storeChange() {
    this.customerList = [];
    this.translate.get(["ALL"]).subscribe((translations) => {
      this.customerList = [{ label: translations.ALL, value: 0 }]
    });
    this.page = 1;
    this.getCustomerList();
  }

  getCustomerList() {
    const data: any = {
      user_id: this.main.LoggedUserInfo.user_id
    }
    if (this.salesForm.value.selectedStoreItem != 0) {
      data.store_ids = this.salesForm.value.selectedStoreItem
    }

    this.khataService.getCustomerList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach(item => {
            var data = { label: item.name, value: item.user_id };
            this.customerList.push(data);
          })
          this.salesForm.controls.selectedCustomerItem.setValue(this.customerList[0].value)
          this.GetOfferCodeList()
        } else {
          this.GetSalesList(1);
        }
      },
      error: (err) => { },
      complete: () => { }
    })
  }

  ChangeCustomer() {
    this.offerCodeList = [];
    this.salesForm.controls.selectedOfferCodeItem.reset();
    this.translate.get(["ALL"]).subscribe((translations) => {
      this.offerCodeList = [{ label: translations.ALL, value: 0 }]
    });
    this.GetOfferCodeList();
  }

  GetOfferCodeList() {
    const data = {
      store_id: this.salesForm.value.selectedStoreItem,
      user_id: this.salesForm.value.selectedCustomerItem == 0 ? this.main.LoggedUserInfo.user_id : this.salesForm.value.selectedCustomerItem
    }

    this.salesreportService.offerCodesList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach(el => {
            var data = { label: el.offer_code, value: el.offer_id };
            this.offerCodeList.push(data);
          })
          this.salesForm.controls.selectedOfferCodeItem.setValue(this.offerCodeList[0].label)
          this.GetSalesList(1)
        } else {
          this.GetSalesList(1);
        }
      },
      error: (err) => { },
      complete: () => { }
    })
  }

  offerCodeChange() {
    this.GetSalesList(1)
  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.main.DateFormate.split(" ")[0];
  }

  GetSalesList(page) {
    this.page = page;
    const data = {
      from_date: moment(new Date(this.salesForm.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.salesForm.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      store_ids: this.salesForm.value.selectedStoreItem,
      customer_user_ids: this.salesForm.value.selectedCustomerItem,
      user_id: this.main.LoggedUserInfo.user_id,
      offer_code: this.salesForm.value.selectedOfferCodeItem?.value == 0 ? '' : this.salesForm.value.selectedOfferCodeItem?.label,
      page: this.page,
      search_query: '',
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      filter_by: this.salesForm.value.filterOn
    }

    this.salesreportService.salesReport(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.salesList = response.data;
          this.salesList.forEach(item => {
            item.amount = parseFloat(item.amount).toFixed(2);
            item.delivery_charges = parseFloat(item.delivery_charges).toFixed(2);
            item.item_total = parseFloat(item.item_total).toFixed(2);
            item.order_tax = parseFloat(item.order_tax).toFixed(2);
            item.packaging_cost = parseFloat(item.packaging_cost).toFixed(2);
            item.order_tip = parseFloat(item.order_tip).toFixed(2);
            item.pod_images = item.pod_images == null ? [] : item.pod_images;
          })
          this.count = response.count;
        } else {
          this.salesList = [];
          this.count = 0;
          this.toastr.error(this.translate.instant(response.message))
        }
      },
      error: (err) => { },
      complete: () => { }
    })
  }

  orderReportDownload() {
    const data = {
      from_date: moment(new Date(this.salesForm.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.salesForm.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      store_ids: this.salesForm.value.selectedStoreItem,
      current_store_id: this.main.LoggedUserStoreInfo.store_id,
      customer_user_ids: this.salesForm.value.selectedCustomerItem,
      user_id: this.main.LoggedUserInfo.user_id,
      offer_code: this.salesForm.value.selectedOfferCodeItem?.value == 0 ? '' : this.salesForm.value.selectedOfferCodeItem?.label,
      filter_by: this.salesForm.value.filterOn,
      is_export: 1
    }
    if (this.count > 200000) {
      this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
    } else {
      this.salesreportService.salesReport(data).subscribe({
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
  }

  SearchSalesReport() {
    this.GetSalesList(this.page);
  }

  clearSalesReport() {
    this.loadForm();
    this.getStoreList();
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetSalesList(this.page);
  }
  /** Open ProofOfDeliveryComponent modal */
  viewPODImageDetail(item) {
    const modalRef = this.modalService.open(ProofOfDeliveryComponent, {
      size: 'lg',
      centered: true
    })
    modalRef.componentInstance.receivedData = item
  }

  activityLogslist: any = [];

  openOrderDetailsModal(details, flag) {
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
    })
  }

  orderdetail: any = [];
  taxAndChargesTotalToolTip: any;
  ItemTotalPrice: any;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  date: any = {
  };
  orderitemdetail: any = [];
  closeResult: any;

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
            item_remark: Item.item_remark,
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
  /** Open OrderDetailsModalComponent modal */
  orderDetailsModal(data: any) {
    const modalRef = this.modalService.open(OrderDetailsModalComponent, {
      size: "lg-950",
    });
    modalRef.componentInstance.orderdetail = data;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.session = this.session;
    modalRef.componentInstance.viewOrder = this.viewOrder;
    modalRef.componentInstance.forReport = 1;
    modalRef.componentInstance.taxAndChargesTotalToolTip = this.taxAndChargesTotalToolTip;
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
      }
    );
  }

  orderitemReportDownload() {
    const data = {
      from_date: moment(new Date(this.salesForm.value.fromDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      to_date: moment(new Date(this.salesForm.value.toDate)).format(this.DateFormateFromServerSideOnlyDateReturn()),
      store_ids: this.salesForm.value.selectedStoreItem,
      current_store_id: this.main.LoggedUserStoreInfo.store_id,
      customer_user_ids: this.salesForm.value.selectedCustomerItem,
      user_id: this.main.LoggedUserInfo.user_id,
      filter_by: this.salesForm.value.filterOn,
      is_export: 1
    }
    if (this.count > 200000) {
      this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
    } else {
      this.salesreportService.salesDetailsReport(data).subscribe({
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
      data.module_key = '58'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '58'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '124'
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
