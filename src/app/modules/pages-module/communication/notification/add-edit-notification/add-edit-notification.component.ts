import { ChangeDetectorRef, Component, ElementRef, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { SpinnerService } from 'src/app/services/custom/spinner.service';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { CommunicationService } from 'src/app/services/communication.service';
import { ConfirmPasswordComponent } from '../../../model/confirm-password/confirm-password.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-notification',
  templateUrl: './add-edit-notification.component.html',
  styleUrls: ['./add-edit-notification.component.scss']
})
export class AddEditNotificationComponent implements OnInit {
  notificationId: any = 0;
  main: any = { LoggedUserInfo: {} };
  public formGroup: UntypedFormGroup;
  Id: any = 0;
  lan_code: any;
  category_list: any = [];
  link_list: any = [];
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
    if (location.href.indexOf("/notification/edit") > -1) {
      this.notificationId = this.cryptoService.decryptIdValue(
        "notification_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.is_duplicate = this.cryptoService.decryptIdValue(
        "duplicate_notification_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.notificationId == undefined) {
        this.router.navigate(["/notification"]);
      }
    }
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    if (this.notificationId) {
      this.getDetails();
    }
    this.getCategoryList();
    this.getLinktoList();
    this.cdr.detectChanges();
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      name: [null, Validators.required],
      notification_title: [null, Validators.required],
      is_active: new UntypedFormControl(true),
      notification_text: [null, Validators.required],
      category: [null, Validators.required],
      event: [null],
      link_to: [null, Validators.required]
    });
  }

  /** Get notification details using service */
  //get details
  getDetails() {
    var data = {
      notification_id: this.notificationId
    }
    this.communicationService.getNotificationTemplate(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.Id = response.data.notification_details[0].id;
          this.lan_code = response.data.notification_details[0].language_code;
          this.formGroup.patchValue({
            name: response.data.name,
            notification_title: response.data.notification_details[0].notification_title,
            notification_text: response.data.notification_details[0].notification_text,
            is_active: response.data.is_active == 1 ? true : false,
            category: Number(response.data.category),
            event: response.data.event,
            link_to: Number(response.data.link_to)
          });
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => { },
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

  async getLinktoList() {
    const data = {};
    await this.communicationService.getModuleLinktoList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.link_list = response.data;
          var selectedLink: number = null;
          if (this.formGroup.get("link_to").value != null) {
            this.link_list.forEach(element => {
              if (element.id == this.formGroup.get("link_to").value) {
                selectedLink = element.id;
              }
            });
            this.formGroup.controls.link_to.setValue(selectedLink);
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

  /** Submit new/updated notification details */
  onSubmit(item: any) {
    this.spinner.show();
    let data: any = {};
    data = {
      notification_id: 0,
      id: 0,
      user_id: this.main.LoggedUserInfo.user_id,
      name: this.formGroup.value.name,
      notification_title: this.formGroup.value.notification_title,
      notification_text: this.formGroup.value.notification_text,
      is_active: this.formGroup.value.is_active == true ? 1 : 0,
      language_code: this.lan_code,
      category: this.formGroup.get('category').value,
      event: this.formGroup.get('event').value,
      link_to: this.formGroup.get('link_to').value
    };
    if (this.notificationId) {
      data.notification_id = this.is_duplicate ? 0 : this.notificationId;
      data.id = this.is_duplicate ? 0 : this.Id;
    }
    this.communicationService.editNotificationTemplate(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          item.model.dismiss();
          this.router.navigate([`/notification`]);
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

  confirmLoginPassword() {
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