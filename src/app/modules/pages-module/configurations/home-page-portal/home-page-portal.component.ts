import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { HomePagePortalService } from 'src/app/services/configuration/home-page-portal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfirmPasswordComponent } from '../../model/confirm-password/confirm-password.component';
import { RearrangeCollectionComponent } from '../../model/rearrange-collection/rearrange-collection.component';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home-page-portal',
  templateUrl: './home-page-portal.component.html',
  styleUrls: ['./home-page-portal.component.scss']
})
export class HomePagePortalComponent implements OnInit {

  main;
  homePagePortalForm: UntypedFormGroup;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  business_model = this.platform_setting.business_model;
  is_home_configuration: any;
  store_label: any;
  home_configuration_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  help_details: any;
  editedLabel: any;

  constructor(
    public translate: TranslateService,
    private appComponent: AppComponent,
    public formBuilder: UntypedFormBuilder,
    public homePagePortalService: HomePagePortalService,
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
    this.platform_setting == null ? this.main.platform_setting : this.platform_setting;
    this.requiredConditions();
    this.homePagePortalForm = this.formBuilder.group({
      'arr': new UntypedFormArray([])
    })
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.getData();
    this.getHelpDetails()

  }

  requiredConditions() {
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

  get myFormArray(): UntypedFormArray {
    return this.homePagePortalForm.get('arr') as UntypedFormArray;
  }
  /** Get home page portal data using service */
  getData() {
    var data = {
      environment_for: 2
    }
    this.homePagePortalService.getHomeConfigurationSettings(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.home_configuration_details = response.data;

          response.data.forEach(item => {

            item.hide = false;

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

            if (!item.hide) {
              this.myFormArray.push(this.formBuilder.group({
                'created_at': item.created_at,
                'custom_title': item.custom_title,
                'custom_title_align': item.custom_title_align,
                'description': item.description,
                'environment_for': item.environment_for,
                'is_deleted': item.is_deleted,
                'item_collection_id': item.item_collection_id,
                'show_order': item.show_order,
                'title': item.title,
                'title_label': item.title_label,
                'updated_at': item.updated_at,
                'is_custom_title_apply': item.is_custom_title_apply == 1 ? true : false,
                'is_active': item.is_active == 1 ? true : false,
                'content_limit': item.content_limit == 0 ? '' : item.content_limit,
                'hide': item.hide,
                'home_configuration_settings_id': item.home_configuration_settings_id,
                'type_id': item.type_id,
                'isEditing': false
              }));
            }
          })
        }
      }
    })
  }
  /** Drag and drop method */
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex == 0 || event.currentIndex == 0) {
      return;
    }
    moveItemInArray(this.homePagePortalForm.get('arr')['controls'], event.previousIndex, event.currentIndex);
  }

  zeroNotValid(index) {
    if (this.homePagePortalForm.controls.arr['controls'][index].value.content_limit == 0) {
      this.toastr.error(this.translate.instant('COUNT_TO_BE_GREATER_ZERO'));
      this.homePagePortalForm.controls.arr['controls'][index].value.content_limit = "";
    }
  }

  editMode(index: any) {
    this.homePagePortalForm.controls.arr['controls'][index].patchValue({ isEditing: true });
    this.cdr.detectChanges();
  }

  /** Open  RearrangeCollectionComponent modal*/
  rearrangeitem() {
    const modalRef = this.modalService.open(RearrangeCollectionComponent, {
      size: "sm",
    });
    modalRef.componentInstance.collectionList = this.home_configuration_details;
    modalRef.componentInstance.forAppPortal = false;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.modelSubmit(receivedEntry)
    });
  }

  /** Open ConfirmPasswordComponent and get data by passEntry output decorator */
  modelSubmit(item) {
    var homePortalData = item;

    const modalRef = this.modalService.open(ConfirmPasswordComponent, {
      size: "ml",
      // backdrop: 'static',
      // keyboard: false,
      centered: true
    });
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      if (receivedEntry) {
        this.PostData(receivedEntry, homePortalData);
      }
    });
  }

  /** Open ConfirmPasswordComponent modal and bind data with its form using formArray */
  onSubmit() {
    var homePortalData = [];
    var pass: boolean = true;

    this.homePagePortalForm.controls.arr['controls'].forEach(element => {
      if (Number(element.value.content_limit) > 20) {
        pass = false;
      }
      homePortalData.push(element.value)
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
        this.PostData(receivedEntry, homePortalData);
      }
    });
  }
  /** Saved home page portal data by getting dara from its modal */
  PostData(receivedEntry, homePortalData) {
    var index = 1;

    homePortalData.forEach(el => {
      el.show_order = index;
      el.is_active = el.is_active == true ? 1 : 0;
      el.is_custom_title_apply = el.is_custom_title_apply == true ? 1 : 0;
      index++;
    })

    var data = {
      home_configuration_data: homePortalData,
      password: receivedEntry.pas,
      user_id: this.main.LoggedUserInfo.user_id,
      environment_for: 2,
    }

    this.homePagePortalService.manageHomeConfigurationSettings(data).subscribe({
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
      data.module_key = '33'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '33'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '33'
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
