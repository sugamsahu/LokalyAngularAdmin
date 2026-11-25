import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { CommonConfigurationService } from 'src/app/services/configuration/common-configuration.service';
import { AppComponent } from 'src/app/app.component';
import { CommonService } from 'src/app/services/common.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-block-management',
  templateUrl: './block-management.component.html',
  styleUrls: ['./block-management.component.scss']
})
export class BlockManagementComponent implements OnInit {
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  business_model = this.platform_setting.business_model;
  main: any = { LoggedUserInfo: {} };
  itemBlockForm: FormGroup;
  itemBlockFormStore: FormGroup;
  storeBlockForm: FormGroup;
  cuisinesBlockForm: FormGroup;
  offerBlockForm: FormGroup;
  bannerBlockForm: FormGroup;
  storeTypeBlock: FormGroup;
  categoriesBlockForm: FormGroup;
  pastOrderBlockForm: FormGroup;
  itemCollectionBlockForm: FormGroup;
  itemTagBlockForm: FormGroup
  loginUserId: any;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  minItemNum = 3;
  minItemNumStore = 3;
  maxItemNum = 10;
  maxItemNumStore = 6;
  minBorder = 0;
  maxBorder = 5;
  maxMargin = 100;
  maxRounding = 20;
  maxShadow = 100;
  maxPadding = 50;
  blockList: any = [];
  minOffer = 1;
  minimum_offer = 3;
  maxOffer = 4;
  maxPaddingStore = 60;
  isPendingItem: boolean = false;
  isPendingItemStore: boolean = false;
  isPendingStore: boolean = false;
  isPendingCuisines: boolean = false;
  isPendingOffer: boolean = false;
  isPendingBanner: boolean = false;
  isPendingStoreType: boolean = false;
  isPendingCategories: boolean = false;
  isPendingPastOrder: boolean = false;
  isPendingCollection: boolean = false;
  isPendingTag: boolean = false;

  constructor(
    public formbuilder: FormBuilder,
    public translate: TranslateService,
    private modalService: NgbModal,
    private _helpService: BannerService,
    private commonConfigurationServices: CommonConfigurationService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    public commonService: CommonService,
    private router: Router,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.platform_setting =
      this.platform_setting == null
        ? this.main.platform_setting
        : this.platform_setting;
    this.business_model = this.platform_setting.business_model;
    this.loginUserId = this.main.LoggedUserInfo.user_id;
    this.general_setting =
      this.general_setting == null ? this.main : this.general_setting;
    this.loadform();
    this.listOfBlockConfig();
    this.getHelpDetails();
  }

