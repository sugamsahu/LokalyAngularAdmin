import { UnitTypeService } from "../../../../../services/lookup/unit-type.service";
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-unit-type-add",
  templateUrl: "./unit-type-add.component.html",
  styleUrls: ["./unit-type-add.component.scss"],
})
export class UnitTypeAddComponent implements OnInit, AfterViewInit {
  unitType = { unit_name: "" };
  Unit_form: any;
  main: any
  unit_type_id: any = 0;
  customer_User_Id: any = 0;
  public formGroup: FormGroup;
  @ViewChild('cursor') cursor

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private unitTypeservice: UnitTypeService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private cryptoService: CryptoService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/unit-type/edit") > -1) {
      this.unit_type_id = this.cryptoService.decryptIdValue(
        "lookup_unit_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.unit_type_id == undefined) {
        this.router.navigate(["/unit-type"]);
      }
    }
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.formGroup = this.formBuilder.group({
      unit_id: new FormControl(0),
      unit_name: new FormControl(null, [Validators.required]),
      user_id: new FormControl(this.main.LoggedUserInfo.user_id),
    });

    if (this.unit_type_id) {
      this.getUnitTypeDetails();
    }
    this.cdr.detectChanges();
  }
  /** Submit method of add/edit unit type */
  onSubmit() {
    if (!this.formGroup.valid) {
      return;
    }



    this.unitTypeservice.add(this.formGroup.value).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.router.navigate([`/unit-type`]);
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

  getUnitTypeDetails() {

    var data = {
      unit_id: this.unit_type_id,
    };

    this.unitTypeservice.getById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.unitType = response.data;
          this.formGroup.setValue({
            unit_id: response.data.unit_id,
            unit_name: response.data.unit_name,
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
