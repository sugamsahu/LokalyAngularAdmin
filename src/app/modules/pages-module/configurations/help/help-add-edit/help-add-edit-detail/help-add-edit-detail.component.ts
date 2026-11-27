import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AngularEditorConfig } from "@kolkov/angular-editor";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { ConfirmPasswordComponent } from "src/app/modules/pages-module/model/confirm-password/confirm-password.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-help-add-edit-detail",
  templateUrl: "./help-add-edit-detail.component.html",
  styleUrls: ["./help-add-edit-detail.component.scss"],
})
export class HelpAddEditDetailComponent implements OnInit {
  @Input() languageDetail: any = null;
  module_key_Id: any;
  main: any;
  general_setting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  User = JSON.parse(localStorage.getItem("LoginUserDetails"));
  module_is_ids: any = JSON.parse(localStorage.getItem("help_module_is_Id"));
  store_label: string = this.general_setting.store_label;
  @Output() someEvent = new EventEmitter<string>();
  contentDetails: any;
  is_duplicate: any;
  public contentForm: UntypedFormGroup;
  @ViewChild("cursor") cursor: ElementRef;
  fileSizeError: boolean = false;
  customer_User_Id: any = 0;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private snackbarService: ToastrService,
    private bannerService: BannerService,
    private appComponent: AppComponent,
    private el: ElementRef,
    public translateService: TranslateService,
    private router: Router,
    private cryptoService: CryptoService,
    private modalService: NgbModal,
  ) {
    this.main = this.appComponent.main;
  }

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
    // placeholder: "Enter text here...",
    defaultParagraphSeparator: "",
    defaultFontName: "",
    fonts: [
      { class: 'celias', name: 'Celias' },
      { class: 'arial', name: 'Arial' },
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

  ngOnInit() {
    this.ckEditorConfig.contentsCss = [window.location.origin + "/assets/ckEditor-font.css"];
    this.loadForm();
    if (location.href.indexOf("/help/edit") > -1) {
      this.module_key_Id = this.cryptoService.decryptIdValue(
        "help_module_key_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.module_key_Id == undefined) {
        this.router.navigate(["/help"]);
      }
      this.getDetails();
    }
    if (this.languageDetail.sequence_no != 1) {
      this.contentForm.get('is_active').disable({ onlySelf: true });
      this.contentForm.get('is_super_admin').disable({ onlySelf: true });
      if (this.module_is_ids) {
        this.contentForm.patchValue({
          is_active: this.module_is_ids?.is_active,
          is_super_admin: this.module_is_ids?.is_super_admin,
        });
      }
    }
    if (this.module_key_Id) {
      this.contentForm.patchValue({
        module_key: this.module_key_Id,
      });
    }
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  loadForm() {
    this.contentForm = this.formBuilder.group({
      module_name: ["", Validators.required],
      title: ["", Validators.required],
      language_id: this.languageDetail.language_id,
      module_key: [""],
      module_value: [""],
      attachment: [""],
      attachment_link: [""],
      is_active: ["1"],
      is_super_admin: ["1"],
      is_image_delete: ["0"]
    });
  }

  callParent(): void {
    this.someEvent.next('somePhone');
  }

  async getDetails() {
    var data: any = {
      module_key: this.module_key_Id,
      language_id: this.languageDetail.language_id
    };

    await this.bannerService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.contentDetails = response.data;
          if (this.contentDetails) {
            this.contentForm.patchValue({
              module_name: this.contentDetails.module_name,
              title: this.contentDetails.title,
              module_value: this.contentDetails.module_value,
              mobile_type: this.contentDetails.mobile_type,
              mobile_content: this.contentDetails.mobile_content,
              is_active: this.contentDetails.is_active,
              is_super_admin: this.contentDetails.is_super_admin,
              module_key: this.module_key_Id,
              attachment: this.contentDetails.attachment,
              attachment_link: this.contentDetails.attachment,
            });
          }
        }
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

  selectFile(event: any, type: string) {
    const fileInput = event.target as HTMLInputElement;
    const selectedFile = fileInput.files?.[0];
    if (selectedFile) {
      if (selectedFile.size <= 10 * 1024 * 1024) {
        this.fileSizeError = false;
        this.contentForm.patchValue({
          [type]: selectedFile,
        });
        this.contentForm.get(type).updateValueAndValidity();
        this.contentForm.controls["is_image_delete"].setValue("0");
      } else {
        this.fileSizeError = true;
        fileInput.value = null;
      }
    }
  }

  RemoveFile(type: any) {
    this.contentForm.controls[type].setValue(undefined);
    this.contentForm.controls["attachment_link"].setValue("");
    this.contentForm.controls["is_image_delete"].setValue("1");
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

  onFormSubmit(item: any) {
    // Create a FormData object and append all form data to it
    const formData = new FormData();

    //Iterate through all form controls and append their values to the FormData object
    Object.keys(this.contentForm.controls).forEach((controlName) => {
      const control: any = this.contentForm.get(controlName);
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
        if (controlName == "is_active" || controlName == "is_super_admin" || (this.is_duplicate && (controlName == "module_key")) || controlName == "module_value") {
          if (controlName == "is_active") {
            formData.append(controlName, control.value == true ? '1' : '0');
          }
          if (controlName == "module_value") {
            formData.append(controlName, (control.value != 'null' && control.value) ? control.value : '');
          }
          if (controlName == "is_super_admin") {
            formData.append(controlName, control.value == true ? '1' : '0');
          }
          if (this.is_duplicate && (controlName == "module_key")) {
            formData.append(controlName, control.value = '');
          }
        } else {
          formData.append(controlName, control.value);
        }
      }
    });

    this.bannerService.getManageHelps(formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.snackbarService.success(response.message);
          item.model.dismiss();
          if (response.data) {
            this.module_key_Id = response.data.module_key.toString();
            if (this.languageDetail.sequence_no == 1) {
              let activeData: any = {
                is_active: response.data.is_active,
                is_super_admin: response.data.is_super_admin
              }
              localStorage.setItem("help_module_is_Id", JSON.stringify(activeData));
            }
          } else {
            if (this.languageDetail.sequence_no == 1) {
              let activeData: any = {
                is_active: this.contentForm.controls["is_active"].value,
                is_super_admin: this.contentForm.controls["is_super_admin"].value
              }
              localStorage.setItem("help_module_is_Id", JSON.stringify(activeData));
            }
          }
          if (location.href.indexOf("/help/edit") > -1 && this.module_key_Id) {
            this.getDetails();
          } else {
            this.cryptoService.clearCookie(
              "help_module_key_Id" + this.main.LoggedUserInfo.role_id?.toString()
            );
            this.cryptoService.encryptIdValue(
              response.data.module_key?.toString(),
              "help_module_key_Id" + this.main.LoggedUserInfo.role_id?.toString(),
              this.main.CryptoKey
            );
            this.router.navigate(["/help/edit"]);
          }
          this.fileSizeError = false;
        } else {
          this.snackbarService.error(response.message);
        }
      },
      error: (error) => {
        this.snackbarService.error(error);
      }
    });
  }

  conformloginpassword() {
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
      const modalRef = this.modalService.open(ConfirmPasswordComponent, {
        size: "md",
        // backdrop: "static",
        // keyboard: false,
      });
      modalRef.componentInstance.communication = true;
      modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
        this.onFormSubmit(receivedEntry);
      });
    }
  }

  cancelClick() {
    history.back();
  }
}
