import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { StoreDashboardService } from "src/app/services/dashboard/store-dashboard.service";
import * as moment from "moment";
import { pickerDate } from "src/app/utils/date-range";
import { AppComponent } from "src/app/app.component";
import { UsersService } from "src/app/services/users.service";
import { DashboardHelpInfoComponent } from "../model/dashboard-help-info/dashboard-help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { StoreService } from "src/app/services/store.service";
import { Chart } from "angular-highcharts";
import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-pos-dashboard",
  templateUrl: "./pos-dashboard.component.html",
  styleUrls: ["./pos-dashboard.component.scss"],
})
export class PosDashboardComponent implements OnInit, OnDestroy {
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

  selected: any
  ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  }
  constructor(
    public translate: TranslateService,
    private StoreDashboardService: StoreDashboardService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    private UsersService: UsersService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private storeService: StoreService,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }
  ngOnInit(): void {
    this.selected = { startDate: new Date(), endDate: new Date() };

    $(
      "<style>.mat-datepicker-content .mat-calendar {  width:" +
      "449px" +
      " !important;  height:" +
      "497px" +
      " !important;}</style>"
    ).appendTo("body");

    this.conditions();
    this.loadForm();
    this.cdr.detectChanges();
  }

  // load form
  loadForm() {
    this.range = this.formBuilder.group({
      start: new FormControl(new Date()),
      end: new FormControl(new Date()),
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
    this.getStoreDashboard();
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
    this.getStoreDashboard();
  }
  /** Conditions for by default adding data with form and set it in local storage */
  conditions() {
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
    this.getStoreDashboard();
  }

  // get subslist
  async subscriptiontRecord() {
    var data = {
      store_id: this.sellerDetails.store_id,
    };
    await this.UsersService.getStoreSubscriptionDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.main.LoggedUserInfo.license_detail = response.data;
          this.cdr.detectChanges();
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  DateFormateFromServerSide() {
    return this.main.DateFormate;
  }
  // get storeDashboard data
  async getStoreDashboard() {
    if (this.selected.startDate == null && this.selected.endDate == null) {
      this.selected = { startDate: new Date(), endDate: new Date() };
    }
    this.startdate = pickerDate(this.selected.startDate).format(this.main.DateFormate.split(" ")[0]);
    this.enddate = pickerDate(this.selected.endDate).format(this.main.DateFormate.split(" ")[0]);
    const data = {
      store_id: this.sellerDetails.store_id,
      from_date: this.startdate,
      to_date: this.enddate,
      user_id: this.sellerDetails.user_id,
    };

    await this.StoreDashboardService.getposDashboard(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.StoreDashboard = null;
          this.StoreDashboard = response.data;
          this.StoreDashboard.store_details.registered_on = moment(
            this.StoreDashboard.store_details.registered_on,
            this.DateFormateFromServerSide()
          );
          this.createChartPie();
          this.orderCountForChart();
          this.orderAmountForChart();
          this.orderItemCountForChart();
          this.cdr.detectChanges();
        } else {
          this.toastr.error(response.message);
        }
      },
    });
  }

  //piechart
  donutChart: Chart;
  createChartPie(): void {
    var datalist: any = [];
    this.StoreDashboard.payment_modes.forEach((element) => {
      datalist.push({
        name: element.method_name,
        y: Number(element.total_amount),
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
  /** Open DashboardHelpInfoComponent modal */
  //Help modal
  openinfomodel(selected) {
    const modalRef = this.modalService.open(DashboardHelpInfoComponent, {
      size: "md",
    });
    modalRef.componentInstance.selected = selected;
  }

  popular = 1;
  nosale = 0;
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

  order_count_chart: Chart;
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
            color: "#bfdbf7",
          },
        ],
      });
      this.order_count_chart = chart;
    }
  }

  amount_chart: Chart;
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

  item_chart: Chart;
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