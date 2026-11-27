import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { TaxGroupService } from "src/app/services/lookup/tax-group.service";
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-tax-group-add",
  templateUrl: "./tax-group-add.component.html",
  styleUrls: ["./tax-group-add.component.scss"],
})
export class TaxGroupAddComponent implements OnInit, AfterViewInit {
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  tax_group_id: any = 0;
  main: any = { LoggedUserInfo: {} };
  package_form: any;
  public formGroup: UntypedFormGroup;
  taxzone_list = [];
  taxzone_name: any = null;
  taxzoneid: any = null;
  isedit = false;
  @ViewChild('cursor') cursor;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private TaxGroupService: TaxGroupService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private toastr: ToastrService,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;

    if (location.href.indexOf("/tax-group/edit") > -1) {
      this.tax_group_id = this.cryptoService.decryptIdValue(
        "lookup_tax_group_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );

      if (this.tax_group_id == undefined) {
        this.router.navigate(["/tax-group"]);
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
    this.loadForm();

    this.TaxzoneListRecord();

    if (this.tax_group_id) {
      this.getDetails();
    }
    this.cdr.detectChanges();
  }

  taxgroupList = [];
  addtaxamount() {
    if (
      this.formGroup.value.selected_taxzone < -1 ||
      this.formGroup.value.selected_taxzone == null
    ) {
      this.toastr.error(this.translate.instant("SELECT_TAX_ZONE"));
      return;
    }
    if (
      this.formGroup.value.tax_amount == undefined ||
      this.formGroup.value.tax_amount == ""
    ) {
      this.toastr.error(this.translate.instant("ENTER_TAX %"));
      return;
    }
    if (
      this.formGroup.value.tax_amount > 100 ||
      this.formGroup.value.tax_amount < 1
    ) {
      this.toastr.error(this.translate.instant("ENTER_VALID_TAX_AMOUNT"));
      return;
    }
    if (this.isedit == true) {
      this.taxgroupList.forEach((element) => {
        if (element.tax_zone_id == this.taxzoneid) {
          element.tax_zone_id = this.taxzoneid;
          element.tax_value = Number(this.formGroup.value.tax_amount).toFixed(2);
          element.tax_zone_name = this.taxzone_name;
        }
      });
    } else {
      this.taxgroupList.push({
        tax_zone_id: this.formGroup.value.selected_taxzone.tax_zone_id,
        tax_value: Number(this.formGroup.value.tax_amount).toFixed(2),
        tax_zone_name: this.formGroup.value.selected_taxzone.tax_zone_name,
      });
    }
    this.isedit = false;
    this.taxzone_name = null;
    this.taxzoneid = null;
    this.taxzone_list = this.taxzone_list.filter(
      (event) => event !== this.formGroup.value.selected_taxzone
    );
    this.formGroup.controls["selected_taxzone"].setValue(null);
    this.formGroup.controls["tax_amount"].setValue(null);
  }

  edittaxlist(item) {
    this.isedit = true;
    this.formGroup.controls["selected_taxzone"].setValue(
      item.tax_zone_name,
      item.tax_zone_id
    );
    this.taxzone_name = item.tax_zone_name;
    this.taxzoneid = item.tax_zone_id;
    this.formGroup.controls["tax_amount"].setValue(item.tax_value);
    this.formGroup.value.tax_amount = item.tax_value;
  }

  removetax(item) {
    this.taxgroupList = this.taxgroupList.filter((event) => event !== item);
    this.taxzone_list.push(item);
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      selected_taxzone: new UntypedFormControl(null),
      tax_group_id: new UntypedFormControl(null),
      tax_group_name: [null, Validators.required],
      description: new UntypedFormControl(null),
      tax_amount: new UntypedFormControl(null),
      is_active: new UntypedFormControl(true),
    });
  }
  /** Submit edit/new tax group data */
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      let data = {};
      if (this.tax_group_id && this.taxgroupList.length != 0) {
        data = {
          user_id: this.main.LoggedUserInfo.user_id,
          tax_group_id: this.tax_group_id,
          tax_group_name: this.formGroup.value.tax_group_name,
          description: this.formGroup.value.description,
          is_active: this.formGroup.value.is_active == true ? "1" : "0",
          tax_zones: JSON.stringify(this.taxgroupList),
        };
      } else if (this.taxgroupList.length != 0) {
        data = {
          user_id: this.main.LoggedUserInfo.user_id,
          tax_group_name: this.formGroup.value.tax_group_name,
          description: this.formGroup.value.description,
          tax_group_id: this.formGroup.value.selected_taxzone,
          tax_value: this.formGroup.value.tax_amount,
          is_active: this.formGroup.value.is_active == true ? "1" : "0",
          tax_zones: JSON.stringify(this.taxgroupList),
        };
      }

      this.TaxGroupService.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/tax-group`]);
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
  /** Get tax group details by it's id using service.  */
  getDetails() {
    let data = {
      tax_group_id: this.tax_group_id,
    };
    this.TaxGroupService.getDetailsTax(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.tax_zones.forEach((element) => {
            var data = {
              tax_zone_id: element.tax_zone_id,
              tax_value: element.tax_value,
              tax_zone_name: element.tax_zone_name,
            };
            this.taxgroupList.push(data);
          });

          this.formGroup.setValue({
            tax_group_name: response.data.tax_group_name,
            tax_group_id: response.data.tax_group_id,
            description: response.data.description,
            is_active: response.data.is_active == 1 ? true : false,
            selected_taxzone: null,
            tax_amount: null,
          });
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => { },
    });
  }

  async TaxzoneListRecord() {
    var data = {
      token_type: 1,
    };
    await this.TaxGroupService.getTaxzoneList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.taxzone_list = response.data;
          if (!this.tax_group_id) {
          }
          this.cdr.detectChanges();
        }
      },
      error: (error) => { },
      complete: () => { },
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
