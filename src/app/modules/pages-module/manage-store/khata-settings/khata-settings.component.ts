import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { ToastrService } from 'ngx-toastr';
import { ManageStoreService } from 'src/app/services/manage-store.service';
import { CommonService } from 'src/app/services/common.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-khata-settings',
  templateUrl: './khata-settings.component.html',
  styleUrls: ['./khata-settings.component.scss']
})
export class KhataSettingsComponent implements OnInit, AfterViewInit {
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  seller_details = JSON.parse(localStorage.getItem('loginUserStore'));
  unit_type: any;
  khata_label = this.general_setting.khata_label;
  formGroup: UntypedFormGroup;
  main: any;
  @ViewChild('cursor') cursor;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  skipShow: boolean = true;
  pos_allowed: any;

  constructor(
    public translate: TranslateService,
    public manageStoreService: ManageStoreService,
    private formBuilder: UntypedFormBuilder,
    private appComponent: AppComponent,
    private toastr: ToastrService,
    public commonService: CommonService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private router: Router,
  ) {
    translate.addLangs(["it", "en", "de"]);
    translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.unit_type = [{ unit_id: 1, Unit_name: this.translate.instant("DAY") }, { unit_id: 2, Unit_name: this.translate.instant("WEEK") }, { unit_id: 3, Unit_name: this.translate.instant("MONTH") }, { unit_id: 4, Unit_name: this.translate.instant("YEAR") }];
    this.formGroup = this.formBuilder.group({
      overdue_limit: new UntypedFormControl(null, [Validators.required]),
      number: new UntypedFormControl(null, [Validators.required]),
      unit_name: ['', [Validators.required]],
    });
    this.pos_allowed = this.main.LoggedUserStoreInfo.pos_allowed
    if (this.pos_allowed == 1) {
      this.pos_allowed = this.main.LoggedUserStoreInfo.pos == 1 ? 1 : 0;
    }
    this.getStoreKhataSettings();
    this.getHelpDetails();
  }

  async getStoreKhataSettings() {
    var data = { store_id: this.seller_details.store_id };
    await this.manageStoreService
      .getStoreKhataSettings(data)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.formGroup.setValue({
              overdue_limit: response.data.overdue_limit,
              number: response.data.number,
              unit_name: response.data.unit_id,
            })
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => {
          // handle error
        },
        complete: () => {
        },
      });
  }

  onPreviousButton() {
    this.router.navigate([`/payment-setting`])
  }

  onNextButton() {
    if (this.general_setting.order_settings) {
      this.router.navigate([`/order-settings`])
    } else if (this.general_setting.pos_module && this.pos_allowed == '1') {
      this.router.navigate([`/possetting`])
    } else if (this.general_setting.dinein_module && this.main.LoggedUserStoreInfo.iseatery == '1') {
      this.router.navigate([`/dine-in-setting`])
    } else {
      this.router.navigate([`/storeholidays`])
    }
  }

  controlHasError(validation, controlName) {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
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
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  onSubmit() {
    if (!this.formGroup.valid) {
      return;
    }
    this.submitKhataDetails();
  }

  async submitKhataDetails() {
    var data = {
      store_id: this.seller_details.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
      overdue_limit: this.formGroup.value.overdue_limit,
      number: this.formGroup.value.number,
      unit_id: this.formGroup.value.unit_name
    };
    await this.manageStoreService
      .saveStoreKhataSettings(data)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message);
            this.skipShow = false;
          } else {
            this.toastr.error(response.message);
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

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '95'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '95'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '95'
    }
    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_details = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }
}