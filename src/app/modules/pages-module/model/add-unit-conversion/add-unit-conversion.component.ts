import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { CommonService } from "src/app/services/common.service";

import { UnitConversionService } from "src/app/services/lookup/unit-conversion.service";

@Component({
  selector: "app-add-unit-conversion",
  templateUrl: "./add-unit-conversion.component.html",
  styleUrls: ["./add-unit-conversion.component.scss"],
})
export class AddUnitConversionModelComponent implements OnInit {
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @Input() from_unit_id: any;
  @Input() to_unit_id: any;
  closeResult = '';
  public formGroup: FormGroup;
  unitConversionId: any = 0;
  main: any;
  unitTypeList: any = [];
  fromUnitTypeList: any = [];
  toUnitTypeList: any = [];
  @Output() selectedConversion: EventEmitter<any> = new EventEmitter();
  isDivDisabled: boolean = true;
  style_obj_add_unit_conversion:any;

  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private UnitConversionService: UnitConversionService,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_add_unit_conversion = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.loadForm();
    this.unitTypeUnitNameRecord();
  }
  /** Get Item Unit List using service. */
  async unitTypeUnitNameRecord() {
    var data = {
      token_type: 1,
    };
    await this.UnitConversionService.getItemUnitList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.unitTypeList = response.data;
          this.fromUnitTypeList = this.unitTypeList;
          this.toUnitTypeList = this.unitTypeList;
          if (this.unitConversionId != undefined) {
          }

          this.formGroup.controls["from_unit_id"].setValue(this.from_unit_id.unit_id)
          this.formGroup.controls["to_unit_id"].setValue(this.to_unit_id.unit_id)
        }
      },
      error: (error) => {
        this.toastr.error(this.translate.instant(error.message));
      },
      complete: () => {
        ;
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

  getSelectedFromUnit(val: any) { }

  controlHasError(validation: any, controlName: any): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
      });

      if(!this.formGroup.controls['conversation_name'].valid) {
        this.toastr.error(this.translate.instant('ENTER_CONVERSATION_NANE'));
        return;
      }

      if(!this.formGroup.controls['from_unit_value'].valid) {
        this.toastr.error(this.translate.instant('PLEASE_ENTER_FROM_UNIT_VALUE'));
        return;
      }

      if(!this.formGroup.controls['to_unit_value'].valid) {
        this.toastr.error(this.translate.instant('PLEASE_ENTER_TO_UNIT_VALUE'));
      }
    } else {
      let data = {
        conversation_name: this.formGroup.value.conversation_name,
        from_unit_value: this.formGroup.value.from_unit_value,
        to_unit_value: this.formGroup.value.to_unit_value,
        from_unit_id: this.formGroup.value.from_unit_id,
        to_unit_id: this.formGroup.value.to_unit_id,
      };

      this.UnitConversionService.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(this.translate.instant(response.message));
            this.selectedConversion.emit(response.data.conversation_id);
            this.modal.close();
          } else {
            this.toastr.error(this.translate.instant(response.message));
          }
        },
        error: (error) => {
          this.toastr.error(this.translate.instant(error.message));
        },
        complete: () => {
          ;
        },
      });
    }
  }

  validateDropDown(){
  }

}
