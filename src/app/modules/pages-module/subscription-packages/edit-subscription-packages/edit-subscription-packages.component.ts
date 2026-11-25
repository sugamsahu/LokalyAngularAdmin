import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { SubscriptionPackagesService } from "src/app/services/subscription-packages.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-edit-subscription-packages",
  templateUrl: "./edit-subscription-packages.component.html",
  styleUrls: ["./edit-subscription-packages.component.scss"],
})
export class EditSubscriptionPackagesComponent implements OnInit, AfterViewInit {
  subId: any = 0;
  main: any = { LoggedUserInfo: {} };
  package_form: any;
  public formGroup: FormGroup;
  isSubscription: boolean;
  business_model: any;
  @ViewChild('cursor') cursor;
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private SubscriptionPackagesService: SubscriptionPackagesService,
    private appComponent: AppComponent,
    private spinner: SpinnerService,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin)  {
      this.router.navigate(['/dashboard']);
    }
    if (location.href.indexOf("/subscription-packages/edit") > -1) {
      this.subId = this.cryptoService.decryptIdValue(
        "subscription_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );

      if (this.subId == undefined) {
        this.router.navigate(["/subscription-packages"]);
      }
    }
  }
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  ngOnInit(): void {
    this.PlatformSetting =
      this.PlatformSetting == null
        ? this.main.platform_setting
        : this.PlatformSetting;
    this.business_model = this.PlatformSetting.business_model;
    this.isSubscription =
      this.business_model == 1
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : false;

    if (Number(this.isSubscription) == 0) {
      this.router.navigate([`/dashboard`]);
    }
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());

    this.loadForm();
    if (this.subId) {
      this.getDetails();
    }
    this.cdr.detectChanges();
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      package_name: [null, Validators.required],
      package_desc: [null, Validators.required],
      is_active: new FormControl(false),
    });
  }
  /** Submit edit data */
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      this.spinner.show();
      let data = {};
      if (this.subId) {
        data = {
          user_id: this.main.LoggedUserInfo.user_id,
          subscription_id: this.subId,
          package_name: this.formGroup.value.package_name,
          package_description: this.formGroup.value.package_desc,
          is_active: this.formGroup.value.is_active == true ? "1" : "0",
        };
      } else {
        data = {};
      }
      this.SubscriptionPackagesService.manageSubscriptions(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/subscription-packages`]);
          } else {
            this._snackbarService.error(response.message);
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
  /** Get subscription details using service */
  getDetails() {
    this.spinner.show();
    let data = {
      subscription_id: this.subId,
    };
    this.SubscriptionPackagesService.getSubscriptionList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();

          response.data.forEach((item) => {
            if (item.subscription_id == this.subId) {
              this.formGroup.setValue({
                package_name: item.package_name,
                package_desc: item.package_description,
                is_active: item.is_active == 1 ? true : false,
              });
            }
          });
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
