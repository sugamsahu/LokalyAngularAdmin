import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnInit, AfterViewInit, ViewChild
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service"
import { TemplateService } from "src/app/services/campaign-management/template.service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { crop_rectangleComponent } from "../../../model/crop-rectangle/crop-rectangle.component";
import { SellerService } from "src/app/services/seller.service";
import { ItemCollectionService } from "src/app/services/lookup/item-collection.service";
import { CategoryService } from "src/app/services/lookup/category.service";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ItemService } from "src/app/services/item.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-add-template",
  templateUrl: "./add-template.component.html",
  styleUrls: ["./add-template.component.scss"],
})
export class AddTemplateComponent implements OnInit, AfterViewInit {
  public formGroup: FormGroup;
  main: any = { LoggedUserInfo: {} };
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  business_model = this.platform_setting.business_model;
  store_label: string = this.general_setting.store_label;
  offers_module = this.general_setting.offers_module;
  template_id: any = 0;
  banner_store_list: any = [];
  show_emoji_picker: boolean = false;
  show_emoji_picker_text: boolean = false;
  external_link_pattern: string = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  //editor
  @ViewChild('cursor') cursor: ElementRef
  is_cropped_image = false;
  is_cropped_thumb_image = false;
  my_cropped_image_show: any;
  my_cropped_image_show_thumb: any;
  my_cropped_image: string;
  my_cropped_image_thumb: string;
  cropped_images: any;
  cropped_images_thumb: any;
  cropFiles: any;
  cropFilesThumb: any;
  cropped_store_logo: any;
  cropped_store_logoThumb: any;
  OfferList: any;
  offerID: null;
  itemCollectionId: null;
  collectionlist: any;
  bannerCategoryList: any;
  categoryID: null;
  bannerItemList: any;
  itemID: null;
  isDuplicate: string;
  isExecuted: any = 0;
  check_duplicate: any;

