import {
  Component,
  ChangeDetectorRef,
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
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { CommunicationService } from "src/app/services/communication.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmPasswordComponent } from "src/app/modules/pages-module/model/confirm-password/confirm-password.component";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-edit-sms",
  templateUrl: "./edit-sms.component.html",
  styleUrls: ["./edit-sms.component.scss"],
})
export class EditSmsComponent implements OnInit {
  smsId: any = 0;
  main: any = { LoggedUserInfo: {} };
  public formGroup: UntypedFormGroup;
  Id: any = 0;
  lan_code: any;
  category_list: any = [];
  is_duplicate: string;
  customer_User_Id: any = 0;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private appComponent: AppComponent,
    private spinner: SpinnerService,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private communicationService: CommunicationService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/sms/edit") > -1) {
      this.smsId = this.cryptoService.decryptIdValue(
        "sms_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.is_duplicate = this.cryptoService.decryptIdValue(
        "duplicate_sms_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.smsId == undefined) {
        this.router.navigate(["/sms"]);
      }
    }
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadForm();
    if (this.smsId) {
      this.getDetails();
    }
    this.getCategoryList();
    this.cdr.detectChanges();
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      subject: [null, Validators.required],
      is_active: new UntypedFormControl(true),
      sms_text: [null, Validators.required],
      category: [null],
      event: [null]
    });
  }

  /** Get sms details using service */
  getDetails() {
    var data = {
      sms_id: this.smsId
    }
    this.communicationService.getSMSTemplate(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.Id = response.data.sms_details[0].id;
          this.lan_code = response.data.sms_details[0].language_code;
          this.formGroup.patchValue({
            subject: response.data.title,
            sms_text: response.data.sms_details[0].sms_text,
            is_active: response.data.is_active == 1 ? true : false,
            category: Number(response.data.category),
            event: response.data.event
          });
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => { },
    });
  }

  /** Submit new/updated sms details */
  onSubmit(item: any) {
    this.spinner.show();
    let data: any = {};
    data = {
      sms_id: 0,
      id: 0,
      user_id: this.main.LoggedUserInfo.user_id,
      title: this.formGroup.value.subject,
      sms_text: new UntypedFormControl('', [Validators.required, Validators.maxLength(160)]),
      is_active: this.formGroup.value.is_active == true ? 1 : 0,
      language_code: this.lan_code,
      category: this.formGroup.get('category').value,
      event: this.formGroup.get('event').value
    };
    if (this.smsId) {
      data.sms_id = this.is_duplicate ? 0 : this.smsId;
      data.id = this.is_duplicate ? 0 : this.Id;
    }
    this.communicationService.editSMSTemplate(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          item.model.dismiss();
          this.router.navigate([`/sms`]);
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
        ;
      },
    });
  }

  conformLoginPassword() {
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

  cancelClick() {
    history.back();
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }
}
