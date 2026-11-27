import { Component, OnInit, ChangeDetectorRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ManageStoreService } from 'src/app/services/manage-store.service';
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-payment-setting-add',
  templateUrl: './payment-setting-add.component.html',
  styleUrls: ['./payment-setting-add.component.scss']
})
export class PaymentSettingAddComponent implements OnInit {
  seller_details = JSON.parse(localStorage.getItem('loginUserStore'));
  Unit_form: any;
  main: any
  table_id: any = 0;
  customer_User_Id: any = 0;

  public formGroup: UntypedFormGroup;
  store_id: any;
  paymentMethod: any;
  paymentType: any;
  @ViewChild("cursor") cursor;


  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private manageStoreService: ManageStoreService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private cryptoService: CryptoService,
    private toastr: ToastrService
  ) {
    translate.addLangs(["it", "en", "de"]);
    translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/payment-setting/edit") > -1) {
      this.table_id = this.cryptoService.decryptIdValue(
        "payment-setting" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.table_id == undefined) {
        this.router.navigate(["/payment-setting"]);
      }
    }
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
    }

    this.formGroup = this.formBuilder.group({
      paymentMethod: new UntypedFormControl(null),
      published_key: new UntypedFormControl(null),
      secret_key: new UntypedFormControl(null),
      is_agree: [0],
      merchant_id: new UntypedFormControl(null),
      merchant_key: new UntypedFormControl(null),
      is_default: [0],
      upi_id: new UntypedFormControl(null, [Validators.required, Validators.pattern('[a-zA-Z0-9\\.\\-]{2,256}\\@[a-zA-Z][a-zA-Z]{2,64}')])
    });

    this.GetUserPaymentTypeList();

  }

  /** Submit method for add/edit data of payment setting  */
  onSubmit() {
    let formData = new FormData();
    formData.append("user_id", this.main.LoggedUserInfo.user_id);
    formData.append("store_id", this.seller_details.store_id);
    if (this.table_id) {
      formData.append("seller_payment_type_id", this.table_id);
    }
    formData.append("payment_type_id", this.formGroup.value.paymentMethod.payment_type_id);

    if (this.formGroup.value.paymentMethod.payment_type_id == 2) {
      if (this.formGroup.value.is_agree == 0) {
        this.toastr.error(this.translate.instant('PLEASE_SELECT_ENABLED_THE_LIVE_MODE_IN_RAZORPAY'));
        return;
      }
      if (this.formGroup.value.published_key == undefined || this.formGroup.value.published_key == null || this.formGroup.value.published_key == '') {
        this.toastr.error(this.translate.instant('PLEASE_ENTER_PUBLISHABLE_KEY'));
        return;
      }
      else {
        formData.append("published_key", this.formGroup.value.published_key);
      }

      if (this.formGroup.value.secret_key == undefined || this.formGroup.value.secret_key == null || this.formGroup.value.secret_key == '') {
        this.toastr.error(this.translate.instant('PLEASE_ENTER_SECRET_KEY'));
        return;
      }
      else {
        formData.append("secret_key", this.formGroup.value.secret_key);
        formData.append(
          "is_agree",
          this.formGroup.value.is_agree == 1 ? "1" : "0"
        );
      }
    }

    else if (this.formGroup.value.paymentMethod.payment_type_id == 3) {
      if (this.formGroup.value.is_agree == 0) {
        this.toastr.error(this.translate.instant('PLEASE_SELECT_ENABLED_THE_LIVE_MODE_IN_RAZORPAY'));
        return;
      }
      if (this.formGroup.value.merchant_key == undefined || this.formGroup.value.merchant_key == null || this.formGroup.value.merchant_key == '') {
        this.toastr.error(this.translate.instant('PLEASE_ENTER_MERCHANT_KEY'));
        return;
      }
      else {
        formData.append("merchant_key", this.formGroup.value.merchant_key);
      }

      if (this.formGroup.value.merchant_id == undefined || this.formGroup.value.merchant_id == null || this.formGroup.value.merchant_id == '') {
        this.toastr.error(this.translate.instant('PLEASE_ENTER_MERCHANT_Id'));
        return;
      }
      else {
        formData.append("merchant_id", this.formGroup.value.merchant_id);
        formData.append(
          "is_agree",
          this.formGroup.value.is_agree == 1 ? "1" : "0"
        );
      }
    }

    else if (this.formGroup.value.paymentMethod.payment_type_id == 1) {
      formData.append("upi_id", this.formGroup.get('upi_id').value)
    }

    formData.append(
      "is_default",
      this.formGroup.value.is_default == true ? '1' : '0'
    );
    var data = formData;

    this.manageStoreService.saveStorePaymentType(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.router.navigate([`/payment-setting`]);

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
  /** Get data by id using service  */
  editdetails: any;
  async getbyid() {
    var data = {
      store_id: this.seller_details.store_id,
    };

    await this.manageStoreService.paymentTableGetById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach(element => {
            if (element.seller_payment_type_id == this.table_id) {
              this.editdetails = element;
            }
          });

          this.paymentType.forEach(element => {
            if (element.payment_type_id == this.editdetails.payment_type_id) {
              this.formGroup.controls["paymentMethod"].setValue(element);
            }
          });
          this.formGroup.controls["is_default"].setValue(this.editdetails.is_default);
          this.formGroup.controls["is_agree"].setValue(this.editdetails.is_agree);
          this.formGroup.controls["published_key"].setValue(this.editdetails.published_key);
          this.formGroup.controls["secret_key"].setValue(this.editdetails.secret_key);
          this.formGroup.controls["merchant_id"].setValue(this.editdetails.merchant_id);
          this.formGroup.controls["merchant_key"].setValue(this.editdetails.merchant_key);
          this.formGroup.controls["upi_id"].setValue(this.editdetails.upi_id);
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

  /**
   * Get the Option Value in Dropdown.
   */
  async GetUserPaymentTypeList() {
    await this.manageStoreService.getUserPaymentTypeList({}).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.paymentType = response.data;
          if (this.table_id) {
            this.getbyid();
          } else {
            this.formGroup.controls['paymentMethod'].setValue(this.paymentType[0]);
          }
          this.cdr.detectChanges()
        }

      },
      error: (error) => {
        // handle error

      },
      complete: () => {

      },
    });
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  cancelClick() {
    history.back();
  }

}