  @ViewChild("myckeditor") ckeditor: any;
  ckeConfig: any = {
    extraPlugins: 'uploadimage,pastefromword,filebrowser',
    uploadUrl:
      'https://apilocal.lokaly.in/store/ckeditor',
    filebrowserBrowseUrl:
      'uploads/ckeditor',
    filebrowserImageBrowseUrl:
      'uploads/ckeditor',
    filebrowserUploadUrl:
      'https://apilocal.lokaly.in/store/ckeditor',
    filebrowserImageUploadUrl:
      'https://apilocal.lokaly.in/store/ckeditor',
    editable: true,
    spellcheck: true,
    sanitize: false,
    script: true,
    allowedContent: true,
    toolbar: [
      ['Source', 'Templates', 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'],
      ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
      ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'],
      ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'],
      ['Link', 'Unlink', 'Anchor'],
      ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak'],
      ['Styles', 'Format', 'Font', 'FontSize'],
      ['TextColor', 'BGColor'],
      ['Maximize', 'ShowBlocks']
    ],
    font_names: 'Arial/Arial, Helvetica, sans-serif;' +
      'Celias/Celias-Light;' +
      'Times New Roman/Times New Roman, Times, serif;' +
      'Verdana;',
    font_style: {
      element: 'span',
      styles: { 'font-family': '#(family)' },
      verrides: [{ element: 'font', attributes: { 'face': null } }]
    },
    fontSize: {
      options: [
        'default',
        '8pt',
        '9pt',
        '10pt',
        '11pt',
        '12pt',
        '14pt',
        '18pt',
        '24pt',
        '36pt'
      ]
    },
    font_defaultLabel: 'Celias',
    fontSize_defaultLabel: '16',
    height: 300,

  };
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private TemplateService: TemplateService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private toastr: ToastrService,
    private spinner: SpinnerService,
    private modalService: NgbModal,
    private _sellerService: SellerService,
    private _itemCollectionService: ItemCollectionService,
    private _categoryService: CategoryService,
    private _bannerService: BannerService,
    private itemservice: ItemService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/template/edit") > -1) {
      this.template_id = this.cryptoService.decryptIdValue(
        "campaign_templates_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.isDuplicate = this.cryptoService.decryptIdValue(
        "campaign_templates_id_duplicate" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.template_id == undefined) {
        this.router.navigate(["/template"]);
      }
    }
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (/windows/i.test(navigator.userAgent)) {
        var textArea = document.querySelector('textarea[name="notification_text"]');
        if (textArea) {
          textArea.classList.add('win');
        }
      }
      if (/windows/i.test(navigator.userAgent)) {
        var textArea = document.querySelector('input[name="notification_title"]');
        if (textArea) {
          textArea.classList.add('win');
        }
      }
    }, 500);


    this.ckeConfig.contentsCss = [window.location.origin + "/assets/ckEditor-font.css"];
    var sessionconfig: any = this.appComponent.sessionConfig();
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    if (this.general_setting) {
      this.formGroup.controls["footer"].setValue(
        this.general_setting.email_footer_customer
      );
      this.formGroup.controls["header"].setValue(
        this.general_setting.email_header
      );
    } else {
      this.formGroup.controls["footer"].setValue(
        this.main.email_footer_customer
      );
      this.formGroup.controls["header"].setValue(this.main.email_header);
    }
    if (this.template_id) {
      this.getDetails();
      if (this.isDuplicate) {
        this.template_id = undefined
      }
    } else {
      this.getSellerList(0)
    }


    this.cdr.detectChanges();
  }

  //load form
  loadForm() {
    this.formGroup = this.formBuilder.group({
      template_name: [null, Validators.required],
      Type: ["1"],
      header: [null],
      content: [null],
      footer: [null],
      msg_title: [null],
      sms_text: [null],
      user_picture: new FormControl("assets/icons/no_image.svg"),
      notification_thumb: new FormControl(this.general_setting.mobile_logo),
      notification_title: [null],
      notification_text: [null, Validators.compose([Validators.maxLength(150)])],
      is_active: [true],
      linkType: '0',
      selectedStore: new FormControl(null),
      SelectedCategory: [null],
      external_link: [''],
      SelectedOffer: [null],
      SelectedCollection: [null],
      SelectedItem: [null],
      notification_link_name: [null],
    });
    this.formGroup.get('linkType').valueChanges.subscribe(val => {
      if (val == 2) {
        this.formGroup.controls['external_link'].setValidators([Validators.required, Validators.pattern(this.external_link_pattern)]);
      } else {
        this.formGroup.controls['external_link'].clearValidators();
      }
      this.formGroup.controls['external_link'].updateValueAndValidity();
    });
  }

  async getSellerList(storeId: number) {
    const data = {
      market_type: 2
    }
    await this._sellerService.getSellerList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach(el => {
            el.name = el.store_name + ' (' + el.manager_name + ') ' + el.store_area_name + ', ' + el.store_city_name;
            this.banner_store_list.push(el)
          })
          if (storeId == 0 || storeId == null) {
            this.formGroup.controls.selectedStore.setValue(this.banner_store_list[0]);
          }
          else {
            var selectedStoreData: any = [];
            this.banner_store_list.forEach(el => {
              if (Number(el.store_id) == storeId) {
                selectedStoreData.push(el);
              }
            })
            this.formGroup.controls.selectedStore.setValue(selectedStoreData[0]);
          }
          this.getOfferList();
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {
        if (this.formGroup.value.linkType == '1') {
          this.spinner.show()
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
          this.OfferList = response.data
          var selectedOffer: number = null;
          if (this.offerID != null) {
            this.OfferList.forEach(element => {
              if (element.offer_id == this.offerID) {
                selectedOffer = element.offer_id;
              }
            })
            this.formGroup.controls.SelectedOffer.setValue(selectedOffer);
          }

          this.getCollectionList();
        } else {
          this.getCollectionList();
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {
        if (this.formGroup.value.linkType == '1') {
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
      sort_type: ''
    };
    this._itemCollectionService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.collectionlist = response.data
          var selectedCollection: string = '';
          if (this.itemCollectionId != null) {
            this.collectionlist.forEach(element => {
              if (element.item_collection_id == this.itemCollectionId) {
                selectedCollection = element.item_collection_id
              }
            })
            this.formGroup.controls.SelectedCollection.setValue(selectedCollection);
          }

          this.getCategoryList();
        } else {
          this.getCategoryList();
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {
        if (this.formGroup.value.linkType == '1') {
          this.spinner.show()
        }
        this.spinner.hide()
      }
    })
  }

  async getCategoryList() {
    const data = {
      store_id: this.formGroup.value.selectedStore.store_id
    }
    await this._categoryService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.bannerCategoryList = response.data;
          var selectedCategory: number = null;
          if (this.categoryID != null) {
            this.bannerCategoryList.forEach(element => {
              if (element.category_id == this.categoryID) {
                selectedCategory = element.category_id;
              }
            })
            this.formGroup.controls.SelectedCategory.setValue(selectedCategory);
            this.getItemList();
          }
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {
        this.spinner.hide()
      }
    })
  }

  async getItemList() {
    const data = {
      store_id: this.formGroup.value.selectedStore.store_id,
      category_id: this.formGroup.value.SelectedCategory,
      page: 1,
      search_query: '',
      search_type: 1,
      user_id: this.main.LoggedUserInfo.user_id
    };

    await this.itemservice.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {

          this.bannerItemList = response.data;
          var selectedItem: number = null;

          if (this.itemID != null) {
            this.bannerItemList.forEach(element => {
              if (element.item_id == this.itemID) {
                selectedItem = element.item_id
              }
            })
            this.formGroup.controls.SelectedItem.setValue(selectedItem);
          }
        } else {
          if (!this.template_id) {
            this.toastr.error(response.message);
            this.bannerItemList = [];
          }
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {
        if (this.formGroup.value.linkType == '1') {
          this.spinner.hide()
        }
      }
    })
  }

  /** Open crop_rectangleComponent modal */
  openUpdateUserProfPicModal() {
    const modalRef = this.modalService.open(crop_rectangleComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.my_cropped_image_show;
    modalRef.componentInstance.imageChangedEvent = this.my_cropped_image
    modalRef.componentInstance.imageChangedEvent = this.cropped_images
    modalRef.componentInstance.cropFiles = this.cropFiles
    modalRef.componentInstance.aspectRatio = 3
    modalRef.componentInstance.newseller =
      this.cropped_store_logo == undefined
        ? this.formGroup.value.user_picture
        : this.cropped_store_logo;
    modalRef.componentInstance.isCroppedImage = this.is_cropped_image;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.editProfilePic(receivedEntry);
    });
  }

  openUpdateThumbPicModal() {
    const modalRef = this.modalService.open(crop_rectangleComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.my_cropped_image_show_thumb;
    modalRef.componentInstance.imageChangedEvent = this.my_cropped_image_thumb
    modalRef.componentInstance.imageChangedEvent = this.cropped_images_thumb
    modalRef.componentInstance.cropFiles = this.cropFilesThumb

    modalRef.componentInstance.newseller =
      this.cropped_store_logoThumb == undefined
        ? this.formGroup.value.notification_thumb
        : this.cropped_store_logoThumb;
    modalRef.componentInstance.isCroppedImage = this.is_cropped_image;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.editThumbPic(receivedEntry);
    });
  }


  editThumbPic(item) {
    if (item.crop_image_file != undefined) {
      this.is_cropped_thumb_image = true;
      this.cropFilesThumb = item.cropFiles
      this.cropped_images_thumb = item.croppedImages

      this.cropped_store_logoThumb = item.crop_image;
      this.formGroup.controls["notification_thumb"].setValue(item.crop_image_file);
      this.my_cropped_image_thumb = item.full_image;
    }
    this.cdr.detectChanges();
  }

  ChangeCategory() {
    this.formGroup.controls['SelectedItem'].reset();
    this.getItemList()
  }

  StoreChange(item: any) {
    this.bannerCategoryList = [];
    this.bannerItemList = [];
    this.formGroup.controls['SelectedCategory'].reset();
    this.formGroup.controls['SelectedItem'].reset();
    this.getCategoryList();
  }

  editProfilePic(item) {
    if (item.crop_image_file != undefined) {
      this.is_cropped_image = true;
      this.cropFiles = item.cropFiles
      this.cropped_images = item.croppedImages
      this.cropped_store_logo = item.crop_image;
      this.formGroup.controls["user_picture"].setValue(item.crop_image_file);
      this.my_cropped_image = item.full_image;
    }
    this.cdr.detectChanges();
  }

  /** Get template details using  service */
  //get details
  getDetails() {
    this.spinner.show();
    var data = {
      campaign_templates_id: this.template_id,
    };
    this.TemplateService.getCampaignTemplate(data).subscribe({
      next: (response: any) => {
        this.check_duplicate = localStorage.getItem('check_duplicate');
        if (response.status == 1) {
          if (this.check_duplicate == "false") {
            this.isExecuted = response.data.isExecuted
          } else {
            this.isExecuted = 0;
          }
          this.formGroup.controls["template_name"].setValue(
            response.data.templates_list_name
          );
          this.formGroup.controls["is_active"].setValue(
            response.data.is_active == 1 ? true : false
          );
          this.formGroup.controls["Type"].setValue(
            response.data.templates_type
          );
          if (this.formGroup.value.Type == 1) {
            this.formGroup.controls["header"].setValue(
              response.data.email_header
            );
            this.formGroup.controls["content"].setValue(
              response.data.email_body
            );
            this.formGroup.controls["footer"].setValue(
              response.data.email_footer
            );
          }
          if (this.formGroup.value.Type == 2) {
            this.formGroup.controls["msg_title"].setValue(
              response.data.sms_title
            );
            this.formGroup.controls["sms_text"].setValue(
              response.data.sms_text
            );
          }
          if (this.formGroup.value.Type == 3) {
            this.getSellerList(response.data.store_id)

            if (response.data.notification_image) {
              this.formGroup.controls["user_picture"].setValue(
                response.data.notification_image
              );
            }

            if (response.data.notification_thumb) {
              this.formGroup.controls["notification_thumb"].setValue(
                response.data.notification_thumb
              );
            }

            this.formGroup.controls["notification_title"].setValue(
              response.data.notification_title
            );
            this.formGroup.controls["notification_text"].setValue(
              response.data.notification_text
            );

            this.formGroup.controls["linkType"].setValue(
              response.data.type ? response.data.type : '0'
            );
            if (this.formGroup.value.linkType != '0') {
              this.formGroup.controls["notification_link_name"].setValue(
                response.data.notification_link_name
              );
            } else {
              this.formGroup.controls["notification_link_name"].setValue(
                ''
              );
            }

            if (this.formGroup.value.linkType == '1') {
              this.categoryID = response.data.category_id;
              this.itemID = response.data.item_id;
            }

            if (this.formGroup.value.linkType == '2') {
              this.formGroup.controls['external_link'].setValue(response.data.external_link);
            }

            if (this.formGroup.value.linkType == '3') {
              this.offerID = response.data.offer_id
            }

            if (this.formGroup.value.linkType == '4') {
              this.itemCollectionId = response.data.item_collection_id
            }
          }
          this.spinner.hide();
        }
      },
      error: (error) => {
        this.spinner.hide();
        this._snackbarService.error(error);
      },
      complete: () => {
        this.spinner.hide();
        ;
      },
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

  clickedOutside(): void {
    this.show_emoji_picker = false;
  }

  clickedOutsideText(): void {
    this.show_emoji_picker_text = false;
  }

  toggleEmojiPicker() {
    this.show_emoji_picker = !this.show_emoji_picker;
  }

  toggleEmojiPickerText() {
    this.show_emoji_picker_text = !this.show_emoji_picker_text;
  }

  addEmoji(event) {
    if (/windows/i.test(navigator.userAgent)) {
      var textArea = document.querySelector('input[name="notification_title"]');
      if (textArea) {
        textArea.classList.add('win');
      }
    }
    if (!this.formGroup.value.notification_title || this.formGroup.value.notification_title?.length < 50) {
      let text = "";
      if (!this.formGroup.value.notification_title) {
        text = `${event.emoji.native}`;
      } else {
        text = `${this.formGroup.value.notification_title}${event.emoji.native}`;
      }
      this.formGroup.controls["notification_title"].setValue(
        text
      );
    }
  }

  addEmojiText(event) {
    if (/windows/i.test(navigator.userAgent)) {
      var textArea = document.querySelector('textarea[name="notification_text"]');
      if (textArea) {
        textArea.classList.add('win');
      }
    }
    if (!this.formGroup.value.notification_text || this.formGroup.value.notification_text?.length < 151) {
      let text = "";
      if (!this.formGroup.value.notification_text) {
        text = `${event.emoji.native}`;
      } else {
        text = `${this.formGroup.value.notification_text}${event.emoji.native}`;
      }
      this.formGroup.controls["notification_text"].setValue(
        text
      );
    }
  }

  linkTypeChange() {
    this.formGroup.controls["notification_link_name"].setValue('');
  }

  removeImage() {
    this.is_cropped_image = false
    this.formGroup.controls["user_picture"].setValue(
      "assets/icons/no_image.svg"
    );
  }

  removeImageThumb() {
    this.is_cropped_thumb_image = false
    this.formGroup.controls["notification_thumb"].setValue(
      this.general_setting.mobile_logo
    );
  }

  get patternError() {
    return this.formGroup.controls;
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  /** Submit template details */
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
      this.toastr.error(this.translate.instant("ENTER_ALL_REQUIRED_FIELDS"));
      return;
    } else {
      if (this.formGroup.value.linkType == '3') {
        if (this.formGroup.value.SelectedOffer == null) {
          this.toastr.error(this.translate.instant('PLEASE_SELECT_OFFER'));
          return;
        }
      }
      if (this.formGroup.value.linkType == '4') {
        if (this.formGroup.value.SelectedCollection == undefined || this.formGroup.value.SelectedCollection == null) {
          this.toastr.error(this.translate.instant('PLEASE_SELECT_COLLECTION'))
          return;
        }
      }
      this.spinner.show();
      let formData = new FormData();
      formData.append(
        "templates_list_name",
        this.formGroup.value.template_name
      );
      formData.append("templates_type", this.formGroup.value.Type);
      if (this.template_id) {
        formData.append("campaign_templates_id", this.template_id);
      }
      if (this.formGroup.value.Type == 1) {
        formData.append("email_header", this.formGroup.value.header);
        formData.append("email_body", this.formGroup.value.content);
        formData.append("email_footer", this.formGroup.value.footer);
      }
      if (this.formGroup.value.Type == 2) {
        formData.append("sms_title", this.formGroup.value.msg_title ? this.formGroup.value.msg_title : '');
        formData.append("sms_text", this.formGroup.value.sms_text ? this.formGroup.value.sms_text : '');
      }
      if (this.formGroup.value.Type == 3) {
        if (this.is_cropped_image) {
          formData.append("notification_image", this.formGroup.value.user_picture);
        }
        if (this.is_cropped_thumb_image) {
          formData.append("notification_thumb", this.formGroup.value.notification_thumb);
        }
        if (!this.formGroup.value.notification_title) {
          this.spinner.hide();
          this.toastr.error(this.translate.instant("ENTER_ALL_REQUIRED_FIELDS"));
          return;
        }
        if (this.formGroup.value.linkType != '0' && !this.formGroup.value.notification_link_name) {
          this.spinner.hide();
          this.toastr.error(this.translate.instant("ENTER_ALL_REQUIRED_FIELDS"));
          return;
        }
        formData.append(
          "notification_title",
          this.formGroup.value.notification_title
        );
        formData.append(
          "notification_text",
          this.formGroup.value.notification_text ? this.formGroup.value.notification_text : ''
        );
        formData.append('type', this.formGroup.value.linkType);
        if (this.formGroup.value.linkType != '0') {
          formData.append('notification_link_name', this.formGroup.value.notification_link_name);
        } else {
          formData.append('notification_link_name', '');
        }
        if (this.formGroup.value.linkType == '1') {

          formData.append('store_id', this.formGroup.value.selectedStore.store_id);
          if (this.formGroup.value.SelectedCategory != null) {
            formData.append('category_id', this.formGroup.value.SelectedCategory);
          }
          if (this.formGroup.value.SelectedItem != null) {
            formData.append('item_id', this.formGroup.value.SelectedItem);
          }
        }
        if (this.formGroup.value.linkType == '2') {
          formData.append('external_link', this.formGroup.value.external_link);
        }
        if (this.formGroup.value.linkType == '3') {
          formData.append('offer_id', this.formGroup.value.SelectedOffer);
        }
        if (this.formGroup.value.linkType == '4') {
          formData.append('item_collection_id', this.formGroup.value.SelectedCollection);
        }
      }
      formData.append(
        "is_active",
        this.formGroup.value.is_active == true ? "1" : "0"
      );
      var data = formData;
      this.TemplateService.manageCampaignTemplate(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/template`]);
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
      });
    }
  }

  ngOnDestroy(): void {
    localStorage.removeItem("check_duplicate")
  }
}
