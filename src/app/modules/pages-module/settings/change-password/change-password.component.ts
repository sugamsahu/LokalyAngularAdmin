import {
  ViewChild,
  Component,
  OnInit,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { AppComponent } from "src/app/app.component";
import { SettingsService } from "src/app/services/settings.service";
import { TranslateService } from "@ngx-translate/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Router } from "@angular/router";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.scss"],
})
export class ChangePasswordComponent implements OnInit, AfterViewInit {
  main: any = { LoggedUserInfo: {} };
  public formGroup: UntypedFormGroup;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  check: boolean;
  @ViewChild('cursor') cursor
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private router: Router,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private SettingsService: SettingsService,
    private formBuilder: UntypedFormBuilder,
    private el: ElementRef,
    private _snackbarService: ToastrService,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.loadform();
    this.getHelpDetails();
  }

  loadform() {
    this.formGroup = this.formBuilder.group(
      {
        new_password: [
          null,
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(20),
          ],
        ],
        confirm_password: new UntypedFormControl(null, [Validators.required]),
      },
      { validator: this.passwordConfirming }
    );
  }

  passwordConfirming(c: AbstractControl): { invalid: boolean } {
    if (c.get("new_password").value !== c.get("confirm_password").value) {
      return { invalid: true };
    }
  }

  /** Check password that new password and confirm password is matched or not */
  checkpas(data) {
    if (
      this.formGroup.value.confirm_password != this.formGroup.value.new_password
    ) {
      this.check = true;
    } else if (
      this.formGroup.value.confirm_password == this.formGroup.value.new_password
    ) {
      this.check = false;
    }
  }

  resetPassword() {
    this.loadform();
  }

  //submit
  /** Update password  */
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      let formData = new FormData();
      formData.append("user_id", this.main.LoggedUserInfo.user_id);
      formData.append("password", this.formGroup.value.new_password);
      formData.append(
        "confirm_password",
        this.formGroup.value.confirm_password
      );
      var data = formData;
      this.SettingsService.addEditProfile(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/change-password`]);
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
    this.loadform();
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
      data.module_key = '65'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '65'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '133'
    }
    if (this.main.LoggedUserInfo.role_id == 8) {
      data.module_key = '137'
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
}
