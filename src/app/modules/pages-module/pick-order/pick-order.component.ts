import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { OrderService } from "src/app/services/order.service";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  tap,
  Observable,
  startWith,
  map
} from "rxjs";
import { PickerOrderDetailsComponent } from "../model/picker-order-details/picker-order-details.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { CookieService } from "ngx-cookie-service";
import { CommonService } from "src/app/services/common.service";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-pick-order",
  templateUrl: "./pick-order.component.html",
  styleUrls: ["./pick-order.component.scss"],
})
export class PickOrderComponent implements OnInit {
  page: number = 1;
  total_count: number = 0;
  table_size = environment.tableSize;
  search: any;
  no_data = true;
  isOrderBy: any;
  sortKey: any;
  main: any;
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  picker_status: any =
    localStorage.getItem("picker_status") == undefined
      ? 1
      : localStorage.getItem("picker_status");

  orderStatusList: any = [{ label: "All", value: 0 }];
  session = this.appComponent.sessionConfig();
  sessionConfig = this.appComponent.sessionConfig();

  express_delivery: any = 0;
  orderitem = {
    status: [],
  };
  dashboardStatus: any;
  perPages: any = [
    { id: "20", name: "20" },
    { id: "50", name: "50" },
    { id: "100", name: "100" },
    { id: "200", name: "200" },
    { id: "1000000000", name: "ALL" },
  ];
  selectedPerPage: any = this.perPages[0].id;
  orderList = [];
  orderStatistics: any = {};
  picker_pending_count: any = 0;
  picker_inprocess_count: any = 0;
  isdisplayChat = Number(this.general_setting.chat_module) == 0 ? false : true;
  iseatery: any;
  isSuperAdmin = false;
  delivery_model = this.platform_setting.delivery_model;
  show_customer_details_to_store =
    this.general_setting.show_customer_details_to_store == "1" ? true : false;
  pincode_label = this.general_setting.pincode_label;
  deliveryboy_label = this.general_setting.deliveryboy_label;
  SelectedStore: any = {};
  adminSellerList: any = [];
  activityLogslist: any = [];
  orderitemdetail: any = [];
  orderdetail: any;
  ItemTotalPrice: any;
  date: any = {};
  printCurrantDateTime: any;
  closeResult: any;
  store_label = this.general_setting.store_label;
  //recent search
  myControl = new FormControl("");
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  searchHistory: any;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    private OrderService: OrderService,
    private modalService: NgbModal,
    private cryptoService: CryptoService,
    private router: Router,
    private cookieService: CookieService,
    public commonService: CommonService,
    private _helpService: BannerService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    $(
      "<style>.mat-form-field-appearance-outline .mat-form-field-outline {  margin-top:" +
      "28px" +
      " !important;  margin-bottom:" +
      "10px" +
      " !important;}</style>"
    ).appendTo("body");

    $(
      "<style>.mat-form-field-appearance-outline .mat-form-field-flex {  margin-top:" +
      "-35px" +
      " !important;</style>"
    ).appendTo("body");

    this.date.startdate = new Date().setDate(new Date().getDate() - 30);
    this.date.enddate = new Date();

    if (this.delivery_model == 2 || this.delivery_model == 4) {
      if (
        this.main.LoggedUserInfo.role_id == 6 ||
        this.main.LoggedUserInfo.role_id == 1
      ) {
        this.isSuperAdmin = true;
      }
    }

    var orderList = this.general_setting.order_status_list;
    var pickerStatus: any = this.general_setting.picker_order_display.split(',');
    orderList.forEach((Item: any) => {
      pickerStatus.forEach((status: any) => {
        if (Item.id == status) {
          var data = { label: Item.name, value: Number(Item.id) };
          this.orderStatusList.push(data);
        }
      });
    });
    this.orderitem.status = pickerStatus.map((x) => Number(x));

