import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AppComponent } from 'src/app/app.component';
import { TranslateService } from "@ngx-translate/core";
import { CreditWalletService } from 'src/app/services/miscellaneous/credit-wallet.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-credit-wallet',
  templateUrl: './credit-wallet.component.html',
  styleUrls: ['./credit-wallet.component.scss']
})
export class CreditWalletComponent implements OnInit, AfterViewInit {
  public formGroup: UntypedFormGroup;
  main: any = { LoggedUserInfo: {} };
  user_id: any = 0;
  customerMobile = '';
  customer_user_id: any;
  @ViewChild('cursor') cursor: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private creditwalletservice: CreditWalletService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private el: ElementRef,
    private _snackbarService: ToastrService,
    public commonService: CommonService,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
  }

  generalSetting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  PlatformSetting = JSON.parse(localStorage.getItem('_platform_setting'));
  business_model = this.PlatformSetting.business_model;
  global_currency = this.generalSetting.currency_symbol;
  userData = JSON.parse(localStorage.getItem('loginUser'));
  description = 'Wallet credited by ' + this.generalSetting.platform_name;

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    this.getHelpDetails()
  }

  loadForm() {
    var creditDate = moment(new Date()).format(this.generalSetting.date_format_web.split(' ')[0]);
    this.formGroup = this.formBuilder.group({
      customerMobile: new UntypedFormControl(null, Validators.required),
      name: new UntypedFormControl(null),
      email: new UntypedFormControl(null),
      creditDate: new UntypedFormControl(creditDate),
      walletAmount: new UntypedFormControl(null, Validators.required),
      description: new UntypedFormControl(null),
    })
  }
  /** Submit method for add data of credit wallet. */
  onSubmit() {
    if (this.displayUnregisteredUserMsg) {
      this._snackbarService.error(this.translate.instant("WALLET_CREDIT_CANNOT_BE_DONE_FOR_UNREGISTERED"));
      return;
    }
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
      if (this.main.LoggedUserInfo.user_id) {
        data = {
          user_id: this.main.LoggedUserInfo.user_id,
          customer_user_id: this.creditWallet.user_id,
          amount: this.formGroup.value.walletAmount,
          description: this.formGroup.value.description,
        }
      }
      this.creditwalletservice.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(this.translate.instant(response.message));
            this.router.navigate([`/credit-wallet`]);
            this.clearForm();
          } else {
            this._snackbarService.error(this.translate.instant(response.message));
          }
        },
        error: (error) => {
          this._snackbarService.error(this.translate.instant(error));
        },
        complete: () => {

        },
      });
    }
  }

  clearForm() {
    this.loadForm();
  }
  changeNumber() {
    if (this.formGroup.value.customerMobile.length == 10) {
      this.getCustomerDetails();
    }
  }

  validateFloatNumber() {
    if (
      this.formGroup.value.walletAmount.split(".").length > 1 &&
      this.formGroup.value.walletAmount.split(".")[0] == ""
    ) {
      this.formGroup.controls['walletAmount'].setValidators(null);
    }
    if (this.formGroup.value.walletAmount.split(".").length > 2) {

      this.formGroup.controls['walletAmount'].setValue(
        Number(this.formGroup.value.walletAmount.split(".")[0] +
          "." +
          this.formGroup.value.walletAmount.split(".")[1]))
    }

    if (
      this.formGroup.value.walletAmount.split(".").length > 1 &&
      this.formGroup.value.walletAmount.split(".")[1] > 99
    ) {
      this.formGroup.controls['walletAmount'].setValue(Number(
        this.formGroup.value.walletAmount
      ).toFixed(2))
    }
  }

  creditWallet: any = [];
  commonConfigurationDetails: any;
  displayUnregisteredUserMsg: boolean = false;
  getCustomerDetails() {

    var data = {
      phone: this.formGroup.value.customerMobile,
    };

    this.creditwalletservice.getById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.displayUnregisteredUserMsg = false;
          this.creditWallet = response.data,
            this.formGroup.setValue({
              customerMobile: response.data.phone,
              name: response.data.name,
              email: response.data.email,
              creditDate: this.formGroup.value.creditDate,
              walletAmount: '',
              description: this.description
            });
          this.cdr.detectChanges();
        }
        else {
          this.formGroup.setValue({
            customerMobile: this.formGroup.value.customerMobile,
            name: '',
            email: '',
            creditDate: this.formGroup.value.creditDate,
            walletAmount: '',
            description: this.description
          });
          this.creditWallet.user_id = 0;
          this._snackbarService.error(response.message)
          if (response.message == "Wallet Credit cannot be done for unregistered user") {
            this.displayUnregisteredUserMsg = true;
          }
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
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

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
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
      data.module_key = '22'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '22'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '22'
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
