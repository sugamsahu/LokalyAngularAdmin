import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { SpinnerService } from 'src/app/services/custom/spinner.service';
import { CommonService } from 'src/app/services/common.service';
import { PlatformConfigurationsServiceService } from 'src/app/services/configuration/platform-configurations-service.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmPasswordComponent } from '../../model/confirm-password/confirm-password.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-platform-configuration',
  templateUrl: './platform-configuration.component.html',
  styleUrls: ['./platform-configuration.component.scss']
})
export class PlatformConfigurationComponent implements OnInit {

  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  store_label = this.general_setting.store_label;
  user_data = JSON.parse(localStorage.getItem('loginUser'));
  main: any = { LoggedUserInfo: {} };
  formGroup: FormGroup;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  platformData: any = [];
  subscriptionData: any = [];
  storeData: any = [];
  itemData: any = [];
  cusBuyData: any = [];
  deliveryData: any = [];
  deliveryModelData: any = [];
  offerSettingData: any = [];
  orderData: any = [];
  platformConfiguration: any;
  platformConfigurationDetails: any;

  constructor(
    private appComponent: AppComponent,
    public translate: TranslateService,
    private spinner: SpinnerService,
    private platformConfigService: PlatformConfigurationsServiceService,
    public commonService: CommonService,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private modalService: NgbModal,
    private _helpService: BannerService,
    private router: Router,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    this.getPlatformDetails();
    this.getHelpDetails();
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      business_model: new FormControl(''),
      subscription_model: new FormControl(''),
      store_display_model: new FormControl(''),
      item_display: new FormControl(''),
      customer_buying: new FormControl(''),
      delivery_business: new FormControl(''),
      delivery_model: new FormControl(''),
      offer_settings: new FormControl(''),
      order_settings: new FormControl(''),
    });
  }

  /** Get all platform configuration details using service */
  async getPlatformDetails() {
    await this.platformConfigService.getAllPlatformSettings().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.platformConfigurationDetails = response.data;
          this.platformData = this.platformConfigurationDetails.business_model
          this.subscriptionData = this.platformConfigurationDetails.subscription_model
          this.storeData = this.platformConfigurationDetails.store_display_model
          this.itemData = this.platformConfigurationDetails.item_display
          this.cusBuyData = this.platformConfigurationDetails.customer_buying
          this.deliveryData = this.platformConfigurationDetails.delivery_business
          this.deliveryModelData = this.platformConfigurationDetails.delivery_model
          this.offerSettingData = this.platformConfigurationDetails.offer_settings
          this.orderData = this.platformConfigurationDetails.order_settings
          this.getplatformConfiguration()
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }

  getplatformConfiguration() {
    this.commonService.getPlatformSettings().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.platformConfiguration = response.data;
          var temp_business_model: any = [];
          var temp_subscription_model: any = [];
          var temp_store_display_model: any = [];
          var temp_item_display: any = [];
          var temp_customer_buying: any = [];
          var temp_delivery_business: any = [];
          var temp_delivery_model: any = [];
          var temp_offer_settings: any = [];
          var temp_order_settings: any = [];
          this.platformConfigurationDetails.business_model.forEach(item => {
            if (item.id == this.platformConfiguration.business_model) {
              temp_business_model.push(item);
            }
          })
          this.formGroup.controls['business_model'].setValue(temp_business_model[0]);

          this.platformConfigurationDetails.subscription_model.forEach(item => {
            if (item.id == this.platformConfiguration.subscription_model) {
              temp_subscription_model.push(item);
            }
          })
          this.formGroup.controls['subscription_model'].setValue(temp_subscription_model[0]);

          this.platformConfigurationDetails.store_display_model.forEach(item => {
            if (item.id == this.platformConfiguration.store_display_model) {
              temp_store_display_model.push(item);
            }
          })
          this.formGroup.controls['store_display_model'].setValue(temp_store_display_model[0]);

          this.platformConfigurationDetails.item_display.forEach(item => {
            if (item.id == this.platformConfiguration.item_display) {
              temp_item_display.push(item);
            }
          })
          this.formGroup.controls['item_display'].setValue(temp_item_display[0]);
          this.platformConfigurationDetails.customer_buying.forEach(item => {
            if (item.id == this.platformConfiguration.customer_buying) {
              temp_customer_buying.push(item);
            }
          })
          this.formGroup.controls['customer_buying'].setValue(temp_customer_buying[0]);
          this.platformConfigurationDetails.delivery_business.forEach(item => {
            if (item.id == this.platformConfiguration.delivery_business) {
              temp_delivery_business.push(item);
            }
          })
          this.formGroup.controls['delivery_business'].setValue(temp_delivery_business[0]);
          this.platformConfigurationDetails.delivery_model.forEach(item => {
            if (item.id == this.platformConfiguration.delivery_model) {
              temp_delivery_model.push(item);
            }
          })
          this.formGroup.controls['delivery_model'].setValue(temp_delivery_model[0]);
          this.platformConfigurationDetails.offer_settings.forEach(item => {
            if (item.id == this.platformConfiguration.offer_settings) {
              temp_offer_settings.push(item);
            }
          })
          this.formGroup.controls['offer_settings'].setValue(temp_offer_settings[0]);
          this.platformConfigurationDetails.order_settings.forEach(item => {
            if (item.id == this.platformConfiguration.order_settings) {
              temp_order_settings.push(item);
            }
          })
          this.formGroup.controls['order_settings'].setValue(temp_order_settings[0]);
        }
      },
      error: (error) => {
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  getSelectedbusiness_model(item) {
    this.formGroup.controls['business_model'].setValue(item)
  }
  getSelectedsubscription_model(item) {
    this.formGroup.controls['subscription_model'].setValue(item)
  }
  getSelectedstore_display_model(item) {
    this.formGroup.controls['store_display_model'].setValue(item)
  }
  getSelecteditem_display(item) {
    this.formGroup.controls['item_display'].setValue(item)
  }
  getSelectedcustomer_buying(item) {
    this.formGroup.controls['customer_buying'].setValue(item)
  }
  getSelecteddelivery_business(item) {
    this.formGroup.controls['delivery_business'].setValue(item)
  }
  getSelecteddelivery_model(item) {
    this.formGroup.controls['delivery_model'].setValue(item)
  }
  getSelectedoffer_settings(item) {
    this.formGroup.controls['offer_settings'].setValue(item)
  }
  getSelectedorder_settings(item) {
    this.formGroup.controls['order_settings'].setValue(item)
  }

  confirmLoginPassword() {
    const modalRef = this.modalService.open(ConfirmPasswordComponent, {
      size: "ml",
    });
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.confirmPassword(receivedEntry);
    });
  }

  confirmPassword(item) {
    var data = {
      business_model: this.formGroup.value.business_model.id,
      customer_buying: this.formGroup.value.customer_buying.id,
      delivery_business: this.formGroup.value.delivery_business.id,
      delivery_model: this.formGroup.value.delivery_model.id,
      item_display: this.formGroup.value.item_display.id,
      offer_settings: this.formGroup.value.offer_settings.id,
      order_settings: this.formGroup.value.order_settings.id,
      store_display_model: this.formGroup.value.store_display_model.id,
      subscription_model: this.formGroup.value.subscription_model.id,
      password: item.pas,
      user_id: this.user_data.user_id
    }
    this.platformConfigService.managePlatformSettings(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message)
          item.model.dismiss();
          item.model.dismiss()
          this.getPlatformDetails();
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

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '30'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '30'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '30'
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