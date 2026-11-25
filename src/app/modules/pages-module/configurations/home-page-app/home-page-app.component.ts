import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { HomePageAppService } from 'src/app/services/configuration/home-page-app.service';
import { RearrangeCollectionComponent } from '../../model/rearrange-collection/rearrange-collection.component';
import { ConfirmPasswordComponent } from '../../model/confirm-password/confirm-password.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home-page-app',
  templateUrl: './home-page-app.component.html',
  styleUrls: ['./home-page-app.component.scss']
})
export class HomePageAppComponent implements OnInit {

  main;
  is_active: boolean = false;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  business_model = this.platform_setting.business_model;
  arr: FormArray;
  homePageAppForm: FormGroup
  home_configuration_details: any = []
  show_order: any;
  is_home_configuration: any;
  store_label: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  help_details: any;

  constructor(
    public translate: TranslateService,
    private appComponent: AppComponent,
    public formBuilder: FormBuilder,
    public homePageAppService: HomePageAppService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private _snackbarService: ToastrService,
    private _helpService: BannerService,
    private router: Router,
    private cdr: ChangeDetectorRef,


  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.platform_setting == null ? this.main.platform_setting : this.platform_setting;

    this.homePageConditions();

    this.homePageAppForm = this.formBuilder.group({
      'arr': new FormArray([])
    });
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.getData();
    this.getHelpDetails();
  }

  homePageConditions() {
    this.is_home_configuration = (this.business_model == 1 && (this.main.LoggedUserInfo.role_id == 6)) ? true : this.business_model == 2 ? true : this.business_model == 3 ? true : false;

    if (this.is_home_configuration == true) {
      if (this.general_setting) {
        this.is_home_configuration = this.main.LoggedUserInfo.role_id == 6 ? 1 : parseFloat(this.general_setting.module_config);
        this.store_label = this.general_setting.store_label;
      }
      else {
        this.is_home_configuration = this.main.LoggedUserInfo.role_id == 6 ? 1 : parseFloat(this.main.module_config);
        this.store_label = this.main.store_label;
      }
    }
  }

  get myFormArray(): FormArray {
    return this.homePageAppForm.get('arr') as FormArray;
  }

  /** Get home page app configuration setting data using service */
  getData() {
    var data = {
      environment_for: 1
    }
    this.homePageAppService.getHomeConfigurationSettings(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.home_configuration_details = response.data;

          this.home_configuration_details.forEach(item => {

            if (this.business_model == 3) {
              if (item.title == 'category' || item.title == 'popular_stores' || item.title == 'cuisines' || item.title == 'sponsored_stores' || item.title == 'nearby' || item.title == 'whole_seller_stores' || item.title == 'stores') {
                item.hide = true;
              }
            }
            if (this.general_setting.offers_module == 0) {
              if (item.title == 'offers') {
                item.hide = true;
              }
            }
            if (this.general_setting.allow_wholeseller == 0) {
              if (item.title == 'whole_seller_stores') {
                item.hide = true;
              }
            }
            if (this.general_setting.eatery_module == 0) {
              if (item.title == 'cuisines') {
                item.hide = true;
              }
            }
            if (item.title == 'shop_categories_horizontal') {
              item.hide = true;
            }
            if (!item.hide) {
              this.myFormArray.push(this.formBuilder.group({
                'created_at': item.created_at,
                'custom_title_align': item.custom_title_align,
                'description': item.description,
                'environment_for': item.environment_for,
                'is_deleted': item.is_deleted,
                'item_collection_id': item.item_collection_id,
                'show_order': item.show_order,
                'title': item.title,
                'title_label': item.title_label,
                'updated_at': item.updated_at,
                'is_active': item.is_active == 1 ? true : false,
                'is_custom_title_apply': item.is_custom_title_apply == 1 ? true : false,
                'custom_title': item.custom_title,
                'content_limit': item.content_limit == 0 ? '' : item.content_limit,
                'hide': item.hide,
                'home_configuration_settings_id': item.home_configuration_settings_id,
                'type_id': item.type_id,
                'isEditing': false
              }));
            }
          });

        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      }
    })
  }

  /** Drag and drop method */
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.homePageAppForm.get('arr')['controls'], event.previousIndex, event.currentIndex);
  }

  zeroNotValid(index) {
    if (this.homePageAppForm.controls.arr['controls'][index].value.content_limit == 0) {
      this.toastr.error(this.translate.instant('COUNT_TO_BE_GREATER_ZERO'));
      this.homePageAppForm.controls.arr['controls'][index].value.content_limit = "";
    }
  }
  /** Rearrange item by opening its RearrangeCollectionComponent modal */
  rearrangeItem() {
    const modalRef = this.modalService.open(RearrangeCollectionComponent, {
      size: "sm",
    });
    modalRef.componentInstance.collectionList = this.home_configuration_details;
    modalRef.componentInstance.forAppPortal = true;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.modelSubmit(receivedEntry)
    });
  }

  /** Open ConfirmPasswordComponent modal for confirming password */
  modelSubmit(item) {
    var homeConfig = item;
    const modalRef = this.modalService.open(ConfirmPasswordComponent, {
      size: "ml",
      // backdrop: 'static',
      // keyboard: false,
      centered: true
    });
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      if (receivedEntry) {
        this.PostData(receivedEntry, homeConfig);
      }
    });
  }

  /** Open  ConfirmPasswordComponent and bind data using formArray*/
  onSubmit() {
    var homeConfig = [];
    var pass: boolean = true;
    this.homePageAppForm.controls.arr['controls'].forEach(element => {
      if (Number(element.value.content_limit) > 20) {
        pass = false;
      }
      homeConfig.push(element.value)
    })

    if (!pass) {
      this.toastr.error(this.translate.instant('COUNT_SHOULD_BE_LESS_THAN_EQUAL_TO_20'));
      return;
    }
    const modalRef = this.modalService.open(ConfirmPasswordComponent, {
      size: "ml",
      centered: true
    });
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      if (receivedEntry) {
        this.PostData(receivedEntry, homeConfig);
      }
    });
  }
  /** Saved data by getting it's data from modal  */
  PostData(receivedEntry, homeConfig) {
    var index = 1;

    homeConfig.forEach(el => {
      el.show_order = index;
      el.is_active = el.is_active == true ? 1 : 0;
      el.is_custom_title_apply = el.is_custom_title_apply == true ? 1 : 0;
      index++;
    })

    var data = {
      home_configuration_data: homeConfig,
      password: receivedEntry.pas,
      user_id: this.main.LoggedUserInfo.user_id,
      environment_for: 1,
    }

    this.homePageAppService.manageHomeConfigurationSettings(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          receivedEntry.model.dismiss()
          location.reload()
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
    })
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
      data.module_key = '32'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '32'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '32'
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

  editMode( index: any){
    this.homePageAppForm.controls.arr['controls'][index].patchValue({ isEditing : true });    
    this.cdr.detectChanges();
  }

}