  loadform() {
    // Item Block 1st Accordian
    this.itemBlockForm = this.formbuilder.group({
      number_display1: new FormControl(null, [Validators.required, Validators.min(this.minItemNum), Validators.max(this.maxItemNum)]),
      borderWeight1: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxItemNum)]),
      margin1: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      rounding1: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      itemSquare1: new FormControl(null),
      shadow1: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      shadowItem: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      slide1: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxBorder)]),
    })
    // Store Block 2nd Accordian
    this.storeBlockForm = this.formbuilder.group({
      number_display2: new FormControl(null, [Validators.required, Validators.min(this.minItemNum), Validators.max(this.maxItemNum)]),
      slide2: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxBorder)]),
      borderWeight2: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxItemNum)]),
      margin2: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      rounding2: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      imageRounding2: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      itemSquare2: new FormControl(null),
      shadow2: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      shadowStore: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),

    })
    // Cuisines Block 3rd Accordian
    this.cuisinesBlockForm = this.formbuilder.group({
      number_display3: new FormControl(null, [Validators.required, Validators.min(this.minItemNum), Validators.max(this.maxItemNum)]),
      slide3: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxBorder)]),
      borderWeight3: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxItemNum)]),
      margin3: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      rounding3: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      imageRounding3: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      itemSquare3: new FormControl(null),
      shadow3: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      shadowCuisines: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
    })
    // Offer Block 4th Accordian
    this.offerBlockForm = this.formbuilder.group({
      number_display4: new FormControl(null, [Validators.required, Validators.min(this.minimum_offer), Validators.max(this.maxOffer)]),
      slide4: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxBorder)]),
      borderWeight4: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxItemNum)]),
      margin4: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      rounding4: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      imageRounding4: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxPadding)]),
      itemSquare4: new FormControl(null),
      shadow4: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      shadowOffer: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
    })
    // Banner Block 5th Accordian
    this.bannerBlockForm = this.formbuilder.group({
      borderWeight5: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxItemNum)]),
      rounding5: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxPadding)]),
      shadow5: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      shadowBanner: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      rowsNumber: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(10)]),
      columnsNumber: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(3)]),
      bannerMargin: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(this.maxRounding)])
    })
    this.bannerBlockForm.get("columnsNumber").valueChanges.subscribe((column) => {
      if (column == 1) {
        this.bannerBlockForm.controls['bannerMargin'].clearValidators();
        this.bannerBlockForm.controls['bannerMargin'].updateValueAndValidity();
        this.bannerBlockForm.controls['bannerMargin'].setValue(0);
        this.bannerBlockForm.controls['bannerMargin'].disable();
      } else {
        this.bannerBlockForm.controls["bannerMargin"].setValidators([Validators.required, Validators.min(1), Validators.max(this.maxRounding)]);
        this.bannerBlockForm.controls['bannerMargin'].updateValueAndValidity();
        this.bannerBlockForm.controls['bannerMargin'].setValue(1);
        this.bannerBlockForm.controls['bannerMargin'].enable();
      }
    });
    // Store Type Block 6th Accordian
    this.storeTypeBlock = this.formbuilder.group({
      number_display6: new FormControl(null, [Validators.required, Validators.min(this.minItemNum), Validators.max(this.maxItemNum)]),
      slide6: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxBorder)]),
      borderWeight6: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxItemNum)]),
      margin6: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      rounding6: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      imageRounding6: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      imagePadding6: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxPaddingStore)]),
      imagePaddingStoreType: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxPaddingStore)]),
      itemSquare6: new FormControl(null),
      shadow6: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      shadowStoreType: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
    })
    // Categories Block 7th Accordian
    this.categoriesBlockForm = this.formbuilder.group({
      number_display7: new FormControl(null, [Validators.required, Validators.min(this.minItemNum), Validators.max(this.maxItemNum)]),
      slide7: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxBorder)]),
      borderWeight7: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxItemNum)]),
      margin7: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      rounding7: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      imageRounding7: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      imagePadding7: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxPaddingStore)]),
      imagePaddingCategories: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxPaddingStore)]),
      itemSquare7: new FormControl(null),
      shadow7: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      shadowCategories: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
    })
    // Past Order Block 8th Accordian
    this.pastOrderBlockForm = this.formbuilder.group({
      borderWeight8: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxItemNum)]),
      margin8: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      rounding8: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      imageRounding8: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      imagePadding8: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxPadding)]),
      itemSquare8: new FormControl(null),
      shadow8: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      shadowPastOrder: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
    })
    // Item Collection 9th Accordian
    this.itemCollectionBlockForm = this.formbuilder.group({
      number_display9: new FormControl(null, [Validators.required, Validators.min(this.minItemNum), Validators.max(this.maxItemNum)]),
      slide9: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxBorder)]),
      borderWeight9: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxItemNum)]),
      margin9: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      rounding9: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      imageRounding9: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      itemSquare9: new FormControl(null),
      shadow9: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      shadowItemCollection: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
    })
    // Tag 10th Accordian
    this.itemTagBlockForm = this.formbuilder.group({
      number_display10: new FormControl(null, [Validators.required, Validators.min(this.minItemNum), Validators.max(this.maxItemNum)]),
      slide10: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxBorder)]),
      borderWeight10: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxItemNum)]),
      margin10: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      rounding10: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      imageRounding10: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      itemSquare10: new FormControl(null),
      shadow10: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      shadowTag: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
    })

    this.itemBlockFormStore = this.formbuilder.group({
      number_display1: new FormControl(null, [Validators.required, Validators.min(this.minItemNumStore), Validators.max(this.maxItemNumStore)]),
      borderWeight1: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxItemNum)]),
      margin1: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      rounding1: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxRounding)]),
      itemSquare1: new FormControl(null),
      shadow1: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
      shadowItem: new FormControl(null, [Validators.required, Validators.min(this.minBorder), Validators.max(this.maxShadow)]),
    })
  }

  omitSpecialChar(event) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
  }


  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '140'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '140'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '140'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  controlHasError(formName, validation, controlName): boolean {
    if (formName == 'itemBlockForm') {
      const control = this.itemBlockForm.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    } else if (formName == 'storeBlockForm') {
      const control = this.storeBlockForm.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    } else if (formName == 'cuisinesBlockForm') {
      const control = this.cuisinesBlockForm.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    } else if (formName == 'offerBlockForm') {
      const control = this.offerBlockForm.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    } else if (formName == 'bannerBlockForm') {
      const control = this.bannerBlockForm.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    } else if (formName == 'storeTypeBlock') {
      const control = this.storeTypeBlock.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    } else if (formName == 'categoriesBlockForm') {
      const control = this.categoriesBlockForm.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    } else if (formName == 'pastOrderBlockForm') {
      const control = this.pastOrderBlockForm.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    } else if (formName == 'itemCollectionBlockForm') {
      const control = this.itemCollectionBlockForm.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    } else if (formName == 'itemTagBlockForm') {
      const control = this.itemTagBlockForm.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    } else if (formName == 'itemBlockFormStore') {
      const control = this.itemBlockFormStore.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    }

  }

  listOfBlockConfig() {
    const data: any = {
    };
    this.commonConfigurationServices.blockConfiguration(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.blockList = response.data;
          this.loadBlockListData();
        }
      },
      error: (error) => {

      },
      complete: () => { },
    });
  }

  loadBlockListData() {
    //Item Block
    this.itemBlockForm.controls['number_display1'].setValue(this.blockList[0].number_of_items);
    this.itemBlockForm.controls['borderWeight1'].setValue(this.blockList[0].border_weight);
    this.itemBlockForm.controls['margin1'].setValue(this.blockList[0].margin);
    this.itemBlockForm.controls['rounding1'].setValue(this.blockList[0].rounding);
    this.itemBlockForm.controls['itemSquare1'].setValue(this.blockList[0].item_square);
    var item = this.blockList[0].shadow.split(" ");
    this.itemBlockForm.controls['shadow1'].setValue(item[0]);
    this.itemBlockForm.controls['shadowItem'].setValue(item[1]);
    this.itemBlockForm.controls['slide1'].setValue(this.blockList[0].slide_by);

    //storehomepage
    this.itemBlockFormStore.controls['number_display1'].setValue(this.blockList[10].number_of_items);
    this.itemBlockFormStore.controls['borderWeight1'].setValue(this.blockList[10].border_weight);
    this.itemBlockFormStore.controls['margin1'].setValue(this.blockList[10].margin);
    this.itemBlockFormStore.controls['rounding1'].setValue(this.blockList[10].rounding);
    this.itemBlockFormStore.controls['itemSquare1'].setValue(this.blockList[10].item_square);
    var item1 = this.blockList[10].shadow.split(" ");
    this.itemBlockFormStore.controls['shadow1'].setValue(item1[0]);
    this.itemBlockFormStore.controls['shadowItem'].setValue(item1[1]);

    //Store Block
    this.storeBlockForm.controls['number_display2'].setValue(this.blockList[1].number_of_items);
    this.storeBlockForm.controls['borderWeight2'].setValue(this.blockList[1].border_weight);
    this.storeBlockForm.controls['margin2'].setValue(this.blockList[1].margin);
    this.storeBlockForm.controls['rounding2'].setValue(this.blockList[1].rounding);
    this.storeBlockForm.controls['itemSquare2'].setValue(this.blockList[1].item_square);
    var store = this.blockList[1].shadow.split(" ");
    this.storeBlockForm.controls['shadow2'].setValue(store[0]);
    this.storeBlockForm.controls['shadowStore'].setValue(store[1]);
    this.storeBlockForm.controls['slide2'].setValue(this.blockList[1].slide_by);
    this.storeBlockForm.controls['imageRounding2'].setValue(this.blockList[1].image_rounding);

    //Cuisines Block
    this.cuisinesBlockForm.controls['number_display3'].setValue(this.blockList[2].number_of_items);
    this.cuisinesBlockForm.controls['borderWeight3'].setValue(this.blockList[2].border_weight);
    this.cuisinesBlockForm.controls['margin3'].setValue(this.blockList[2].margin);
    this.cuisinesBlockForm.controls['rounding3'].setValue(this.blockList[2].rounding);
    this.cuisinesBlockForm.controls['itemSquare3'].setValue(this.blockList[2].item_square);
    var cuisines = this.blockList[2].shadow.split(" ");
    this.cuisinesBlockForm.controls['shadow3'].setValue(cuisines[0]);
    this.cuisinesBlockForm.controls['shadowCuisines'].setValue(cuisines[1]);
    this.cuisinesBlockForm.controls['slide3'].setValue(this.blockList[2].slide_by);
    this.cuisinesBlockForm.controls['imageRounding3'].setValue(this.blockList[2].image_rounding);

    //Offer Block
    this.offerBlockForm.controls['number_display4'].setValue(this.blockList[3].number_of_items);
    this.offerBlockForm.controls['borderWeight4'].setValue(this.blockList[3].border_weight);
    this.offerBlockForm.controls['margin4'].setValue(this.blockList[3].margin);
    this.offerBlockForm.controls['rounding4'].setValue(this.blockList[3].rounding);
    var offer = this.blockList[3].shadow.split(" ");
    this.offerBlockForm.controls['shadow4'].setValue(offer[0]);
    this.offerBlockForm.controls['shadowOffer'].setValue(offer[0]);
    this.offerBlockForm.controls['slide4'].setValue(this.blockList[3].slide_by);
    this.offerBlockForm.controls['imageRounding4'].setValue(this.blockList[3].image_rounding);

    //Banner Block
    this.bannerBlockForm.controls['borderWeight5'].setValue(this.blockList[4].border_weight);
    this.bannerBlockForm.controls['rounding5'].setValue(this.blockList[4].rounding);
    var banner = this.blockList[4].shadow.split(" ");
    this.bannerBlockForm.controls['shadow5'].setValue(banner[0]);
    this.bannerBlockForm.controls['shadowBanner'].setValue(banner[1]);
    this.bannerBlockForm.controls['rowsNumber'].setValue(this.blockList[4].no_of_rows);
    this.bannerBlockForm.controls['columnsNumber'].setValue(this.blockList[4].no_of_columns);
    this.bannerBlockForm.controls['bannerMargin'].setValue(this.blockList[4].margin);

    //Store Type Block
    this.storeTypeBlock.controls['number_display6'].setValue(this.blockList[5].number_of_items);
    this.storeTypeBlock.controls['borderWeight6'].setValue(this.blockList[5].border_weight);
    this.storeTypeBlock.controls['margin6'].setValue(this.blockList[5].margin);
    this.storeTypeBlock.controls['rounding6'].setValue(this.blockList[5].rounding);
    this.storeTypeBlock.controls['itemSquare6'].setValue(this.blockList[5].item_square);
    var storeType = this.blockList[5].shadow.split(" ");
    this.storeTypeBlock.controls['shadow6'].setValue(storeType[0]);
    this.storeTypeBlock.controls['shadowStoreType'].setValue(storeType[1]);
    this.storeTypeBlock.controls['slide6'].setValue(this.blockList[5].slide_by);
    this.storeTypeBlock.controls['imageRounding6'].setValue(this.blockList[5].image_rounding);
    var imagePaddingStoreType = this.blockList[5].image_padding.split(" ");
    this.storeTypeBlock.controls['imagePadding6'].setValue(imagePaddingStoreType[0]);
    this.storeTypeBlock.controls['imagePaddingStoreType'].setValue(imagePaddingStoreType[1]);

    //Categories Block
    this.categoriesBlockForm.controls['number_display7'].setValue(this.blockList[6].number_of_items);
    this.categoriesBlockForm.controls['borderWeight7'].setValue(this.blockList[6].border_weight);
    this.categoriesBlockForm.controls['margin7'].setValue(this.blockList[6].margin);
    this.categoriesBlockForm.controls['rounding7'].setValue(this.blockList[6].rounding);
    this.categoriesBlockForm.controls['itemSquare7'].setValue(this.blockList[6].item_square);
    var category = this.blockList[6].shadow.split(" ");
    this.categoriesBlockForm.controls['shadow7'].setValue(category[0]);
    this.categoriesBlockForm.controls['shadowCategories'].setValue(category[1]);
    this.categoriesBlockForm.controls['slide7'].setValue(this.blockList[6].slide_by);
    this.categoriesBlockForm.controls['imageRounding7'].setValue(this.blockList[6].image_rounding);
    var imagePaddingCategories = this.blockList[6].image_padding.split(" ");
    this.categoriesBlockForm.controls['imagePadding7'].setValue(imagePaddingCategories[0]);
    this.categoriesBlockForm.controls['imagePaddingCategories'].setValue(imagePaddingCategories[1]);

    //Past Order Block
    this.pastOrderBlockForm.controls['borderWeight8'].setValue(this.blockList[7].border_weight);
    this.pastOrderBlockForm.controls['margin8'].setValue(this.blockList[7].margin);
    this.pastOrderBlockForm.controls['rounding8'].setValue(this.blockList[7].rounding);
    this.pastOrderBlockForm.controls['itemSquare8'].setValue(this.blockList[7].item_square);
    var pastOrder = this.blockList[7].shadow.split(" ");
    this.pastOrderBlockForm.controls['shadow8'].setValue(pastOrder[0]);
    this.pastOrderBlockForm.controls['shadowPastOrder'].setValue(pastOrder[1]);
    this.pastOrderBlockForm.controls['imageRounding8'].setValue(this.blockList[7].image_rounding);
    this.pastOrderBlockForm.controls['imagePadding8'].setValue(this.blockList[7].image_padding);

    //Item Collection Block
    this.itemCollectionBlockForm.controls['number_display9'].setValue(this.blockList[8].number_of_items);
    this.itemCollectionBlockForm.controls['borderWeight9'].setValue(this.blockList[8].border_weight);
    this.itemCollectionBlockForm.controls['margin9'].setValue(this.blockList[8].margin);
    this.itemCollectionBlockForm.controls['rounding9'].setValue(this.blockList[8].rounding);
    this.itemCollectionBlockForm.controls['itemSquare9'].setValue(this.blockList[8].item_square);
    var itemCollection = this.blockList[8].shadow.split(" ");
    this.itemCollectionBlockForm.controls['shadow9'].setValue(itemCollection[0]);
    this.itemCollectionBlockForm.controls['shadowItemCollection'].setValue(itemCollection[1]);
    this.itemCollectionBlockForm.controls['slide9'].setValue(this.blockList[8].slide_by);
    this.itemCollectionBlockForm.controls['imageRounding9'].setValue(this.blockList[8].image_rounding);

    //Tag Block
    this.itemTagBlockForm.controls['number_display10'].setValue(this.blockList[9].number_of_items);
    this.itemTagBlockForm.controls['borderWeight10'].setValue(this.blockList[9].border_weight);
    this.itemTagBlockForm.controls['margin10'].setValue(this.blockList[9].margin);
    this.itemTagBlockForm.controls['rounding10'].setValue(this.blockList[9].rounding);
    this.itemTagBlockForm.controls['itemSquare10'].setValue(this.blockList[9].item_square);
    var itemCollection = this.blockList[9].shadow.split(" ");
    this.itemTagBlockForm.controls['shadow10'].setValue(itemCollection[0]);
    this.itemTagBlockForm.controls['shadowTag'].setValue(itemCollection[1]);
    this.itemTagBlockForm.controls['slide10'].setValue(this.blockList[9].slide_by);
    this.itemTagBlockForm.controls['imageRounding10'].setValue(this.blockList[9].image_rounding);
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.storeBlockForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    return invalid;
  }

  submitItemBlock() {
    this.isPendingItem = false;
    if (!this.itemBlockForm.valid) {

    } else {
      var fd = new FormData();
      fd.append("block_id", "1")
      fd.append("number_of_items", this.itemBlockForm.value.number_display1);
      fd.append("border_weight", this.itemBlockForm.value.borderWeight1);
      fd.append("margin", this.itemBlockForm.value.margin1);
      fd.append("rounding", this.itemBlockForm.value.rounding1);
      fd.append("item_square", this.itemBlockForm.value.itemSquare1 ? '1' : '0');
      fd.append("shadow", this.itemBlockForm.value.shadow1 + " " + this.itemBlockForm.value.shadowItem);
      fd.append("slide_by", this.itemBlockForm.value.slide1);
      this.commonConfigurationServices.manageBlockConfiguration(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message)
            this.listOfBlockConfig();
          } else {
            this.toastr.error(response.message)
          }
        },
        error: (error) => {

        },
        complete: () => { },
      });
    }


  }

  submitItemBlockStore() {
    this.isPendingItemStore = false;
    if (!this.itemBlockFormStore.valid) {

    } else {
      var fd = new FormData();
      fd.append("block_id", "11")
      fd.append("number_of_items", this.itemBlockFormStore.value.number_display1);
      fd.append("border_weight", this.itemBlockFormStore.value.borderWeight1);
      fd.append("margin", this.itemBlockFormStore.value.margin1);
      fd.append("rounding", this.itemBlockFormStore.value.rounding1);
      fd.append("item_square", this.itemBlockFormStore.value.itemSquare1 ? '1' : '0');
      fd.append("shadow", this.itemBlockFormStore.value.shadow1 + " " + this.itemBlockFormStore.value.shadowItem);
      this.commonConfigurationServices.manageBlockConfiguration(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message)
            this.listOfBlockConfig();
          } else {
            this.toastr.error(response.message)
          }
        },
        error: (error) => {

        },
        complete: () => { },
      });
    }


  }

  resetItemBlock() {
    this.isPendingItem = true;
    this.itemBlockForm.controls['number_display1'].setValue(5);
    this.itemBlockForm.controls['borderWeight1'].setValue(1);
    this.itemBlockForm.controls['margin1'].setValue(8);
    this.itemBlockForm.controls['rounding1'].setValue(10);
    this.itemBlockForm.controls['itemSquare1'].setValue(1);
    this.itemBlockForm.controls['shadow1'].setValue("0");
    this.itemBlockForm.controls['shadowItem'].setValue("0");
    this.itemBlockForm.controls['slide1'].setValue(1);
  }

  resetItemBlockStore() {
    this.isPendingItemStore = true;
    this.itemBlockFormStore.controls['number_display1'].setValue(4);
    this.itemBlockFormStore.controls['borderWeight1'].setValue(1);
    this.itemBlockFormStore.controls['margin1'].setValue(8);
    this.itemBlockFormStore.controls['rounding1'].setValue(10);
    this.itemBlockFormStore.controls['itemSquare1'].setValue(1);
    this.itemBlockFormStore.controls['shadow1'].setValue("0");
    this.itemBlockFormStore.controls['shadowItem'].setValue("0");
  }

  submitStoreBlock() {
    this.findInvalidControls();
    this.isPendingStore = false;
    if (!this.storeBlockForm.valid) {

    } else {
      var fd = new FormData();
      fd.append("block_id", "2")
      fd.append("number_of_items", this.storeBlockForm.value.number_display2);
      fd.append("border_weight", this.storeBlockForm.value.borderWeight2);
      fd.append("margin", this.storeBlockForm.value.margin2);
      fd.append("rounding", this.storeBlockForm.value.rounding2);
      fd.append("image_rounding", this.storeBlockForm.value.imageRounding2);
      fd.append("item_square", this.storeBlockForm.value.itemSquare2);
      fd.append("shadow", this.storeBlockForm.value.shadow2 + " " + this.storeBlockForm.value.shadowStore);
      fd.append("slide_by", this.storeBlockForm.value.slide2);
      this.commonConfigurationServices.manageBlockConfiguration(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message)
            this.listOfBlockConfig();
          } else {
            this.toastr.error(response.message)
          }
        },
        error: (error) => {

        },
        complete: () => { },
      });
    }


  }

  resetStoreBlock() {
    this.isPendingStore = true;
    this.storeBlockForm.controls['number_display2'].setValue(5);
    this.storeBlockForm.controls['borderWeight2'].setValue(0);
    this.storeBlockForm.controls['margin2'].setValue(8);
    this.storeBlockForm.controls['rounding2'].setValue(10);
    this.storeBlockForm.controls['itemSquare2'].setValue(1);
    this.storeBlockForm.controls['shadow2'].setValue("0");
    this.storeBlockForm.controls['shadowStore'].setValue("0");
    this.storeBlockForm.controls['slide2'].setValue(1);
    this.storeBlockForm.controls['imageRounding2'].setValue(10);
  }

  submitCuisinesBlock() {
    this.isPendingCuisines = false;
    if (!this.cuisinesBlockForm.valid) {

    } else {
      var fd = new FormData();
      fd.append("block_id", "3")
      fd.append("number_of_items", this.cuisinesBlockForm.value.number_display3);
      fd.append("border_weight", this.cuisinesBlockForm.value.borderWeight3);
      fd.append("margin", this.cuisinesBlockForm.value.margin3);
      fd.append("rounding", this.cuisinesBlockForm.value.rounding3);
      fd.append("image_rounding", this.cuisinesBlockForm.value.imageRounding3);
      fd.append("item_square", this.cuisinesBlockForm.value.itemSquare3);
      fd.append("shadow", this.cuisinesBlockForm.value.shadow3 + " " + this.cuisinesBlockForm.value.shadowCuisines);
      fd.append("slide_by", this.cuisinesBlockForm.value.slide3);
      this.commonConfigurationServices.manageBlockConfiguration(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message)
            this.listOfBlockConfig();
          } else {
            this.toastr.error(response.message)
          }
        },
        error: (error) => {

        },
        complete: () => { },
      });
    }


  }

  resetCuisinesBlock() {
    this.isPendingCuisines = true;
    this.cuisinesBlockForm.controls['number_display3'].setValue(5);
    this.cuisinesBlockForm.controls['borderWeight3'].setValue(0);
    this.cuisinesBlockForm.controls['margin3'].setValue(8);
    this.cuisinesBlockForm.controls['rounding3'].setValue(10);
    this.cuisinesBlockForm.controls['itemSquare3'].setValue(1);
    this.cuisinesBlockForm.controls['shadow3'].setValue("0");
    this.cuisinesBlockForm.controls['shadowCuisines'].setValue("0");
    this.cuisinesBlockForm.controls['slide3'].setValue(1);
    this.cuisinesBlockForm.controls['imageRounding3'].setValue(10);
  }

  submitOfferBlock() {
    this.isPendingOffer = false;
    if (!this.offerBlockForm.valid) {

    } else {
      var fd = new FormData();
      fd.append("block_id", "4")
      fd.append("number_of_items", this.offerBlockForm.value.number_display4);
      fd.append("border_weight", this.offerBlockForm.value.borderWeight4);
      fd.append("margin", this.offerBlockForm.value.margin4);
      fd.append("rounding", this.offerBlockForm.value.rounding4);
      fd.append("image_rounding", this.offerBlockForm.value.imageRounding4);
      fd.append("shadow", this.offerBlockForm.value.shadow4 + " " + this.offerBlockForm.value.shadowOffer);
      fd.append("slide_by", this.offerBlockForm.value.slide4);
      this.commonConfigurationServices.manageBlockConfiguration(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message)
            this.listOfBlockConfig();
          } else {
            this.toastr.error(response.message)
          }
        },
        error: (error) => {

        },
        complete: () => { },
      });
    }


  }

  resetOfferBlock() {
    this.isPendingOffer = true;
    this.offerBlockForm.controls['number_display4'].setValue(3);
    this.offerBlockForm.controls['borderWeight4'].setValue(0);
    this.offerBlockForm.controls['margin4'].setValue(8);
    this.offerBlockForm.controls['rounding4'].setValue(10);
    this.offerBlockForm.controls['shadow4'].setValue("0");
    this.offerBlockForm.controls['shadowOffer'].setValue("0");
    this.offerBlockForm.controls['slide4'].setValue(1);
    this.offerBlockForm.controls['imageRounding4'].setValue(50);
  }

  submitBannerBlock() {
    this.isPendingBanner = false;
    if (!this.bannerBlockForm.valid) {

    } else {
      var fd = new FormData();
      fd.append("block_id", "5")
      fd.append("border_weight", this.bannerBlockForm.value.borderWeight5);
      fd.append("rounding", this.bannerBlockForm.value.rounding5);
      fd.append("shadow", this.bannerBlockForm.value.shadow5 + " " + this.bannerBlockForm.value.shadowBanner);
      fd.append("no_of_rows", this.bannerBlockForm.value.rowsNumber);
      fd.append("no_of_columns", this.bannerBlockForm.value.columnsNumber);
      fd.append("margin", this.bannerBlockForm.value.bannerMargin ? this.bannerBlockForm.value.bannerMargin : 0);

      this.commonConfigurationServices.manageBlockConfiguration(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message)
            this.listOfBlockConfig();
          } else {
            this.toastr.error(response.message)
          }
        },
        error: (error) => {

        },
        complete: () => { },
      });
    }

  }

  resetBannerBlock() {
    this.isPendingBanner = true;
    this.bannerBlockForm.controls['borderWeight5'].setValue(0);
    this.bannerBlockForm.controls['rounding5'].setValue(50);
    this.bannerBlockForm.controls['shadow5'].setValue("0");
    this.bannerBlockForm.controls['shadowBanner'].setValue("0");
    this.bannerBlockForm.controls['rowsNumber'].setValue(1);
    this.bannerBlockForm.controls['columnsNumber'].setValue(1);
    this.bannerBlockForm.controls['bannerMargin'].setValue(0);
  }

  submitStoreTypeBlock() {
    this.isPendingStoreType = false;
    if (!this.storeTypeBlock.valid) {
    } else {
      var fd = new FormData();
      fd.append("block_id", "6")
      fd.append("number_of_items", this.storeTypeBlock.value.number_display6);
      fd.append("border_weight", this.storeTypeBlock.value.borderWeight6);
      fd.append("margin", this.storeTypeBlock.value.margin6);
      fd.append("rounding", this.storeTypeBlock.value.rounding6);
      fd.append("image_rounding", this.storeTypeBlock.value.imageRounding6);
      fd.append("image_padding", this.storeTypeBlock.value.imagePadding6 + " " + this.storeTypeBlock.value.imagePaddingStoreType);
      fd.append("item_square", this.storeTypeBlock.value.itemSquare6);
      fd.append("shadow", this.storeTypeBlock.value.shadow6 + " " + this.storeTypeBlock.value.shadowStoreType);
      fd.append("slide_by", this.storeTypeBlock.value.slide6);
      this.commonConfigurationServices.manageBlockConfiguration(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message)
            this.listOfBlockConfig();
          } else {
            this.toastr.error(response.message)
          }
        },
        error: (error) => {

        },
        complete: () => { },
      });
    }


  }

  resetStoreTypeBlock() {
    this.isPendingStoreType = true;
    this.storeTypeBlock.controls['number_display6'].setValue(5);
    this.storeTypeBlock.controls['borderWeight6'].setValue(0);
    this.storeTypeBlock.controls['margin6'].setValue(0);
    this.storeTypeBlock.controls['rounding6'].setValue(10);
    this.storeTypeBlock.controls['itemSquare6'].setValue(1);
    this.storeTypeBlock.controls['shadow6'].setValue("0");
    this.storeTypeBlock.controls['shadowStoreType'].setValue("0");
    this.storeTypeBlock.controls['slide6'].setValue(1);
    this.storeTypeBlock.controls['imageRounding6'].setValue(10);
    this.storeTypeBlock.controls['imagePadding6'].setValue("0");
    this.storeTypeBlock.controls['imagePaddingStoreType'].setValue("60");
  }

  submitCategoriesBlock() {
    this.isPendingCategories = false;
    if (!this.categoriesBlockForm) {

    } else {
      var fd = new FormData();
      fd.append("block_id", "7")
      fd.append("number_of_items", this.categoriesBlockForm.value.number_display7);
      fd.append("border_weight", this.categoriesBlockForm.value.borderWeight7);
      fd.append("margin", this.categoriesBlockForm.value.margin7);
      fd.append("rounding", this.categoriesBlockForm.value.rounding7);
      fd.append("image_rounding", this.categoriesBlockForm.value.imageRounding7);
      fd.append("image_padding", this.categoriesBlockForm.value.imagePadding7 + " " + this.categoriesBlockForm.value.imagePaddingCategories);
      fd.append("item_square", this.categoriesBlockForm.value.itemSquare7);
      fd.append("shadow", this.categoriesBlockForm.value.shadow7 + " " + this.categoriesBlockForm.value.shadowCategories);
      fd.append("slide_by", this.categoriesBlockForm.value.slide7);
      this.commonConfigurationServices.manageBlockConfiguration(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message)
            this.listOfBlockConfig();
          } else {
            this.toastr.error(response.message)
          }
        },
        error: (error) => {

        },
        complete: () => { },
      });
    }


  }
  resetCategoriesBlock() {
    this.isPendingCategories = true;
    this.categoriesBlockForm.controls['number_display7'].setValue(5);
    this.categoriesBlockForm.controls['borderWeight7'].setValue(0);
    this.categoriesBlockForm.controls['margin7'].setValue(0);
    this.categoriesBlockForm.controls['rounding7'].setValue(10);
    this.categoriesBlockForm.controls['itemSquare7'].setValue(1);
    this.categoriesBlockForm.controls['shadow7'].setValue("0");
    this.categoriesBlockForm.controls['shadowCategories'].setValue("0");
    this.categoriesBlockForm.controls['slide7'].setValue(1);
    this.categoriesBlockForm.controls['imageRounding7'].setValue(10);
    this.categoriesBlockForm.controls['imagePadding7'].setValue("0");
    this.categoriesBlockForm.controls['imagePaddingCategories'].setValue("60");
  }
  submitPastOrderBlock() {
    this.isPendingPastOrder = false;
    if (!this.pastOrderBlockForm.valid) {

    } else {
      var fd = new FormData();
      fd.append("block_id", "8")
      fd.append("border_weight", this.pastOrderBlockForm.value.borderWeight8);
      fd.append("margin", this.pastOrderBlockForm.value.margin8);
      fd.append("rounding", this.pastOrderBlockForm.value.rounding8);
      fd.append("image_rounding", this.pastOrderBlockForm.value.imageRounding8);
      fd.append("image_padding", this.pastOrderBlockForm.value.imagePadding8);
      fd.append("item_square", this.pastOrderBlockForm.value.itemSquare8);
      fd.append("shadow", this.pastOrderBlockForm.value.shadow8 + " " + this.pastOrderBlockForm.value.shadowPastOrder);
      this.commonConfigurationServices.manageBlockConfiguration(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message)
            this.listOfBlockConfig();
          } else {
            this.toastr.error(response.message)
          }
        },
        error: (error) => {

        },
        complete: () => { },
      });
    }


  }
  resetPastOrderBlock() {
    this.isPendingPastOrder = true;
    this.pastOrderBlockForm.controls['borderWeight8'].setValue(1);
    this.pastOrderBlockForm.controls['margin8'].setValue(8);
    this.pastOrderBlockForm.controls['rounding8'].setValue(10);
    this.pastOrderBlockForm.controls['itemSquare8'].setValue(1);
    this.pastOrderBlockForm.controls['shadow8'].setValue("0");
    this.pastOrderBlockForm.controls['shadowPastOrder'].setValue("0");
    this.pastOrderBlockForm.controls['imageRounding8'].setValue(10);
    this.pastOrderBlockForm.controls['imagePadding8'].setValue(1);
  }
  submitItemCollectionBlock() {
    this.isPendingCollection = false;
    if (!this.itemCollectionBlockForm.valid) {

    } else {
      var fd = new FormData();
      fd.append("block_id", "9")
      fd.append("number_of_items", this.itemCollectionBlockForm.value.number_display9);
      fd.append("border_weight", this.itemCollectionBlockForm.value.borderWeight9);
      fd.append("margin", this.itemCollectionBlockForm.value.margin9);
      fd.append("rounding", this.itemCollectionBlockForm.value.rounding9);
      fd.append("image_rounding", this.itemCollectionBlockForm.value.imageRounding9);
      fd.append("item_square", this.itemCollectionBlockForm.value.itemSquare9);
      fd.append("shadow", this.itemCollectionBlockForm.value.shadow9 + " " + this.itemCollectionBlockForm.value.shadowItemCollection);
      fd.append("slide_by", this.itemCollectionBlockForm.value.slide9);
      this.commonConfigurationServices.manageBlockConfiguration(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message)
            this.listOfBlockConfig();
          } else {
            this.toastr.error(response.message)
          }
        },
        error: (error) => {

        },
        complete: () => { },
      });
    }


  }
  resetItemCollectionBlock() {
    this.isPendingCollection = true;
    this.itemCollectionBlockForm.controls['number_display9'].setValue(5);
    this.itemCollectionBlockForm.controls['borderWeight9'].setValue(0);
    this.itemCollectionBlockForm.controls['margin9'].setValue(8);
    this.itemCollectionBlockForm.controls['rounding9'].setValue(10);
    this.itemCollectionBlockForm.controls['itemSquare9'].setValue(1);
    this.itemCollectionBlockForm.controls['shadow9'].setValue("0");
    this.itemCollectionBlockForm.controls['shadowItemCollection'].setValue("0");
    this.itemCollectionBlockForm.controls['slide9'].setValue(1);
    this.itemCollectionBlockForm.controls['imageRounding9'].setValue(10);
  }
  submitTagBlock() {
    this.isPendingTag = false;
    if (!this.itemTagBlockForm.valid) {

    } else {
      var fd = new FormData();
      fd.append("block_id", "10")
      fd.append("number_of_items", this.itemTagBlockForm.value.number_display10);
      fd.append("border_weight", this.itemTagBlockForm.value.borderWeight10);
      fd.append("margin", this.itemTagBlockForm.value.margin10);
      fd.append("rounding", this.itemTagBlockForm.value.rounding10);
      fd.append("image_rounding", this.itemTagBlockForm.value.imageRounding10);
      fd.append("item_square", this.itemTagBlockForm.value.itemSquare10);
      fd.append("shadow", this.itemTagBlockForm.value.shadow10 + " " + this.itemTagBlockForm.value.shadowTag);
      fd.append("slide_by", this.itemTagBlockForm.value.slide10);
      this.commonConfigurationServices.manageBlockConfiguration(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message)
            this.listOfBlockConfig();
          } else {
            this.toastr.error(response.message)
          }
        },
        error: (error) => {

        },
        complete: () => { },
      });
    }


  }
  resetTagBlock() {
    this.isPendingTag = true;
    this.itemTagBlockForm.controls['number_display10'].setValue(5);
    this.itemTagBlockForm.controls['borderWeight10'].setValue(0);
    this.itemTagBlockForm.controls['margin10'].setValue(8);
    this.itemTagBlockForm.controls['rounding10'].setValue(10);
    this.itemTagBlockForm.controls['itemSquare10'].setValue(1);
    this.itemTagBlockForm.controls['shadow10'].setValue("0");
    this.itemTagBlockForm.controls['shadowTag'].setValue("0");
    this.itemTagBlockForm.controls['slide10'].setValue(1);
    this.itemTagBlockForm.controls['imageRounding10'].setValue(10);
  }
}

