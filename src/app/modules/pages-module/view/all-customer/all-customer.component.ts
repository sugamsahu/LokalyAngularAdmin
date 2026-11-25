import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { CommonService } from 'src/app/services/common.service';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgEventBus } from 'ng-event-bus';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from 'rxjs';

@Component({
  selector: 'app-order',
  templateUrl: './all-customer.component.html',
  styleUrls: ['./all-customer.component.scss']
})
export class AllCustomer implements OnInit {
  generalSetting: any = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  main: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  helpDetails: any;
  view_all_list: any = [];
  view_all_count: any = 0;
  page: any;
  tableSize = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  no_data = true;
  search: any;
  super_admin: any;
  count: number = 0;


  constructor(
    private _helpService: BannerService,
    private appComponent: AppComponent,
    public commonService: CommonService,
    private modalService: NgbModal,
    public translate: TranslateService,
    private toastr: ToastrService,
    private cryptoService: CryptoService,
    private router: Router,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    this.super_admin = this.main.LoggedUserInfo.role_id;
    if (this.super_admin == 6 || !this.generalSetting.visualization_module) {
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
      this.search = filterObject.search;
      this.page = filterObject.page;
      this.tableSize = filterObject.limit;
      this.searchbox.nativeElement.value = this.search;
    }
    this.allViewList(this.page);
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.allViewList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }

  allViewList(page) {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
      search_query: search,
      page: this.page
    };
    this.commonService.allviewList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.no_data = false;
          this.view_all_list = response.data;
          this.view_all_count = response.count;
        } else {
          this.no_data = true;
          this.view_all_list = [];
          this.view_all_count = 0;
        }
      }
    });
  }

  editView(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.tableSize,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(id.toString(),
      "View_management_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/view-management/edit"]);
  }

  viewCustomerDetail(details: any) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.tableSize,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    localStorage.setItem("specifictoShowStore", details.specific_to);
    this.router.navigate([`/customer-view/${details.url_path}`]);
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.allViewList(1);
    }
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 || this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '146'
    }
    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => {
      },
      complete: () => { },
    });
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

}
