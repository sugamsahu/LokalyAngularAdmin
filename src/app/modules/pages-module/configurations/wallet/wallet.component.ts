import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { WalletService } from 'src/app/services/configuration/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import Swal from 'sweetalert2';
import { CommonService } from 'src/app/services/common.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

  main
  walletForm: UntypedFormGroup
  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  global_currency = this.general_setting.currency_symbol;
  store_label = this.general_setting.store_label;
  store_list: any = [];
  allowWallet: boolean = false;
  ChargeTypeList = [
    { id: 1, name: '%' },
    { id: 2, name: 'Flat' }
  ];
  paymentDuration = [{ id: 1, name: 'Weekly' }, { id: 2, name: 'Monthly' }, { id: 3, name: 'Half Yearly' }, { id: 4, name: 'Yearly' }];
  SelectedPayment = this.paymentDuration[0];
  @ViewChild('cursor') cursor: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  stores: any = [];

  constructor(
    public formBuilder: UntypedFormBuilder,
    public walletService: WalletService,
    public translate: TranslateService,
    private appComponent: AppComponent,
    private _snackbarService: ToastrService,
    private toastr: ToastrService,
    private el: ElementRef,
    public commonService: CommonService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private router: Router,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    this.getData();
    this.getStoreList();
    this.getHelpDetails();
  }

  loadForm() {
    this.walletForm = this.formBuilder.group({
      allow_wallet: (false),
      allow_credit: (false),
      min_credit: [null, Validators.required],
      is_credit_chargable: [''],
      credit_charge_type: [''],
      credit_charge: [''],
      is_transfer_chargable: [''],
      max_transfer: [''],
      transfer_charge_type: [''],
      transfer_charge: [''],
      max_payment: [''],
      allow_all_store: ['1'],
      selectedStore: [undefined]
    })
  }

  /** Get wallet data by using its service */
  getData() {
    var data = {}
    this.walletService.getWalletSetting(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (response.data.allow_wallet == 1) {
            this.allowWallet = true;
          }
          else {
            this.allowWallet = false;
          }
          var tempCreditChargeType = [];
          var tempTransferChargeType = [];

          this.ChargeTypeList.forEach(item => {
            if (item.id == response.data.credit_charge_type) {
              tempCreditChargeType.push(item)
            }
            if (item.id == response.data.transfer_charge_type) {
              tempTransferChargeType.push(item)
            }
          })

          this.stores = [];

          if (response.data.stores != null) {
            response.data.stores.forEach(element => {
              this.stores.push(element);
            })
          }

          this.walletForm = this.formBuilder.group({
            allow_wallet: response.data.allow_wallet == '1' ? true : false,
            allow_credit: response.data.allow_credit == '1' ? true : false,
            min_credit: response.data.min_credit,
            is_credit_chargable: response.data.is_credit_chargable == '1' ? true : false,
            credit_charge_type: tempCreditChargeType,
            credit_charge: response.data.credit_charge,
            is_transfer_chargable: response.data.is_transfer_chargable,
            max_transfer: response.data.max_transfer,
            transfer_charge_type: tempTransferChargeType,
            transfer_charge: response.data.transfer_charge,
            max_payment: response.data.max_payment,
            allow_all_store: response.data.allow_all_store,
            selectedStore: [null],
          })

          if (this.walletForm.value.allow_wallet && this.walletForm.value.allow_credit) {
            this.cursor.nativeElement.focus();
          }
          else {
            this.cursor.nativeElement.blur();
          }
        }
      }
    })
  }

  async getStoreList() {
    var data = {
      user_id: this.main.LoggedUserInfo.user_id
    };
    if (this.walletForm.value.allow_all_store == '0') { }
    await this.walletService.getUserStoreRoles(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {

          response.data.forEach(element => {
            if (element.role_id == 2 && element.khata_user == 0) {
              element.label = element.store_name + " (" + element.name + ")"
              this.store_list.push(element)
            }
          })
          this.store_list = this.store_list.sort((a, b) => a.store_name.localeCompare(b.store_name));
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => {
        ;
      },
    });
  }

  selectStore() {
    if (this.walletForm.value.selectedStore != undefined) {
      var duplicate: boolean = false;
      if (this.stores.length > 0) {
        this.stores.forEach(element => {
          if (Number(element.store_id) == this.walletForm.value.selectedStore.store_id) {
            duplicate = true;
          }
        })
      }
      if (duplicate) {
        this.toastr.error(this.translate.instant('ALREADY_EXIST'));
        duplicate = false;
        this.walletForm.controls['selectedStore'].setValue(null);
        return this.walletForm;
      } else {
        var data = {
          store_id: this.walletForm.value.selectedStore.store_id.toString(),
          store_name: this.walletForm.value.selectedStore.store_name,
          payment_duration: this.SelectedPayment.id,
          area_name: this.walletForm.value.selectedStore.area_name,
          city_name: this.walletForm.value.selectedStore.city_name,
          category_name: this.walletForm.value.selectedStore.category_name
        };
        this.stores.push(data);
        this.walletForm.controls['selectedStore'].setValue(null);
      }
    } else {
      this.toastr.error(this.translate.instant('PLEASE_SELECT_STORE'));
    }
  }

  getSelectedStore(event) {
    this.walletForm.value.selectedStore = event;
  }

  deleteStore(id) {
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
        if (id != undefined) {
          this.stores = this.stores.filter((item) => item.store_id !== id);
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  CreditChargeChange(event) {
    this.walletForm.value.credit_charge_type = event.id;
  }

  TransferChargeChange(event) {
    this.walletForm.value.transfer_charge_type = event;
  }

  /** Submit wallet details */
  onSubmit() {
    if (!this.walletForm.valid) {
      const controls = this.walletForm.controls;
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
      var storeSelection = []
      this.stores.forEach(element => {
        var data = {
          store_id: element.store_id,
          payment_duration: 1
        }
        storeSelection.push(data);
      })
      if (this.allowWallet && this.walletForm.value.allow_all_store == '0' && this.stores.length == 0) {
        this.toastr.error('Select minimum one store');
        return;
      }
      var formData = new FormData();
      formData.append('user_id', this.main.LoggedUserInfo.user_id);
      formData.append('min_credit', this.walletForm.value.min_credit);
      formData.append('allow_wallet', this.walletForm.value.allow_wallet == true ? '1' : '0');
      formData.append('allow_credit', this.walletForm.value.allow_credit == true ? '1' : '0');
      formData.append('is_credit_chargable', this.walletForm.value.is_credit_chargable == true ? '1' : '0');
      formData.append('credit_charge_type', this.walletForm.value.credit_charge_type.id);
      formData.append('credit_charge', this.walletForm.value.credit_charge);
      formData.append('is_transfer_chargable', this.walletForm.value.is_transfer_chargable == true ? '1' : '0');
      formData.append('max_transfer', this.walletForm.value.max_transfer);
      formData.append('transfer_charge_type', this.walletForm.value.transfer_charge_type.id);
      formData.append('transfer_charge', this.walletForm.value.transfer_charge);
      formData.append('max_payment', this.walletForm.value.max_payment);
      formData.append('allow_all_store', this.walletForm.value.allow_all_store);
      if (this.walletForm.value.allow_all_store == '0' && this.stores.length > 0) {
        formData.append('stores', JSON.stringify(storeSelection));
      }
      this.walletService.manageWallet(formData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.getData()
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {
          this._snackbarService.error(error);
        },
        complete: () => {
          ;
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
    const control = this.walletForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      // backdrop: "static",
      // keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '36'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '36'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '36'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_details = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }
}
