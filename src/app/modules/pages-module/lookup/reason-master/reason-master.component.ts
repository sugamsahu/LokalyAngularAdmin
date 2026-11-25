import { Router } from '@angular/router';
import { reasonMasterService } from '../../../../services/lookup/reason-master.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from 'src/app/app.component';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap, } from "rxjs";
import { environment } from "src/environments/environment";
import * as $ from "jquery";
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reason-master',
  templateUrl: './reason-master.component.html',
  styleUrls: ['./reason-master.component.scss']
})
export class ReasonMasterComponent implements OnInit {

  POSTS: any;
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  reason_type_list: [];
  search: any;
  no_data = true;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;

  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.general_setting.store_label;
  deliveryboy_label = this.general_setting.deliveryboy_label;
  stock_mgmt = this.general_setting.stock_mgmt;

  orderStatusList = [
    { label: 'All', value: 0 },
    { label: 'Item Approved', value: 8 },
    { label: 'Item Rejected', value: 9 },
    { label: 'Order Cancelled by Customer', value: 1 },
    { label: 'Order Cancelled by Store', value: 2 },
    { label: 'Order Rejected (Order processing)', value: 3 },
    { label: 'Order Rejected (Order for Delivery)', value: 4 },
    { label: 'Order Undelivered', value: 5 },
    { label: 'Proof of Delivery', value: 7 },
  ];

  selectedOrderItem: any;
  main: any;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  ChangeOrderStatus(item) {
    this.selectedOrderItem = item;
    this.GetReasonTypeList(0);
  }

  constructor(
    private reasonMasterservice: reasonMasterService,
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

  ngOnInit(): void {
    $(
      "<style>.ng-option .ng-star-inserted { white-space:normal !important}</style>"
    ).appendTo("body");

    if (this.stock_mgmt == 1) {
      this.orderStatusList.push({ label: 'Stock Damage', value: 6 })
    }
    this.main = this.appComponent.main;
    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    if (localStorage.getItem("seller_Order_obj") != null && localStorage.getItem("seller_Order_obj") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }
    if (filterObject) {
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
      var selected_orderItem_status = JSON.parse(localStorage.getItem("selected_orderItem_status"));
      localStorage.removeItem("selected_orderItem_status")
      if (selected_orderItem_status) {
        this.selectedOrderItem = selected_orderItem_status
      }
    } else {
      this.selectedOrderItem = this.orderStatusList[0];
    }

    this.GetReasonTypeList(this.page);

    if (this.searchbox != undefined) {
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.GetReasonTypeList(1);
          })
        )
        .subscribe();
    }
    this.getHelpDetails();

  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetReasonTypeList(1);
    }
  }

  GetReasonTypeList(page): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    this.page = page;
    var data = {};

    if (this.selectedOrderItem?.value == 0) {
      data = {
        page: this.page,
        search_query: this.search,
        sort_field: this.sortKey,
        sort_type: this.isOrderBy ? 1 : 2,
      }
    }

    if (this.selectedOrderItem?.value <= 9 && this.selectedOrderItem?.value > 0) {
      data = {
        reason_type: this.selectedOrderItem?.value,
        page: this.page,
        search_query: this.search,
        limit: this.table_size,
      };
    }

    this.reasonMasterservice.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.reason_type_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.reason_type_list = [];
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

  editReasonMasterDetail(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("selected_orderItem_status", JSON.stringify(this.selectedOrderItem));
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      id.toString(),
      "lookup_reasonMaster_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );

    this.router.navigate(["/reason-master/edit"]);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetReasonTypeList(this.page);
  }
  ngOnDestroy(): void {
    $(
      "<style>.ng-option .ng-star-inserted { white-space:normal !important}</style>"
    ).appendTo("body");

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
      data.module_key = '55'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '55'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '55'
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
