import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnInit,
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
import { CryptoService } from "src/app/services/custom/crypto.service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { CommunicationService } from "src/app/services/communication.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmPasswordComponent } from "../../../model/confirm-password/confirm-password.component";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-edit-email",
  templateUrl: "./edit-email.component.html",
  styleUrls: ["./edit-email.component.scss"],
})
export class EditEmailComponent implements OnInit {
  mailId: any = null;
  main: any = { LoggedUserInfo: {} };
  public formGroup: FormGroup;
  category_list: any = [];
  customer_User_Id: any = 0;
  Id: any = 0;
  lan_code: any;
  is_duplicate: string;
  //CKEditor configuration
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
    height: 300
  };
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private appComponent: AppComponent,
    private spinner: SpinnerService,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private communicationService: CommunicationService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    if (location.href.indexOf("/email/edit") > -1) {
      this.mailId = this.cryptoService.decryptIdValue(
        "email_template_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.mailId == undefined) {
        this.router.navigate(["/email"]);
      }
    }
  }

  ngOnInit(): void {
    this.ckeConfig.contentsCss = [window.location.origin + "/assets/ckEditor-font.css"];
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    if (this.mailId) {
      this.getDetails();
    }
    this.getCategoryList();
    this.cdr.detectChanges();
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      subject: [null, Validators.required],
      title: [null, Validators.required],
      is_active: new FormControl(true),
      description: [null, Validators.required],
      category: new FormControl(null, Validators.required),
      event: new FormControl(null)
    });
  }

  //get details
  getDetails() {
    var data = {
      email_template_id: this.mailId,
    };
    this.communicationService.getEmailTemplate(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.Id = response.data.email_templates[0].id;
          this.lan_code = response.data.email_templates[0].language_code;
          this.formGroup.patchValue({
            subject: response.data.email_templates[0].msg_subject,
            title: response.data.title,
            is_active: response.data.is_active == 1 ? true : false,
            description: response.data.email_templates[0].msg_body,
            category: Number(response.data.category),
            event: response.data.event
          });
          this.spinner.hide();
        }
      },
      error: (error) => {
        this.spinner.hide();
        this._snackbarService.error(error);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  /** Add/Edit email details */
  onSubmit(item: any) {
    this.spinner.show();
    let data: any = {};
    data = {
      user_id: this.main.LoggedUserInfo.user_id,
      msg_body: this.formGroup.value.description,
      msg_subject: this.formGroup.value.subject,
      email_template_id: 0,
      id: 0,
      title: this.formGroup.value.title,
      is_active: this.formGroup.value.is_active,
      language_code: this.lan_code,
      admin_user_type: false,
      client_user_type: false,
      category: this.formGroup.get('category').value,
      event: this.formGroup.get('event').value
    };
    if (this.mailId) {
      data.email_template_id = this.is_duplicate ? 0 : this.mailId;
      data.id = this.is_duplicate ? 0 : this.Id;
    }
    this.communicationService.editEmailTemplate(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          item.model.dismiss();
          this.router.navigate([`/email`]);
        } else {
          this._snackbarService.error(response.message);
        }
      },
      error: (error) => {
        this.spinner.hide();
        this._snackbarService.error(error);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  async getCategoryList() {
    const data = {};
    await this.communicationService.getModuleCategoryTypeList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.category_list = response.data;
          var selectedCategory: number = null;
          if (this.formGroup.get("category").value != null) {
            this.category_list.forEach((element) => {
              if (element.id == this.formGroup.get("category").value) {
                selectedCategory = element.id;
              }
            });
            this.formGroup.controls.category.setValue(selectedCategory);
          }
        } else {
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
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

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  cancelClick() {
    history.back();
  }

  conformloginpassword() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      const modalRef = this.modalService.open(ConfirmPasswordComponent, {
        size: "md",
      });
      modalRef.componentInstance.communication = true;
      modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
        this.onSubmit(receivedEntry);
      });
    }
  }
}
