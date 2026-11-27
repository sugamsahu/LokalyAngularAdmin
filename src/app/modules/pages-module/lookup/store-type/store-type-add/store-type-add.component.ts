import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { StoreTypeService } from 'src/app/services/lookup/store-type.service';
import { ToastrService } from 'ngx-toastr';
import { find } from "lodash";

@Component({
  selector: 'app-store-type-add',
  templateUrl: './store-type-add.component.html',
  styleUrls: ['./store-type-add.component.scss']
})
export class StoreTypeAddComponent implements OnInit, AfterViewInit {
  storeTypeId: any;
  main;
  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  store_label = this.general_setting.store_label;
  file: any;
  category_images: any;
  category_icon: any;
  category_black_icon: any;
  category_big_icon: any;
  category_customer_icon: any;
  is_display_whole: any;
  is_display_is_eatery: any
  public storeTypeForm: UntypedFormGroup;
  @ViewChild("cursor") cursor;
  available_notes: any = []

  constructor(
    private router: Router,
    public translate: TranslateService,
    private appComponent: AppComponent,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private storeTypeService: StoreTypeService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;

    if (location.href.indexOf("/store-type/edit") > -1) {
      this.storeTypeId = this.cryptoService.decryptIdValue(
        "lookup_storeType_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.storeTypeId == undefined) {
        this.router.navigate(["/store-type"]);
      }
    }
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.displayConditions();
    this.loadForm();

    if (this.storeTypeId) {
      this.getData();
    }    

  }
  /** Display data as per general settings data */
  displayConditions() {
    if (this.general_setting) {
      this.is_display_whole = Number(this.general_setting.allow_wholeseller);
      this.is_display_is_eatery = Number(this.general_setting.eatery_module);;
    }
    else {
      this.is_display_whole = Number(this.main.allow_wholeseller);
      this.is_display_is_eatery = Number(this.main.eatery_module);
    }
  }

