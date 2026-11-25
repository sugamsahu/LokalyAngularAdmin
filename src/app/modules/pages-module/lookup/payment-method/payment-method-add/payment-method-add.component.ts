import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { PaymentMethodService } from "src/app/services/lookup/payment-method.service";

@Component({
  selector: "app-payment-method-add",
  templateUrl: "./payment-method-add.component.html",
  styleUrls: ["./payment-method-add.component.scss"],
})
export class PaymentMethodAddComponent implements OnInit, AfterViewInit {
  payment_method_id: any = 0;
  main: any = {};
  general_setting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  dinein_module = this.general_setting.dinein_module;
  pos_module = this.general_setting.pos_module;
  session = this.appComponent.sessionConfig();
  @ViewChild('cursor') cursor;

  newPaymentMethod: {
    method_type: any;
    method_type_val: any;
    is_active: any;
    multipayment_allowed: any;
  };
  public formGroup: FormGroup;

  constructor(
    private router: Router,
    public translate: TranslateService,
    private appComponent: AppComponent,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private paymentMathodService: PaymentMethodService,
    private el: ElementRef,
    private cryptoService: CryptoService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;

  }
  ngOnInit(): void {
    if (location.href.indexOf("/payment-method/edit") > -1) {
      this.payment_method_id = this.cryptoService.decryptIdValue(
        "lookup_paymentMethod_Id" + this.main.LoggedUserInfo.role_id.toString(),
        this.main.CryptoKey
      );
      this.session.clearCookie(
        "lookup_paymentMethod_Id" + this.main.LoggedUserInfo.role_id.toString()
      );
      if (this.payment_method_id == undefined) {
        this.router.navigate(["/payment-method/"]);
      }
    }
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.newPaymentMethod = {
      method_type: "Payment On Delivery",
      method_type_val: "2",
      is_active: true,
      multipayment_allowed: false,
    };

    this.loadForm();

    if (this.payment_method_id) {
      this.getData();
    }
  }

  hideFields: boolean = false;
  loadForm() {
    if (this.dinein_module == 0 && this.pos_module == 0) {
      this.hideFields = true;
      this.formGroup = this.formBuilder.group({
        name: ["", Validators.required],
        displayName: ["", Validators.required],
        methodType: [this.newPaymentMethod.method_type, Validators.required],
        isActive: (this.newPaymentMethod.is_active),
      });
    } else {
      this.hideFields = false;
      this.formGroup = this.formBuilder.group({
        name: ["", Validators.required],
        displayName: ["", Validators.required],
        posMethodName: ["", Validators.required],
        methodType: [this.newPaymentMethod.method_type, Validators.required],
        multipaymentAllowed: (this.newPaymentMethod.multipayment_allowed),
        isActive: (this.newPaymentMethod.is_active),
      });
    }
  }
  /** Get payment method data by id using service */
  async getData() {
    let data = {
      method_id: this.payment_method_id,
    };
    await this.paymentMathodService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.newPaymentMethod = {
            multipayment_allowed: response.data.multipayment_allowed == "1" ? true : false,
            is_active: response.data.is_active == 1 ? true : false,
            method_type: response.data.method_type,
            method_type_val: response.data.method_type_val,
          };

          this.formGroup.patchValue({
            name: response.data.method_name,
            displayName: response.data.method_name_display,
            posMethodName: response.data.pos_method_name,
            methodType: response.data.method_type,
            description: response.data.description,
            multipaymentAllowed: response.data.multipayment_allowed == "1" ? true : false,
            isActive: response.data.is_active == "1" ? true : false,
          });
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => {
        ;
      },
    });
  }
  /** Submit edit/new payment method data */
  onSubmit() {

    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });

    }
    else {
      let data = {};
      if (this.payment_method_id) {
        data = {
          method_name: this.formGroup.value.name,
          method_name_display: this.formGroup.value.displayName,
          pos_method_name: this.formGroup.value.posMethodName,
          is_active: this.formGroup.value.isActive == true ? "1" : "0",
          multipayment_allowed: this.formGroup.value.multipaymentAllowed == true ? "1" : "0",
          method_type_val: this.newPaymentMethod.method_type_val,
          method_id: this.payment_method_id,
        };
      } else {
        data = {
          method_name: this.formGroup.value.name,
          method_name_display: this.formGroup.value.displayName,
          pos_method_name: this.formGroup.value.posMethodName,
          is_active: this.formGroup.value.isActive == true ? "1" : "0",
          multipayment_allowed: this.formGroup.value.multipaymentAllowed == true ? "1" : "0",
          method_type_val: this.newPaymentMethod.method_type_val,
        };
      }

      this.paymentMathodService.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/payment-method`]);
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {
          this._snackbarService.error(error);
        },
        complete: () => {
          ;
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

  cancelClick() {
    history.back();
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }
}
