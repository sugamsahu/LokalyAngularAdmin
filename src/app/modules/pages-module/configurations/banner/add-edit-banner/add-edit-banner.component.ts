import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AppComponent } from 'src/app/app.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { CategoryService } from 'src/app/services/lookup/category.service';
import { ItemCollectionService } from 'src/app/services/lookup/item-collection.service';
import { SellerService } from 'src/app/services/seller.service';
import { CropBannerImageComponent } from '../../../model/crop-banner-image/crop-banner-image.component';
import { ItemService } from 'src/app/services/item.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-add-edit-banner',
  templateUrl: './add-edit-banner.component.html',
  styleUrls: ['./add-edit-banner.component.scss']
})
export class AddEditBannerComponent implements OnInit, AfterViewInit {

  main;
  bannerId: string;
  public bannerForm: FormGroup
  banner_type_list: any = [];
  is_cropped_image: boolean = false;
  general_setting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label: string = this.general_setting.store_label;
  offers_module = this.general_setting.offers_module;
  banner_store_list: any = [];
  banner_category_list: any = [];
  banner_item_list: any = [];
  offer_list: any = [];
  collection_list: any = [];
  cropped_banner_image: string;
  my_cropped_image_show: any;
  my_cropped_image: string;
  external_link_pattern: string = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  offer_id: number = null;
  item_collection_id: number = null;
  category_id: number = null;
  item_id: number = null;
  min_date: Date = new Date()
  cropFiles: any;
  croppedImages: any;
  @ViewChild('cursor') cursor: ElementRef;
  minDateForValidTo: Date = new Date()
  maxDateForValidFrom: Date = new Date();
  minTime : any = 3000;
  bannerLst: any = [];
  collectionFlag = 0;

  constructor(
    public translate: TranslateService,
    private appComponent: AppComponent,
    private cryptoService: CryptoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private _bannerService: BannerService,
    private _sellerService: SellerService,
    private _toastr: ToastrService,
    private _categoryService: CategoryService,
    private _itemCollectionService: ItemCollectionService,
    private el: ElementRef,
    private itemservice: ItemService,
    private spinner: NgxSpinnerService,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    this.min_date = moment().subtract(1, 'days').toDate();
    if (location.href.indexOf("/banner/edit") > -1) {
      this.bannerId = this.cryptoService.decryptIdValue(
        "configurations_banner_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.bannerId == undefined) {
        this.router.navigate(["/banner"]);
      }
    }
  }

  ngOnInit(): void {
    this.loadForm();
    this.getBannerList();
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
  }

  loadForm() {
    this.bannerForm = this.formBuilder.group({
      banner_title: ['', Validators.required],
      bannerType: [1],
      Banner_image: 'assets/icons/no_image.svg',
      linkType: '0',
      selectedStore: new FormControl(null),
      SelectedCategory: [null],
      SelectedItem: [null],
      startdate: new FormControl(new Date()),
      enddate: new FormControl(null),
      banner_transition: new FormControl(10000, [Validators.required, Validators.min(this.minTime)]),
      displayid: [''],
      externallink: [''],
      SelectedOffer: [null],
      SelectedCollection: [null],
      banner_alt_text: new FormControl(null)
    })
    this.bannerForm.get('linkType').valueChanges.subscribe(val => {
      if (val == 2) {
        this.bannerForm.controls['externallink'].setValidators([Validators.required, Validators.pattern(this.external_link_pattern)]);
      } else {
        this.bannerForm.controls['externallink'].clearValidators();
      }
      this.bannerForm.controls['externallink'].updateValueAndValidity();
    });

    this.translate.get(["FIRST_BANNER", "SECOND_BANNER", "THIRD_BANNER", "FOURTH_BANNER", "FIFTH_BANNER"])
      .subscribe((translations) => {
        this.banner_type_list = [
          { id: 1, name: translations.FIRST_BANNER },
          { id: 2, name: translations.SECOND_BANNER },
          { id: 3, name: translations.THIRD_BANNER },
          { id: 4, name: translations.FOURTH_BANNER },
          { id: 5, name: translations.FIFTH_BANNER },
        ];
      });
  }

