import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import { CategoryTypeService } from 'src/app/services/lookup/category-type.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-type-add',
  templateUrl: './category-type-add.component.html',
  styleUrls: ['./category-type-add.component.scss']
})
export class CategoryTypeAddComponent implements OnInit, AfterViewInit {
  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  is_display_is_eatery = parseFloat(this.general_setting.eatery_module);
  is_allow_wholeseller = parseFloat(this.general_setting.allow_wholeseller);
  store_label = this.general_setting.store_label;
  main: any;
  category_type_id: any = 0;
  public formGroup: UntypedFormGroup;
  store_type_list = [];
  category_id: any = 0;
  temp = [];
  fileInput: any;
  image_changed_event: any;
  file: any;
  @ViewChild('cursor') cursor
  categoryImages = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private categoryTypeService: CategoryTypeService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    public commonService: CommonService,
    private toastr: ToastrService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/category-type/edit") > -1) {
      this.category_type_id = this.cryptoService.decryptIdValue(
        "lookup_categoryType_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.category_type_id == undefined) {
        this.router.navigate(["/category-type"]);
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
    this.formGroup = this.formBuilder.group({
      category_image: new UntypedFormControl("assets/icons/no_image.svg"),
      parent_category_description: new UntypedFormControl(''),
      parent_category_id: new UntypedFormControl(null),
      store_types: new UntypedFormControl(null, [Validators.required]),
      create_subcategory: new UntypedFormControl(false),
      all_eatery: new UntypedFormControl(false),
      all_store: new UntypedFormControl(false),
      all_wholesale: new UntypedFormControl(false),
      category_name: ["", Validators.required]
    });

    this.categoryListRecord()
    if (this.category_type_id != undefined) {
      this.getCategoryTypeDetails();
    }
  }

  async categoryListRecord() {
    await this.categoryTypeService.getStoreTypeList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.store_type_list = response.data;
          this.store_type_list.forEach(el => {
            el.category_id = el.category_id.toString();
          })
          this.cdr.detectChanges()
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }

  async getCategoryTypeDetails() {
    var data = {
      parent_category_id: this.category_type_id,
    };
    await this.categoryTypeService.getById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.formGroup.patchValue({
            category_image: response.data.category_image,
            parent_category_description: response.data.parent_category_description,
            parent_category_id: response.data.parent_category_id,
            category_name: response.data.parent_category_name,
            user_id: this.main.LoggedUserInfo.user_id,
            create_subcategory: false,
            all_eatery: false,
            all_store: false,
            all_wholesale: false,
            store_types: response.data.category_id?.toString().split(',')
          });
          if (this.formGroup.value.category_image != null || this.formGroup.value.category_image != undefined || this.formGroup.value.category_image != "") {
            this.categoryImages = true
          }
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
  }

  /** Change data while select other checkbox  */
  stateChanged(event: any, type: any) {
    this.temp = []
    if (this.formGroup.value.all_store == true) {
      this.store_type_list.forEach(element => {
        this.temp.push(element.category_id)
      });
      this.formGroup.controls['store_types'].setValue(this.temp)
    }
    if (this.formGroup.value.all_eatery == true) {
      this.store_type_list.forEach(element => {
        if (element.iseatery == 1) {
          this.temp.push(element.category_id)
        }
      });
      this.formGroup.controls['store_types'].setValue(this.temp)
    }
    if (this.formGroup.value.all_wholesale == true) {
      this.store_type_list.forEach(element => {
        if (element.is_whole_seller == 1) {
          this.temp.push(element.category_id)
        }
      });
      this.formGroup.controls['store_types'].setValue(this.temp)
    }
    if (this.formGroup.value.all_store == false && this.formGroup.value.all_eatery == false && this.formGroup.value.all_wholesale == false) {
      this.formGroup.controls['store_types'].setValue(null)
    }
  }

  removeImage() {
    this.formGroup.controls['category_image'].setValue("assets/icons/no_image.svg")
    this.file = null;
  }

  onFileChange(event: any): any {
    this.file = event.target.files[0];
    if (this.file.name.indexOf('.') > -1) {
      var extension = this.file.name.split(".").pop().toLowerCase();
    } else {
      var extension = this.file.name.split('/').pop().toLowerCase();
    }
    if ($.inArray(extension, ['png', 'PNG', 'jpg', 'jpeg']) == -1) {
      this._snackbarService.error(this.translate.instant('PLEASE_SELECT_JPG_JPEG_PNG_FORMAT_LOGO'));
      this.file = ''
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = (event: any) => {
      this.formGroup.controls['category_image'].setValue(event.target.result)
      this.cdr.detectChanges();
    }
    this.image_changed_event = event;
  }

  triggerSelectFile(fileInput: HTMLInputElement) {
    fileInput.click();
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

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  cancelClick() {
    history.back();
  }

  /** Submit edited/new category type data */
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    }
    else {
      if ((this.file == undefined || this.file == null) && !this.categoryImages) {
        this.toastr.error(this.translate.instant('PLEASE_SELECT_CATEGORY_LOGO'));
        return;
      }
      var fd = new FormData()
      if (this.category_type_id) {
        fd.append("parent_category_id", this.formGroup.value.parent_category_id)
      }
      else {
        fd.append("create_subcategory", this.formGroup.value.create_subcategory == false ? '' : this.formGroup.value.create_subcategory)
      }
      fd.append("user_id", this.main.LoggedUserInfo.user_id)
      fd.append("parent_category_name", this.formGroup.value.category_name)
      fd.append("parent_category_description", this.formGroup.value.parent_category_description)
      fd.append("category_id", this.formGroup.value.store_types?.toString().split(','))
      if (this.file != null) {
        fd.append("category_image", this.file)
      }
      this.categoryTypeService.manageStoreCategories(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/category-type`]);
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {
          this._snackbarService.error(error.name);
        },
        complete: () => {
        },
      });
    }
  }
}