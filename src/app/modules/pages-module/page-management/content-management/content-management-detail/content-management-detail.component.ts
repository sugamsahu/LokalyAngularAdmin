import { Location } from "@angular/common";
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AngularEditorConfig } from "@kolkov/angular-editor";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { AppComponent } from "src/app/app.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { CategoryService } from "src/app/services/lookup/category.service";
import { ItemCollectionService } from "src/app/services/lookup/item-collection.service";
import { PageManagementService } from "src/app/services/page-management.service";
import { ItemService } from "src/app/services/item.service";
import { SellerService } from "src/app/services/seller.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-content-management-detail",
  templateUrl: "./content-management-detail.component.html",
  styleUrls: ["./content-management-detail.component.scss"],
})
export class ContentManagementDetailComponent implements OnInit {
  @Input() languageDetail: any = null;
  @Input() languageList: any = [];
  @Output() newItemEvent: EventEmitter<any> = new EventEmitter();
  pageId: any = 0;
  store_list: any = [];
  category_list: any = [];
  item_list: any = [];
  offer_list: any = [];
  collection_list: any = [];
  main: any;
  general_setting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label: string = this.general_setting.store_label;

  contentId: any = 0;
  languageCode: any = "";

  contentDetails: any;
  pageContentDetails: any;
  customer_User_Id: any = 0;
  public contentForm: UntypedFormGroup;
  @ViewChild("cursor") cursor: ElementRef;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private sellerService: SellerService,
    private snackbarService: ToastrService,
    private categoryService: CategoryService,
    private itemService: ItemService,
    private bannerService: BannerService,
    private itemCollectionService: ItemCollectionService,
    private appComponent: AppComponent,
    private el: ElementRef,
    public translateService: TranslateService,
    private pageManagementService: PageManagementService,
    private router: Router,
    private cryptoService: CryptoService,
    private spinnerService: NgxSpinnerService,
    private location: Location
  ) {
    this.main = this.appComponent.main;
  }

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    sanitize: false,
    height: '15rem',
    minHeight: '5rem',
    width: "auto",
    minWidth: "750px",
    translate: "no",
    enableToolbar: true,
    showToolbar: true,
    defaultParagraphSeparator: "",
    defaultFontName: "Celias",
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'celias', name: 'Celias' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    defaultFontSize: "",
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: "redText",
        class: "redText",
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ],
  };

  ckEditorConfig: any = {
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
    fontSize_defaultLabel: '16'
  };

  ngOnInit() {
    this.ckEditorConfig.contentsCss = [window.location.origin + "/assets/ckEditor-font.css"];
    if (location.href.indexOf("/page-management/edit-content") > -1) {
      this.pageId = this.cryptoService.decryptIdValue(
        "content_mgmt_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.pageId == undefined) {
        this.router.navigate(["/page-management"]);
      }
      this.getDetails(false);
    }
    else {
      this.getSellerList(0);
    }
    this.loadForm();
    this.getOfferList();
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  loadForm() {
    this.contentForm = this.formBuilder.group({
      link_name: ["", Validators.required],
      link_tooltip: [""],
      source_type: 1, //'1 Content,2 Download,3 External Link,4 Internal,5 Offer,6 Collection'
      mobile_link_name: ["", Validators.required],
      mobile_type: 1, //'1 Content,2 Open Web Url'
      mobile_content: [""], //missing
      page_title_h1: [""],
      page_subtitle_h2: [""],
      content: [""],
      download_file: [""],
      download_file_link: "",
      content_image: [""],
      content_image_link: "",
      external_link: [""],
      offer_id: [null],
      item_collection_id: [null],
      store_id: [null],
      category_id: [null],
      item_id: [null],
      meta_title: this.general_setting.platform_page_title,
      meta_description: this.general_setting.about_platform,
      meta_keyword: this.general_setting.platform_keywords,
      og_title: this.general_setting.platform_page_title,
      og_description: this.general_setting.about_platform,
      og_image: [""],
      og_image_link: this.general_setting.platform_meta_logo,
      og_image_meta: this.general_setting.platform_keywords,
      id: 0,
      page_id: this.pageId,
      user_id: this.main.LoggedUserInfo.user_id,
      language_code: this.languageDetail.language_code,
    });

    // Add custom validation for page_title_h1, page_subtitle_h2, and content
    this.contentForm.get("source_type").valueChanges.subscribe((sourceType) => {
      if (sourceType === 4) {
        this.contentForm
          .get("external_link")
          .setValidators([Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]);
      } else {
        this.contentForm.get("external_link").clearValidators();
      }
      this.contentForm.get("external_link").updateValueAndValidity();
    });
  }

  async getDetails(isPrimary) {
    var data = {
      page_id: this.pageId,
    };

    await this.pageManagementService.getById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.pageContentDetails = response.data;
          console.log(this.pageContentDetails)
          if (isPrimary) {
            this.contentDetails = response.data.rows[0];
            console.log(this.contentDetails, "1");
            
          }
          else {
            console.log(this.contentDetails, "2");
            this.contentDetails = response.data.rows.filter(
              (item) => item.language_id == this.languageDetail.language_id
            )[0];
            this.contentId = this.contentDetails == undefined ? 0 : this.contentDetails.id;
            this.languageCode = this.contentDetails == undefined ? this.languageDetail.language_code : this.contentDetails.language_code;
          }

          if (this.contentDetails) {
            this.contentForm.patchValue({
              link_name: this.contentDetails.link_name,
              link_tooltip: this.contentDetails.link_tooltip,
              source_type: this.contentDetails.source_type,
              mobile_link_name: this.contentDetails.mobile_link_name,
              mobile_type: this.contentDetails.mobile_type,
              mobile_content: this.contentDetails.mobile_content,
              language_code: this.languageCode,
              page_title_h1: this.contentDetails.page_title_h1,
              page_subtitle_h2: this.contentDetails.page_subtitle_h2,
              content: this.contentDetails.content,
              download_file_link: this.contentDetails.download_file,
              content_image_link: this.contentDetails.content_image,
              external_link: this.contentDetails.external_link,
              offer_id: this.contentDetails.offer_id,
              item_collection_id: this.contentDetails.item_collection_id,
              meta_title: this.contentDetails.meta_title,
              meta_description: this.contentDetails.meta_description,
              meta_keyword: this.contentDetails.meta_keyword,
              og_title: this.contentDetails.og_title,
              og_description: this.contentDetails.og_description,
              og_image_link: this.contentDetails.og_image == "" ? this.general_setting.platform_meta_logo : this.contentDetails.og_image,
              og_image_meta: this.contentDetails.og_image_meta,
              id: this.contentId,
            });
          }

          this.newItemEvent.emit(this.contentDetails);
          this.getSellerList(this.contentDetails == undefined ? 0 : this.contentDetails.store_id);
        }
      }
    });
  }

  sourceTypeChange(event: any) {
    if (this.contentForm.value.source_type == 8) {
      this.contentForm.patchValue({
        mobile_type: 2
      })
    }
  }

  async getSellerList(storeId: number) {
    this.spinnerService.show('home')
    const data = {
      market_type: 2,
    };
    await this.sellerService.getSellerList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach((el) => {
            el.name =
              el.store_name +
              " (" +
              el.manager_name +
              ") " +
              el.store_area_name +
              ", " +
              el.store_city_name;
            this.store_list.push(el);
          });
          if (storeId == 0 || storeId == null) {
            this.contentForm.controls.store_id.setValue(
              this.store_list[0].store_id
            );
          } else {
            var SelectedStore: any = [];

            this.store_list.forEach((el) => {
              if (Number(el.store_id) == storeId) {
                SelectedStore.push(el);
              }
            });
            this.contentForm.controls.store_id.setValue(
              SelectedStore[0].store_id
            );
          }
        }
        this.spinnerService.hide('home');
        this.getCategoryList();
      },
      error: (error) => {
        this.snackbarService.error(error);
        this.spinnerService.hide('home')
      }
    });
  }

  StoreChange() {
    this.category_list = [];
    this.item_list = [];
    this.contentForm.controls["category_id"].reset();
    this.contentForm.controls["item_id"].reset();
    this.getCategoryList();
  }

  async getCategoryList() {
    const data = {
      store_id: this.contentForm.value.store_id,
    };
    await this.categoryService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.category_list = response.data;
          var selectedCategory: number = null;
          if (this.contentDetails) {
            this.contentForm.controls.category_id.setValue(
              this.contentDetails.category_id
            );
          }
          if (this.contentForm.get("category_id").value != null) {
            this.category_list.forEach((element) => {
              if (
                element.category_id == this.contentForm.get("category_id").value
              ) {
                selectedCategory = element.category_id;
              }
            });
            this.contentForm.controls.category_id.setValue(selectedCategory);
            this.getItemList();
          }
        }
      },
      error: (error) => {
        this.snackbarService.error(error);
      }
    });
  }

  ChangeCategory() {
    this.contentForm.controls["item_id"].reset();
    this.getItemList();
  }

  async getItemList() {
    const data = {
      store_id: this.contentForm.value.store_id,
      categories: this.contentForm.value.category_id,
      page: 1,
      search_query: "",
      search_type: 1,
      user_id: this.main.LoggedUserInfo.user_id,
    };
    await this.itemService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.item_list = response.data;

          var selectedItem: number = null;
          this.contentForm.controls.item_id.setValue(this.contentDetails.item_id);
          if (this.contentForm.get("item_id").value != null) {
            this.item_list.forEach((element) => {
              if (element.item_id == this.contentForm.get("item_id").value) {
                selectedItem = element.item_id;
              }
            });
            this.contentForm.controls.item_id.setValue(selectedItem);
          }
        } else {
          this.snackbarService.error(response.message);
          this.item_list = [];
        }
      },
      error: (error) => {
        this.snackbarService.error(error);
      }
    });
  }

  async getOfferList() {
    const data = {
      search_query: "",
      remove_single_use_offers: 1,
      offer_type: 1,
    };

    await this.bannerService.getOffersList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach((element) => {
            element.name = element.title + " (" + element.discount_code + ")";
          });
          this.offer_list = response.data;

          var selectedOffer: number = null;

          if (this.contentForm.get("offer_id").value != null) {
            this.offer_list.forEach((element) => {
              if (element.offer_id == this.contentForm.get("offer_id").value) {
                selectedOffer = element.offer_id;
              }
            });
            this.contentForm.controls.offer_id.setValue(selectedOffer);
          }

          this.getCollectionList();
        } else {
          this.getCollectionList();
        }
      },
      error: (error) => {
        this.snackbarService.error(error);
      }
    });
  }

  async getCollectionList() {
    const data = {
      page: 0,
      search_query: "",
      sort_field: "",
      sort_type: "",
    };

    this.itemCollectionService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.collection_list = response.data;

          var selectedCollection: string = "";

          if (this.contentForm.get("item_collection_id").value != null) {
            this.collection_list.forEach((element) => {
              if (
                element.item_collection_id == this.contentForm.get("item_collection_id").value
              ) {
                selectedCollection = element.item_collection_id;
              }
            });
            this.contentForm.controls.item_collection_id.setValue(
              selectedCollection
            );
          }
        }
      },
      error: (error) => {
        this.snackbarService.error(error);
      }
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

  selectFile(event: Event, type: string) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const selectedFile = fileInput.files[0]; // Get the selected file

      if (selectedFile.name.indexOf(".") > -1) {
        var extension = selectedFile.name.split(".").pop().toLowerCase();
      } else {
        var extension = selectedFile.name.split("/").pop().toLowerCase();
      }

      var extensionList = ["png", "PNG", "jpg", "jpeg", "svg"];

      const isDownloadFile: boolean = (type == "download_file");

      if (isDownloadFile) {
        extensionList.push("pdf", "doc", "docx", "DOC", "DOCX", "zip","xls","xlsx","txt","rtf","ppt","pptx");
      }

      if (
        $.inArray(extension, extensionList) == -1
      ) {
        this.snackbarService.error(
          this.translateService.instant(isDownloadFile ? "PLEASE_SELECT_JPG_JPEG_PNG_SVG_PDF_DOC_DOCX_ZIP_FORMAT_FILE" : "PLEASE_SELECT_JPG_JPEG_PNG_SVG_FORMAT_FILE"
          )
        );
        return false;
      } else if (selectedFile.size / 1024 >= (isDownloadFile ? 5120 : 2048)) {
        var errorMessage = "IMAGE_SIZE_SHOULD_BE_LESS_THAN_" + (isDownloadFile ? 5 : 2) + "_MB";
        this.snackbarService.error(
          this.translateService.instant(errorMessage)
        );
        return false;
      } else {
        if (isDownloadFile) {
          this.contentForm.patchValue({
            download_file: selectedFile,
          });
        } else if (type == "og_image") {
          this.contentForm.patchValue({
            og_image: selectedFile,
          });
        }
        else if (type == "content_image") {
          this.contentForm.patchValue({
            content_image: selectedFile,
          });
        }
        this.contentForm.get(type).updateValueAndValidity();
      }
    }
  }

  RemoveFile(type) {
    this.contentForm.controls[type].setValue("");
  }

  clear(type) {
    if (type == "category_id") {
      this.item_list = [];
    }
    this.contentForm.controls[type].reset();
  }

  clearSEOData() {
    this.contentForm.controls["meta_title"].reset();
    this.contentForm.controls["meta_description"].reset();
    this.contentForm.controls["meta_keyword"].reset();
    this.contentForm.controls["og_title"].reset();
    this.contentForm.controls["og_description"].reset();
    this.contentForm.controls["og_image_meta"].reset();
  }

  controlHasError(validation, controlName) {
    const control = this.contentForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  get patternError() {
    return this.contentForm.controls;
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.contentForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  onContentSubmit() {
    if (!this.contentForm.valid) {
      const controls = this.contentForm.controls;
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
    } else {
      // Create a FormData object and append all form data to it
      const formData = new FormData();

      //Iterate through all form controls and append their values to the FormData object
      Object.keys(this.contentForm.controls).forEach((controlName) => {
        const control = this.contentForm.get(controlName);

        // Check if the control is a file input
        if (control instanceof FileList) {
          // Append each file in the FileList to the FormData object
          for (let i = 0; i < control.length; i++) {
            const fileInput = this.contentForm.get(controlName);

            if (fileInput && fileInput.value) {
              formData.append(controlName, fileInput.value.files[0]);
            }
          }
        } else {
          // Append regular form control values
          formData.append(controlName, control.value);
        }
      });

      this.pageManagementService.add(formData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.snackbarService.success(response.message);
            if (this.languageList.length == 1) {
              this.router.navigate([`/page-management`]);
            }
            if (this.pageId != 0) {
              this.getDetails(false);
            }
          } else {
            this.snackbarService.error(response.message);
          }
        },
        error: (error) => {
          this.snackbarService.error(error);
        }
      });
    }
  }

  cancelClick() {
    history.back();
  }

  onChange(event) {
    const isChecked = event.target.checked;
    if (isChecked == true) {
      this.getDetails(true);
    }
  }

  //Start angular-editor angular component validation for image required with maximum 1MB size
  handleEditorInput(event: Event, controlName: string): void {
    const editorContent = (event.target as any).innerHTML;
    this.validateImages(editorContent, controlName);
  }

  validateImages(content: string, controlName: string): void {
    const imgRegex = /<img.*?src="(.*?)".*?>/g;
    const matches = content.match(imgRegex);

    if (matches) {
      for (const match of matches) {
        const imgSrcRegex = /src="(.*?)"/;
        const srcMatch = match.match(imgSrcRegex);

        if (srcMatch) {
          const imageUrl = srcMatch[1];
          this.validateImageSize(imageUrl, controlName);
        }
      }
    }
  }

  validateImageSize(imageUrl: string, controlName: string): void {
    // Fetch the image size or use other methods to determine the size
    // For simplicity, let's assume you have a function to get the image size
    this.getImageSize(imageUrl).then((sizeInBytes) => {
      const sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > 1) {
        // Clear the editor content or display an error message
        this.contentForm.get(controlName).setValue('');
        this.snackbarService.error('Image size should be less than 1 MB');
      }
    });
  }

  getImageSize(imageUrl: string): Promise<number> {
    // Implement a function to get the image size (e.g., using a HEAD request)
    return new Promise((resolve, reject) => {
      // Example using an Image element (may not work for cross-origin images)
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth * img.naturalHeight);
      img.onerror = () => reject(new Error('Error loading image'));
      img.src = imageUrl;
    });
  }
  //End angular-editor angular component validation for image required with maximum 1MB size
}
