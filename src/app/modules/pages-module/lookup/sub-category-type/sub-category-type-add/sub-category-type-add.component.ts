import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { CommonService } from 'src/app/services/common.service';
import { SubCategoryTypeService } from 'src/app/services/lookup/sub-category-type.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sub-category-type-add',
  templateUrl: './sub-category-type-add.component.html',
  styleUrls: ['./sub-category-type-add.component.scss']
})
export class SubCategoryTypeAddComponent implements OnInit, AfterViewInit {
  main: any = { LoggedUserInfo: {} };
  sub_category_type_id: any = 0;
  formGroup: FormGroup;
  category_list = [];
  @ViewChild('cursor') cursor;
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private subCategoryTypeService: SubCategoryTypeService,
    public commonService: CommonService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/sub-category-type/edit") > -1) {
      this.sub_category_type_id = this.cryptoService.decryptIdValue(
        "lookup_subCategoryType_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );

      if (this.sub_category_type_id == undefined) {
        this.router.navigate(["/sub-category-type"]);
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
      selected_category: new FormControl(null),
      sub_category_name: new FormControl(null, [Validators.required]),
      sub_category_description: new FormControl(null),
      user_id: new FormControl(this.main.LoggedUserInfo.user_id),
    });

    this.parentCategoryListRecord()

    if (this.sub_category_type_id) {
      this.getCategoryTypeDetails();
    }
    this.cdr.detectChanges();
  }
  /** Submit edit/new sub category type data  */
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
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


      let data = {};
      if (this.sub_category_type_id) {
        data = {
          sub_category_id: this.sub_category_type_id,
          sub_category_name: this.formGroup.value.sub_category_name,
          sub_category_description: this.formGroup.value.sub_category_description,
          parent_category_id: this.formGroup.value.selected_category,
          user_id: this.main.LoggedUserInfo.user_id,
        };
      } else {
        data = {
          sub_category_name: this.formGroup.value.sub_category_name,
          sub_category_description: this.formGroup.value.sub_category_description,
          parent_category_id: this.formGroup.value.selected_category,
          user_id: this.main.LoggedUserInfo.user_id,
        };
      }
      this.subCategoryTypeService.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/sub-category-type`]);
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {
          this._snackbarService.error(error);
        },
        complete: () => { },
      });
    }
  }

  selectedCategoryEdit = ''
  getCategoryTypeDetails() {

    var data = {
      sub_category_id: this.sub_category_type_id,
    };
    this.subCategoryTypeService.getById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.formGroup.patchValue({
            selected_category: response.data[0].parent_category_id,
            sub_category_name: response.data[0].sub_category_name,
            sub_category_description: response.data[0].sub_category_description,
            user_id: this.main.LoggedUserInfo.user_id,
          });
          this.cdr.detectChanges();
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
  }

  async parentCategoryListRecord() {

    var data = {
      token_type: 1,
    };
    await this.subCategoryTypeService.getParentCategoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.category_list = response.data;
          if (!this.sub_category_type_id) {
            this.formGroup.controls['selected_category'].setValue(this.category_list[0].parent_category_id.toString());
          }
          this.cdr.detectChanges()

        }
      },
      error: (error) => {

      },
      complete: () => {

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

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }
}
