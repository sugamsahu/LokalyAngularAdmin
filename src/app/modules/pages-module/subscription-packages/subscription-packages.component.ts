
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { SubscriptionPackagesService } from "src/app/services/subscription-packages.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { environment } from "src/environments/environment";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { Router } from "@angular/router";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-subscription-packages",
  templateUrl: "./subscription-packages.component.html",
  styleUrls: ["./subscription-packages.component.scss"],
})
export class SubscriptionPackagesComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  tableSize: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search = "";
  no_data = true;
  main: any;
  subscriptionPackagesList: any;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isSubscription: boolean;
  business_model: any;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private SubscriptionPackagesService: SubscriptionPackagesService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private spinner: SpinnerService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  ngOnInit() {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin)  {
      this.router.navigate(['/dashboard']);
    }
    this.PlatformSetting =
      this.PlatformSetting == null
        ? this.main.platform_setting
        : this.PlatformSetting;
    this.business_model = this.PlatformSetting.business_model;
    this.isSubscription =
      this.business_model == 1
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : false;

    if (Number(this.isSubscription) == 0) {
      this.router.navigate([`/dashboard`]);
    }

    var preUrl = localStorage.getItem("Previous_URL");
    let previousURL = preUrl.slice(0, preUrl.lastIndexOf("/"));

    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;
    if (
      localStorage.getItem("seller_Order_obj") != null &&
      localStorage.getItem("seller_Order_obj") != undefined
    ) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }
    if (filterObject) {
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.tableSize = filterObject.limit;
    }
    this.getPagedList(this.page);

    if (this.searchbox != undefined) {
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.getPagedList(this.page);
          })
        )
        .subscribe();
    }
    this.getHelpDetails();

  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getPagedList(1);
    }
  }

  getPagedList(page): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    this.page = page;
    var data = {};

    data = {
      page: this.page,
      search_query: search,
      limit: this.tableSize,
      sort_by: '',
      sort_direction: ''
    };
    this.SubscriptionPackagesService.getSubscriptionList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.subscriptionPackagesList = response.data;
          this.no_data = false;
          this.count = this.subscriptionPackagesList.length;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.subscriptionPackagesList = [];
        }
      },
      error: (error) => {
        // handle error
        this.spinner.hide();
      },
      complete: () => {

        this.spinner.hide();
      },
    });
  }

  onSearchChange(value) {
    this.search = value;
    this.page = 1;
    this.getPagedList(1);
  }

  editsubsPack(subscription_id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.tableSize,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      subscription_id.toString(),
      "subscription_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/subscription-packages/edit"]);
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
    let data:any = {
      language_id:this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1 ) {
      data.module_key = '80'
    }
    if(this.main.LoggedUserInfo.role_id == 6){
      data.module_key = '14'
    }
    if (this.main.LoggedUserInfo.role_id == 2 ) {
      data.module_key = '14'
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
