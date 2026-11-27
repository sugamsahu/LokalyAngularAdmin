
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AdminDashboardService } from "src/app/services/dashboard/admin-dashboard.service";
import * as moment from "moment";
import { pickerDate } from "src/app/utils/date-range";
import { AppComponent } from "src/app/app.component";
import { DashboardHelpInfoComponent } from "../model/dashboard-help-info/dashboard-help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DemoStoreService } from "src/app/services/configuration/demo-store.service";
import { Chart } from "angular-highcharts";
import { UntypedFormControl, UntypedFormGroup, UntypedFormBuilder } from "@angular/forms";
import { StoreService } from "src/app/services/store.service";
import { CommonService } from "src/app/services/common.service";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  adminDashboard: any;
  sellerDetails: any;
  generalSetting: any;
  startdate: any;
  enddate: any;
  main: any;
  platformSetting: any;
  business_model: any;
  isOrderBalanceShowPlatForm: boolean;
  global_currency: any;
  global_timezone: any;
  pincode_label: any;
  khata_label: any;
  platform_name: any;
  allow_khata: number;
  store_label: any;
  searchText: string;
  show_price_same_font: any;
  data: any = [];
  helpDetails: any;
  moduleHide: boolean;
  public range: UntypedFormGroup;
  currentday: any = new Date();
  language_id = localStorage.getItem("select_lan_id") || "1";
  alwaysShowCalendars: boolean;
  selected: any;
  dashboard_help_active: any = 0;
  dashboard_title: any = '';
  module_key: any;
  ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  }
  help_list: any = [];
  helpDetailsOrderStatistics: any;
  helpDetailsStoreOrderStatistics: any;
  helpDetailsPlatformMetrix: any;
  helpDetailsStoreStatistics: any;
  helpDetailsaPayment: any;
  helpDetailsaOrderHour: any;
  helpDetailsaCreditAccount: any;
  helpDetailsaLastOrder: any;
  wishlist: any;
  amount_seperator: any;
  sellerList: any = [];
  SelectedStore: any;
  tempSellerList: any = [];
  registered_on: any;
  storeId = 0;
  metrix_type = 1;
  date_format: { format: any; };
  donutChart: Chart;
  order_count_chart: Chart;
  amount_chart: Chart;
  item_chart: Chart;

  constructor(
    public translate: TranslateService,
    private AdminDashboardService: AdminDashboardService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private DemoStoreService: DemoStoreService,
    private _helpService: BannerService,
    private formBuilder: UntypedFormBuilder,
    private storeService: StoreService,
    public commonService: CommonService,
    public spinner: NgxSpinnerService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit() {
    this.selected = { startDate: new Date(), endDate: new Date() };
    this.date_format = {
      format: this.main.DateFormate.split(" ")[0]
    }
    this.getConditions();
    this.loadForm();
    this.getHelpList();
    this.cdr.detectChanges();
  }

  /** Conditions for gerneral setting  */
  getConditions() {
    this.startdate = moment(new Date()).format(
      this.main.DateFormate.split(" ")[0]
    );
    this.enddate = moment(new Date()).format(
      this.main.DateFormate.split(" ")[0]
    );
    this.sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.generalSetting = JSON.parse(
      localStorage.getItem("LoggedUserSettings")
    );
    this.generalSetting =
      this.generalSetting == null ? this.main : this.generalSetting;
    this.global_currency = this.generalSetting.currency_symbol;
    this.amount_seperator = this.generalSetting?.amount_seperator;
    this.global_timezone = this.generalSetting.timezone;
    this.pincode_label = this.generalSetting.pincode_label;
    this.wishlist = this.generalSetting?.wishlist;
    if (this.generalSetting) {
      this.khata_label = this.generalSetting.khata_label;
      this.allow_khata = parseInt(this.generalSetting.allow_khata);
      this.store_label = this.generalSetting.store_label;
      this.platform_name = this.generalSetting.platform_name;
      this.show_price_same_font = this.generalSetting.show_price_same_font;
    } else {
      this.khata_label = this.main.khata_label;
      this.allow_khata = parseInt(this.main.allow_khata);
      this.store_label = this.main.store_label;
      this.platform_name = this.main.platform_name;
      this.show_price_same_font = this.main.show_price_same_font;
    }
    this.main.LoggedUserInfo.license_detail = JSON.parse(
      localStorage.getItem("subscriptionDetails")
    );

    this.platformSetting = JSON.parse(
      localStorage.getItem("_platform_setting")
    );
    this.platformSetting =
      this.platformSetting == null
        ? this.main.platform_setting
        : this.platformSetting;
    this.business_model = this.platformSetting.business_model;
    this.isOrderBalanceShowPlatForm = true;
    if (this.business_model == 3) {
      this.isOrderBalanceShowPlatForm =
        this.business_model == 1
          ? true
          : this.business_model == 2
            ? true
            : false;
      this.isOrderBalanceShowPlatForm =
        this.main.LoggedUserInfo.role_id == 6
          ? true
          : this.isOrderBalanceShowPlatForm;
    }

    this.moduleHide =
      this.business_model == 1
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;
    if (this.moduleHide == true) {
      this.getUserDetails();
      // this.getAdminDashboard();
    }
  }

  // load form
  loadForm() {
    this.range = this.formBuilder.group({
      start: new UntypedFormControl(new Date()),
      end: new UntypedFormControl(new Date()),
    });
  }

  datechangefun() {
    if (this.range.value.end == null) {
      this.range.controls["end"].setValue(new Date());
    }
    var StartDate: any;
    var EndDate: any;
    StartDate = moment(this.range.value.start).format(
      this.main.DateFormate.split(" ")[0]
    );
    EndDate = moment(this.range.value.end).format(
      this.main.DateFormate.split(" ")[0]
    );
    this.startdate = StartDate;
    this.enddate = EndDate;
    this.getAdminDashboard();
  }

  getDate(item) {
    var StartDate: any;
    var EndDate: any;
    if (item == 1) {
      StartDate = moment(new Date("01-01-2018")).format(
        this.main.DateFormate.split(" ")[0]
      );
      EndDate = moment(this.range.value.end).format(
        this.main.DateFormate.split(" ")[0]
      );
    }

    if (item == 2) {
      StartDate = moment(new Date(new Date().setDate(1))).format(
        this.main.DateFormate.split(" ")[0]
      );
      EndDate = moment(
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      ).format(this.main.DateFormate.split(" ")[0]);
    }
    if (item == 3) {
      StartDate = moment(
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      ).format(this.main.DateFormate.split(" ")[0]);
      EndDate = moment(
        new Date(new Date().getFullYear(), new Date().getMonth(), 0)
      ).format(this.main.DateFormate.split(" ")[0]);
    }
    this.startdate = StartDate;
    this.enddate = EndDate;
    this.range.controls["start"].setValue(new Date(moment(StartDate, this.main.DateFormate.split(' ').toString()).toDate()));
    this.range.controls["end"].setValue(new Date(moment(EndDate, this.main.DateFormate.split(' ').toString()).toDate()));
    this.getAdminDashboard();
  }

  // get seller
  async getUserDetails() {
    let data: {
      market_type: 2
    };
    await this.DemoStoreService.getSellerListRecord(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.sellerList = response.data;
          this.sellerList = this.sellerList.sort((a, b) => a.store_name.localeCompare(b.store_name));

          var storedefault = {
            store_id: 0,
            store_name: "",
            manager_name: "All " + this.store_label,
          };
          this.sellerList.splice(0, 0, storedefault);
          this.SelectedStore = this.sellerList[0];

          localStorage.setItem(
            "UniqLinkSellerDetails",
            JSON.stringify(this.SelectedStore)
          );
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //change store
  getSelectedUser(item) {
    if (item.store_id != 0) {
      this.SelectedStore =
        item.store_name + " " + "(" + item.manager_name + ")";
    }
    this.registered_on = new Date(item.registered_on);
    this.storeId = item.store_id;
  }
  // get adminDashboard data
  async getAdminDashboard() {
    this.spinner.show('home');
    if (this.selected.startDate == null && this.selected.endDate == null) {
      this.selected = { startDate: new Date(), endDate: new Date() };
    }
    // this.startdate = pickerDate(this.selected.startDate).format(this.main.DateFormate.split(" ")[0])
    // this.enddate = pickerDate(this.selected.endDate).format(this.main.DateFormate.split(" ")[0])
    this.startdate = pickerDate(this.selected.startDate).format(this.generalSetting.date_format_web.split(" ")[0]);
    this.enddate = pickerDate(this.selected.endDate).format(this.generalSetting.date_format_web.split(" ")[0]);
    const data = {
      store_id: this.storeId,
      from_date: this.startdate,
      to_date: this.enddate,
    };

    await this.AdminDashboardService.getAdminDashboard(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.adminDashboard = null;
          this.adminDashboard = response.data;

          if (this.metrix_type == 1) {
            this.adminDashboard.metrix_details =
              response.data.top_products_sellers_cancelled;
          }
          if (this.metrix_type == 2) {
            this.adminDashboard.metrix_details =
              response.data.top_products_wishlists;
          }
          if (this.metrix_type == 3) {
            this.adminDashboard.metrix_details =
              response.data.top_categories_sales;
          }
          if (this.metrix_type == 4) {
            this.adminDashboard.metrix_details =
              response.data.customer_repeat_rates;
          }
          this.spinner.hide('home');
          this.createChartPie();
          this.orderCountForChart();
          this.orderAmountForChart();
          this.orderItemCountForChart();
          this.cdr.detectChanges();
        } else {
          this.spinner.hide('home');
          this.toastr.error(response.message);
        }
      },
    });
  }
  /** Open DashboardHelpInfoComponent modal */
  //Help modal
  openinfomodel(selected) {
    const modalRef = this.modalService.open(DashboardHelpInfoComponent, {
      size: "md",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
  }

  //download pdf
  DownloadPDFForBannerAndPoster(value) {
    var data = {};
    switch (value) {
      case "Banner":
        {
          data = {
            store_id: this.storeId,
          };
        }
        break;
      case "Poster":
        {
          data = {
            store_id: this.storeId,
            poster: 1,
          };
        }
        break;
    }
    this.getDownloadPDFForBannerAndPoster(data);
  }

  getDownloadPDFForBannerAndPoster(data) {
    this.storeService.getPosterOrBannerPdfUrl(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var fileName = response.data.substr(
            response.data.lastIndexOf("/") + 1
          );
          var xhr = new XMLHttpRequest();
          xhr.open("GET", response.data, true);
          xhr.responseType = "blob";

          xhr.onprogress = function (event) {
            if (event.lengthComputable) {
              var percentComplete = (event.loaded / event.total) * 100;
            }
          };

          xhr.onload = function (event) {
            if (this.status == 200) {
              var aelement = document.createElement("a");
              document.body.appendChild(aelement);
              var url = window.URL.createObjectURL(this.response);
              aelement.href = url;
              aelement.download = fileName;
              aelement.click();
              document.body.removeChild(aelement);
            }
          };
          xhr.send();
        } else {
          this.toastr.error(response.message);
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
  /** Top product cancelled  */
  topProductCancelled(type) {
    this.metrix_type = type;
    $("#liWishlist").removeClass("active");
    $("#liCategories").removeClass("active");
    $("#liRate").removeClass("active");
    $("#pills-Wishlist").removeClass("active");
    $("#pills-Rate").removeClass("active");
    $("#pills-items").removeClass("active");
    $("#pills-Wishlist-tab").attr("aria-selected", "false");
    $("#pills-items-tab").attr("aria-selected", "false");
    $("#pills-Rate-tab").attr("aria-selected", "false");

    if (!$("#liCancelled").hasClass("active")) {
      $("#liCancelled").addClass("active");
      $("#pills-Cancelled").addClass("active");
      $("#pills-Cancelled-tab").attr("aria-selected", "true");
    }

    this.adminDashboard.metrix_details =
      this.adminDashboard.top_products_sellers_cancelled;
  }

  topProductWishlist(type) {
    this.metrix_type = type;
    $("#liCancelled").removeClass("active");
    $("#liCategories").removeClass("active");
    $("#liRate").removeClass("active");
    $("#pills-Cancelled").removeClass("active");
    $("#pills-items").removeClass("active");
    $("#pills-Cancelled-tab").attr("aria-selected", "false");
    $("#pills-items-tab").attr("aria-selected", "false");
    $("#pills-Rate-tab").attr("aria-selected", "false");
    if (!$("#liWishlist").hasClass("active")) {
      $("#liWishlist").addClass("active");
      $("#pills-Wishlist").addClass("active");
      $("#pills-Wishlist-tab").attr("aria-selected", "true");
    }
    this.adminDashboard.metrix_details =
      this.adminDashboard.top_products_wishlists;
  }

  topProductCategory(type) {
    this.metrix_type = type;
    $("#liCancelled").removeClass("active");
    $("#liWishlist").removeClass("active");
    $("#liRate").removeClass("active");
    $("#pills-Cancelled").removeClass("active");
    $("#pills-Rate").removeClass("active");
    $("#pills-liRate").removeClass("active");
    $("#pills-Wishlist").removeClass("active");
    $("#pills-Cancelled-tab").attr("aria-selected", "false");
    $("#pills-Wishlist-tab").attr("aria-selected", "false");
    $("#pills-Rate-tab").attr("aria-selected", "false");

    if (!$("#liCategories").hasClass("active")) {
      $("#liCategories").addClass("active");
      $("#pills-Categories").addClass("active");
      $("#pills-Categories-tab").attr("aria-selected", "true");
    }
    this.adminDashboard.metrix_details =
      this.adminDashboard.top_categories_sales;
  }

  repeatRate(type) {
    this.metrix_type = type;
    $("#liCancelled").removeClass("active");
    $("#liWishlist").removeClass("active");
    $("#liCategories").removeClass("active");
    $("#pills-Cancelled").removeClass("active");
    $("#pills-Wishlist").removeClass("active");
    $("#pills-Cancelled-tab").attr("aria-selected", "false");
    $("#pills-Wishlist-tab").attr("aria-selected", "false");
    $("#pills-Categories-tab").attr("aria-selected", "false");
    if (!$("#liRate").hasClass("active")) {
      $("#liRate").addClass("active");
      $("#pills-Rate").addClass("active");
      $("#pills-Rate-tab").attr("aria-selected", "true");
    }
    this.adminDashboard.metrix_details =
      this.adminDashboard.customer_repeat_rates;
  }

  getPaymentMethodColor(methodId: string): string {
    switch (methodId) {
      case '1':
        return '#220bf3';
      case '128':
        return '#fe6665'; // Cash color
      case '3':
        return '#8baa37'; // UPI color
      case '0':
        return '#249afc'; // Khata color
      case '2':
        return '#253443'; // card color
      case '5':
        return '#5d132d'; // online color
      case '4':
        return '#000000'; // razor color
      case '6':
        return '#7282dd'; // six color
      case '7':
        return '#006656'; // seven color
      case '8':
        return '#90e990'; // eight color
      case '9':
        return '#801e63a4'; // nine color
      case '10':
        return '#b83f3f'; // ten color  
    }
  }

  //piechart
  private createChartPie(): void {
    var datalist: any = [];
    this.adminDashboard.payment_modes.forEach((element) => {
      datalist.push({
        name: element.method_name,
        y: Number(element.total_amount),
        color: this.getPaymentMethodColor(element.method_id),
      });
    });

    const donut = new Chart({
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
      },
      title: {
        text: "",
        align: "center",
        verticalAlign: "middle",
        y: 0,
      },

      credits: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          allowPointSelect: false,
          cursor: "pointer",
          dataLabels: {
            enabled: false,
            distance: -50,
            style: {
              fontWeight: "bold",
              color: "black",
            },
          },
          startAngle: -90,
          endAngle: -180,
          center: ["35%", "50%"],
          size: "85%",
        },
      },
      series: [
        {
          name: "total_amount",
          data: datalist,
          type: "pie",
          innerSize: "45%",
        },
      ],
    });
    this.donutChart = donut;
  }

  orderCountClick() {
    $("#liorderamount").removeClass("active");
    $("#liorderitems").removeClass("active");
    $("#pills-amount").removeClass("active");
    $("#pills-items").removeClass("active");
    $("#pills-amount-tab").attr("aria-selected", "false");
    $("#pills-items-tab").attr("aria-selected", "false");

    if (!$("#liordercount").hasClass("active")) {
      $("#liordercount").addClass("active");
      $("#pills-order").addClass("active");
      $("#pills-order-tab").attr("aria-selected", "true");
    }
  }

  orderAmountClick() {
    $("#liordercount").removeClass("active");
    $("#liorderitems").removeClass("active");
    $("#pills-order").removeClass("active");
    $("#pills-items").removeClass("active");
    $("#pills-order-tab").attr("aria-selected", "false");
    $("#pills-items-tab").attr("aria-selected", "false");

    if (!$("#liorderamount").hasClass("active")) {
      $("#liorderamount").addClass("active");
      $("#pills-amount").addClass("active");
      $("#pills-amount-tab").attr("aria-selected", "true");
    }
  }

  orderItemsClick() {
    $("#liordercount").removeClass("active");
    $("#liorderamount").removeClass("active");
    $("#pills-order").removeClass("active");
    $("#pills-amount").removeClass("active");
    $("#pills-order-tab").attr("aria-selected", "false");
    $("#pills-amount-tab").attr("aria-selected", "false");

    if (!$("#liorderitems").hasClass("active")) {
      $("#liorderitems").addClass("active");
      $("#pills-items").addClass("active");
      $("#pills-items-tab").attr("aria-selected", "true");
    }
  }

  orderCountForChart() {
    if (this.adminDashboard.order_by_hours) {
      var datalist = [];
      this.adminDashboard.order_by_hours.forEach((element) => {
        if (element.order_count < 0) {
          element.order_count = "0";
        }
        datalist.push(Number(element.order_count));
      });
      let chart = new Chart({
        chart: {
          type: "area",
        },
        title: {
          text: "",
        },
        credits: {
          enabled: false,
        },
        xAxis: {
          categories: [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "21",
            "22",
            "23",
          ],
          title: {
            text: "Hour of the Day",
          },
        },
        yAxis: {
          tickInterval: 2,
          endOnTick: false,
          title: {
            text: "Order Count",
          },
        },

        series: [
          {
            name: "Order Count in Hour",
            data: datalist,
            type: "area",
            color: "#bfdbf7",
          },
        ],
      });
      this.order_count_chart = chart;
    }
  }

  orderAmountForChart() {
    if (this.adminDashboard.order_by_hours) {
      var datalist = [];
      this.adminDashboard.order_by_hours.forEach((element) => {
        if (element.amount < 0) {
          element.amount = "0";
        }
        datalist.push(Number(element.amount));
      });
      let chart = new Chart({
        chart: {
          type: "area",
        },
        title: {
          text: "",
        },
        credits: {
          enabled: false,
        },
        xAxis: {
          categories: [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "21",
            "22",
            "23",
          ],
          title: {
            text: "Hour of the Day",
          },
        },
        yAxis: {
          tickInterval: 10000,
          endOnTick: false,
          title: {
            text: "Amount",
          },
        },

        series: [
          {
            name: "Amount in Hour",
            data: datalist,
            type: "area",
            color: "#bfdbf7",
          },
        ],
      });
      this.amount_chart = chart;
    }
  }

  orderItemCountForChart() {
    if (this.adminDashboard.order_by_hours) {
      var datalist = [];
      this.adminDashboard.order_by_hours.forEach((element) => {
        if (element.item_count < 0) {
          element.item_count = "0";
        }
        datalist.push(Number(element.item_count));
      });
      let chart = new Chart({
        chart: {
          type: "area",
        },
        title: {
          text: "",
        },
        credits: {
          enabled: false,
        },
        xAxis: {
          categories: [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "21",
            "22",
            "23",
          ],
          title: {
            text: "Hour of the Day",
          },
        },
        yAxis: {
          tickInterval: 2,
          endOnTick: false,
          title: {
            text: "Items",
          },
        },

        series: [
          {
            name: "Items in Hour",
            data: datalist,
            type: "area",
            color: "#bfdbf7",
          },
        ],
      });
      this.item_chart = chart;
    }
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    if (selected == 'dashboard') {
      modalRef.componentInstance.helpDetails = this.helpDetails;
    } else if (selected == 'orderstatistics') {
      modalRef.componentInstance.helpDetails = this.helpDetailsOrderStatistics;
    } else if (selected == 'storestatistics') {
      modalRef.componentInstance.helpDetails = this.helpDetailsStoreOrderStatistics;
    } else if (selected == 'platformMetrix') {
      modalRef.componentInstance.helpDetails = this.helpDetailsPlatformMetrix;
    } else if (selected == 'storeadminstore') {
      modalRef.componentInstance.helpDetails = this.helpDetailsStoreStatistics;
    } else if (selected == 'storepaymentmode') {
      modalRef.componentInstance.helpDetails = this.helpDetailsaPayment;
    } else if (selected == 'storeorderbyhour') {
      modalRef.componentInstance.helpDetails = this.helpDetailsaOrderHour;
    } else if (selected == 'khata') {
      modalRef.componentInstance.helpDetails = this.helpDetailsaCreditAccount;
    } else if (selected == 'storelastorders') {
      modalRef.componentInstance.helpDetails = this.helpDetailsaLastOrder;
    }
    modalRef.componentInstance.selected = selected;
  }

  getHelpList(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = "67,68,69,70,71,72,73,74,75"
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = "1,2,3,4,5,6,7,8,9"
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '83,84,86,87,90'
    }

    this._helpService.getHelpList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_list = response.data;
          if (this.main.LoggedUserInfo.role_id == 1) {
            this.help_list.forEach((element: any) => {
              if (element.module_key == '67') {
                this.helpDetails = element;
              } else if (element.module_key == '68') {
                this.helpDetailsOrderStatistics = element;
              } else if (element.module_key == '69') {
                this.helpDetailsStoreOrderStatistics = element;
              } else if (element.module_key == '70') {
                this.helpDetailsPlatformMetrix = element;
              } else if (element.module_key == '71') {
                this.helpDetailsStoreStatistics = element;
              } else if (element.module_key == '72') {
                this.helpDetailsaPayment = element;
              } else if (element.module_key == '73') {
                this.helpDetailsaOrderHour = element;
              } else if (element.module_key == '74') {
                this.helpDetailsaCreditAccount = element;
              } else if (element.module_key == '75') {
                this.helpDetailsaLastOrder = element;
              }
            });
          }
          if (this.main.LoggedUserInfo.role_id == 6) {
            this.help_list.forEach((element: any) => {
              if (element.module_key == '1') {
                this.helpDetails = element;
              } else if (element.module_key == '2') {
                this.helpDetailsOrderStatistics = element;
              } else if (element.module_key == '3') {
                this.helpDetailsStoreOrderStatistics = element;
              } else if (element.module_key == '4') {
                this.helpDetailsPlatformMetrix = element;
              } else if (element.module_key == '5') {
                this.helpDetailsStoreStatistics = element;
              } else if (element.module_key == '6') {
                this.helpDetailsaPayment = element;
              } else if (element.module_key == '7') {
                this.helpDetailsaOrderHour = element;
              } else if (element.module_key == '8') {
                this.helpDetailsaCreditAccount = element;
              } else if (element.module_key == '9') {
                this.helpDetailsaLastOrder = element;
              }
            });
          }
          if (this.main.LoggedUserInfo.role_id == 2) {
            this.help_list.forEach((element: any) => {
              if (element.module_key == '83') {
                this.helpDetailsOrderStatistics = element;
              } else if (element.module_key == '84') {
                this.helpDetailsStoreStatistics = element;
              } else if (element.module_key == '86') {
                this.helpDetailsaPayment = element;
              } else if (element.module_key == '87') {
                this.helpDetailsaOrderHour = element;
              } else if (element.module_key == '90') {
                this.helpDetailsaLastOrder = element;
              }
            });
          }
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  ngOnDestroy(): void {
    $(
      "<style>.ng-dropdown-panel.ng-select-bottom {  margin-top:" +
      "-1px" +
      " !important; }</style>"
    ).appendTo("body");

    //date
    $(
      "<style>.mat-datepicker-content .mat-calendar {  width:" +
      "296px" +
      " !important;  height:" +
      "354px" +
      " !important;}</style>"
    ).appendTo("body");
  }
}
