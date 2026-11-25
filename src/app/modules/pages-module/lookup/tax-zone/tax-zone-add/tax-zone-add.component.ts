import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { TaxZoneService } from "src/app/services/lookup/tax-zone.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SelectCountryComponent } from "../../../model/select-country/select-country.component";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-tax-zone-add",
  templateUrl: "./tax-zone-add.component.html",
  styleUrls: ["./tax-zone-add.component.scss"],
})
export class TaxZoneAddComponent implements OnInit, AfterViewInit {
  TaxZoneId: any = 0;
  main: any = { LoggedUserInfo: {} };
  package_form: any;
  public formGroup: FormGroup;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  pincode_label = this.general_setting.pincode_label;
  store_label = this.general_setting.store_label;
  selected_areas_list = [];
  @ViewChild('cursor') cursor;
  allow_alphanumeric_pincode: number;
  type: string;
  pincode_length: any;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private TaxZoneService: TaxZoneService,
    private appComponent: AppComponent,
    private spinner: SpinnerService,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;

    if (location.href.indexOf("/tax-zone/edit") > -1) {
      this.TaxZoneId = this.cryptoService.decryptIdValue(
        "lookup_tax_zone_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );

      if (this.TaxZoneId == undefined) {
        this.router.navigate(["/tax-zone"]);
      }
    }
  }

  ngOnInit(): void {
    this.pincode_length = this.general_setting.pincode_length;
    this.allow_alphanumeric_pincode = parseInt(
      this.general_setting.allow_alphanumeric_pincode
    );
    this.type = this.allow_alphanumeric_pincode == 1 ? "text" : "number"
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    this.cdr.detectChanges();
    if (this.TaxZoneId) {
      this.getDetails();
    }
  }

  loadForm() {
    if (this.TaxZoneId) {
      this.formGroup = this.formBuilder.group({
        tax_zone_id: [null],
        tax_zone_name: [null, Validators.required],
        description: [null],
        is_active: [true],
        tax_zone: ["1"],
        pincode_type: ["1"],
        pincode_list: [null],
        Rows: this.formBuilder.array([]),
      });
    } else {
      this.formGroup = this.formBuilder.group({
        tax_zone_id: [null],
        tax_zone_name: [null, Validators.required],
        description: [null],
        is_active: [true],
        tax_zone: ["1"],
        pincode_type: ["1"],
        pincode_list: [null],
        Rows: this.formBuilder.array([this.initRows()]),
      });
    }
  }

  get formArr() {
    return this.formGroup.get("Rows") as FormArray;
  }

  initRows() {
    return this.formBuilder.group({
      from_pincode: [""],
      to_pincode: [""],
    });
  }

  newpinrange() {
    this.formArr.push(this.initRows());
  }

  deleteRow(index: number) {
    this.formArr.removeAt(index);
  }

  openSelectCountry() {
    const modalRef = this.modalService.open(SelectCountryComponent, {
      size: "lg",
    });
    modalRef.componentInstance.sendCountry = this.selected_areas_list;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      if (receivedEntry) {
        this.selected_areas_list = receivedEntry;
      } else {
        this.selected_areas_list = [];
      }
    });
  }
  /** Submit method of edit/new tax zone data  */
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
      formData.append("tax_zone_name", this.formGroup.value.tax_zone_name);

      if (
        this.formGroup.value.description != undefined &&
        this.formGroup.value.description != null &&
        this.formGroup.value.description != ""
      ) {
        formData.append("description", this.formGroup.value.description);
      } else {
        formData.append("description", "");
      }
      formData.append("zone_type", this.formGroup.value.tax_zone);
      // for country
      if (this.formGroup.value.tax_zone == "1") {
        var areaIds = [];

        if (this.selected_areas_list.length == 0) {
          this.toastr.error(
            this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_COUNTRY")
          );
          return this.formGroup;
        }

        this.selected_areas_list.forEach((element) => {
          areaIds.push(element.id || element.country_id);
        });

        if (areaIds.length == 0) {
          this.toastr.error(
            this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_COUNTRY")
          );
          return this.formGroup;
        } else {
          formData.append("country_ids", areaIds.toString());
        }
      } else if (this.formGroup.value.tax_zone == 3) {
        formData.append("pincode_type", this.formGroup.value.pincode_type);
        if (this.formGroup.value.pincode_type == 0) {
          return;
        }
        if (this.formGroup.value.pincode_type == 1) {
          if (
            this.formGroup.value.pincode_list == undefined ||
            this.formGroup.value.pincode_list == null ||
            this.formGroup.value.pincode_list == ""
          ) {
            this.toastr.error(
              this.translate.instant(
                "Enter " + this.pincode_label + " value(s)"
              )
            );
            return this.formGroup;
          }
          formData.append("pincode_list", this.formGroup.value.pincode_list);
        }
        if (this.formGroup.value.pincode_type == 2) {
          var slotpin = 1;
          for (var i = 0; i < this.formArr.value.length; i++) {
            if (
              this.formArr.value[i].from_pincode == undefined ||
              this.formArr.value[i].to_pincode == undefined ||
              this.formArr.value[i].from_pincode == "" ||
              this.formArr.value[i].to_pincode == ""
            ) {
              slotpin = 0;
              break;
            }
          }
          if (slotpin == 0) {
            this.toastr.error(
              this.translate.instant(
                "Please enter" + this.pincode_label + "range"
              )
            );
            return this.formGroup;
          }
          formData.append("pincode_range", JSON.stringify(this.formArr.value));
        }
      }
      formData.append(
        "is_active",
        this.formGroup.value.is_active == true ? "1" : "0"
      );

      if (this.TaxZoneId) {
        formData.append("tax_zone_id", this.TaxZoneId);
        var data = formData;
      } else {
        var data = formData;
      }
      this.spinner.show();
      this.TaxZoneService.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/tax-zone`]);
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
  /** Get tax zone details by id using service */
  getDetails() {
    this.spinner.show();
    let data = {
      tax_zone_id: this.TaxZoneId,
    };
    this.TaxZoneService.getDetailsTax(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          response.data.countries.forEach((element) => {
            this.selected_areas_list.push(element);
          });
          this.formGroup.patchValue({
            tax_zone_id: response.data.tax_zone_id,
            tax_zone_name: response.data.tax_zone_name,
            tax_zone: response.data.zone_type,
            pincode_type: response.data.pincode_type != null ? response.data.pincode_type.toString() : '',
            description: response.data.description,
            is_active: response.data.is_active == 1 ? true : false,
            pincode_list: response.data.pincode_list,
          });
          if (response.data.pincode_range.length == 0) {
            this.editRowsBind(null);
          } else {
            response.data.pincode_range.forEach(el => {
              this.editRowsBind(el);
            })
          }
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

  editRowsBind(d: any) {
    const row = this.formBuilder.group({
      from_pincode: [d && d.from_pincode ? d.from_pincode : null],
      to_pincode: [d && d.to_pincode ? d.to_pincode : null],
    });
    this.formArr.push(row);
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

  restrictNumeric(e) {
    if (this.type == "number") {
      var charCode = e.keyCode;
      if ((charCode < 48 || charCode > 57) && charCode != 46) {
        event.preventDefault();
      }
    }
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }
}