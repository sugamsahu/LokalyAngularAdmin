import { data } from 'jquery';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";

import { CryptoService } from "src/app/services/custom/crypto.service";
import { PageManagementService } from "src/app/services/page-management.service";
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-page-management-add",
  templateUrl: "./page-management-add.component.html",
  styleUrls: ["./page-management-add.component.scss"],
})
export class PageManagementAddComponent implements OnInit {
  public formGroup: UntypedFormGroup;
  file: any;
  imageChangedEvent: any;
  main;
  pageId: any = 0;
  general_setting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  customer_User_Id: any = 0;
  constructor(
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private el: ElementRef,
    public commonService: CommonService,
    private _snackbarService: ToastrService,
    private cdr: ChangeDetectorRef,
    private appComponent: AppComponent,
    private pageManagementService: PageManagementService,
    private router: Router,
    private cryptoService: CryptoService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    if (location.href.indexOf("/page-management/edit") > -1) {
      this.pageId = this.cryptoService.decryptIdValue(
        "page_mgmt_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.pageId == undefined) {
        this.router.navigate(["/page-management"]);
      }
    }
  }

  ngOnInit() {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin)  {
      this.router.navigate(['/dashboard']);
      return;
    }
    if (location.href.indexOf("/page-management/edit") > -1) {
      this.pageId = this.cryptoService.decryptIdValue(
        "page_mgmt_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );

      if (this.pageId == 0) {
        this.router.navigate(["/page-management"]);
      }
    }

    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.formGroup = this.formBuilder.group({
      page_title: ["", Validators.required],
      page_slug: ["", Validators.required],
      page_icon_mob: new UntypedFormControl(this.general_setting.mobile_logo),
      sequence_no: ["", Validators.required],
      is_active: new UntypedFormControl(true),
      portal_display: new UntypedFormControl(true),
      mobile_display: new UntypedFormControl(true),
      page_id: new UntypedFormControl(null),
    });

    // Listen for changes in the page_title control
    if (this.pageId == 0) {
      this.formGroup.get("page_title").valueChanges.subscribe((value) => {
        // Update the page_slug control with the slugified value
        const slugifiedValue = this.slugify(value);
        this.formGroup.get("page_slug").setValue(slugifiedValue);
      });
    }

    if (this.pageId != 0) {
      this.getDetails();
    } else {
      this.GetPageManagementList();
    }
  }

  GetPageManagementList(): void {
    var data = {
      sort_field: "sequence_no",
      sort_type: 2,
      limit: 1,
      page: 1,
    };

    this.pageManagementService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.formGroup.patchValue({
            sequence_no: response.data[0].sequence_no + 1,
          });
        } else {
        }
      }
    });
  }

  async getDetails() {
    var data = {
      page_id: this.pageId,
    };

    await this.pageManagementService.getById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.formGroup.patchValue({
            page_title: response.data.page_title,
            page_icon_mob: (response.data.page_icon_mob == "" || response.data.page_icon_mob == null) ? this.general_setting.mobile_logo : response.data.page_icon_mob,
            page_slug: response.data.page_slug,
            sequence_no: response.data.sequence_no,
            is_active: response.data.is_active == 1,
            portal_display: response.data.portal_display == 1,
            mobile_display: response.data.mobile_display == 1,
            page_id: response.data.page_id,
          });
        }
      }
    });
  }

  /** Submit edited/new category type data */
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      var fd = new FormData();

      if (this.pageId) {
        fd.append("page_id", this.pageId);
      }

      fd.append("user_id", this.main.LoggedUserInfo.user_id);
      fd.append("page_title", this.formGroup.value.page_title);
      fd.append("page_slug", this.formGroup.value.page_slug);
      fd.append("sequence_no", this.formGroup.value.sequence_no);
      if (this.file != null) { fd.append("page_icon_mob", this.file); }
      fd.append(
        "is_active",
        this.formGroup.value.is_active == true ? "1" : "0"
      );

      fd.append(
        "portal_display",
        this.formGroup.value.portal_display == true ? "1" : "0"
      );

      fd.append(
        "mobile_display",
        this.formGroup.value.mobile_display == true ? "1" : "0"
      );

      this.pageManagementService.add(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/page-management`]);
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {
          this._snackbarService.error(error);
        }
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
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  slugify(value) {
    return value
      .normalize("NFD") // split an accented letter in the base letter and the acent
      .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, "") // remove all chars not letters, numbers and spaces (to be replaced)
      .replace(/\s+/g, "-");
  }

  onFileChange(event: any): any {
    this.file = event.target.files[0];
    if (this.file.name.indexOf(".") > -1) {
      var extension = this.file.name.split(".").pop().toLowerCase();
    } else {
      var extension = this.file.name.split("/").pop().toLowerCase();
    }
    if ($.inArray(extension, ["png", "PNG", "jpg", "jpeg"]) == -1) {
      this._snackbarService.error(
        this.translate.instant("PLEASE_SELECT_JPG_JPEG_PNG_FORMAT_LOGO")
      );
      this.file = "";
      return;
    } else if (this.file.size / 1024 >= 20) {
      this._snackbarService.error(
        this.translate.instant("IMAGE_SIZE_SHOULD_BE_LESS_THAN_20_KB")
      );
      return false;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = (event: any) => {
      this.formGroup.controls["page_icon_mob"].setValue(event.target.result);
      this.cdr.detectChanges();
    };

    this.imageChangedEvent = event;
  }

  triggerSelectFile(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  cancelClick() {
    history.back();
  }

  removeImage() {
    this.formGroup.controls["page_icon_mob"].setValue(
      "assets/icons/no_image.svg"
    );
  }

  ngOnDestroy(): void {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA");
    console.log(window.location.pathname);
    
  }
}
