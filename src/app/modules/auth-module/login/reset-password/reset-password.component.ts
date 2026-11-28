import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UsersService } from 'src/app/services/users.service';
import { SpinnerService } from 'src/app/services/custom/spinner.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})

export class ResetPasswordComponent implements OnInit, OnDestroy {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  public resetForm: UntypedFormGroup
  public verificationForm: UntypedFormGroup
  public updatePasswordForm: UntypedFormGroup
  isLogin: any = 0;
  afterOtpSend: any = 0;
  count: any = 60;
  private countdown: ReturnType<typeof setInterval>;
  countdownFlag: boolean = false;
  eMail: '';
  reset_password_style: any

  constructor(
    public activeModal: NgbActiveModal,
    private el: ElementRef,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private userServices: UsersService,
    private spinner: SpinnerService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.reset_password_style = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.loadform();
    this.loadverificationform();
    this.loadUpdatePasswordform();
  }

  loadform() {
    this.resetForm = this.formBuilder.group({
      eMail: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]]
    })
  }

  loadverificationform() {
    this.verificationForm = this.formBuilder.group({
      a: new UntypedFormControl(null),
      b: new UntypedFormControl(null),
      c: new UntypedFormControl(null),
      d: new UntypedFormControl(null),
    })
  }

  moveFocus(event, nextElement) {
    var charCode = event.keyCode;
    if (event) {
      const allowedCharacters = /^[a-zA-Z0-9]*$/;
      // Check if the entered character matches the allowed pattern.
      var a: any = Number(event.target.value)
      if (!allowedCharacters.test(a)) {
        event.preventDefault();
        return;
      }

      if (event.target.value === '') {
        return;
      }

      if (charCode >= 48 && charCode <= 57) {
        $(nextElement).focus();
      }
      else {
        return
      }

    }
  }

  loadUpdatePasswordform() {
    this.updatePasswordForm = this.formBuilder.group({
      new_password: new UntypedFormControl('', [Validators.required]),
      confirm_password: new UntypedFormControl('', [Validators.required])
    },
      { validator: this.passwordConfirming });

  }

  passwordConfirming(c: AbstractControl): { invalid: boolean } {
    if (c.get('new_password').value !== c.get('confirm_password').value) {
      return { invalid: true };
    }
  }

  validateNumber(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  resetPassword() {
    if (!this.resetForm.valid) {
      const controls = this.resetForm.controls;

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
      this.spinner.show();
      var data = {
        isLogin: 0,
        phone: this.resetForm.value.eMail,
        source: "web"
      }

      this.userServices.resetPassword(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.afterOtpSend = 1;
            var _this = this;
            clearInterval(this.countdown);
            this.countdown = setInterval(function () {
              if (_this.count > 0)
                _this.count = _this.count - 1;
            }, 1000);
            this._snackbarService.success(response.message);
          } else {
            this._snackbarService.error(response.message);
            this.afterOtpSend = 0;
          }
        },
        error: (error) => {
          this.spinner.hide();
          this._snackbarService.error(error);
        },
        complete: () => {
          this.spinner.hide();
        },
      });
    }
  }


  otpVerify(otp: any) {
    if (!this.verificationForm.valid) {
      const controls = this.verificationForm.controls;

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
      this.spinner.show();
      var otpData = {
        otp: this.verificationForm.value.a + this.verificationForm.value.b + this.verificationForm.value.c + this.verificationForm.value.d,
        phone: this.resetForm.value.eMail
      }
      this.userServices.verificationOTP(otpData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.afterOtpSend = 2;
          } else {
            this._snackbarService.error(response.message);
            this.afterOtpSend = 1;
          }
        },
        error: (error) => {
          this._snackbarService.error(error);
        },
        complete: () => {
          this.spinner.hide();
        },
      });
    }
  }

  resendPassword() {
    this.spinner.show();
    this.verificationForm.reset();
    this.count = 60;
    var otpData = {
      isLogin: 0,
      phone: this.resetForm.value.eMail,
      source: "web"
    }
    this.userServices.resetPassword(otpData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
        } else {
          this._snackbarService.error(response.message);
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => {
        this.spinner.hide();
      },
    });

  }

  updatePassword() {
    if (!this.updatePasswordForm.valid) {
      const controls = this.updatePasswordForm.controls;

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
      this.spinner.show();
      var updateData = {
        password: this.updatePasswordForm.value.new_password,
        confirm_password: this.updatePasswordForm.value.confirm_password,
        phone: this.resetForm.value.eMail
      }
      this.userServices.changePassword(updateData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.activeModal.dismiss();
            this.router.navigate([`/auth/login`]);
          }
          else {
            this._snackbarService.error(response.message);
            this.afterOtpSend = null;
          }
        },
        error: (error) => {
          this.spinner.hide();
          this._snackbarService.error(error);
        },
        complete: () => {
          this.spinner.hide();
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
    const control = this.resetForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  controlHasError3(validation, controlName): boolean {
    const control3 = this.updatePasswordForm.controls[controlName];
    return control3.hasError(validation) && (control3.dirty || control3.touched);
  }

  ngOnDestroy(): void {
    clearInterval(this.countdown);
  }
}