    if (this.seller_details) {
      if (this.isdisplayChat) {
        this.isdisplayChat = this.seller_details.chat == 1 ? true : false;
      }

      this.iseatery = this.seller_details.iseatery;
      // this.dashboardStatus = this.sessionConfig.decryptIdValue(
      //   "dashboardStatus" + this.seller_details.store_id.toString(),
      //   this.main.CryptoKey
      // );

      document.cookie =
        "dashboardStatus" +
        this.seller_details.store_id.toString() +
        "=;expires=Thu, 01 Jan 1970";

      // if (this.dashboardStatus == 1) {
      //   this.orderitem.status = [1];
      // } else if (this.dashboardStatus == 2) {
      //   this.orderitem.status = [2, 3, 4, 7];
      // } else if (this.dashboardStatus == 5) {
      //   this.orderitem.status = [5];
      // } else if (this.dashboardStatus == 6) {
      //   this.orderitem.status = [6, 8];
      // } else {
      //   this.orderitem.status = [3, 1, 7, 2];
      // }

      this.seller_details.fullAddress = [
        this.seller_details.address1,
        this.seller_details.address2,
        this.seller_details.area_name,
        this.seller_details.city_name,
        this.seller_details.state_name,
        this.seller_details.country_name,
      ]
        .filter(Boolean)
        .join(", ");
    }

    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getOrderList(1);
        })
      )
      .subscribe();

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value || ""))
    );

    this.getOrderList(this.page);
    this.getSearchHistory();
    this.getHelpDetails();
  }

  setCookie(search) {
    if (this.options.length > 4) {
      var first = this.options[0];
      var newNum = search;
      for (let i = 1; i < this.options.length; i++) {
        var temp = null;
        temp = this.options[i];
        this.options[i] = first;
        first = temp;
        if (i == this.options.length - 1) {
          this.options[0] = newNum;
        }
      }
    } else {
      this.options.unshift(search)
    }
    var data: any = this.options;
    this.cookieService.set("recentSearchPicker", data);
  }

  getSearchHistory() {
    var cookies = this.cookieService.get("recentSearchPicker");
    var data: any = cookies.split(",");
    if (data == "") {
      data = [];
    }
    this.options = data;
  }

  //delete history
  deleteHistory(data) {
    this.options.forEach((element, i) => {
      if (element == data) {
        this.options.splice(i, 1)
      }
    });
    this.myControl.setValue(null)
    var data: any = this.options;
    this.cookieService.set("recentSearchPicker", data);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    this.searchFun();

    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }
  /** Search */
  searchFun() {
    var value = this.myControl.value;
    this.options.forEach((el) => {
      if (value == el) {
        this.search = el;
        this.getOrderList(1);
      }
    });
  }

  clearsearch() {
    this.myControl.setValue(null)
    this.search = null
    this.getOrderList(1);
  }
  /** Get pick order list using service */
  //Get order list
  getOrderList(pageNo: any) {
    this.page = pageNo;
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    if (search != "") {
      var temp = false;
      this.options.forEach((element) => {
        if (element == search) {
          temp = true;
        }
      });
      if (temp == false) {
        this.setCookie(search);
      }
    }

    var data = {
      store_id: this.seller_details.store_id,
      user_id: this.seller_details.user_id,
      order_status: this.orderitem.status.toString(),
      page: pageNo,
      search_query: search,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy == true ? 1 : 2,
      limit: Number(this.selectedPerPage),
      picker_status: this.picker_status,
      express_delivery: this.express_delivery,
      role_id: 8
    };

    this.OrderService.getOrderListPicker(data).subscribe({
      next: (response: any) => {
        this.orderList = [];
        if (response.status == 1) {
          this.no_data = false;
          this.orderList = response.data;
          this.orderStatistics = response.order_statistics;
          this.picker_pending_count = response.picker_pending_count;
          this.picker_inprocess_count = response.picker_inprocess_count;
          this.orderList.forEach((Item: any) => {
            Item.date = Item.order_date.split(" ")[0];
            Item.isMenushow = false;
            Item.OrderStatus = Item.delivery_type_val;
            Item.OrderStatus = Item.order_status_val;
            Item.Number = "";
            Item.CustomerName =
              Item.name + (Item.Number != "" ? " (" + Item.Number + ")" : "");
          });
          this.total_count = response.count;
          this.cdr.detectChanges();
          // this.currentDateTime = new Date();
        } else {
          this.no_data = true;
          this.orderStatistics = response.order_statistics;
          this.orderList = [];
          this.total_count = 0;
          this.cdr.detectChanges();
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      },
    });
  }

  limitChange(event: any) {
    this.page = 1;
    this.selectedPerPage = event;
    this.getOrderList(this.page);
  }

  ShowExpressOrders(type: any) {
    this.express_delivery = type;
    this.getOrderList(1);
  }

  SearchOrderReport() {
    this.orderList = [];
    this.page = 1;
    this.getOrderList(this.page);
  }

  ChangeOrderStatus(item: any) {
    item.forEach((element) => {
      if (element == 0) {
        this.orderitem.status = [];
        this.orderStatusList.forEach((status: any) => {
          if (status.value != 0) {
            this.orderitem.status.push(status.value);
          }
        });
      }
    });
  }

  onlyDateReturn(dateTime: any) {
    if (dateTime) {
      return dateTime.substring(0, dateTime.indexOf(" "));
    }
  }

  onlyTimeReturn(dateTime: any) {
    if (dateTime) {
      return dateTime.substring(dateTime.indexOf(" ") + 1);
    }
  }

  sortAPISide(keyname: any) {
    this.sortKey = keyname; //set the sortKey to the param passed
    this.isOrderBy = !this.isOrderBy;
    this.getOrderList(this.page);
  }

  getSelectedStore(item: any) {
    this.SelectedStore.selected = item;
    this.seller_details = item;
    this.getOrderList(this.page);
  }

  printPackingOrderSummaryDetail(details: any, isordersummary: any) {
    var data: any = {
      order_id: details.order_id,
    };
    if (isordersummary == 2) {
      data.is_full_item_name = 1;
    }
    this.OrderService.getPickerOrderDetails(data).subscribe({
      next: (response: any) => {
        this.activityLogslist = [];
        if (response.status == 1) {
          // this.orderdetail = response.data;
          this.orderDetailBinding(response.data, isordersummary);
          if (this.orderitemdetail.length > 0) {
            window.setTimeout(() => {
              if (isordersummary == 1) {
                this.PrintDIV("PrintModel");
              } else if (isordersummary == 0) {
                this.PrintDIV("PrintPackSlip");
              } else if (isordersummary == 2) {
                this.PrintDIV("PrintMiniBill");
              } else if (isordersummary == 3) {
                this.PrintDIV("PrintPickList");
              }
            }, 1000);
          }
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      },
    });
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
    this.seller_details = this.orderdetail.store;
    this.seller_details.fullAddress = [
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
            packaging_name: variant.packaging_name,
            unit_name: variant.unit_name,
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

  PrintDIV(divId: any) {
    this.printCurrantDateTime = new Date();
    var contents = document.getElementById(divId).innerHTML;
    var body = document.getElementsByTagName("BODY")[0];

    //Create a dynamic IFRAME.
    var frame1: any = document.createElement("IFRAME");
    frame1.name = "frame1";
    frame1.setAttribute("style", "position:absolute;top:-1000000px");
    body.appendChild(frame1);

    //Create a Frame Document.
    var frameDoc = frame1.contentWindow
      ? frame1.contentWindow
      : frame1.contentDocument.document
        ? frame1.contentDocument.document
        : frame1.contentDocument;
    frameDoc.document.open();

    //Create a new HTML document.
    frameDoc.document.write("<html><head><title></title>");
    frameDoc.document.write("</head><body>");
    frameDoc.document.write(
      "<style>.profile-media {display: -ms-flexbox;display: flex;-ms-flex-align: start;align-items: flex-start;}.profile-body {-ms-flex: 1;flex: 1;padding-left: 15px;border-left: 1px solid #ddd;}.profile-media .profile-box {width: 90px;height: 90px;overflow: hidden;border-radius: 50%;margin-right: 15px;}.prcess-circle {width: 120px;height: 120px;display: inline-block;border: 2px solid #e0e0e0;border-radius: 50%;background-color: #ffffff;}.profile-media .profile-box img {width: 100%;}.profile-media .dt-row {margin-bottom: 10px;}.account-process {text-align: center;width: 100%;}.prcess-circle .title-box {margin-top: 22px;margin-left: auto;margin-right: auto;width: 90px;text-align: center;font-size: 14px;line-height: 18px}.prcess-circle .profile-box img {width: 100%;}.orderDetail {padding: 15px 0;}.orderDetail .control-label {margin: 0;}.modal-content tr:nth-child(even) {background: #CCC}.modal-content tr:nth-child(odd) {background: #FFF}.schaduleDiv{background-color:#24c9fcc7;padding: 10px 10px;margin-left: 12px;margin-top: 10px;}.table{border-collapse: inherit;} ul { padding-left: 0rem !important; list-style: none; }</style>"
    );
    frameDoc.document.write(
      "<style>@media print{.col-md-6{width:50%; float:left;} .col-sm-4 {width: 33.33333333%;float:left;} .col-md-8 {width: 66.66666667%;} .form-group label {margin-bottom: 5px;color: #666666;font-weight: 400;font-size: 13px; th {background-color: #d8d4d4;font-size: 13px; }}}.table > tbody > tr > td{font-size: 13px;} ul { padding-left: 0rem !important; list-style: none; }</style>"
    );
    if (divId == "PrintPackSlip") {
      //frameDoc.document.write('<style>@page{margin:0;size:Statement;}</style>');
      frameDoc.document.write("<style>@page{size:Statement;}</style>");
    } else {
      frameDoc.document.write("<style>@page{size:A4;}</style>");
    }

    //Append the external CSS file.
    frameDoc.document.write(
      '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">'
    );

    //Append the DIV contents.
    frameDoc.document.write(contents);
    frameDoc.document.write("</body></html>");
    frameDoc.document.close();

    window.setTimeout(function () {
      window.frames["frame1"].focus();
      window.frames["frame1"].print();
      body.removeChild(frame1);
    }, 1000);
  }

  viewCustomerOrderDetail(details: any) {
    var data = {
      order_id: details.order_id,
    };
    this.OrderService.getPickerOrderDetails(data).subscribe({
      next: (response: any) => {
        this.activityLogslist = [];
        if (response.status == 1) {
          // this.orderdetail = response.data;
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
  /** Open PickerOrderDetailsComponent modal*/
  orderDetailsModal(data: any) {
    const modalRef = this.modalService.open(PickerOrderDetailsComponent, {
      size: "lg",
    });
    modalRef.componentInstance.orderdetail = data;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.session = this.session;
    modalRef.componentInstance.OrderId.subscribe((orderId) => {
      this.editOrderDetail(orderId);
    });
  }

  OrderDivClick(name: any) {
    if (name == "Pending Orders") {
      // this.orderitem.status = [1];
      this.picker_status = 1;
      this.SearchOrderReport();
    } else if (name == "Running Orders") {
      // this.orderitem.status = [3,1,7,2];
      this.picker_status = 2;
      this.SearchOrderReport();
    }
  }
  /** Export GetOrderListDownloadData */
  exportData() {
    this.GetOrderListDownloadData(0);
  }

  GetOrderListDownloadData(pageNo: any) {
    // this.page = pageNo;
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    var data = {
      store_id: this.seller_details.store_id,
      user_id: this.seller_details.user_id,
      order_status: this.orderitem.status.toString(),
      search_query: search,
    };
    this.OrderService.getOrderListPicker(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var orderListDownload = response.data;

          orderListDownload.forEach((Item: any) => {
            Item.OrderDate = Item.order_date.split(" ")[0];
            Item.OrderStatus = Item.delivery_type_val;
            Item.OrderStatus = Item.order_status_val;
            Item.Number = "";
            Item.CustomerName =
              Item.name + (Item.Number != "" ? " (" + Item.Number + ")" : "");
            Item.phone = Number(Item.phone);
            Item.store_phone = Number(Item.store_phone);
            Item.amount = Number(Item.amount);
            Item.item_count = Number(Item.item_count);
            Item.confirmed_date =
              Item.confirmed_date == null ? "" : Item.confirmed_date;
            Item.deliveryboy_name =
              Item.deliveryboy_name == null ? "" : Item.deliveryboy_name;
            Item.deliveryboy_phone =
              Item.deliveryboy_phone == null ? "" : Item.deliveryboy_phone;
          });

          var mystyle: any = {
            headers: true,
          };

          if (this.show_customer_details_to_store == true) {
            mystyle.columns = [
              { columnid: "name", title: "Customer Name" },
              { columnid: "phone", title: "Customer Number" },
              { columnid: "store_name", title: this.store_label + " Name" },
              { columnid: "store_phone", title: this.store_label + " Number" },
              { columnid: "order_no", title: "Order Number" },
              { columnid: "amount", title: "Amount" },
              { columnid: "delivery_type_val", title: "Order Type" },
              { columnid: "order_status_val", title: "Status" },
              { columnid: "zipcode", title: "ZipCode" },
              { columnid: "OrderDate", title: "Order Date" },
              { columnid: "confirmed_date", title: "Confirmed" },
              {
                columnid: "deliveryboy_name",
                title: this.deliveryboy_label + " Name",
              },
              {
                columnid: "deliveryboy_phone",
                title: this.deliveryboy_label + " Number",
              },
              {
                columnid: "delivery_pickup_time",
                title: "Delivery Slot/ Time",
              },
              { columnid: "time_interval", title: "Time Remaining" },
              { columnid: "delivery_address", title: "Address" },
              { columnid: "item_count", title: "Item Count" },
            ];
          } else {
            mystyle.columns = [
              { columnid: "store_name", title: this.store_label + " Name" },
              { columnid: "store_phone", title: this.store_label + " Number" },
              { columnid: "order_no", title: "Order Number" },
              { columnid: "amount", title: "Amount" },
              { columnid: "delivery_type_val", title: "Order Type" },
              { columnid: "order_status_val", title: "Status" },
              { columnid: "zipcode", title: "ZipCode" },
              { columnid: "OrderDate", title: "Order Date" },
              { columnid: "confirmed_date", title: "Confirmed" },
              {
                columnid: "deliveryboy_name",
                title: this.deliveryboy_label + " Name",
              },
              {
                columnid: "deliveryboy_phone",
                title: this.deliveryboy_label + " Number",
              },
              {
                columnid: "delivery_pickup_time",
                title: "Delivery Slot/ Time",
              },
              { columnid: "time_interval", title: "Time Remaining" },
              { columnid: "delivery_address", title: "Address" },
              { columnid: "item_count", title: "Item Count" },
            ];
          }

          // alasql('SELECT * INTO XLSXML("Order Report ' + '.xls",?) FROM ?', [mystyle, orderListDownload]);
          // alasql('SELECT * INTO XLS("Order Report ' + '.xls",?) FROM ?', [mystyle, orderListDownload]);
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      },
    });
  }

  editOrderDetail(orderId) {
    var orderId = orderId;
    if (this.picker_status == 1) {
      this.start_pickup(orderId);
    }
    var obj = {
      page: this.page,
      search: this.search,
      status: this.orderitem.status,
      sortKey: this.sortKey,
      isOrderBy: this.isOrderBy,
      sellerDetails: this.seller_details,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    localStorage.setItem("picker_status", this.picker_status);
    this.cryptoService.encryptIdValue(
      orderId.toString(),
      "order_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/picker-selller-process-order"]);
  }

  start_pickup(orderId) {
    var data = {
      store_id: this.seller_details.store_id,
      user_id: this.seller_details.user_id,
      order_id: orderId,
    };

    this.OrderService.getOrderListPicker(data).subscribe({
      next: (response: any) => {
        this.orderList = [];
        if (response.status == 1) {
        } else {
        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      },
    });
  }

  ngOnDestroy(): void {
    $(
      "<style>.mat-form-field-appearance-outline .mat-form-field-outline {  margin-top:" +
      "0px" +
      " !important;  margin-bottom:" +
      "0px" +
      " !important;}</style>"
    ).appendTo("body");

    $(
      "<style>.mat-form-field-appearance-outline .mat-form-field-flex {  margin-top:" +
      "-0.25em" +
      " !important;</style>"
    ).appendTo("body");
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id,
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '135'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '135'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '135'
    }
    if (this.main.LoggedUserInfo.role_id == 8) {
      data.module_key = '135'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_details = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

}
