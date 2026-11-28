import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, filter, fromEvent, takeUntil, tap } from 'rxjs';
import { PosSeetingService } from "src/app/services/store-management/pos-seeting.service";
import { CustomerService } from "src/app/services/customer.service";
import { environment } from 'src/environments/environment';
import { AddPosCustomerComponent } from '../add-pos-customer/add-pos-customer.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-customer',
  templateUrl: './change-customer.component.html',
  styleUrls: ['./change-customer.component.scss']
})
export class ChangeCustomerComponent implements OnInit, OnDestroy {

  @Input() selected_customer: any;
  private destroy$ = new Subject();
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  settings: any = {};
  customerList = [];
  search: any;
  page: number = 1;
  customercount = 0;
  inProcess: boolean = false;
  loadMorecus: boolean = false;
  @Output() selectedcustomer: EventEmitter<any> = new EventEmitter();
  main: any;
  no_data = true;
  tableSize = 24;
  style_obj_change_customer:any;
  constructor(public modal: NgbActiveModal,
    public translate: TranslateService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    public PosSeetingService: PosSeetingService,
    private customerService: CustomerService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.style_obj_change_customer = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.DineInSettingRecord();

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
  }
  //Get pos settings
  async DineInSettingRecord() {
    var data = {
      store_id: this.sellerDetails.store_id,
    };
    await this.PosSeetingService.getPOSSettings(data).pipe(takeUntil(this.destroy$)).subscribe({
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
                customer_user_id: 0,
                phone: "xxxxxxxxxx"
              };
              this.customerList.push(cus);
            }
            this.customercount = response.count - 1;

            response.data.forEach(element => {
              if (element.customer_user_id != this.selected_customer.customer_user_id) {
                this.customerList.push(element);
              }
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

  addposorder(item) {
    localStorage.setItem('oldcustomerdetails', JSON.stringify(this.selected_customer));
    localStorage.setItem('customerdetails', JSON.stringify(item));
    this.selectedcustomer.emit(item);
    this.modal.dismiss();
  }

  add_New_Customer() {
    const addCustomer_modalRef = this.modalService.open(AddPosCustomerComponent, {
      size: "md",
    });
    addCustomer_modalRef.componentInstance.order_page = true;
    addCustomer_modalRef.componentInstance.main = this.main;
    addCustomer_modalRef.componentInstance.newCutomer.subscribe(
      (item) => {
        this.addposorder(item);
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
