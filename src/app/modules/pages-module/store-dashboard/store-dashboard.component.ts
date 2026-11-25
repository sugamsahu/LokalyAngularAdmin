import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { StoreDashboardService } from "src/app/services/dashboard/store-dashboard.service";
import * as moment from "moment";
import { AppComponent } from "src/app/app.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Chart } from "angular-highcharts";
import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
import { StoreService } from "src/app/services/store.service";
import { Router } from "@angular/router";
import { CommonService } from "src/app/services/common.service";
import { BannerService } from "src/app/services/configuration/banner.service";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-store-dashboard",
  templateUrl: "./store-dashboard.component.html",
  styleUrls: ["./store-dashboard.component.scss"],
})
export class StoreDashboardComponent implements OnInit, OnDestroy {
  login_store = JSON.parse(localStorage.getItem("loginUserStore"));
  loggedUserSettings = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  StoreDashboard: any;
  sellerDetails: any;
  generalSetting: any;
  startdate: any;
  enddate: any;
  main: any;
  PlatformSetting: any;
  business_model: any;
  isOrderBalanceShowPlatForm: boolean;
  global_currency: any;
  global_timezone: any;
  pincode_label: any;
  khata_label: any;
  deliveryboy_label: any;
  allow_khata: number;
  store_label: any;
  searchText: string;
  show_price_same_font: any;
  data: any = [];
  public range: FormGroup;
  currentday: any = new Date();
  sessionConfig = this.appComponent.sessionConfig();
  language_id = localStorage.getItem("select_lan_id") || "1";
  alwaysShowCalendars: boolean;
  selected: any
  ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  }
  date_format: any;
  help_details: any;
  helpDetailsOrderStatistics: any;
  helpDetailsStoreOrderStatistics: any;
  helpDetailsDriverStatistics: any;
  helpDetailsPaymentMode: any;
  helpDetailsaOrderHour: any;
  helpDetailsPopulaItem: any;
  helpDetailsNoSalesItems: any;
  helpDetailsaLastOrder: any;
  help_list: any = [];
  amount_seperator: any;
  donutChart: Chart;
  popular = 1;
  nosale = 0;
  order_count_chart: Chart;
  amount_chart: Chart;
  item_chart: Chart;

  constructor(
    public translate: TranslateService,
    private storeDashboardService: StoreDashboardService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private storeService: StoreService,
    private router: Router,
    private _helpService: BannerService,
    public commonService: CommonService,
    public spinner: NgxSpinnerService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    this.alwaysShowCalendars = true;
  }

  ngOnInit(): void {
    if (this.login_store.user_role_confirm == '0') {
      this.router.navigate(['/store-details']);
    }
    this.date_format = {
      format: this.main.DateFormate.split(" ")[0]
    }
    this.selected = { startDate: new Date(), endDate: new Date() };
    $(
      "<style>.mat-datepicker-content .mat-calendar {  width:" + "449px" + " !important;  height:" + "497px" + " !important;}</style>"
    ).appendTo("body");
    this.conditions();
    this.loadForm();
    this.getHelpList();
    this.cdr.detectChanges();
  }

  // load form
  loadForm() {
    this.range = this.formBuilder.group({
      start: new FormControl(new Date()),
      end: new FormControl(new Date()),
    });
  }

  /** Condition for local storage setting  */
  conditions() {
    this.startdate = moment(new Date()).format(
      this.main?.DateFormate.split(" ")[0]
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

    this.khata_label = this.generalSetting.khata_label;
    this.deliveryboy_label = this.generalSetting.deliveryboy_label;
    this.allow_khata = parseInt(this.generalSetting.allow_khata);
    this.store_label = this.generalSetting.store_label;
    this.show_price_same_font = this.generalSetting.show_price_same_font;
    this.main.LoggedUserInfo.license_detail = JSON.parse(
      localStorage.getItem("subscriptionDetails")
    );

    this.PlatformSetting = JSON.parse(
      localStorage.getItem("_platform_setting")
    );
    this.PlatformSetting =
      this.PlatformSetting == null
        ? this.main.platform_setting
        : this.PlatformSetting;
    this.business_model = this.PlatformSetting.business_model;
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
    // this.getStoreDashboard();
    // api calls
  }


  DateFormateFromServerSide() {
    return this.main.DateFormate;
  }

  // get storeDashboard data
  async getStoreDashboard() {
    this.spinner.show('home');
    if (this.selected.startDate == null && this.selected.endDate == null) {
      this.selected = { startDate: new Date(), endDate: new Date() };
    }
    this.startdate = moment(this.selected.startDate).format(this.generalSetting.date_format_web.split(" ")[0]);
    this.enddate = moment(this.selected.endDate).format(this.generalSetting.date_format_web.split(" ")[0]);
    const data = {
      store_id: this.sellerDetails.store_id,
      from_date: this.startdate,
      to_date: this.enddate,
      // user_id: this.sellerDetails.user_id,
    };
    await this.storeDashboardService.getStoreDashboard(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.StoreDashboard = null;
          this.StoreDashboard = response.data;
          this.StoreDashboard.store_details.registered_on = moment(
            this.StoreDashboard.store_details.registered_on,
            this.DateFormateFromServerSide()
          );
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
  createChartPie(): void {
    var datalist: any = [];
    this.StoreDashboard.payment_modes.forEach((element) => {
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

  changesales(item) {
    if (item == 1) {
      this.popular = 1;
      this.nosale = 0;
    }
    if (item == 2) {
      this.nosale = 1;
      this.popular = 0;
    }
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
    if (this.StoreDashboard.order_by_hours) {
      var datalist = [];
      this.StoreDashboard.order_by_hours.forEach((element) => {
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
            color: '#bfdbf7',
          },
        ],
      });
      this.order_count_chart = chart;
    }
  }

  orderAmountForChart() {
    if (this.StoreDashboard.order_by_hours) {
      var datalist = [];
      this.StoreDashboard.order_by_hours.forEach((element) => {
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
    if (this.StoreDashboard.order_by_hours) {
      var datalist = [];
      this.StoreDashboard.order_by_hours.forEach((element) => {
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

  //download pdf
  DownloadPDFForBannerAndPoster(value) {
    var data = {};
    switch (value) {
      case "Banner":
        {
          data = {
            store_id: this.sellerDetails.store_id,
          };
        }
        break;
      case "Poster":
        {
          data = {
            store_id: this.sellerDetails.store_id,
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

  ViewDetails(name) {
    if (name == 'Pending Orders') {
      var status = 1;
      this.sessionConfig.encryptIdValue(
        status.toString(),
        "dashboardStatus" + this.sellerDetails.store_id.toString(),
        this.main.CryptoKey
      );
      this.router.navigate(["/order"]);
    }
    else if (name == 'Running Orders') {
      var status = 2;
      this.sessionConfig.encryptIdValue(
        status.toString(),
        "dashboardStatus" + this.sellerDetails.store_id.toString(),
        this.main.CryptoKey
      );
      this.router.navigate(["/order"]);
    }
    else if (name == 'Completed Orders') {
      var status = 5;
      this.sessionConfig.encryptIdValue(
        status.toString(),
        "dashboardStatus" + this.sellerDetails.store_id.toString(),
        this.main.CryptoKey
      );
      this.router.navigate(["/order"]);
    }
    else if (name == 'Cancelled Orders') {
      var status = 6;
      this.sessionConfig.encryptIdValue(
        status.toString(),
        "dashboardStatus" + this.sellerDetails.store_id.toString(),
        this.main.CryptoKey
      );
      this.router.navigate(["/order"]);
    }
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    if (selected == 'dashboard') {
      modalRef.componentInstance.helpDetails = this.help_details;
    } else if (selected == 'orderstatistics') {
      modalRef.componentInstance.helpDetails = this.helpDetailsOrderStatistics;
    } else if (selected == 'storestatistics') {
      modalRef.componentInstance.helpDetails = this.helpDetailsStoreOrderStatistics;
    } else if (selected == 'driverstatistics') {
      modalRef.componentInstance.helpDetails = this.helpDetailsDriverStatistics;
    } else if (selected == 'paymentmode') {
      modalRef.componentInstance.helpDetails = this.helpDetailsPaymentMode;
    }
    else if (selected == 'popularitems') {
      modalRef.componentInstance.helpDetails = this.helpDetailsPopulaItem;
    }
    else if (selected == 'storeorderbyhour') {
      modalRef.componentInstance.helpDetails = this.helpDetailsaOrderHour;
    }
    else if (selected == 'nosalesitems') {
      modalRef.componentInstance.helpDetails = this.helpDetailsNoSalesItems;
    } else if (selected == 'storelastorders') {
      modalRef.componentInstance.helpDetails = this.helpDetailsaLastOrder;
    }
  }

  getHelpList(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '82,83,84,85,86,87,88,89,90'
    }

    this._helpService.getHelpList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_list = response.data;
          if (this.main.LoggedUserInfo.role_id == 2) {
            this.help_list.forEach((element: any) => {
              if (element.module_key == '82') {
                this.help_details = element;
              }
              if (element.module_key == '83') {
                this.helpDetailsOrderStatistics = element;
              }
              if (element.module_key == '84') {
                this.helpDetailsStoreOrderStatistics = element;
              }
              if (element.module_key == '85') {
                this.helpDetailsDriverStatistics = element;
              }
              if (element.module_key == '86') {
                this.helpDetailsPaymentMode = element;
              }
              if (element.module_key == '87') {
                this.helpDetailsaOrderHour = element;
              }
              if (element.module_key == '88') {
                this.helpDetailsPopulaItem = element;
              }
              if (element.module_key == '89') {
                this.helpDetailsNoSalesItems = element;
              }
              if (element.module_key == '90') {
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
      "<style>.mat-datepicker-content .mat-calendar {  width:" +
      "296px" +
      " !important;  height:" +
      "354px" +
      " !important;}</style>"
    ).appendTo("body");
  }
}
