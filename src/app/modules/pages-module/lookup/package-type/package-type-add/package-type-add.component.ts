import { ChangeDetectorRef, Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import { PackageTypeService } from 'src/app/services/lookup/package-type.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

import { CryptoService } from "src/app/services/custom/crypto.service";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-package-type-add',
  templateUrl: './package-type-add.component.html',
  styleUrls: ['./package-type-add.component.scss']
})
export class PackageTypeAddComponent implements OnInit, AfterViewInit {
  packageType = { package_name: "" };
  package_type_id: any = 0;
  main: any = { LoggedUserInfo: {} };
  package_form: any;
  public formGroup: FormGroup;
  @ViewChild('cursor') cursor;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private packageTypeService: PackageTypeService,
    private appComponent: AppComponent,

    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService

  ) {

    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;

    if (location.href.indexOf("/package-type/edit") > -1) {
      this.package_type_id = this.cryptoService.decryptIdValue(
        "lookup_packageType_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );

      if (this.package_type_id == undefined) {
        this.router.navigate(["/package-type"]);
      }
    }
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.formGroup = this.formBuilder.group({
      packaging_id: new FormControl(null),
      packaging_name: new FormControl(null, [Validators.required]),
      description: new FormControl(null),
      user_id: new FormControl(this.main.LoggedUserInfo.user_id),
    });

    if (this.package_type_id && this.package_type_id != 0) {
      this.getPackageTypeDetails();
    }
    this.cdr.detectChanges();
  }
  /** Submit edit/new package type data */
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });

    } else {


      let data = {};
      if (this.package_type_id) {
        data = {
          packaging_name: this.formGroup.value.packaging_name,
          description: this.formGroup.value.description,
          packaging_id: this.package_type_id,
        };
      } else {
        data = {
          packaging_name: this.formGroup.value.packaging_name,
          description: this.formGroup.value.description,
        };
      }
      this.packageTypeService.add(this.formGroup.value).subscribe({

        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/package-type`]);
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
  getPackageTypeDetails() {

    var data = {
      packaging_id: this.package_type_id,
    };

    this.packageTypeService.getById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.packageType = response.data;
          this.formGroup.setValue({
            packaging_id: response.data.packaging_id,
            packaging_name: response.data.packaging_name,
            description: response.data.description,
            user_id: this.main.LoggedUserInfo.user_id,
          });
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
