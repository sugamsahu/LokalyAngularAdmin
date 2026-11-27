import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { AppComponent } from "src/app/app.component";
import { CommonService } from "src/app/services/common.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { UnitConversionService } from "src/app/services/lookup/unit-conversion.service";

@Component({
  selector: "app-unit-conversion-add",
  templateUrl: "./unit-conversion-add.component.html",
  styleUrls: ["./unit-conversion-add.component.scss"],
})
export class UnitConversionAddComponent implements OnInit, AfterViewInit {
  unit_conversion_id: any = 0;
  main;
  unit_type_list = [];
  from_unit_type_list = [];
  to_unit_type_list = [];
  public formGroup: UntypedFormGroup;
  customer_User_Id: any = 0;
  @ViewChild('cursor') cursor
  constructor(
    private router: Router,
    public translate: TranslateService,
    private appComponent: AppComponent,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private UnitConversionService: UnitConversionService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/unit-conversion/edit") > -1) {
      this.unit_conversion_id = this.cryptoService.decryptIdValue(
        "lookup_unitConversion_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.unit_conversion_id == undefined) {
        this.router.navigate(["/unit-conversion"]);
      }
    }
  }
  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadForm();
    this.unitTypeUnitNameRecord();
    if (this.unit_conversion_id) {
      this.getData();
    }
  }

  ChangeUnit(item) { }

  async unitTypeUnitNameRecord() {
    var data = {
      token_type: 1,
    };
    await this.UnitConversionService.getItemUnitList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.unit_type_list = response.data;
          this.from_unit_type_list = this.unit_type_list;
          this.to_unit_type_list = this.unit_type_list;
          if (this.unit_conversion_id != undefined) {
          }
        }
      },
      error: (error) => { },
      complete: () => {

      },
    });
  }
  /** Get unit conversion data by id using service */
  getData() {
    let data = {
      conversation_id: this.unit_conversion_id,
    };
    this.UnitConversionService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.formGroup.setValue({
            conversation_name: response.data.conversation_name,
            from_unit_value: response.data.from_unit_value,
            to_unit_value: response.data.to_unit_value,
            from_unit_id: response.data.from_unit_id,
            to_unit_id: response.data.to_unit_id,
          });
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => {

      },
    });
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      conversation_name: [null, Validators.required],
      from_unit_value: [null, Validators.required],
      to_unit_value: [null, Validators.required],
      from_unit_id: [null, Validators.required],
      to_unit_id: [null, Validators.required],
    });
  }
  /** Submit method of add/edit unit conversion  */
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      let data = {};
      if (this.unit_conversion_id) {
        data = {
          conversation_name: this.formGroup.value.conversation_name,
          from_unit_value: this.formGroup.value.from_unit_value,
          to_unit_value: this.formGroup.value.to_unit_value,
          from_unit_id: this.formGroup.value.from_unit_id,
          to_unit_id: this.formGroup.value.to_unit_id,
          conversation_id: this.unit_conversion_id,
        };
      } else {
        data = {
          conversation_name: this.formGroup.value.conversation_name,
          from_unit_value: this.formGroup.value.from_unit_value,
          to_unit_value: this.formGroup.value.to_unit_value,
          from_unit_id: this.formGroup.value.from_unit_id,
          to_unit_id: this.formGroup.value.to_unit_id,
        };
      }

      this.UnitConversionService.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/unit-conversion`]);
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

  getSelectedFromUnit(unit) {
    this.to_unit_type_list = [];
    this.unit_type_list.forEach((element) => {
      if (element.unit_id != unit) {
        this.to_unit_type_list.push(element);
      }
    });
    if (this.formGroup.value.to_unit_id == unit) {
      this.formGroup.controls["to_unit_id"].setValue(null);
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
