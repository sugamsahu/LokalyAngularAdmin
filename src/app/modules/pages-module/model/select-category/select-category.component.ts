import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { TranslateService } from "@ngx-translate/core";
import { ItemAttributeService } from "src/app/services/lookup/item-attribute.service";
import Swal from "sweetalert2";
import { CategoryService } from "src/app/services/lookup/category.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-select-category",
  templateUrl: "./select-category.component.html",
  styleUrls: ["./select-category.component.scss"],
})
export class SelectCategoryComponent implements OnInit {
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  @Input() receivedSubCategory: any;

  public addSubCategoryForm: UntypedFormGroup;
  storeTypeList: any = [];
  parentCategoryList: any = [];
  subCategoryList: any = [];
  storeType_id_obj: any;
  cat_id_obj: any;
  subCat_id_obj: any = [];
  subCatIds: any = [];
  on_item_type: any;
  SelectedSubCategory: any = [];
  categories = [];
  sub_categories = [];
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  store_label = this.generalSetting.store_label;
  AllCategoryList: any;
  categoryList: { label: string; value: number }[];
  cat_id: { label: string; value: number };
  catIds: string;
  style_obj_select_category: any;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: UntypedFormBuilder,
    private toastr: ToastrService,
    private itemAttributeService: ItemAttributeService,
    private Categoryservice: CategoryService,
    private spinner: SpinnerService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    $(
      "<style>.modal-dialog { max-width: 800px }</style>"
    ).appendTo("body");
    this.style_obj_select_category = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    if (this.on_item_type == 1) {
      this.addSubCategoryForm = this.formBuilder.group({
        category: [""],
      });
    } else {
      this.loadForm();
    }
    this.categoryListRecord();
  }

  loadForm() {
    this.addSubCategoryForm = this.formBuilder.group({
      category: [""],
      subCategory: [""],
    });
  }

  async categoryListRecord() {
    this.spinner.show();
    var data = {
      store_id: this.sellerDetails.store_id,
      for_offer: 1
    };
    await this.Categoryservice.getStoreCategories(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.AllCategoryList = response.data;

          this.categoryList = [{ label: "All", value: 0 }];
          response.data.forEach((cat) => {
            var data = { label: cat.category_name, value: cat.category_id };
            if (cat.category_id > 2) {
              this.categoryList.push(data);
            }
          });
          if (this.on_item_type == 2) {
            this.addSubCategoryForm.controls["category"].setValue(
              this.categoryList[0]
            );
            this.GetSubCategoryList();
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

  async GetSubCategoryList() {
    this.subCategoryList = [];
    this.subCategoryList = [{ label: "All", value: 0 }];
    this.AllCategoryList.forEach((cat) => {
      if (this.addSubCategoryForm.value.category.value == 0) {
        if (cat.sub_categories)
          cat.sub_categories.forEach((subCat) => {
            var data = {
              label: subCat.sub_category_name,
              value: subCat.sub_category_id,
            };
            this.subCategoryList.push(data);
          });
      } else {
        if (this.addSubCategoryForm.value.category.value == cat.category_id) {
          cat.sub_categories.forEach((subCat) => {
            var data = {
              label: subCat.sub_category_name,
              value: subCat.sub_category_id,
            };
            this.subCategoryList.push(data);
          });
        }
      }
    });
  }

  categoryChange(event) {
    if (this.on_item_type == 2) {
      this.GetSubCategoryList();
    } else {
      if (event[event.length - 1].value == 0) {
        this.addSubCategoryForm.controls["category"].setValue(null);
        var cat_id = [];
        this.categoryList.forEach((status) => {
          if (status.value != 0) {
            cat_id.push(status);
          }
        });
        this.addSubCategoryForm.controls["category"].setValue(cat_id);
      }
    }
  }

  subCategoryChange(item) {
    if (item[item.length - 1].value == 0) {
      this.addSubCategoryForm.controls["subCategory"].setValue(null);
      var subcat_id = [];
      this.subCategoryList.forEach((status) => {
        if (status.value != 0) {
          subcat_id.push(status);
        }
      });
      this.addSubCategoryForm.controls["subCategory"].setValue(subcat_id);
    }
  }

  onSubmit() {
    if (this.on_item_type == 1) {
      var catIds = [];
      if (this.addSubCategoryForm.value.category?.length == 0) {
        this.toastr.error(this.translate.instant("SELECT_CATEGORY"));
        return;
      }

      for (var i = 0; i < this.addSubCategoryForm.value.category?.length; i++) {
        catIds.push(parseInt(this.addSubCategoryForm.value.category[i].value));
      }

      var duplicate = false;
      this.categories.forEach((element) => {
        if (duplicate == false) {
          duplicate = catIds.includes(element.category_id) ? true : false;
        }
      });
      if (duplicate) {
        this.toastr.error(
          this.translate.instant("PLEASE_ENTER_DIFFERENT_CATEGORY")
        );
        return;
      }

      this.catIds = catIds.toString();

      catIds.forEach((idName) => {
        var filterData;

        if (
          this.categories.filter(
            (elem) => elem.category_id == idName.toString()
          )[0]
        ) {
        } else {
          filterData = this.categoryList.filter(
            (elem) => elem.value == idName
          )[0];
        }

        if (filterData) {
          var data = {
            category_id: filterData.value,
            category_name: filterData.label,
          };
          this.categories.push(data);
        }
      });
      this.addSubCategoryForm.controls["category"].setValue(null);
      this.passEntry.emit(this.categories);
    } else if (this.on_item_type == 2) {
      var subCatIds = [];
      if (
        this.addSubCategoryForm.value.subCategory == null ||
        this.addSubCategoryForm.value.subCategory.length == 0
      ) {
        this.toastr.error(this.translate.instant("SELECT_SUB_CATEGORY"));
        return;
      }

      for (
        var i = 0;
        i < this.addSubCategoryForm.value.subCategory.length;
        i++
      ) {
        subCatIds.push(
          parseInt(this.addSubCategoryForm.value.subCategory[i].value)
        );
      }

      var duplicate = false;
      this.sub_categories.forEach((element) => {
        if (duplicate == false) {
          duplicate = subCatIds.includes(element.sub_category_id)
            ? true
            : false;
        }
      });
      if (duplicate) {
        this.toastr.error(
          this.translate.instant("PLEASE_ENTER_DIFFERENT_CATEGORY")
        );
        return;
      }

      this.subCatIds = subCatIds.toString();

      subCatIds.forEach((idName) => {
        var filterData;

        if (
          this.sub_categories.filter(
            (elem) => elem.sub_category_id == idName.toString()
          )[0]
        ) {
        } else {
          filterData = this.subCategoryList.filter(
            (elem) => elem.value == idName
          )[0];
        }

        if (filterData) {
          var data = {
            sub_category_id: filterData.value,
            sub_category_name: filterData.label,
          };
          this.sub_categories.push(data);
        }
      });
      this.addSubCategoryForm.controls["subCategory"].setValue(null);
      this.passEntry.emit(this.sub_categories);
    }
    this.toastr.success(
      (this.on_item_type == 1 ? "Category" : "Sub Category") + " Add Successful"
    );
  }

  removeValue(item) {
    if (item != undefined) {
      this.categories.splice($.inArray(item, this.categories), 1);
    }
  }
  removeSubCat(item) {
    if (item != undefined) {
      this.sub_categories.splice($.inArray(item, this.sub_categories), 1);
    }
  }

  removeAllValue() {
    if (
      this.on_item_type == 1
        ? this.categories.length > 0
        : this.sub_categories.length > 0
    ) {
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
      if (this.on_item_type == 1) {
        this.toastr.error(
          this.translate.instant("NO_CATEGORY_EXIST_FOR_DELETE")
        );
      }
      this.toastr.error(
        this.translate.instant("NO_SUB_CATEGORY_EXIST_FOR_DELETE")
      );
    }
  }

  deleteCategory(cat) {
    if (cat == 0) {
      this.categories = [];
    } else {
      this.categories = this.categories.filter((item) => item !== cat);
    }
  }

  removeAllValueConfirm() {
    if (this.on_item_type == 1) {
      this.categories = [];
    } else if (this.on_item_type == 2) {
      this.sub_categories = [];
      this.passEntry.emit("removeAllValueConfirm");
    }
  }
}
