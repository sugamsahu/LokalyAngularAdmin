import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { AppComponent } from 'src/app/app.component';
import { TranslateService } from "@ngx-translate/core";
import { WholesaleAppService } from 'src/app/services/miscellaneous/wholesale-app.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-wholesaleapp-add',
  templateUrl: './wholesaleapp-add.component.html',
  styleUrls: ['./wholesaleapp-add.component.scss']
})
export class WholesaleappAddComponent implements OnInit {
  main: any = { LoggedUserInfo: {} };
  customer_business_id: any = 0;
  public formGroup: FormGroup;
  picture: any;
  selectedStatus: any;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private wholesaleappService: WholesaleAppService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private _snackbarService: ToastrService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;

    if (location.href.indexOf("/wholesale-app/edit") > -1) {
      this.customer_business_id = this.cryptoService.decryptIdValue(
        "customer_business_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.cryptoService.clearCookie("customer_business_id" + this.main.LoggedUserInfo.role_id?.toString());
      if (this.customer_business_id == undefined) {
        this.router.navigate(["/wholesale-app"]);
      }
    }
  }
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  PlatformSetting = JSON.parse(localStorage.getItem('_platform_setting'));
  business_model = this.PlatformSetting.business_model;
  isdisplayWhole = parseInt(this.generalSetting.allow_wholeseller);
  pincode_label = this.generalSetting.pincode_label;


  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();

    if (this.customer_business_id) {
      this.getWholesaleAppData();
    }

    this.cdr.detectChanges();
  }

  statusList = [
    { label: 'Under Review', value: 1 },
    { label: 'Approved', value: 2 },
    { label: 'Rejected', value: 3 }
  ];
  ChangeStatus(event: any) {
    this.selectedStatus = event;
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      user_name: new FormControl(null),
      user_phone: new FormControl(null),
      user_email: new FormControl(null),
      picture: new FormControl("assets/icons/no_image.svg"),
      business_name: new FormControl(null),
      tax_number: new FormControl(null),
      address1: new FormControl(null),
      address2: new FormControl(null),
      area_name: new FormControl(null),
      zipcode: new FormControl(null),
      city_name: new FormControl(null),
      state_name: new FormControl(null),
      country_name: new FormControl(null),
      remarks: new FormControl(null),
      selectedStatus: new FormControl(null),
    });
  }

  async getWholesaleAppData() {
    var data = {
      customer_business_id: this.customer_business_id,
    };
    await this.wholesaleappService.getById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.formGroup.setValue({
            user_name: response.data.user_name,
            user_phone: response.data.user_phone,
            user_email: response.data.user_email,
            business_name: response.data.business_name,
            tax_number: response.data.tax_number,
            address1: response.data.address1,
            address2: response.data.address2,
            area_name: response.data.area_name,
            zipcode: response.data.zipcode,
            city_name: response.data.city_name,
            state_name: response.data.state_name,
            country_name: response.data.country_name,
            picture: response.data.user_picture,
            remarks: response.data.remarks,
            selectedStatus: response.data.status,
          });
          this.cdr.detectChanges();
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
  }

  /** Submit method for add/edit data of whole sale app module */
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
      if (this.customer_business_id) {
        data = {
          customer_business_id: this.customer_business_id,
          status: this.selectedStatus.label,
          status_val: this.selectedStatus.value,
          remarks: this.formGroup.value.remarks,
        }
      }
      this.wholesaleappService.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/wholesale-app`]);
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {

          this._snackbarService.error(error);
        },
        complete: () => { },
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

  cancelClick() {
    history.back();
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }
}
