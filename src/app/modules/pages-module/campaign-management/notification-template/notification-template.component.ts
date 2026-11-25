import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { NotificationTemplateService } from "src/app/services/campaign-management/notification-template.service";
import { debounceTime, distinctUntilChanged, filter, fromEvent, pipe, tap } from "rxjs";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-notification-template",
  templateUrl: "./notification-template.component.html",
  styleUrls: ["./notification-template.component.scss"],
})
export class NotificationTemplateComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  tableSize = environment.tableSize;
  no_data = true;
  main: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  show_price_same_font = this.general_setting.show_price_same_font;
  sortKey: any = "";
  isOrderBy: boolean = true;
  //notification
  Notification_detail_list: any = [];
  search: string = '';
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private NotificationTemplateService: NotificationTemplateService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var preUrl = localStorage.getItem("Previous_URL");
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    var filterObject;
    this.page = 1;
    this.count = 0;
    if (
      localStorage.getItem("seller_Order_obj") != null &&
      localStorage.getItem("seller_Order_obj") != undefined
    ) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }
    if (filterObject) {
      this.page = filterObject.page;
      this.tableSize = filterObject.limit;
    }
    this.getNotificationDetailsList(this.page);
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean),
        debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getNotificationDetailsList(1);
        })
      )
      .subscribe();
  }

  //get list
  getNotificationDetailsList(page): void {
    this.page = page;
    var data = {};
    data = {
      page: this.page,
      limit: this.tableSize,
      search_query: this.search
    };
    this.NotificationTemplateService.getSMSNotificationsList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.Notification_detail_list = response.data;
          this.no_data = false;
          this.count = this.Notification_detail_list.length;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.Notification_detail_list = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }


  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getNotificationDetailsList(1);
    }
  }

  //edit
  editNotification(item) {
    var obj = {
      page: this.page,
      limit: this.tableSize,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    localStorage.setItem("notificationDetail", JSON.stringify(item));
    this.cryptoService.encryptIdValue(
      item.campaign_id.toString(),
      "campaign_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/notification-template/edit"]);
  }
}
