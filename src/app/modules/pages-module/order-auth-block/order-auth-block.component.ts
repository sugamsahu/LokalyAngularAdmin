import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  OnDestroy,
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
} from "rxjs";
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from "@angular/common";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-order-auth-block",
  templateUrl: "./order-auth-block.component.html",
  styleUrls: ["./order-auth-block.component.scss"],
  providers: [
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
  ],
})
export class OrderAuthBlockComponent implements OnInit, OnDestroy {
  page: number = 1;
  total_count: number = 0;
  table_size: number = 8;
  search: any;
  no_data = true;
  isOrderBy: any;
  sortKey: any;
  main: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  orderList: any = [];
  location: Location;
  store_id: any;
  orderitem = {
    status: [],
  };
  store_name: any;
  orderStatistics: any;
  orderStatusList: any = [{ label: "All", value: 0 }];
  store_label = '';
  pincode_label = '';
  deliveryboy_label = '';
  show_customer_details_to_store = false;
  id: any = 0;
  private startTimeout: ReturnType<typeof setTimeout>;
  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    private OrderService: OrderService,
    public spinner: NgxSpinnerService,
    private router: Router,
    location: Location
  ) {
    setTimeout(() => {
      this.translate.addLangs(["it", "en", "de"]);
      this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
      this.main = this.appComponent.main;
      this.location = location;
    }, 2000);
  }

  ngOnInit(): void {
    this.spinner.show('home')
    this.startTimeout = setTimeout(() => {
      this.general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
      this.store_label = this.general_setting.store_label;
      this.pincode_label = this.general_setting.pincode_label;
      this.deliveryboy_label = this.general_setting.deliveryboy_label;
      this.show_customer_details_to_store =
        this.general_setting.show_customer_details_to_store == "1" ? true : false;
      var temp = this.location.path();
      var temp1 = temp.split("=");
      this.store_id = temp1[1];
      this.orderitem.status = [1, 2, 3, 4, 7, 9, 10];
      var orderList = this.general_setting.order_status_list;
      orderList.forEach((Item: any) => {
        var data = { label: Item.name, value: Number(Item.id) };
        this.orderStatusList.push(data);
      });
      // server side serach
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

      this.getOrderList(this.page);
      this.id = setInterval(() => {
        this.getOrderList(this.page);
      }, 60000);
    }, 2000);
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getOrderList(1);
    }
  }

  ngOnDestroy() {
    // Leaving within the first 2 seconds: stop the start-up, which would
    // otherwise begin refreshing the list every minute after this.
    clearTimeout(this.startTimeout);
    if (this.id) {
      clearInterval(this.id);
    }
  }
  getOrderList(pageNo: any) {
    this.page = pageNo;
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    var data = {
      store_code: this.store_id,
      order_status: this.orderitem.status.toString(),
      page: pageNo,
      search_query: search,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy == true ? 1 : 2,
      role_id: 2,
      limit: 8
    };

    this.OrderService.getOrderList(data).subscribe({
      next: (response: any) => {
        this.orderList = [];
        if (response.status == 1) {
          this.spinner.hide('home');
          this.no_data = false;
          this.orderList = response.data;
          this.store_name = response.store_name;
          this.orderStatistics = response.order_statistics;
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
        } else if (response.status == 2) {
          this.toastr.error(this.translate.instant("LINK_DEACTIVATED"));
          this.router.navigate(["/auth/login"]);
        }
        else {
          this.spinner.hide('home');
          this.no_data = true;
          this.orderStatistics = response.order_statistics;
          this.orderList = [];
          this.total_count = 0;
          this.cdr.detectChanges();
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error: any) => {
        this.spinner.hide('home');
        this.toastr.error(this.translate.instant(error.message));
      },
    });
  }

  SearchOrderReport() {
    this.orderList = [];
    this.page = 1;
    this.getOrderList(this.page);
  }

  ChangeOrderStatus(item: any) {
    if (item.value == 0) {
      this.orderitem.status = [];
      this.orderStatusList.forEach((status: any) => {
        if (status.value != 0) {
          this.orderitem.status.push(status.value);
        }
      });
    }
  }
  // change status
  OrderDivClick(name: any) {
    if (name == "Pending Orders") {
      this.orderitem.status = [1];
      this.SearchOrderReport();
    } else if (name == "Running Orders") {
      this.orderitem.status = [2, 3, 4, 7, 9, 10];
      this.SearchOrderReport();
    } else if (name == "Completed Orders") {
      this.orderitem.status = [5, 11];
      this.SearchOrderReport();
    } else if (name == "Cancelled Orders") {
      this.orderitem.status = [6, 8];
      this.SearchOrderReport();
    }
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

  getInitials(name: any) {
    if (name != undefined) {
      var canvas: any = document.createElement("canvas");
      canvas.style.display = "none";
      canvas.width = "35";
      canvas.height = "35";
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
        context.fillText(initials.toUpperCase(), 13, 22);
      } else {
        context.fillText(initials.toUpperCase(), 13, 22);
      }
      var data = canvas.toDataURL();
      document.body.removeChild(canvas);
      return data;
    } else {
      return false;
    }
  }

  sortAPISide(keyname: any) {
    this.sortKey = keyname; //set the sortKey to the param passed
    this.isOrderBy = !this.isOrderBy;
    this.getOrderList(this.page);
  }
}