  changeBannerType(event) {
    if (this.bannerLst.length > 0) {
      let myMax = 0;
      let maxDisplayForCustomerPortal: number

      this.bannerLst.forEach(element => {
        if (element.banner_type == event) {
          if (Number(element.display_id) > myMax) {
            myMax = Number(element.display_id);
            maxDisplayForCustomerPortal = Number(myMax) + 1;
          }
        }
      });
      this.bannerForm.controls.displayid.setValue(maxDisplayForCustomerPortal);
    }
  }

  dateFormateFromServerSide() {
    return this.main.DateFormate;
  }

  clearEndDate() {
    this.bannerForm.controls['enddate'].setValue(null);
  }

  async getBannerList() {
    var data: any = {};
    if (!this.bannerId) {
      data.is_all = 1;
    } else {
      data.global_banner_id = this.bannerId
    }
    await this._bannerService.getBannerList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.bannerLst = response.data;
          if (!this.bannerId) {
            let bannerList = response.data;
            if (bannerList.length > 0) {
              let max = 0;
              let max1 = 0;
              let maxDisplayForCustomerPortal: number
              let maxdisplayformobile: number
              bannerList.forEach(element => {
                if (element.banner_type == '1') {
                  if (Number(element.display_id) > max) {
                    max = element.display_id;
                    maxDisplayForCustomerPortal = Number(max) + 1;
                    this.bannerForm.controls.displayid.setValue(maxDisplayForCustomerPortal);
                  }
                }
                else if (element.banner_type == '2') {
                  if (Number(element.display_id) > max1) {
                    max1 = element.display_id;
                    maxdisplayformobile = Number(max1) + 1;
                  }
                }
              })
              this.getSellerList(0);
            }
          }
          else {
            this.bannerForm.patchValue({
              banner_title: response.data[0].banner_title,
              bannerType: Number(response.data[0].banner_type),
              banner_alt_text: response.data[0].banner_alt_text,
              Banner_image: response.data[0].banner,
              startdate: response.data[0].start_date != null ? moment(response.data[0].start_date, this.dateFormateFromServerSide().split(" ")[0]) : null,
              enddate: response.data[0].end_date ? moment(response.data[0].end_date, this.dateFormateFromServerSide().split(" ")[0]) : null,
              banner_transition: response.data[0].transition_time,
              displayid: response.data[0].display_id,
              linkType: response.data[0].link_type != null ? response.data[0].link_type : '0'
            })

            if (moment(new Date(response.data[0].end_date), this.dateFormateFromServerSide()) > moment(new Date(), this.dateFormateFromServerSide())) {
              this.min_date = moment().subtract(1, 'days').toDate();
            }
            const startdate = response.data[0].start_date;
            if (startdate) {
              const startDateMoment = moment(startdate, this.dateFormateFromServerSide().split("")[0]); // Parse the date with the correct format
              const oneDayEnddateData = startDateMoment.add(1, 'days');
              this.minDateForValidTo = oneDayEnddateData.toDate();
              const maxDateMoment = moment(startdate, this.dateFormateFromServerSide().split("")[0]).endOf('day'); // Calculate the end of the day for the start date
              const oneDayStartEnddateData = maxDateMoment.add(1, 'days');
              this.maxDateForValidFrom = oneDayStartEnddateData.toDate();
            }
            this.getSellerList(response.data[0].store_id)
            if (this.bannerForm.value.linkType == '1') {
              this.category_id = response.data[0].category_id;
              this.item_id = response.data[0].item_id;
            }
            if (this.bannerForm.value.linkType == '2') {
              this.bannerForm.controls['externallink'].setValue(response.data[0].redirectweblink);
            }
            if (this.bannerForm.value.linkType == '3') {
              this.offer_id = response.data[0].offer_id
            }
            if (this.bannerForm.value.linkType == '4') {
              this.item_collection_id = response.data[0].item_collection_id
            }
          }
        }
        else {
          this.getSellerList(0);
        }
      },
      error: (error) => {
        this._toastr.error(error);
      },
      complete: () => {
        if (this.bannerForm.value.linkType == '1') {
          this.spinner.show()
        }
      }
    })
  }

  openUpdateUserProfPicModal() {
    const modalRef = this.modalService.open(CropBannerImageComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.my_cropped_image_show;
    modalRef.componentInstance.imageChangedEvent = this.my_cropped_image
    modalRef.componentInstance.imageChangedEvent = this.croppedImages
    modalRef.componentInstance.cropFiles = this.cropFiles
    modalRef.componentInstance.customer_user_pic = true;
    modalRef.componentInstance.newseller =
      this.cropped_banner_image == undefined
        ? this.bannerForm.value.Banner_image
        : this.cropped_banner_image;
    modalRef.componentInstance.isCroppedImage = this.is_cropped_image;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.editProfilePic(receivedEntry);
    });
  }

  editProfilePic(item) {
    if (item.crop_image_file != undefined) {
      this.is_cropped_image = true;
      this.cropFiles = item.cropFiles
      this.croppedImages = item.croppedImages
      this.cropped_banner_image = item.crop_image;
      this.bannerForm.controls["Banner_image"].setValue(item.crop_image_file);
      this.my_cropped_image = item.full_image;
    }
    this.cdr.detectChanges();
  }
  /** Remove banner image */
  removeImage() {
    this.bannerForm.controls.Banner_image.setValue('assets/icons/no_image.svg')
    this.is_cropped_image = false;
    this.my_cropped_image = '';
  }

  async getSellerList(storeId: number) {
    const data = {
      market_type: 2,
      is_verified: 2,
      is_banner: 1
    }
    await this._sellerService.getSellerList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {

          response.data.forEach(el => {
            el.name = el.store_name + ' (' + el.manager_name + ') ' + el.store_area_name + ', ' + el.store_city_name;
            this.banner_store_list.push(el)
          })
          if (storeId == 0 || storeId == null) {
            this.bannerForm.controls.selectedStore.setValue(this.banner_store_list[0]);
          }
          else {
            var selectedStoreData: any = [];

            this.banner_store_list.forEach(el => {
              if (Number(el.store_id) == storeId) {
                selectedStoreData.push(el);
              }
            })
            this.bannerForm.controls.selectedStore.setValue(selectedStoreData[0]);
          }
          this.getOfferList();
        }
      },
      error: (error) => {
        this._toastr.error(error);
      },
      complete: () => {
        if (this.bannerForm.value.linkType == '1') {
          this.spinner.show()
        }
      }
    })
  }

  storeChange(item: any) {
    this.banner_category_list = [];
    this.banner_item_list = [];
    this.bannerForm.controls['SelectedCategory'].reset();
    this.bannerForm.controls['SelectedItem'].reset();
    this.getCategoryList();
  }

  async getCategoryList() {
    const data = {
      store_id: this.bannerForm.value.selectedStore.store_id
    }
    await this._categoryService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.banner_category_list = response.data;
          var selectedCategory: number = null;
          if (this.category_id != null) {
            this.banner_category_list.forEach(element => {
              if (element.category_id == this.category_id) {
                selectedCategory = element.category_id;
              }
            })
            this.bannerForm.controls.SelectedCategory.setValue(selectedCategory);
            this.getItemList();
          }
        }
      },
      error: (error) => {
        this._toastr.error(error);
      },
      complete: () => {
        this.spinner.hide()
      }
    })
  }

  changeCategory() {
    this.bannerForm.controls['SelectedItem'].reset();
    this.getItemList()
  }

  clearCategory() {
    this.banner_item_list = [];
    this.bannerForm.controls['SelectedCategory'].reset();
  }

  clearItem() {
    this.bannerForm.controls['SelectedItem'].reset();
  }

  async getItemList() {
    const data = {
      store_id: this.bannerForm.value.selectedStore.store_id,
      categories: this.bannerForm.value.SelectedCategory,
      page: 1,
      search_query: '',
      search_type: 1,
      user_id: this.main.LoggedUserInfo.user_id
    };
    await this.itemservice.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.banner_item_list = response.data;
          var selectedItem: number = null;
          if (this.item_id != null) {
            this.banner_item_list.forEach(element => {
              if (element.item_id == this.item_id) {
                selectedItem = element.item_id
              }
            })
            this.bannerForm.controls.SelectedItem.setValue(selectedItem);
          }
        } else {
          if (!this.bannerId) {
            this._toastr.error(response.message);
            this.banner_item_list = [];
          }
        }
      },
      error: (error) => {
        this._toastr.error(error);
      },
      complete: () => {
        if (this.bannerForm.value.linkType == '1') {
          this.spinner.hide()
        }
      }
    })
  }

  async getOfferList() {
    const data = {
      search_query: '',
      remove_single_use_offers: 1,
      offer_type: 1
    };

    await this._bannerService.getOffersList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach(element => {
            element.name = element.title + ' (' + element.discount_code + ')'
          })
          this.offer_list = response.data
          var selectedOffer: number = null;
          if (this.offer_id != null) {
            this.offer_list.forEach(element => {
              if (element.offer_id == this.offer_id) {
                selectedOffer = element.offer_id;
              }
            })
            this.bannerForm.controls.SelectedOffer.setValue(selectedOffer);
          }
          this.getCollectionList();
        } else {
          this.getCollectionList();
        }
      },
      error: (error) => {
        this._toastr.error(error);
      },
      complete: () => {
        if (this.bannerForm.value.linkType == '1') {
          this.spinner.show()
        }
      }
    })
  }

  async getCollectionList() {
    const data = {
      page: 0,
      search_query: '',
      sort_field: '',
      sort_type: '',
      is_banner: 1
    };
    this._itemCollectionService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.collection_list = response.data
          var selectedCollection: string = '';
          if (this.item_collection_id != null) {
            this.collection_list.forEach(element => {
              if (element.item_collection_id == this.item_collection_id) {
                selectedCollection = element.item_collection_id
              }
            })
            this.bannerForm.controls.SelectedCollection.setValue(selectedCollection);
          }
          this.getCategoryList();
        } else {
          this.getCategoryList();
        }
      },
      error: (error) => {
        this._toastr.error(error);
      },
      complete: () => {
        if (this.bannerForm.value.linkType == '1') {
          this.spinner.show()
        }
        this.spinner.hide()
      }
    })
  }

  clearCollection() {
    this.bannerForm.controls['SelectedCollection'].reset();
  }

  clearOffer() {
    this.bannerForm.controls['SelectedOffer'].reset();
  }

  hasProtocolDomainPathQuery(str: string): boolean {
    // Regular expression to match the pattern
    const regex = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/;

    // Check if the string matches the pattern
    return regex.test(str);
  }

  /** Submit new/updated banner details */
  onBannerSubmit() {
    if (!this.bannerForm.valid) {
      const controls = this.bannerForm.controls;
      Object.keys(controls).forEach((controlName, i) => {
        if (i == 0) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + controlName + '"]'
          );
          invalidControl.focus();
        }
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    }
    else {
      if (this.bannerForm.value.linkType == '2' && this.hasProtocolDomainPathQuery(this.bannerForm.value.externallink) == false) {
        this._toastr.error(this.translate.instant('External link should have the prefix as http:// or https://'));
        return;
      } else {
        var start_date;
        if (this.bannerForm.value.startdate == undefined) {
          var today = new Date();
          start_date = moment(today).format(this.main.DateFormate.split(' ')[0])
        }
        else {
          start_date = moment(this.bannerForm.value.startdate).format(this.main.DateFormate.split(' ')[0])
        }

        var end_date;
        if (this.bannerForm.value.enddate == undefined || this.bannerForm.value.enddate == null) {
          end_date = '';
        }
        else {
          end_date = moment(this.bannerForm.value.enddate).format(this.main.DateFormate.split(' ')[0])
        }

        if (this.bannerForm.value.Banner_image == 'assets/icons/no_image.svg' || this.bannerForm.value.Banner_image == '' || this.bannerForm.value.Banner_image == null
          || this.bannerForm.value.Banner_image == undefined) {
          this._toastr.error(this.translate.instant('PLEASE_UPLOAD_BANNER_IMAGE'));
          return;
        }

        if (this.bannerForm.value.startdate != null && this.bannerForm.value.enddate != null) {
          if (this.bannerForm.value.startdate > this.bannerForm.value.enddate) {
            this._toastr.error(this.translate.instant('START_END_DATE_VALIDATE'));
            return;
          }
        }

        if (this.bannerForm.value.linkType == '3') {
          if (this.bannerForm.value.SelectedOffer == null) {
            this._toastr.error(this.translate.instant('PLEASE_SELECT_OFFER'));
            return;
          }
        }

        if (this.bannerForm.value.linkType == '4') {
          if (this.bannerForm.value.SelectedCollection == undefined || this.bannerForm.value.SelectedCollection == null) {
            this._toastr.error(this.translate.instant('PLEASE_SELECT_COLLECTION'))
            return;
          }
        }

        if (this.bannerForm.value.Banner_image.size > 100000) {
          this._toastr.error(this.translate.instant('Image Size Should Not Be More Than 100 KB'))
          return;
        }

        var formData = new FormData();

        formData.append('user_id', this.main.LoggedUserInfo.user_id);
        formData.append('banner_title', this.bannerForm.value.banner_title);
        formData.append('banner_type', this.bannerForm.value.bannerType);
        formData.append('banner_alt_text', this.bannerForm.value.banner_alt_text == null ? "" : this.bannerForm.value.banner_alt_text);

        //Use remaining date Logic
        if (this.bannerForm.value.startdate != '' || this.bannerForm.value.startdate != null || this.bannerForm.value.startdate != undefined) {
          formData.append('start_date', start_date);
        }
        if (this.bannerForm.value.enddate != '' || this.bannerForm.value.enddate != null || this.bannerForm.value.enddate != undefined) {
          formData.append('end_date', end_date);
        }

        if (this.bannerForm.value.Banner_image != undefined || this.bannerForm.value.Banner_image != null) {
          formData.append('banner', this.bannerForm.value.Banner_image);
        }

        formData.append('display_id', this.bannerForm.value.displayid);
        formData.append('transition_time', this.bannerForm.value.banner_transition);
        formData.append('link_type', this.bannerForm.value.linkType);

        if (this.bannerForm.value.linkType == '1') {

          formData.append('store_id', this.bannerForm.value.selectedStore.store_id);
          if (this.bannerForm.value.SelectedCategory != null) {
            formData.append('category_id', this.bannerForm.value.SelectedCategory);
          }
          if (this.bannerForm.value.SelectedItem != null) {
            formData.append('item_id', this.bannerForm.value.SelectedItem);
          }
        }

        if (this.bannerForm.value.linkType == '2') {
          formData.append('redirectweblink', this.bannerForm.value.externallink);
        }

        if (this.bannerForm.value.linkType == '3') {
          formData.append('offer_id', this.bannerForm.value.SelectedOffer);
        }

        if (this.bannerForm.value.linkType == '4') {
          formData.append('item_collection_id', this.bannerForm.value.SelectedCollection);
        }

        if (this.bannerId) {
          formData.append('global_banner_id', this.bannerId);
        }

        this._bannerService.manageGlobalBanner(formData).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this._toastr.success(response.message);
              this.router.navigate(["/banner"]);
            } else {
              this._toastr.error(response.message);
            }
          },
          error: (error) => {
            this._toastr.error(error);
          },
          complete: () => {
            //request complete
          }
        })
      }
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

  controlHasError(validation, controlName) {
    const control = this.bannerForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  cancelClick() {
    history.back();
  }

  get patternError() {
    return this.bannerForm.controls;
  }
  /** Pointing focus to first input field */
  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }
}