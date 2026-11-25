import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
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
import { ContactListService } from "src/app/services/campaign-management/contact-list.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AddContactComponent } from "../../../model/add-contact/add-contact.component";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-add-contact-list",
  templateUrl: "./add-contact-list.component.html",
  styleUrls: ["./add-contact-list.component.scss"],
})
export class AddContactListComponent implements OnInit, AfterViewInit {
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  public formGroup: FormGroup;
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  search: any;
  no_data = true;
  main: any = { LoggedUserInfo: {} };
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  business_model = this.platform_setting.business_model;
  campaign_contact_id: any = 0;
  contact_list_record: any = [];
  campaign_contacts_id: any;
  platform_name: any;
  khata_label: any;
  @ViewChild('cursor') cursor: ElementRef;
  isExecuted: any = 0;
  isDuplicate: string;
  manage_call: any;
  user_count: number = 0;
  contact_list_name: any;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ContactListService: ContactListService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private toastr: ToastrService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    if (location.href.indexOf("/contact-list/edit") > -1) {
      this.campaign_contact_id = this.cryptoService.decryptIdValue(
        "campaign_contact_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );

      this.isDuplicate = this.cryptoService.decryptIdValue(
        "campaign_contact_id_duplicate" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.campaign_contact_id == undefined) {
        this.router.navigate(["/contact-list"]);
      }
    }
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.loadForm();
    if (this.campaign_contact_id) {
      this.getContactList(this.page);
    }
    this.cdr.detectChanges();
    if (this.general_setting) {
      this.platform_name = this.general_setting.platform_name;
      this.khata_label = this.general_setting.khata_label;
    } else {
      this.platform_name = this.main.platform_name;
      this.khata_label = this.main.khata_label;
    }

  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      contact_list_name: [null, Validators.required],
      is_active: new FormControl(true),
      searchText: [null],
    });
  }

  //get contact list
  getContactList(page): void {
    this.page = page;
    var data = {};
    data = {
      campaign_contacts_id: this.campaign_contact_id,
    };
    this.ContactListService.getContactList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.isExecuted = response.data.isExecuted
          if (!this.isDuplicate) {
            this.contact_list_name = response.data.contact_list_name
            this.formGroup.controls["contact_list_name"].setValue(
              response.data.contact_list_name
            );
          }
          this.campaign_contacts_id = response.data.campaign_contacts_id;
          this.formGroup.controls["is_active"].setValue(
            response.data.is_active == 0 ? false : true
          );
          if (this.isDuplicate) {
            this.formGroup.controls["is_active"].setValue(true);
          }
          this.count = response.data.contacts_users;
          this.user_count = response.data.user_count;
          this.no_data = false;
          this.contact_list_record = [];
          if (response.data.contacts_users) {
            response.data.contacts_users.forEach((element) => {
              if (element) {
                this.contact_list_record.push(element);
              }
            });
          } else {
            this.no_data = true;
          }
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.contact_list_record = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  checkCompaignContactsExits(search): void {
    if (this.campaign_contact_id && this.contact_list_name == this.formGroup.value.contact_list_name) {
      this.addContactModel()
    } else {
      var data = {};
      data = {
        contact_list_name: search,
      };
      this.ContactListService.check_compaign_contacts_exits(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.addContactModel()
          } else {
            this.toastr.error(response.message);
            return
          }
        },
        error: (error) => {
          // handle error
        },
        complete: () => { },
      });
    }
  }

  //modal
  /** Open AddContactComponent modal */
  addContactModel() {
    if (
      this.formGroup.value.contact_list_name == undefined ||
      this.formGroup.value.contact_list_name == null
    ) {
      this.toastr.error(this.translate.instant("ENTER_CONTACT_LIST_NAME"));
      return;
    }

    const modalRef = this.modalService.open(AddContactComponent, {
      size: "lg-950",
    });
    modalRef.componentInstance.main1 = this.main;
    modalRef.componentInstance.isDuplicate = this.isDuplicate;
    modalRef.componentInstance.contactListname =
      this.formGroup.value.contact_list_name;
    modalRef.componentInstance.id = this.campaign_contact_id;
    modalRef.componentInstance.active =
      this.formGroup.value.is_active == true ? "1" : "0";
    modalRef.componentInstance.passData.subscribe((receivedEntry) => {
      if (receivedEntry) {
        this.manage_call = receivedEntry
      } else {
      }
    });
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      if (receivedEntry) {
        this.campaign_contact_id = receivedEntry;
        this.getContactList(this.page);
      } else {
      }
    });
  }

  //clear all data
  deleteAllContact(item) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("REMOVE_ALL_CONTACT_FROM_CAMPAIGN"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteContactConfirm(item);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        console.log("cancelled");
      }
    });
  }

  deleteContactConfirm(item) {
    let data = {
      is_delete_all: 1,
      campaign_contacts_id: Number(this.campaign_contact_id),
    };

    this.ContactListService.deleteCampaignContacts(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.getContactList(this.page);
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

  //delete particular record
  deleteContact(item) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("REMOVE_CONTACT_FROM_CAMPAIGN"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteConfirm(item);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        console.log("cancelled");
      }
    });
  }

  deleteConfirm(item) {
    let data = {
      contacts_users_list_id: item,
    };
    this.ContactListService.deleteCampaignContacts(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.getContactList(this.page);
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

  //submit
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
      this.toastr.error(this.translate.instant("ENTER_ALL_REQUIRED_FIELDS"));
      return;
    } else {
      if (this.contact_list_record.length == 0) {
        this.toastr.error(this.translate.instant("CONTACT_DETAILS_CAN_NOT_BE_EMPTY"));
        return
      }
      let data = {};
      if (this.campaign_contact_id) {
        data = {
          contact_list_name: this.formGroup.value.contact_list_name,
          campaign_contacts_id: this.campaign_contact_id,
          is_active: this.formGroup.value.is_active == true ? "1" : "0",
        };
      } else {
        data = {
          contact_list_name: this.formGroup.value.contact_list_name,
          campaign_contacts_id: 0,
          is_active: this.formGroup.value.is_active == true ? "1" : "0",
        };
      }
      this.ContactListService.manageCampaignContacts(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            if (response.data.length == 0) {
              this._snackbarService.error(response.message);
              return
            } else {
              this._snackbarService.success(response.message);
            }
            this.router.navigate([`/contact-list`]);
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
}
