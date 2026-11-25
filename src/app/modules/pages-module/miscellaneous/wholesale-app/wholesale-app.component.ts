import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from 'src/app/app.component';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { environment } from "src/environments/environment";
import { WholesaleAppService } from 'src/app/services/miscellaneous/wholesale-app.service';
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from 'rxjs';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-wholesale-app',
  templateUrl: './wholesale-app.component.html',
  styleUrls: ['./wholesale-app.component.scss']
})
export class WholesaleAppComponent implements OnInit {

  search: string;
  page: number = 1;
  main: any;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  wholesale_type_list = [];
  no_data = true;
  count: number = 0;
  sortKey: any = "";
  isOrderBy: boolean = true;
  selectedStatus: any;
  statusList = [
    { label: 'Under Review', value: 1 },
    { label: 'Approved', value: 2 },
    { label: 'Rejected', value: 3 }
  ];
  @ViewChild("search", { static: true }) searchbox: ElementRef;

  platform_setting = JSON.parse(localStorage.getItem('_platform_setting'));
  business_model = this.platform_setting.business_model;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));

  constructor(
    private wholesaleappservice: WholesaleAppService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private router: Router,
    private appComponent: AppComponent,
    private cryptoService: CryptoService,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }
  status: any;
  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;
    if (localStorage.getItem("seller_Order_obj") != null && localStorage.getItem("seller_Order_obj") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }
    if (filterObject) {
      this.page = filterObject.page;
      this.search = filterObject.search
      this.searchbox.nativeElement.value = this.search
      this.status = JSON.parse(localStorage.getItem("ord_status"))
      localStorage.removeItem("ord_status");
      if (this.status) {
        this.selectedStatus = this.status;
      }
    }
    else {
      this.selectedStatus = this.statusList[0];
    }
    this.GetWholesaleCustomerList(this.page);

    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.GetWholesaleCustomerList(1);
        })
      )
      .subscribe();
    this.getHelpDetails()
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetWholesaleCustomerList(1);
    }
  }

  ChangeStatus(item) {
    this.selectedStatus = item;
    this.GetWholesaleCustomerList(0);
  }

  GetWholesaleCustomerList(page): void {

    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;

    var data = {};

    if (this.selectedStatus.value == 0) {
      data = {
        page: this.page,
        search_query: search,
      }
    }
    if (this.selectedStatus.value <= 3 && this.selectedStatus.value > 0) {
      data = {
        status_val: this.selectedStatus.value,
        page: this.page,
        search_query: search,
        sortKey: this.sortKey,
        isOrderBy: this.isOrderBy == true ? 1 : 2
      };

    }

    this.wholesaleappservice.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.wholesale_type_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.wholesale_type_list = [];
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
  }
  /** Edit method for wholesale app by sending id */
  editApp(id) {
    var obj = {
      page: this.page,
      search: this.search,
    };
    localStorage.setItem("ord_status", JSON.stringify(this.selectedStatus));

    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      id.toString(),
      "customer_business_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );

    this.router.navigate(["/wholesale-app/edit/"]);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetWholesaleCustomerList(this.page);
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
      data.module_key = '81'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '21'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '21'
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