  loadForm() {
    this.storeTypeForm = this.formBuilder.group({
      category_name: ["", Validators.required],
      category_description: [""],
      is_whole_seller: [false],
      iseatery: [false],
      item_type: [''],
      category_label: [''],
      mask_image: ['0'],
      prescription: ['0'],
      category_images: ['assets/icons/no_image.svg'],
      category_icon: ['assets/icons/no_image.svg'],
      category_black_icon: ['assets/icons/no_image.svg'],
      category_big_icon: ['assets/icons/no_image.svg'],
      category_customer_icon: ['assets/icons/no_image.svg'],
      note_tags: [""]

    });
  }
  /** Get store type details using service */
  getData() {
    let data = {
      category_id: this.storeTypeId,
    };
    this.storeTypeService.getById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.storeTypeForm.setValue({
            category_name: response.data.category_name,
            category_description: response.data.category_description,
            is_whole_seller: response.data.is_whole_seller == 1 ? true : false,
            iseatery: response.data.iseatery == 1 ? true : false,
            item_type: response.data.item_type,
            category_label: response.data.category_label,
            mask_image: response.data.mask_image,
            prescription: response.data.prescription,
            category_images: response.data.category_images,
            category_icon: response.data.category_icon,
            category_black_icon: response.data.category_black_icon,
            category_big_icon: response.data.category_big_icon,
            category_customer_icon: response.data.category_customer_icon,
            note_tags: '',
          });
          if(response.data.category_tag_name){            
            this.available_notes = response.data.category_tag_name.split(",")
          }else{
            this.available_notes=[]
          }          
        }
      },
      error: (error) => {

        this._snackbarService.error(error);
      },
      complete: () => {

      },
    });
  }

  triggerSelectFile(id, label: any) {
    if (label == 'Store_banner') {
      id: HTMLInputElement
      id.click();
    } else if (label == 'small_white') {
      id: HTMLInputElement
      id.click(label == 'small_white');
    } else if (label = 'small_black') {
      id: HTMLInputElement
      id.click(label == 'small_black');
    } else if (label == 'edge_to_edge') {
      id: HTMLInputElement
      id.click(label == 'edge_to_edge');
    } else if (label == 'logo_with_margin') {
      id: HTMLInputElement
      id.click(label == 'logo_with_margin');
    }
  }

  onFileChange(event: any, label): any {
    this.file = event.target.files[0];
    if (this.file.name.indexOf('.') > -1) {
      var extension = this.file.name.split(".").pop().toLowerCase();
    } else {
      var extension = this.file.name.split('/').pop().toLowerCase();
    }
    if ($.inArray(extension, ['png', 'PNG', 'jpg', 'jpeg']) == -1) {
      this.toastr.error(this.translate.instant('PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_LOGO'));
      this.file = ''
      return;
    } else if (this.file.size / 1024 >= 2048) {
      this.toastr.error(this.translate.instant('IMAGE_SIZE_SHOULD_BE_LESS_THAN_2_MB'));
      this.file = ''
      return false;
    }

    if (label == 'Store_banner') {
      this.category_images = this.file;
    } else if (label == 'small_white') {
      this.category_icon = this.file;
    } else if (label == 'small_black') {
      this.category_black_icon = this.file;
    } else if (label == 'edge_to_edge') {
      this.category_big_icon = this.file;
    } else if (label == 'logo_with_margin') {
      this.file
      this.category_customer_icon = this.file;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.file);

    reader.onload = (event: any) => {
      if (label == 'Store_banner') {
        this.storeTypeForm.controls['category_images'].setValue(event.target.result);
      }
      else if (label == 'small_white') {
        this.storeTypeForm.controls['category_icon'].setValue(event.target.result);
      }
      else if (label == 'small_black') {
        this.storeTypeForm.controls['category_black_icon'].setValue(event.target.result);
      }
      else if (label == 'edge_to_edge') {
        this.storeTypeForm.controls['category_big_icon'].setValue(event.target.result);
      }
      else if (label == 'logo_with_margin') {
        this.storeTypeForm.controls['category_customer_icon'].setValue(event.target.result);
      }
      this.cdr.detectChanges();
    }
  }

  removeImage(label) {
    if (label == "Store_banner") {
      this.category_images = null;
      this.storeTypeForm.controls['category_images'].setValue("assets/icons/no_image.svg")
    } else if (label == 'small_white') {
      this.category_icon = null;
      this.storeTypeForm.controls['category_icon'].setValue("assets/icons/no_image.svg")
    } else if (label == 'small_black') {
      this.category_black_icon = null;
      this.storeTypeForm.controls['category_black_icon'].setValue('assets/icons/no_image.svg');
    } else if (label == 'edge_to_edge') {
      this.category_big_icon = null;
      this.storeTypeForm.controls['category_big_icon'].setValue('assets/icons/no_image.svg');
    } else if (label == 'logo_with_margin') {
      this.category_customer_icon = null;
      this.storeTypeForm.controls['category_customer_icon'].setValue('assets/icons/no_image.svg');
    }
  }
  /** Submit edit/new store type data */
  onSubmit() {
    if (!this.storeTypeForm.valid) {
      const controls = this.storeTypeForm.controls;
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


      let formData = new FormData()
      formData.append("user_id", this.main.LoggedUserInfo.user_id);
      formData.append("category_name", this.storeTypeForm.value.category_name);
      formData.append("category_description", this.storeTypeForm.value.category_description);
      if (this.category_images != null || this.category_images != undefined) {
        formData.append("category_images", this.category_images);
      } else {
        if (this.storeTypeForm.value.category_images == 'assets/icons/no_image.svg') {
          this.toastr.error(this.translate.instant('PLEASE_SELECT_STORE_LOGO_BANNER'))
          return this.storeTypeForm;
        }
      }
      if (this.category_icon != null || this.category_icon != undefined) {
        formData.append("category_icon", this.category_icon);
      }

      if (this.category_black_icon != null || this.category_black_icon != undefined) {
        formData.append("category_black_icon", this.category_black_icon);
      }

      if (this.category_big_icon != null || this.category_big_icon != undefined) {
        formData.append("category_big_icon", this.category_big_icon);
      }

      if (this.category_customer_icon != null || this.category_customer_icon != undefined) {
        formData.append("category_customer_icon", this.category_customer_icon);
      }

      formData.append("item_type", this.storeTypeForm.value.item_type);
      formData.append("mask_image", this.storeTypeForm.value.mask_image);
      formData.append("prescription", this.storeTypeForm.value.prescription);
      formData.append("category_label", this.storeTypeForm.value.category_label);
      formData.append("is_whole_seller", this.storeTypeForm.value.is_whole_seller == true ? '1' : '0');
      formData.append("iseatery", this.storeTypeForm.value.iseatery == true ? '1' : '0');
      formData.append("category_tag_name",this.available_notes);

      if (this.storeTypeId) {
        formData.append("category_id", this.storeTypeId);
      }

      this.storeTypeService.add(formData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/store-type`]);
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {

          this._snackbarService.error(error);
        },
        complete: () => {

        },
      });
    }
  }

  onEnter(event: KeyboardEvent): void {
    event.preventDefault(); 
    if (!this.storeTypeForm.valid) {
      const controls = this.storeTypeForm.controls;
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
    const control = this.storeTypeForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  @ViewChild("tagInput") tagInputRef: ElementRef;
  tags: string[] = [];

  removeTag(i?:any): void {
    this.available_notes.splice(i, 1);
  }
  onKeyUp(event: KeyboardEvent): void{
    const inputValue: string = this.storeTypeForm.controls.note_tags.value;
      if (event.code === "Backspace" && !inputValue) {
        this.removeTag();
        return;
      } else {
        if (event.code === "Comma" || event.code === "Enter" || event.code === "NumpadEnter") {
          this.addTag(inputValue);
          this.storeTypeForm.controls.note_tags.setValue('');
        }
      }
  }

  addTag(tag: string): void {
    var split_tag = tag.split(',')
    tag =split_tag[0]
    if (tag.length > 0 && !find(this.tags, tag)) {
      this.available_notes.push(tag);
    }    
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  cancelClick() {
    history.back();
  }
  

}
