import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { ItemAttributeService } from 'src/app/services/lookup/item-attribute.service';
import { SelectSubCategoryComponent } from '../../../model/select-sub-category/select-sub-category.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-item-attribute-add',
  templateUrl: './item-attribute-add.component.html',
  styleUrls: ['./item-attribute-add.component.scss']
})
export class ItemAttributeAddComponent implements OnInit, AfterViewInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  item_attribute_id: any;
  main:any;
  file: any;
  received_modal_data: any = [];
  newSubItemAttributes: {
    sub_item_attribute_id: any,
    sub_category_id: any,
    sub_item_attribute_name: any
  };
  sub_item_attribute_id: any = 0;
  sub_category_id: any = 0;
  subItemAttributesListArray = []
  counter = 0;
  public itemAttributeForm: UntypedFormGroup;
  @ViewChild('cursor') cursor

  constructor(
    private router: Router,
    public translate: TranslateService,
    private appComponent: AppComponent,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private itemAttributeService: ItemAttributeService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/item-attribute/edit") > -1) {
      this.item_attribute_id = this.cryptoService.decryptIdValue(
        "lookup_itemAttribute_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.item_attribute_id == undefined) {
        this.router.navigate(["/item-attribute"]);
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
    this.newSubItemAttributes = {
      sub_category_id: this.counter + 0,
      sub_item_attribute_id: null,
      sub_item_attribute_name: null
    };

    this.loadForm();

    if (this.item_attribute_id) {
      this.getData();
    }
  }

  loadForm() {
    this.itemAttributeForm = this.formBuilder.group({
      attribute_name: ["", Validators.required],
      description: [''],
      item_attribute_logo: ['assets/icons/no_image.svg'],
      sub_item_attribute_type: ['1'],
      sub_item_attribute_name: [''],
      is_use_in_filter: [false],
      is_active: [true]
    });
  }
  /** Get item attribute data by id using service */
  getData() {

    let data = {
      item_attribute_id: this.item_attribute_id,
    };
    this.itemAttributeService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var newSubItemAttributes: {
            sub_item_attribute_id: any,
            sub_category_id: any,
            sub_item_attribute_name: any
          };
          var count = 1;
          response.data.sub_item_attributes.forEach((element) => {
            newSubItemAttributes = {
              sub_item_attribute_id: element.sub_item_attribute_id,
              sub_item_attribute_name: element.sub_item_attribute_name,
              sub_category_id: count++
            }
            this.subItemAttributesListArray.push(newSubItemAttributes);
          })
          this.received_modal_data = response.data.item_attributes_categories
          this.itemAttributeForm.setValue({
            attribute_name: response.data.attribute_name,
            description: response.data.description,
            item_attribute_logo: response.data.item_attribute_logo == "" ? 'assets/icons/no_image.svg' : response.data.item_attribute_logo,
            sub_item_attribute_type: response.data.sub_attribute_type.toString(),
            sub_item_attribute_name: [''],
            is_use_in_filter: response.data.is_use_in_filter,
            is_active: response.data.is_active == 1 ? true : false
          });
        }
      },
      error: (error) => {

        this._snackbarService.error(error);
      },
      complete: () => {

      },
    });
  }

  triggerSelectFile(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onFileChange(event: any): any {
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
    const reader = new FileReader();
    reader.readAsDataURL(this.file);

    reader.onload = (event: any) => {
      this.itemAttributeForm.controls['item_attribute_logo'].setValue(event.target.result)
      this.cdr.detectChanges();
    }
  }

  removeImage() {
    this.itemAttributeForm.controls['item_attribute_logo'].setValue("assets/icons/no_image.svg")
  }
  /** Open SelectSubCategoryComponent modal */
  openSelectSubCat() {
    const modalRef = this.modalService.open(SelectSubCategoryComponent, {
      size: "lg",

    });
    modalRef.componentInstance.receivedSubCategory = this.received_modal_data;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      if (receivedEntry) {
        this.received_modal_data = receivedEntry;
      } else {
        this.received_modal_data = [];
      }
    });
  }

  addSubItemAttributeName() {
    if (this.sub_category_id == 0) {
      this.newSubItemAttributes = {
        sub_item_attribute_id: null,
        sub_category_id: null,
        sub_item_attribute_name: null
      };

      this.newSubItemAttributes.sub_category_id = ++this.counter;
      this.newSubItemAttributes.sub_item_attribute_id = 0;
      this.newSubItemAttributes.sub_item_attribute_name = this.itemAttributeForm.value.sub_item_attribute_name;
      var duplicateflag = false;

      this.subItemAttributesListArray.forEach((element) => {
        if (element.sub_item_attribute_name == this.itemAttributeForm.value.sub_item_attribute_name) {
          duplicateflag = true;
        }
      });
      if (duplicateflag == false) {
        this.subItemAttributesListArray.push(this.newSubItemAttributes);
      } else {
        this.toastr.error(
          this.translate.instant("VALUE_ALREADY_SELECTED")
        );
      }
    }

    if (this.sub_category_id != 0) {

      var duplicateflag = false;
      this.subItemAttributesListArray.forEach((element) => {
        if (element.sub_item_attribute_name == this.itemAttributeForm.value.sub_item_attribute_name) {
          duplicateflag = true;
        }

        if (element.sub_category_id == this.sub_category_id) {
          element.sub_item_attribute_name = this.itemAttributeForm.value.sub_item_attribute_name;
        }
      });

      if (duplicateflag) {
        this.toastr.error(this.translate.instant("VALUE_ALREADY_SELECTED"));
      }
      this.sub_category_id = 0;
    }

    this.itemAttributeForm.controls["sub_item_attribute_name"].setValue(null);
  }

  editValue(item) {
    this.itemAttributeForm.controls["sub_item_attribute_name"].setValue(item.sub_item_attribute_name);
    this.sub_category_id = item.sub_category_id;
  }

  removeValue(item) {
    if (item != undefined) {
      this.subItemAttributesListArray.splice($.inArray(item, this.subItemAttributesListArray), 1);
    }
  }
  /** Submit edited/new item attribute */
  onSubmit() {
    if (!this.itemAttributeForm.valid) {
      const controls = this.itemAttributeForm.controls;
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

      if (!this.itemAttributeForm) {
      }

      let formData = new FormData()

      formData.append('user_id', this.main.LoggedUserInfo.user_id);
      formData.append('attribute_name', this.itemAttributeForm.value.attribute_name);

      if (this.itemAttributeForm.value.description != undefined && this.itemAttributeForm.value.description != null && this.itemAttributeForm.value.description != '') {
        formData.append('description', this.itemAttributeForm.value.description);
      }
      else {
        formData.append('description', '');
      }
      if (this.itemAttributeForm.get('item_attribute_logo').value != 'assets/icons/no_image.svg') {
        formData.append('item_attribute_logo', this.file);
      } else {
        formData.append('item_attribute_logo', "");
        formData.append('is_image_delete', '1');
      }

      if (this.received_modal_data.length > 0) {
        formData.append('applicable_sub_categories', JSON.stringify(this.received_modal_data))
      }

      formData.append('sub_item_attribute_type', this.itemAttributeForm.value.sub_item_attribute_type)

      if (this.received_modal_data.length == 0) {
        this.toastr.error(this.translate.instant('SELECT_ATLEAST_ONE_SUB_CATEGORY'));
        return this.itemAttributeForm
      }

      if (this.subItemAttributesListArray) {
        if (this.itemAttributeForm.value.sub_item_attribute_type == '1' && this.subItemAttributesListArray.length == 0) {
          this.toastr.error(this.translate.instant('ENTER_ATLEAST_ONE_VALUE'));
          return this.itemAttributeForm
        } else {
          formData.append('sub_item_attribute_value', JSON.stringify(this.subItemAttributesListArray))
        }
      }

      formData.append('is_use_in_filter', this.itemAttributeForm.value.is_use_in_filter == true ? '1' : '0')

      formData.append('is_active', this.itemAttributeForm.value.is_active == true ? '1' : '0')

      if (this.item_attribute_id) {
        formData.append('item_attribute_id', this.item_attribute_id);
        var data = formData;
      }
      else {
        var data = formData;
      }

      this.itemAttributeService.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/item-attribute`]);
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
    const control = this.itemAttributeForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  cancelClick() {
    history.back();
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }
}