import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { ManageStoreService } from 'src/app/services/manage-store.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { SpinnerService } from 'src/app/services/custom/spinner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-other-settings',
  templateUrl: './other-settings.component.html',
  styleUrls: ['./other-settings.component.scss']
})
export class OtherSettingsComponent implements OnInit {
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  seller_details = JSON.parse(localStorage.getItem('loginUserStore'));
  deliveryboy_label = this.general_setting.deliveryboy_label;
  store_label = this.general_setting.store_label;
  khata_label = this.general_setting.khata_label;
  allow_khata = this.general_setting.allow_khata;
  formGroup: FormGroup;
  main: any;
  IsStoreManager = 0;
  oldmanageitem: any;
  oldmanagestore: any;
  selectedLanguage: any;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  skipShow: boolean = true;
  pos_allowed: any;

  constructor(
    public translate: TranslateService,
    public manageStoreService: ManageStoreService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private formBuilder: FormBuilder,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private router: Router,
    private usersService: UsersService,
    private spinner: SpinnerService,
  ) {
    translate.addLangs(["it", "en", "de"]);
    translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserStoreInfo = JSON.parse(
      session.getSessionLoginUserStore()
    );
    if (this.main.LoggedUserStoreInfo.role_id == this.main.UserRole.StoreManager) {
      this.IsStoreManager = 1;
    }
    this.formGroup = this.formBuilder.group({
      manage_item: new FormControl(0),
      manage_store: new FormControl(0),
      allow_khata: new FormControl(0),
      allow_discount: new FormControl(0),
      allow_overdue_limit: new FormControl(0),
      allow_overdue_time: new FormControl(0),
    });
    this.pos_allowed = this.main.LoggedUserStoreInfo.pos_allowed
    if (this.pos_allowed == 1) {
      this.pos_allowed = this.main.LoggedUserStoreInfo.pos == 1 ? 1 : 0;
    }
    this.getStoreSettings();
    this.getHelpDetails();
  }

  onPreviousButton() {
      this.router.navigate([`/storeholidays`])
  }

  async getStoreSettings() {
    var data = { store_id: this.seller_details.store_id };
    await this.manageStoreService
      .getStoreSettings(data)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.formGroup.setValue({
              allow_khata: response.data.allow_khata == 1 ? 1 : 0,
              allow_overdue_limit: response.data.allow_overdue_limit == 1 ? 1 : 0,
              manage_item: response.data.manage_item == 1 ? 1 : 0,
              manage_store: response.data.manage_store == 1 ? 1 : 0,
              allow_discount: response.data.allow_discount == 1 ? 1 : 0,
              allow_overdue_time: response.data.allow_overdue_time == 1 ? 1 : 0,
            })
            this.oldmanageitem = this.formGroup.value.manage_item;
            this.oldmanagestore = this.formGroup.value.manage_store;
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => { },
        complete: () => { },
      });
  }

  skipNextButton() {
    this.router.navigate([`/items/seller-items-import`]);
  }

  UpdateFirstTimeLoginConfirm(user: any) {
    var fd = new FormData();
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("store_id", user.store_id);
    fd.append("contact_number", user.phone);
    fd.append("manager", user.manager);
    fd.append("store_name", user.store_name);
    fd.append("store_description", user.store_description);
    fd.append("store_address", user.store_address1);
    fd.append("store_address2", user.store_address2);
    fd.append("category_id", user.category_id);
    fd.append("is_confirm", "1");
    fd.append("country_id", user.country_id);
    fd.append("state_id", user.state_id);
    fd.append("city_id", user.city_id);
    fd.append("area_id", user.area_id);
    fd.append("zipcode", user.zipcode);
    var data = fd;
    this.usersService.updateFirstTimeLoginConfirm(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          localStorage.setItem(
            "subscriptionDetails",
            JSON.stringify(response.data)
          );
          localStorage.setItem("user_role_confirm", '1');
          localStorage.removeItem('setup_steps');
          this.seller_details.user_role_confirm = '1';
          localStorage.setItem('loginUserStore', this.seller_details);
          var session = this.appComponent.sessionConfig();
          user.user_role_confirm = 1
          session.setSessionLoginUserStore(user == undefined ? "" : user);
          this.router.navigate([`/dashboard`])
            .then(() => {
              window.location.reload();
            });
        } else {
        }
      },
      error: (error) => {
        // handle error
        //
      },
      complete: () => {
        ;
        //
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
      data.module_key = '104'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '104'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '104'
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

  
  onSubmit() {
    if (!this.formGroup.valid) {
      return;
    }
    this.submitStoreSettings();
  }

  async submitStoreSettings() {
    this.spinner.show()
    var data = {
      store_id: this.seller_details.store_id,
      language_code: "en",
      allow_khata: this.formGroup.value.allow_khata == 1 ? 1 : 0,
      allow_discount: this.formGroup.value.allow_discount == 1 ? 1 : 0,
      allow_overdue_limit: this.formGroup.value.allow_overdue_limit == 1 ? 1 : 0,
      allow_overdue_time: this.formGroup.value.allow_overdue_time == 1 ? 1 : 0,
      manage_item: this.formGroup.value.manage_item == 1 ? 1 : 0,
      manage_store: this.formGroup.value.manage_store == 1 ? 1 : 0
    };

    await this.manageStoreService
      .saveStoreSettings(data)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide()
          if (response.status == 1) {
            this.toastr.success(response.message);

            if (this.formGroup.value.manage_item != this.oldmanageitem ||
              this.formGroup.value.otherdetails?.manage_store != this.oldmanagestore) {
            }
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => { this.spinner.hide() },

        complete: () => { },
      });
  }
}