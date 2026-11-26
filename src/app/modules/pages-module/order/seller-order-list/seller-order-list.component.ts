import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  tap,
} from "rxjs";
import { AppComponent } from "src/app/app.component";
import { OrderService } from "src/app/services/order.service";
import { OrderDetailsModalComponent } from "../../model/order-details/order-details.component";
import { environment } from "src/environments/environment";
import { OrderHistoryComponent } from "../../model/order-history/order-history.component";
// calendar-start
import { CalendarOptions, FullCalendarComponent } from "@fullcalendar/angular";
import * as moment from "moment";
// FullCalendar plugins need the core loaded first. The import above is type-only
// (removed by TypeScript), so load the core explicitly.
import "@fullcalendar/core";
import timeGridPlugin from "@fullcalendar/timegrid";
import { NgEventBus } from "ng-event-bus";
import { CommonService } from "src/app/services/common.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { SellerProcessOrderComponent } from "../seller-process-order/seller-process-order.component";
import { ToastrService } from "ngx-toastr";
import { DOCUMENT } from "@angular/common";
// calendar-end

export type ResizeAnchorType =
  | 'top'
  | 'left'
  | 'bottom'
  | 'right'

export type ResizeDirectionType =
  | 'x'
  | 'y'
  | 'xy';

@Component({
  selector: "app-seller-order-list",
  templateUrl: "./seller-order-list.component.html",
  styleUrls: ["./seller-order-list.component.scss"],
})
export class SellerOrderListComponent implements OnInit,OnDestroy {
  // calendar-start
  @ViewChild("orderCalendar") calendarComponent: FullCalendarComponent;
  @ViewChild('mapOrderWise') orderDetailsView: SellerProcessOrderComponent;
  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin],
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev , today , next",
      center: " title",
      right: "dayGridMonth , timeGridWeek , timeGridDay ",
    },
    events: [],
    eventClick: this.eventByOrderDetail.bind(this, true),
    dateClick: this.onDateClick.bind(this),
    displayEventTime: false,
    handleWindowResize: true,
  };
  initialized = false;
  // calendar-end
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  amount_seperator = this.general_setting.amount_seperator;
  business_model = this.platform_setting.business_model;
  deliveryboy_label = this.general_setting.deliveryboy_label;
  store_tax_label = this.general_setting.store_tax_label;
  show_billing_address = this.general_setting.show_billing_address;
  global_timezone = this.general_setting.timezone;
  store_label = this.general_setting.store_label;
  show_price_same_font = this.general_setting.show_price_same_font;
  global_currency = this.general_setting.currency_symbol;
  webAdmin_URL = this.general_setting.webadmin_url;
  pincode_label = this.general_setting.pincode_label;
  picker_order_categories = this.general_setting.picker_order_categories;
  isdisplayChat = Number(this.general_setting.chat_module) == 0 ? false : true;
  orderStatistics: any = {};
  SelectedStore: any = {};
  show_customer_details_to_store =
    this.general_setting.show_customer_details_to_store == "1" ? true : false;
  no_data = true;
  selected: any = { perPage: "20" };
  perPages: any = [
    { id: "20", name: "20" },
    { id: "50", name: "50" },
    { id: "100", name: "100" },
    { id: "200", name: "200" },
    { id: "1000000000", name: "ALL" },
  ];
  sessionConfig = this.appComponent.sessionConfig();
  delivery_model = this.platform_setting.delivery_model;
  isSuperAdmin = false;
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  moment: any = moment;
  subscription_model = this.platform_setting.subscription_model;
  refund_module = this.general_setting.refund_module;

  orderStatusList: any = [{ label: "All", value: 0 }];
  orderitem = {
    status: [],
  };
  session = this.appComponent.sessionConfig();
  orderTypeList: any =
    [{ label: "All", value: 0, is_active: 0, count: 1 },
    { label: "Delivery", value: 1, is_active: 0, count: 0 },
    { label: "Dine IN", value: 5, is_active: 0, count: 0 },
    { label: "Expreess Delivery", value: 4, is_active: 0, count: 0 },
    { label: "Pickup", value: 2, is_active: 0, count: 0 },
    { label: "POS", value: 3, is_active: 0, count: 0 }];
  orderType = {
    status: [],
  };
  express_delivery: any = 0;
  page = 1;
  total_count = 0;
  orderList = [];
  oneAtATime = true;
  status = {
    open: true,
    isFirstOpen: true,
    isFirstDisabled: false,
  };
  date: any = {};
  fileName = "";
  main: any;
  closeResult: any;
  add_refund_module: boolean;
  view_refund_module: boolean;
  dashboardStatus: any;
  iseatery: any;
  isOrderBy: any;
  sortKey: any;
  search: any;
  ItemTotalPrice: any;
  printCurrantDateTime: any;
  orderdetail: any;
  orderitemdetail: any = [];
  adminSellerList: any = [];
  item: any = [];
  activityLogslist: any = [];
  tableSize: number = environment.tableSize;
  showCalender: boolean = false;
  CalendarDate: any = new Date();
  viewOrder: boolean = false;
  taxAndChargesTotalToolTip: any;
  dienInModule: any;
  posModule: any;
  count: number = 0;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  pendingColor = '#F8B931'
  acceptedColor = '#00AAFF'
  readyColor = '#DD11E0'
  deliveredColor = '#8FB038'
  rejectColor = '#FF7364'
  show_list: boolean = true;
  show_map: boolean = false;
  dateType: string;
  month: string;
  weekStart: string;
  weekEnd: string;
  day: string;
  show_day: boolean = false;
  show_month: boolean = false;
  show_week: boolean = false;
  todayButtonClicked: boolean = true;
  zoom: number = 15;
  delivery_type: any = 0;
  // initial center position for the map
  lat: number = 23.0225;
  lng: number = 72.5714;
  map_event_list: any = [];
  delivery_color = '#AC232A';
  express_delivery_color = '#DD11E0';
  pickup_color = '#F8B931';
  map_center_latitude: number;
  map_center_longitude: number;
  selected_order: number;
  view_order_id: any;
  isFilterIcon: any = false;
  interval: NodeJS.Timer;
  is_sidebar_open: boolean = false;

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private modalService: NgbModal,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private eventBus: NgEventBus,
    public commonService: CommonService,
    private _helpService: BannerService,
    private spinner: SpinnerService,
    @Inject(DOCUMENT) private _document: Document,
  ) {
    this.main = this.appComponent.main;
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.dateType = 'month';
    this.updateDate();
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin && this.platform_setting.delivery_model == 1) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.selected.perPage = "20";
    $(
      "<style>a.fc-col-header-cell-cushion , .fc-daygrid-day-number { color: black !important; }</style>"
    ).appendTo("body");
    this.eventBus.on("onCollapse").subscribe(() => {
      if (this.show_map) {
        setTimeout(() => {
          if (localStorage.getItem('sidebarOpen') == 'true') {
            this.is_sidebar_open = true;
            var container = document.getElementById("container")
            var right = document.getElementById("right_panel")
            var left = document.getElementById("left_panel")
            left.style.width = container.offsetWidth - right.offsetWidth + "px"
          } else {
            this.is_sidebar_open = false;
            var container = document.getElementById("container")
            var right = document.getElementById("right_panel")
            var left = document.getElementById("left_panel")
            left.style.width = container.offsetWidth - right.offsetWidth + "px"
          }
        }, 1000);
      }
      if (this.showCalender) {
        setTimeout(() => {
          this.calendarComponent.getApi().render();
        }, 500);
      }
    });
    this.item.combo_variants = [];
    this.main.DateFormate = this.general_setting.date_format_web;
    this.general_setting =
      this.general_setting == null ? this.main : this.general_setting;
    this.platform_setting =
      this.platform_setting == null
        ? this.main.platform_setting
        : this.platform_setting;
    if (
      this.main.LoggedUserInfo.role_id == 6 ||
      this.main.LoggedUserInfo.role_id == 1
    ) {
      this.isdisplayChat = false;
    }
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
    this.posModule = this.seller_details.pos;
    this.dienInModule = this.seller_details.dine_in;
    var orderList = this.general_setting.order_status_list;
    orderList.forEach((Item: any) => {
      var data = { label: Item.name, value: Number(Item.id) };
      this.orderStatusList.push(data);
    });
    if ((this.general_setting.dinein_module == 0 && this.dienInModule == 0) || (this.general_setting.dinein_module == 1 && this.dienInModule == 0)) {

      this.orderStatusList = this.orderStatusList.filter((order: any) => order.value != 9 && order.value != 10)
    }
    if ((this.general_setting.pos_module == 0 && this.posModule == 0) || (this.general_setting.pos_module == 1 && this.posModule == 0)) {
      this.orderStatusList = this.orderStatusList.filter((order: any) => order.value != 11)
    }
    if (this.seller_details) {
      if (this.isdisplayChat) {
        this.isdisplayChat = this.seller_details.chat == 1 ? true : false;
      }
      this.iseatery = this.seller_details.iseatery;
      this.dashboardStatus = this.sessionConfig.decryptIdValue(
        "dashboardStatus" + this.seller_details.store_id.toString(),
        this.main.CryptoKey
      );
      document.cookie =
        "dashboardStatus" +
        this.seller_details.store_id.toString() +
        "=;expires=Thu, 01 Jan 1970";

      if (this.dashboardStatus == 1) {
        this.orderitem.status = [1];
      } else if (this.dashboardStatus == 2) {
        this.orderitem.status = [2, 3, 4, 7];
      } else if (this.dashboardStatus == 5) {
        this.orderitem.status = [5];
      } else if (this.dashboardStatus == 6) {
        this.orderitem.status = [6, 8];
      } else {
        if ((this.general_setting.dinein_module == 0 && this.dienInModule == 0) || (this.general_setting.dinein_module == 1 && this.dienInModule == 0)) {
          this.orderitem.status = [1, 2, 3, 4, 7];
        } else {
          this.orderitem.status = [1, 2, 3, 4, 7, 9, 10];
        }
      }

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

    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;

    if (localStorage.getItem("processOrderData") != null && localStorage.getItem("processOrderData") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("processOrderData"));
      localStorage.removeItem("processOrderData");
    }

    if (filterObject) {
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.tableSize = filterObject.limit;
      this.orderitem.status = filterObject.status
      this.selected.perPage = filterObject.limit
    }
    this.getOrderList(this.page);
    this.cdr.detectChanges;

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
    this.getHelpDetails();
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getOrderList(1);
    }
  }

  eventByOrderDetail(flag, info) {
    var filterData = this.orderList.filter(
      (order) => order.order_no === info.event.title
    );
    this.viewCustomerOrderDetail(filterData[0], flag);
  }

  calendarChangeDate() {
    if (this.showCalender) {
      this.calendarComponent
        .getApi()
        .gotoDate(moment(this.CalendarDate).format("yyyy-MM-DD"));
    }

    if (this.show_map) {
      this.updateDate();
      this.todayButtonClicked = false;

    }
  }

  viewCustomerOrderDetail(details: any, flag) {
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

  Calender() {
    this.showCalender = true;
    this.show_list = false;
    this.show_map = false;
    clearInterval(this.interval)
    this.getOrderList(1);
  }
  list() {
    this.showCalender = false;
    this.show_list = true;
    this.show_map = false;
    clearInterval(this.interval)
  }
  map() {
    this.showCalender = false;
    this.show_list = false;
    this.show_map = true;
    this.getOrderList(1);
    var isResizing = false;
    var lastX = 0;

    this.interval = setInterval(() => {
      if (this.show_map) {
        var container = document.getElementById("container"),
          left = document.getElementById("left_panel"),
          right = document.getElementById("right_panel"),
          handle = document.getElementById("drag");

        handle.onmousedown = function (e) {
          isResizing = true;
          lastX = e.clientX;          
        };

        document.onmousemove = function (e) {
          if (!isResizing) {
            return;
          }          
          var dx = e.clientX - lastX;
          lastX = e.clientX;

          var newLeftWidth = left.offsetWidth + dx;
          var newRightWidth = container.offsetWidth - newLeftWidth;
          
          var minWidth = 0;
          if (newLeftWidth > minWidth && newRightWidth > minWidth) {
            left.style.width = newLeftWidth + "px";
            right.style.width = newRightWidth + "px";
          }
        };

        document.onmouseup = function (e) {
          isResizing = false;
        };
      }
    }, 1000);
  }

  /**
 * To update the filter order status wise
 */
  updateOrderStatus(index: any) {
    if (index == 0) {
      this.orderTypeList[index].is_active == 0 ? this.orderTypeList[index].is_active = 1 : this.orderTypeList[index].is_active = 0;
      this.orderTypeList.forEach((element: any) => {
        if (this.orderTypeList[0].is_active == 0) {
          element.is_active = 0;
        } else {
          element.is_active = 1;
        }
      });
    }
    else {
      this.orderTypeList[index].is_active == 0 ? this.orderTypeList[index].is_active = 1 : this.orderTypeList[index].is_active = 0;
      var is_all_true = this.orderTypeList.filter((status: any) => status.is_active == 0);
      if (is_all_true.length == 1) {
        this.orderTypeList[0].is_active == 0 ? this.orderTypeList[0].is_active = 1 : this.orderTypeList[0].is_active = 0;
      } else {
        this.orderTypeList[0].is_active = 0;

      }
    }
    this.orderList = []
    var tempStatusList = this.orderTypeList.filter((status: any) => status.is_active == 1);
    this.delivery_type = tempStatusList.map((x: any) => x.value).toString();
    if (this.delivery_type) {
      this.isFilterIcon = true;
    } else {
      this.isFilterIcon = false;
    }
    this.getOrderList(1);
  }

  onDateClick(event) {
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.changeView('timeGridDay', event.dateStr);
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
    modalRef.componentInstance.taxAndChargesTotalToolTip = this.taxAndChargesTotalToolTip;
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
      }
    );
  }

  printPackingOrderSummaryDetail(details: any, isordersummary: any) {
    var data: any = {
      order_id: details.order_id,
    };
    if (isordersummary == 2) {
      data.is_full_item_name = 1;
    }
    this.orderService.getOrderDetails(data).subscribe({
      next: (response: any) => {
        this.activityLogslist = [];
        if (response.status == 1) {
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
        this.general_setting.store_tax_label +
        ": " +
        global_currency +
        " " +
        Number(order_tax).toFixed(2) +
        "</div>";
    } else {
      taxAndChargesTotalToolTip =
        "<div style='width:100%;'><div style='float:left; text-align:left;'>" +
        this.general_setting.store_label +
        " Packaging Cost: </div><div style='float:right;'> " +
        global_currency +
        " " +
        Number(packaging_cost).toFixed(2) +
        "</div> </div><div style='width:100%;clear:both;'><div style='width:calc(100% - 50px); float:left; text-align:left;'> " +
        this.general_setting.store_tax_label +
        ": </div><div style='float:right;'>" +
        global_currency +
        " " +
        Number(order_tax).toFixed(2) +
        "</div>";
    }
    return taxAndChargesTotalToolTip;
  }

  getselectedSubChoice = function (ch2) {
    var choices = ch2.choice_prices.filter(function (ch) {
      return ch.is_added == 1;
    });
    if (choices.length > 0) {
      return choices[0].variant_sub_choice_name;
    }
    return "";
  };

  DateFormateFromServerSide() {
    return "yyyy-MM-DD HH:mm:ss";
  }
  eventList = [];
  async getOrderList(pageNo: any) {
    this.spinner.show();
    this.page = pageNo;
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    var data: any = {
      store_id: this.seller_details.store_id,
      user_id: this.seller_details.user_id,
      order_status: this.orderitem.status.toString(),
      search_query: search,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy == true ? 1 : 2,
      limit: this.show_map || this.showCalender ? "" : Number(this.selected.perPage),
      express_delivery: this.express_delivery,
      role_id: 2,
      delivery_type: this.delivery_type
    };

    if (!this.show_map && !this.showCalender) {
      data.page = pageNo;
    }

    await this.orderService.getOrderList(data).subscribe({
      next: (response: any) => {
        this.orderList = [];
        if (response.status == 1) {
          this.spinner.hide();
          this.no_data = false;
          this.orderList = response.data;
          this.orderTypeList.forEach((element: any) => {
            if (element.value == 1) {
              element.count = response.order_statistics.delivery_count
            }
            if (element.value == 2) {
              element.count = response.order_statistics.pick_up_count
            }
            if (element.value == 3) {
              element.count = response.order_statistics.pos_count
            }
            if (element.value == 4) {
              element.count = response.order_statistics.express_delivery_count
            }
            if (element.value == 5) {
              element.count = response.order_statistics.dine_in_count
            }
          });
          this.orderStatistics = response.order_statistics;
          this.orderList.forEach((Item: any) => {
            Item.date = Item.order_date?.split(" ")[0];
            Item.isMenushow = false;
            Item.OrderStatus = Item.delivery_type_val;
            Item.OrderStatus = Item.order_status_val;
            Item.Number = "";
            Item.CustomerName =
              Item.name + (Item.Number != "" ? " (" + Item.Number + ")" : "");
          });
          this.eventList = [];
          this.orderList.forEach((Item: any, index) => {
            var data: any = {};
            data.title = Item.order_no;
            data.orderDetail = Item;
            data.allDay = false;
            data.editable = false;
            if (Item.order_status_val == "Pending") {
              data.backgroundColor = '#F8B931';
              data.background = '#F8B931';
            } else if (Item.order_status_val == "Accepted") {
              data.backgroundColor = "#00AAFF";
            } else if (Item.order_status_val == "Ready For Pickup") {
              data.backgroundColor = "#DD11E0";
            } else if (Item.order_status_val == "Out For Delivery") {
              data.backgroundColor = "#DD11E0";
            } else if (Item.order_status_val == "Delivered") {
              data.backgroundColor = "#8FB038";
            } else if (Item.order_status_val == "Rejected") {
              data.backgroundColor = "#FF7364";
            } else if (Item.order_status_val == "Undelivered") {
              data.backgroundColor = "#00AAFF";
            } else if (Item.order_status_val == "Cancelled") {
              data.backgroundColor = "#FF7364";
            } else if (Item.order_status_val == "Processing") {
              data.backgroundColor = "#00AAFF";
            } else if (Item.order_status_val == "Ready For Billing") {
              data.backgroundColor = "#DD11E0";
            } else if (Item.order_status_val == "Completed") {
              data.backgroundColor = "#8FB038";
            }

            if (Item.delivery_type == 2) {
              if (Item.pickup_time_type == 1) {
                if (Item.revised_pickup_slot_from != null) {
                  data.start = moment(Item.revised_pickup_slot_from).format(
                    this.DateFormateFromServerSide()
                  );
                  data.end = moment(Item.revised_pickup_slot_to).format(
                    this.DateFormateFromServerSide()
                  );
                } else {
                  data.start = moment(Item.pickup_slot_from).format(
                    this.DateFormateFromServerSide()
                  );
                  data.end = moment(Item.pickup_slot_to).format(
                    this.DateFormateFromServerSide()
                  );
                }
              } else {
                if (
                  Item.delivery_pickup_time != null &&
                  Item.delivery_pickup_time != "" &&
                  Item.delivery_pickup_time != "-"
                ) {
                  data.start = moment(Item.delivery_slot_from).format(
                    this.DateFormateFromServerSide()
                  );
                  data.end = moment(Item.delivery_slot_to).format(
                    this.DateFormateFromServerSide()
                  );
                }
              }
            } else if (Item.delivery_type == 5) {
              var orderDate = Item.order_date?.substring(
                0,
                Item.order_date.length - 4
              );
              data.start = moment(orderDate).format(
                this.DateFormateFromServerSide()
              );
              data.end = moment(orderDate).format(
                this.DateFormateFromServerSide()
              );
            } else {
              if (Item.delivery_time_type == 1) {
                if (Item.revised_delivery_slot_from != null) {
                  data.start = moment(Item.revised_delivery_slot_from).format(
                    this.DateFormateFromServerSide()
                  );
                  data.end = moment(Item.revised_delivery_slot_to).format(
                    this.DateFormateFromServerSide()
                  );
                } else {
                  data.start = moment(Item.delivery_slot_from).format(
                    this.DateFormateFromServerSide()
                  );
                  data.end = moment(Item.delivery_slot_to).format(
                    this.DateFormateFromServerSide()
                  );
                }
              } else {
                if (
                  Item.delivery_pickup_time != null &&
                  Item.delivery_pickup_time != "" &&
                  Item.delivery_pickup_time != "-"
                ) {
                  var deliveryPickupTime = Item.delivery_pickup_time.substring(
                    0,
                    Item.delivery_pickup_time.length - 4
                  );
                  data.start = moment(deliveryPickupTime).format(
                    this.DateFormateFromServerSide()
                  );
                  data.end = moment(deliveryPickupTime).format(
                    this.DateFormateFromServerSide()
                  );
                }
              }
            }
            this.eventList.push(data);
          });

          this.calendarOptions.events = this.eventList;
          if (this.show_map) {
            this.mapDisplayOrderWise();
          }
          this.total_count = response.count;

          this.cdr.detectChanges();
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

  sortAPISide(keyname: any) {
    this.sortKey = keyname; //set the sortKey to the param passed
    this.isOrderBy = !this.isOrderBy;
    this.getOrderList(this.page);
  }

  limitChange(event: any) {
    if (event == 1000000000) {
      this.tableSize = this.total_count;
    } else {
      this.tableSize = event;
    }
    this.page = 1;
    this.selected.perPage = event;

    this.getOrderList(this.page);
  }

  getInitials(name: any) {
    if (name != undefined) {
      var canvas: any = document.createElement("canvas");
      canvas.style.display = "none";
      canvas.width = "25";
      canvas.height = "25";
      document.body.appendChild(canvas);
      var context = canvas.getContext("2d");
      context.fillStyle = "#476ce8";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = "16px Arial";
      context.fillStyle = "#FFFFFF";
      var nameArray = name.split(" ");
      var initials = "";
      initials = initials + nameArray[0][0];
      if (initials.length > 1) {
        context.fillText(initials.toUpperCase(), 8, 22);
      } else {
        context.fillText(initials.toUpperCase(), 8, 19);
      }
      var data = canvas.toDataURL();
      document.body.removeChild(canvas);
      return data;
    } else {
      return false;
    }
  }

  OrderDivClick(name: any) {
    if (name == "Pending Orders") {
      this.orderitem.status = [1];
      this.SearchOrderReport();
    } else if (name == "Running Orders") {
      if ((this.general_setting.dinein_module == 0 && this.dienInModule == 0) || (this.general_setting.dinein_module == 1 && this.dienInModule == 0)) {
        this.orderitem.status = [2, 3, 4, 7];
      } else {
        this.orderitem.status = [2, 3, 4, 7, 9, 10];
      }
      this.SearchOrderReport();
    } else if (name == "Completed Orders") {
      if ((this.general_setting.dinein_module == 0 && this.dienInModule == 0) || (this.general_setting.dinein_module == 1 && this.dienInModule == 0)) {
        this.orderitem.status = [5];
      } else {
        this.orderitem.status = [5, 11];
      }
      this.SearchOrderReport();
    } else if (name == "Cancelled Orders") {
      this.orderitem.status = [6, 8];
      this.SearchOrderReport();
    }
  }

  SearchOrderReport() {
    this.orderList = [];
    this.page = 1;
    this.getOrderList(this.page);
    if (this.show_map) {
      this.mapDisplayOrderWise();
    }
  }

  ShowExpressOrders(type: any) {
    this.express_delivery = type;
    this.getOrderList(1);
  }

  ChangeOrderStatus(item: any) {
    item.forEach(element => {
      if (element == 0) {
        this.orderitem.status = [];
        this.orderStatusList.forEach((status: any) => {
          if (status.value != 0) {
            this.orderitem.status.push(status.value);
          }
        });
      }
    })

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

  PrintDIV(divId: any) {
    this.printCurrantDateTime = moment(new Date()).format(this.main.DateFormate);
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

  getSelectedStore(item: any) {
    this.SelectedStore.selected = item;
    this.seller_details = item;
    this.getOrderList(this.page);
  }

  editOrderDetail(orderId) {
    var limitData = this.selected.perPage

    var obj = {
      page: this.page,
      search: this.search,
      status: this.orderitem.status,
      sortKey: this.sortKey,
      isOrderBy: this.isOrderBy,
      sellerDetails: this.seller_details,
      limit: limitData
    };

    localStorage.setItem("processOrderData", JSON.stringify(obj));
    this.sessionConfig.encryptIdValue(
      orderId.toString(),
      "order_id" + this.seller_details?.store_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/order/selller-process-order"]);
  }
  /** Encrypted orderId for sending to generate edit-refund module */
  generate_refund(orderId) {
    this.sessionConfig.encryptIdValue(
      orderId.toString(),
      "order_id" + this.seller_details.store_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/generate-refund/edit-refund"]);
  }

  chatSupport(orderId) {
    this.sessionConfig.encryptIdValue(
      orderId.toString(),
      "ProcessOrderOrderId" + this.seller_details.store_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/chat-support"]);
  }
  /** Open OrderHistoryComponent modal */
  orderhistory(OrderDetails) {
    const modalRef = this.modalService.open(OrderHistoryComponent, {
      size: "lg-950",
    });
    modalRef.componentInstance.OrderDetails = OrderDetails;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.session = this.session;
  }


  exportData() {
    var data = {
      store_id: this.seller_details.store_id,
      user_id: this.seller_details.user_id,
      order_status: this.orderitem.status.toString(),
      express_delivery: this.express_delivery,
      is_export: 1,
    };

    this.orderService.exportOrderList(data).subscribe({
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
      data.module_key = '109'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '109'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '109'
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

  showMonth() {
    this.dateType = 'month';
    this.CalendarDate = new Date();
    this.updateDate();
  }

  showWeek() {
    this.dateType = 'week';
    this.CalendarDate = new Date();
    this.updateDate();
  }

  showDay() {
    this.dateType = 'day';
    this.CalendarDate = new Date();
    this.updateDate();
  }

  updateDate() {
    switch (this.dateType) {
      case 'month':
        this.month = moment(this.CalendarDate).format('MMMM YYYY');
        break;
      case 'week':
        const startOfWeek = moment(this.CalendarDate).startOf('week').format('MMM D, YYYY');
        const endOfWeek = moment(this.CalendarDate).endOf('week').format('MMM D, YYYY');
        this.weekStart = startOfWeek;
        this.weekEnd = endOfWeek;
        break;
      case 'day':
        this.day = moment(this.CalendarDate).format('MMMM D, YYYY');
        break;
      default:
        break;
    }
    this.mapDisplayOrderWise();
  }

  decrementDate() {
    switch (this.dateType) {
      case 'month':
        this.month = moment(this.month, 'MMMM YYYY').subtract(1, 'month').format('MMMM YYYY');
        let month_current = moment(new Date()).format('MMMM YYYY')
        if (this.month == month_current) {
          this.todayButtonClicked = true;
        } else {
          this.todayButtonClicked = false;
        }
        break;
      case 'week':
        const startOfWeek = moment(this.weekStart, 'MMM D, YYYY').subtract(1, 'week').startOf('week').format('MMM D, YYYY');
        const endOfWeek = moment(this.weekEnd, 'MMM D, YYYY').subtract(1, 'week').endOf('week').format('MMM D, YYYY');
        this.weekStart = startOfWeek;
        this.weekEnd = endOfWeek;
        const startCurrentWeek = moment().startOf('week').format('MMM D, YYYY');
        const endCurrentWeek = moment().endOf('week').format('MMM D, YYYY');
        if (`${startCurrentWeek} - ${endCurrentWeek}` == `${this.weekStart} - ${this.weekEnd}`) {
          this.todayButtonClicked = true;
        } else {
          this.todayButtonClicked = false;
        }
        break;
      case 'day':
        this.day = moment(this.day, 'MMMM D, YYYY').subtract(1, 'day').format('MMMM D, YYYY');
        let currentDay = moment().format('MMMM D, YYYY');
        if (this.day == currentDay) {
          this.todayButtonClicked = true;
        } else {
          this.todayButtonClicked = false;
        }
        break;
      default:
        break;
    }
    this.mapDisplayOrderWise();
  }

  incrementDate() {
    switch (this.dateType) {
      case 'month':
        this.month = moment(this.month, 'MMMM YYYY').add(1, 'month').format('MMMM YYYY');
        let month_current = moment(new Date()).format('MMMM YYYY')
        if (this.month == month_current) {
          this.todayButtonClicked = true;
        } else {
          this.todayButtonClicked = false;
        }
        break;
      case 'week':
        const startOfWeek = moment(this.weekStart, 'MMM D, YYYY').add(1, 'week').startOf('week').format('MMM D, YYYY');
        const endOfWeek = moment(this.weekEnd, 'MMM D, YYYY').add(1, 'week').endOf('week').format('MMM D, YYYY');
        this.weekStart = startOfWeek;
        this.weekEnd = endOfWeek;
        const startCurrentWeek = moment().startOf('week').format('MMM D, YYYY');
        const endCurrentWeek = moment().endOf('week').format('MMM D, YYYY');
        if (`${startCurrentWeek} - ${endCurrentWeek}` == `${this.weekStart} - ${this.weekEnd}`) {
          this.todayButtonClicked = true;
        } else {
          this.todayButtonClicked = false;
        }
        break;
      case 'day':
        this.day = moment(this.day, 'MMMM D, YYYY').add(1, 'day').format('MMMM D, YYYY');
        let currentDay = moment().format('MMMM D, YYYY');
        if (this.day == currentDay) {
          this.todayButtonClicked = true;
        } else {
          this.todayButtonClicked = false;
        }
        break;
      default:
        break;
    }
    this.mapDisplayOrderWise();
  }
  today() {
    switch (this.dateType) {
      case 'month':
        this.month = moment().format('MMMM YYYY');
        break;
      case 'week':
        const startOfWeek = moment().startOf('week').format('MMM D, YYYY');
        const endOfWeek = moment().endOf('week').format('MMM D, YYYY');
        this.weekStart = startOfWeek;
        this.weekEnd = endOfWeek;
        break;
      case 'day':
        this.day = moment().format('MMMM D, YYYY');
        break;
      default:
        break;
    }
    this.todayButtonClicked = true;
    this.mapDisplayOrderWise();
  }
  show_delivery_count: number = 0;
  show_pickup_count: number = 0;
  show_express_delivery_count: number = 0;
  mapDisplayOrderWise() {
    this.map_event_list = [];
    this.orderList.forEach((order: any, index) => {
      let momentObject = order.delivery_pickup_time ? order.delivery_pickup_time.split(" ") : '';
      if (this.dateType == 'month' && order.delivery_pickup_time && this.month == moment(momentObject[0]).format('MMMM YYYY')) {
        this.map_event_list.push(order)
        if (this.map_event_list != null && this.map_event_list != undefined) {
          this.map_center_latitude = this.map_event_list[0].to_latitude;
          this.map_center_longitude = this.map_event_list[0].to_latitude;
        }
      }
      let date1: any = moment(moment(momentObject[0]).format('MMM DD, YYYY'), "MMM DD, YYYY");
      let date2: any = moment(moment(momentObject[0]).format('MMM DD, YYYY'), "MMM DD YYYY");
      let week_start: any = moment(this.weekStart, "MMM DD, YYYY")
      let week_end: any = moment(this.weekEnd, "MMM DD, YYYY")
      if (this.dateType == 'week' && week_start <= date1 && week_end >= date2) {
        this.map_event_list.push(order)
      }
      if (this.dateType == 'day' && this.day == moment(momentObject[0]).format('MMMM D, YYYY')) {
        this.map_event_list.push(order)
      }

    })
    this.show_delivery_count = 0;
    this.show_pickup_count = 0;
    this.show_express_delivery_count = 0;
    this.map_event_list.forEach(element => {
      if (element.delivery_type == '1') {
        this.show_delivery_count++;
      }
      if (element.delivery_type == '2') {
        this.show_pickup_count++;
      }
      if (element.delivery_type == '4') {
        this.show_express_delivery_count++;
      }


    });


    if (this.map_event_list.length > 0) {
      this.openOrderDetails(this.map_event_list[0], 0);
    }
  }
  nextOrderItemDetails() {
    if (this.map_event_list.length > this.selected_order + 1) {
      this.openOrderDetails(this.map_event_list[this.selected_order + 1], this.selected_order + 1);
    }
  }
  previousOrderItemDetails() {
    if (this.map_event_list.length >= this.selected_order) {
      this.openOrderDetails(this.map_event_list[this.selected_order - 1], this.selected_order - 1);
    }
  }

  openOrderDetails(order_details: any, index: any) {
    this.view_order_id = order_details.order_id;
    this.selected_order = index;
    this.sessionConfig.encryptIdValue(
      order_details?.order_id.toString(),
      "order_id" + this.seller_details?.store_id.toString(),
      this.main.CryptoKey
    );
    if (this.selected_order >= 0) {
      this.orderDetailsView.openOrderDetailsOrderWise();
      this.cdr.detectChanges();
    }
    this.cdr.detectChanges();
  }

  editOrderDetailPage() {
    this.sessionConfig.encryptIdValue(
      this.view_order_id.toString(),
      "order_id" + this.seller_details?.store_id.toString(),
      this.main.CryptoKey

    );
    window.open('/order/selller-process-order', "_blank");
  }

  ngOnDestroy(): void {
    clearInterval(this.interval)
  }

}
