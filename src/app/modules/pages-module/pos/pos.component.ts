import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CustomerService } from "src/app/services/customer.service";
import { debounceTime, distinctUntilChanged, filter, fromEvent, Subject, takeUntil, tap } from "rxjs";
import { ChangeDetectorRef } from '@angular/core';
import { PosSeetingService } from "src/app/services/store-management/pos-seeting.service";
import { environment } from "src/environments/environment";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SavedOrdersComponent } from '../model/saved-orders/saved-orders.component';
import { Router } from '@angular/router';
import { AddPosCustomerComponent } from '../model/add-pos-customer/add-pos-customer.component';
import { AppComponent } from 'src/app/app.component';
import { HelpInfoModelComponent } from '../model/help-info/help-info.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  settings: any = {};
  customerList = [];
  search: any;
  page: number = 1;
  customercount = 0;
  inProcess: boolean = false;
  loadMorecus: boolean = false;
  main: any;
  no_data = true;
  tableSize = 23;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  generalSetting: any = JSON.parse(localStorage.getItem('LoggedUserSettings'));

  constructor(
    public translate: TranslateService,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private posSeetingService: PosSeetingService,
    private modalService: NgbModal,
    private router: Router,
    private appComponent: AppComponent,
    private _helpService: BannerService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    if(window.innerWidth > 700){
    var sidebarOpne: any = true;
    sidebarOpne = localStorage.getItem('sidebarOpen');
    if (sidebarOpne == "true") {
      $('.navbar-toggler').click();
    }
  }
    this.posSettingRecord();

    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.GetStoreCustomerList(1);
          })
        )
        .subscribe();
    this.cdr.detectChanges();
    this.getHelpDetails();
  }

  //Get pos settings
  async posSettingRecord() {
    var data = {
      store_id: this.sellerDetails.store_id,
    };
    await this.posSeetingService.getPOSSettings(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.settings = response.data;
          this.GetStoreCustomerList(1)
          this.cdr.detectChanges();
        } else {
          this.settings = {};
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //Get customer list
  async GetStoreCustomerList(page) {
    this.page = page;
    var tep_limit: any;
    if (this.page == 1) {
      tep_limit = 23;
    } else {
      tep_limit = 24;
    }

    var data = {
      store_id: this.sellerDetails.store_id,
      search_query: this.search,
      page: this.page,
      limit: tep_limit,
    }

    await this.customerService
      .getStoreCustomerList(data, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.no_data = false;
            this.customerList = [];
            if (this.settings.pos_guest_customer == 1 && !this.search && this.page == 1) {
              var cus = {
                name: "Guest",
                customer_user_id: this.generalSetting.guest_user_id,
                phone: "xxxxxxxxxx"
              };
              this.customerList.push(cus);
            }
            this.customercount = response.count;
            response.data.forEach(element => {
              this.customerList.push(element);
            });
            this.cdr.detectChanges();
          } else {
            this.no_data = true;
            this.customercount = 0;
            this.customerList = [];
            this.toastr.error(response.message);
          }
        },
        error: (error) => {
        },
        complete: () => {
        },
      });
  }

  clearSearch() {
    if (this.search) {
      this.search = undefined;
      this.customerList = [];
      this.GetStoreCustomerList(1);
    }
  }

  //image
  getInitials(name) {
    var canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = 90;
    canvas.height = 90;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    context.fillStyle = "#476ce8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "60px Arial";
    context.fillStyle = "#FFFFFF";
    var nameArray = name.split(" ");
    var initials = "";
    initials = initials + nameArray[0][0];
    initials = initials == "undefined" ? "U" : initials;
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 25, 65);
    } else {
      context.fillText(initials.toUpperCase(), 25, 65);
    }
    var data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }

  loadMoreCustomer() {
    this.loadMorecus = true;
    this.GetStoreCustomerList(this.page);
  }

  view_saved_orders() {
    const modalRef = this.modalService.open(SavedOrdersComponent, {
      size: "lg-950",
      centered: true,
    });
  }

  addposorder(item) {
    var oldcustomerdetails = JSON.parse(localStorage.getItem("customerdetails"));
    localStorage.setItem('customerdetails', JSON.stringify(item));
    var is_cart = false;
    localStorage.setItem('is_cart', JSON.stringify(is_cart));
    localStorage.setItem('oldcustomerdetails', JSON.stringify(oldcustomerdetails));
    this.router.navigate(["/pos/add-pos/"]);
  }

  add_New_Customer() {
    const addCustomer_modalRef = this.modalService.open(AddPosCustomerComponent, {
      size: "md",
    });
    addCustomer_modalRef.componentInstance.main = this.main;
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
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '108'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '108'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '108'
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

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
