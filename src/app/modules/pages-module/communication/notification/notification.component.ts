import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { CommunicationService } from 'src/app/services/communication.service';
import { environment } from 'src/environments/environment';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  search: any;
  no_data = true;
  main: any;
  sortKey: any = "";
  isOrderBy: boolean = true;
  //notification
  notification_template_list: any = [];
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  category_list: any = [];
  selected_category_id: any;

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private communicationService: CommunicationService,
    private _helpService: BannerService,
    private modalService: NgbModal,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    var filterObject:any;
    this.page = 1;
    this.search = "";
    this.count = 0;
    if (
      localStorage.getItem("seller_Order_obj") != null &&
      localStorage.getItem("seller_Order_obj") != undefined
    ) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
      this.cryptoService.clearCookie(
        "notification_id" + this.main.LoggedUserInfo.role_id?.toString()
      );
      this.cryptoService.clearCookie(
        "duplicate_notification_id" + this.main.LoggedUserInfo.role_id?.toString()
      );
    }

    if (filterObject) {
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }

    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean),
        debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getNotificationTemplateList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
    this.getCategoryList();
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getNotificationTemplateList(1);
    }
  }

  getNotificationTemplateList(page): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data = {};
    data = {
      page: this.page,
      search_query: search,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      limit: this.table_size,
      category_id: this.selected_category_id
    };

    this.communicationService.getNotificationTemplateList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.notification_template_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.notification_template_list = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.getNotificationTemplateList(this.page);
  }

  editNotificationTemplateDetail(notificationtemplateid) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };

    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      notificationtemplateid.toString(),
      "notification_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.encryptIdValue(
      '',
      "duplicate_notification_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/notification/edit"]);
  }

  duplicateEditNotificationTemplateDetail(notificationtemplateid) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };

    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      notificationtemplateid.toString(),
      "notification_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.encryptIdValue(
      'duplicate',
      "duplicate_notification_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/notification/edit"]);
  }

  getCategoryList() {
    const data = {};
    this.communicationService.getModuleCategoryTypeList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.category_list = response.data;
          this.category_list = [{ id: 0, name: "All" }];
          response.data.forEach(item => {
            this.category_list.push(item)
          });
          this.selected_category_id = this.category_list[0].id;
          this.getNotificationTemplateList(this.page);
        } else {
        }
      },
      error: (error) => {
        this.toastr.error(error);
      }
    });
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
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '29'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '29'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '29'
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
