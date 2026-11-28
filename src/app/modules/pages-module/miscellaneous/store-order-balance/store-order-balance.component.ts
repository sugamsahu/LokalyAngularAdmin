import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AppComponent } from 'src/app/app.component';
import { TranslateService } from "@ngx-translate/core";
import { StoreOrderBalanceService } from 'src/app/services/miscellaneous/store-order-balance.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-store-order-balance',
  templateUrl: './store-order-balance.component.html',
  styleUrls: ['./store-order-balance.component.scss']
})
export class StoreOrderBalanceComponent implements OnInit {
  public formGroup: UntypedFormGroup;
  main: any = { LoggedUserInfo: {} };
  store_list_details: any = [];
  SelectedCategory: 0;
  licesing_model: any;
  subscription_fees: any;
  currentPackageBalance: any;
  paymentDue: any;
  gstAmount: any;
  totalDue: any;
  oderAmount: any;
  allowOrderAmountType: any;
  StoreList: any;
  storeid: any = 0;
  customerMobile = '';
  seller_subscription_id: any;
  onSaveButton: boolean = false;
  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  global_currency = this.general_setting.currency_symbol;
  store_label = this.general_setting.store_label;
  subscription_id: any;
  creditWallet: any;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private storeorderBalanceService: StoreOrderBalanceService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private el: ElementRef,
    private _snackbarService: ToastrService,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.store_list_details = [];
    this.SelectedCategory = 0;
    this.licesing_model = undefined;
    this.subscription_fees = undefined;
    this.currentPackageBalance = undefined;
    this.paymentDue = undefined;
    this.gstAmount = undefined;
    this.totalDue = undefined;
    this.oderAmount = undefined;
    this.allowOrderAmountType = undefined;
    this.StoreList = undefined;
    this.storeid = 0;
    this.customerMobile = '';
    this.seller_subscription_id = undefined;
    this.onSaveButton = false;
    this.subscription_id = undefined;
    this.creditWallet = undefined;
    this.help_details = undefined;

    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    if (this.general_setting) {
      this.store_label = this.general_setting.store_label;
    }
    else {
      this.store_label = this.main.store_label;
    }

    this.loadForm();
    this.sellerList();
    this.getHelpDetails()
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      oderAmount: new UntypedFormControl(null),
      paymentDue: new UntypedFormControl(null),
      gstAmount: new UntypedFormControl(null),
      totalDue: new UntypedFormControl(null),
      payment_details: new UntypedFormControl(null, Validators.required),
      payment_received: new UntypedFormControl(false, Validators.required),
      SelectedCategory: new UntypedFormControl(null)
    })
  }

  clearForm() {
    if (this.isOtherAmount) {
      this.formGroup.controls['oderAmount'].reset();
      this.formGroup.controls['payment_details'].reset();
      this.formGroup.controls['payment_received'].reset();
    } else {
      this.formGroup.controls['payment_details'].reset();
      this.formGroup.controls['payment_received'].reset();
    }
  }

  async sellerList() {

    var data = {
    };
    await this.storeorderBalanceService.getStoreDetailsByName(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.StoreList = response.data;
          this.StoreList.forEach(element => {
            if (element != undefined) {
              if (element.subscription_id == 5 && element.pay_type == 1) {
                element.selected = 0;
                if (element.store_name != '') {
                  element.display_content = element.store_name + " (" + element.manager_name + ")";
                }
                if (element.store_area_name.length > 0) {
                  element.display_content = element.display_content + element.store_area_name + "," + element.store_city_name;
                }
                if (element.store_name == '') {
                  element.display_content = element.manager_name;
                }
                this.store_list_details.push(element);
              }
            }
          });

          this.store_list_details = this.store_list_details.sort((a, b) => a.store_name.localeCompare(b.store_name));
        }
      },
      error: (error) => {

      },
      complete: () => {
      },
    });
  }


  storename: any;
  selectStore(item: any) {
    this.store_list_details.forEach(el => {
      el.selected = 0;
      if (el.store_id == item.store_id) {
        el.selected = 1;
        this.formGroup.controls['SelectedCategory'].setValue(el)
        this.cdr.detectChanges();
      }
    })

    this.storeid = item.store_id
    if (item.store_id != null) {
      this.onSaveButton = true
      this.seller_subscription_id = item.seller_subscription_id;
        this.licesing_model = item.package_name;
      this.subscription_fees = item.subscription_fees;
      this.currentPackageBalance = Number(item.order_balance == undefined ? 0 : item.order_balance).toFixed(0);
      this.updateOrderAmount(1)
    }
  }

  isOtherAmount: boolean = false;
  updateOrderAmount(value: any) {
    this.isOtherAmount = false;
    if (value == '6') {
      this.isOtherAmount = true;
    }
    this.allowOrderAmountType = value;
    this.oderAmount = value == 1 ? 100 : value == 2 ? 200 : value == 3 ? 300 : value == 4 ? 400 : value == 5 ? 500 : value == 6 ? 500 : 0;
    this.calculate();
  }
  /** Calculate method for payment, gst, total due */
  calculate() {
    this.paymentDue = this.oderAmount * this.subscription_fees;
    this.gstAmount = (18 * this.paymentDue) / 100;
    this.totalDue = this.gstAmount + this.paymentDue;
    this.formGroup.controls['oderAmount'].setValue(this.oderAmount);
      this.formGroup.controls['paymentDue'].setValue(Number(this.paymentDue).toFixed(2));
      this.formGroup.controls['gstAmount'].setValue(Number(this.gstAmount).toFixed(2));
      this.formGroup.controls['totalDue'].setValue(Number(this.totalDue).toFixed(2))
  }

  oderAmountChnage() {
    if (Number(this.formGroup.value.oderAmount) <= 0) {
      this._snackbarService.error('Zero Not Valid');
      this.formGroup.controls['oderAmount'].setValue(null)
      return false;
    }
    else {
      this.oderAmount = this.formGroup.value.oderAmount
    }
    this.calculate();
  }
  /** Submit method for add data of store order balance */
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName, i) => {
        if (i == 0) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + controlName + '"]'
          );
          invalidControl.focus();
        }
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    }
    else {

      let data = {};
      if (this.storeid) {
        data = {
          amount: this.paymentDue,
          grand_total: this.totalDue,
          order_count: this.oderAmount,
          payment_details: this.formGroup.value.payment_details,
          payment_received: this.formGroup.value.payment_received == true ? 1 : 0,
          seller_subscription_id: this.seller_subscription_id,
          store_id: Number(this.storeid),
          tax_amount: this.gstAmount,
          user_id: this.main.LoggedUserInfo.user_id
        }
      }
      this.storeorderBalanceService.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.ngOnInit();
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {
          this._snackbarService.error(error);
        },
        complete: () => {

        },
      });
    }
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement =
      this.el.nativeElement.querySelector("form .ng-invalid");

    window.scroll({
      top: this.getTopOffset(firstInvalidControl),
      left: 0,
      behavior: "smooth",
    });
  }
  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
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
      data.module_key = '23'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '23'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '23'
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
