import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'src/app/services/custom/spinner.service';
import { TranslateService } from "@ngx-translate/core";
import { ItemAttributeService } from 'src/app/services/lookup/item-attribute.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-select-sub-category',
  templateUrl: './select-sub-category.component.html',
  styleUrls: ['./select-sub-category.component.scss']
})
export class SelectSubCategoryComponent implements OnInit {

  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  @Input() receivedSubCategory: any;

  public addSubCategoryForm: FormGroup
  storeTypeList: any = [];
  parentCategoryList: any = [];
  subCategoryList: any = [];
  storeType_id_obj: any;
  cat_id_obj: any;
  subCat_id_obj: any = [];
  subCatIds: any = []

  SelectedSubCategory: any = [];

  generalSetting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  store_label = this.generalSetting.store_label;
  style_obj_select_sub_category: any;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private itemAttributeService: ItemAttributeService,
    private spinner: SpinnerService,
    public translate: TranslateService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_select_sub_category = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    if (this.receivedSubCategory.length > 0) {
      this.SelectedSubCategory = this.receivedSubCategory;
    }

    this.loadForm();
    this.storeTypeListRecord();

  }

  loadForm() {
    this.addSubCategoryForm = this.formBuilder.group({
      store_types: [''],
      category: [''],
      subCategory: ['']
    });
  }

  async storeTypeListRecord() {
    this.spinner.show();
    var data = {
    };
    await this.itemAttributeService.getStoreTypeList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.storeTypeList = response.data;
          this.storeType_id_obj = this.storeTypeList[0]
          this.addSubCategoryForm.controls["store_types"].setValue(this.storeType_id_obj)
          if (this.storeType_id_obj.category_id > 0) {
            this.categoryListRecord();
          }
        }
      },
      error: (error) => {
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  async categoryListRecord() {
    this.spinner.show();
    var data = {
      category_id: this.storeType_id_obj.category_id
    };
    await this.itemAttributeService.getCategoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.parentCategoryList = response.data;
          this.cat_id_obj = this.parentCategoryList[0];
          this.addSubCategoryForm.controls['category'].setValue(this.cat_id_obj);
          if (this.cat_id_obj.parent_category_id != null) {
            this.subCategoryListRecord();
          }
        }
      },
      error: (error) => {
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  async subCategoryListRecord() {
    this.spinner.show();
    var data = {
      parent_category_id: this.cat_id_obj.parent_category_id
    };
    await this.itemAttributeService.getSubCategoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.subCategoryList = [{ sub_category_id: 0, sub_category_name: "All" }];
          response.data.forEach(item => {
            this.subCategoryList.push(item)
          });
        }
      },
      error: (error) => {
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  storetypeChange(event) {
    this.storeType_id_obj = this.addSubCategoryForm.value.store_types;
    this.categoryListRecord();
  }

  categoryChange(event) {
    this.addSubCategoryForm.controls['subCategory'].setValue('');
    this.cat_id_obj = this.addSubCategoryForm.value.category;
    this.subCategoryListRecord();
  }

  subCategoryChange(event) {
    if (event.length > 0 && event[event.length - 1].sub_category_id == 0) {
      this.subCat_id_obj = [];
      this.subCategoryList.forEach(element => {
        if (element.sub_category_id != 0) {
          this.subCat_id_obj.push(element)
        }
      });
    } else {
      this.subCat_id_obj = [];
      this.addSubCategoryForm.value.subCategory.forEach(element => {
        if (element.sub_category_id != 0) {
          this.subCat_id_obj.push(element)
        }
      })
    }
    this.addSubCategoryForm.controls['subCategory'].setValue(this.subCat_id_obj)
  }
  /** Submit subcategory data. */
  onSubmit() {
    this.subCatIds = [];

    this.subCat_id_obj.forEach(element => {
      this.subCatIds.push(element.sub_category_id)
    })

    if (this.subCatIds.length == 0) {
      this.toastr.error(this.translate.instant('SELECT_SUB_CATEGORY'));
      return this.addSubCategoryForm;
    }

    this.subCatIds.forEach(idName => {

      var filterData;
      var duplicate;

      this.SelectedSubCategory.forEach(element => {
        if (element.sub_category_id == idName) {
          duplicate = true;
        }
      })

      if (duplicate == true) {
        this.toastr.error(this.translate.instant('SUB_CATEGORY_ALREADY_EXIST'));
      } else {
        this.subCategoryList.forEach(item => {
          if (item.sub_category_id == idName) {
            filterData = item
          }
        })
      }

      if (filterData) {
        var data = {
          sub_category_id: filterData.sub_category_id,
          sub_category_name: filterData.sub_category_name,
          store_type_category_id: this.storeType_id_obj.category_id,
          category_type_name: this.storeType_id_obj.category_name,
          category_id: this.cat_id_obj.parent_category_id,
          category_name: this.cat_id_obj.parent_category_name
        }

        this.SelectedSubCategory.push(data);

        this.toastr.success(this.translate.instant('SUB_CATEGORY_ADD_SUCCESSFUL'))
      }
    })
    this.subCat_id_obj = []
    this.addSubCategoryForm.controls['subCategory'].setValue('');
    this.passEntry.emit(this.SelectedSubCategory);

  }

  removeValue(item) {
    if (item != undefined) {
      this.SelectedSubCategory.splice($.inArray(item, this.SelectedSubCategory), 1);
    }
  }

  removeAllValue() {
    if (this.SelectedSubCategory.length > 0) {
      Swal.fire({
        title: this.translate.instant("ARE_YOU_SURE"),
        text: this.translate.instant("DELETE"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        cancelButtonText: this.translate.instant("CANCEL"),
        confirmButtonText: this.translate.instant("OK"),
      }).then((result) => {
        if (result.value) {
          this.removeAllValueConfirm();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          console.log("cancelled");
        }
      });
    } else {
      this.toastr.error(this.translate.instant('NO_SUB_CATEGORY_EXIST_FOR_DELETE'));
    }
  }

  removeAllValueConfirm() {
    this.SelectedSubCategory = [];
    this.passEntry.emit(this.SelectedSubCategory);
  }

}
