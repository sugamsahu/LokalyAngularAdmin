import { CryptoService } from 'src/app/services/custom/crypto.service';
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { reasonMasterService } from '../../../../../services/lookup/reason-master.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AppComponent } from 'src/app/app.component';
import { TranslateService } from "@ngx-translate/core";
import { UserRoles } from 'src/app/enums/user-roles';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reason-master-add',
  templateUrl: './reason-master-add.component.html',
  styleUrls: ['./reason-master-add.component.scss']
})
export class ReasonMasterAddComponent implements OnInit, AfterViewInit {

  unitType = { unit_name: "" };
  reason_form: any;
  main;
  reason_id: any;
  roleID: any;
  store: boolean
  delivery: boolean
  customer: boolean

  allSelected: boolean

  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.general_setting.store_label;
  deliveryboy_label = this.general_setting.deliveryboy_label;
  stock_mgmt = this.general_setting.stock_mgmt;

  public formGroup: UntypedFormGroup;
  @ViewChild('cursor') cursor;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private reasonMasterservice: reasonMasterService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private _snackbarService: ToastrService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;

    if (location.href.indexOf("/reason-master/edit") > -1) {
      this.reason_id = this.cryptoService.decryptIdValue(
        "lookup_reasonMaster_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.cryptoService.clearCookie("lookup_reasonMaster_Id" + this.main.LoggedUserInfo.role_id?.toString());
      if (this.reason_id == undefined) {
        this.router.navigate(["/reason-master"]);
      }
    }
  }

  ordertypeList = [
    { name: 'Delivery', value: '1' },
    { name: 'Pick Up', value: '2' },
    { name: 'Express Delivery', value: '4' }
  ];

  orderStatusList = [
    { label: 'Item Approved', value: '8' },
    { label: 'Item Rejected', value: '9' },
    { label: 'Order Cancelled by Customer', value: '1' },
    { label: 'Order Cancelled by Store', value: '2' },
    { label: 'Order Rejected (Order processing)', value: '3' },
    { label: 'Order Rejected (Order for Delivery)', value: '4' },
    { label: 'Order Undelivered', value: '5' },
    { label: 'Proof of Delivery', value: '7' },
  ];
  selectedOrderItem: any;
  selected_order_value: number;

  ChangeOrderStatus(item) {
    this.selectedOrderItem = item;
    this.selected_order_value = item.value;
  }

  ngOnInit(): void {
    if (this.stock_mgmt == 1) {
      this.orderStatusList.push({ label: 'Stock Damage', value: '6' })
    }
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();

    if (this.reason_id) {
      this.getData();
    }

    this.cdr.detectChanges();
  }

  orderTypeChanged() {
    var temp = []
    if (this.formGroup.value.allSelected == true) {
      this.ordertypeList.forEach(element => {
        temp.push(element.value)
      });
      this.formGroup.controls['order_type'].setValue(temp)
    } else {
      this.formGroup.controls['order_type'].setValue(null)
    }
  }
  /** Get reason maste data by id using service */
  roleFromEdit = [];
  async getData() {

    let data = {
      reason_id: this.reason_id,
    };
    await this.reasonMasterservice.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.roleFromEdit = [];
          if (response.data.role_id == '2,3') {
            this.store = true
            this.delivery = true
            this.customer = false
          }
          if (response.data.role_id == '2') {
            this.store = true
            this.delivery = false
            this.customer = false
          }
          if (response.data.role_id == '3') {
            this.store = false
            this.delivery = true
            this.customer = false
          }
          if (response.data.role_id == '4') {
            this.store = false
            this.delivery = false
            this.customer = true
          }
          if (response.data.role_id != null) {
            this.roleFromEdit = response.data.role_id?.split(',');
          }
          this.formGroup.patchValue({
            reason: response.data.reason,
            is_active: response.data.is_active == 1 ? true : false,
            reason_type: response.data.reason_type,
            order_type: response.data.delivery_type?.split(','),
            store: this.store,
            delivery: this.delivery,
            customer: this.customer,
            allSelected: false
          });
        }
      },
      error: (error) => {

        this._snackbarService.error(error);
      },
      complete: () => {
        this.RoleChange();
        ;
      },
    });
  }

  orderTypeChange() {
    for (const item of this.ordertypeList) {
      if (!this.formGroup.get('order_type').value.includes(item.value)) {
        this.formGroup.controls['allSelected'].setValue(false);
        return;
      }
      this.formGroup.controls['allSelected'].setValue(true);
    }
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      reason: new UntypedFormControl(null, [Validators.required]),
      reason_type: new UntypedFormControl(null, [Validators.required]),
      order_type: new UntypedFormControl(null),
      store: new UntypedFormControl(false),
      delivery: new UntypedFormControl(false),
      customer: new UntypedFormControl(false),
      is_active: new UntypedFormControl(true),
      allSelected: new UntypedFormControl(false)
    });
  }

  userRole = UserRoles;
  myRoles: string = '';
  RoleChange() {
    // Initialize myRoles as an empty string
    this.myRoles = '';

    if (this.formGroup.get('store').value == true) {
      // Add Seller role
      this.myRoles += (this.userRole.Seller).toString();
    }

    if (this.formGroup.get('delivery').value == true) {
      // Add Delivery_Boy role
      if (this.myRoles != '') {
        this.myRoles += ',';
      }
      this.myRoles += (this.userRole.Delivery_Boy).toString();
    }

    if (this.formGroup.get('customer').value == true) {
      // Add Customer role
      if (this.myRoles != '') {
        this.myRoles += ',';
      }
      this.myRoles += (this.userRole.Customer).toString();
    }

  }

  reasonTypeChange() {
    this.formGroup.controls['order_type'].reset();
    this.formGroup.controls['store'].reset();
    this.formGroup.controls['delivery'].reset();
    this.formGroup.controls['customer'].reset();
  }

  /** Submit edit/new reason master data  */
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
      let data: any;
      var formValue = this.formGroup.value
      var reasonType = formValue.reason_type


      if (reasonType == 1 || reasonType == 2 || reasonType == 3 || reasonType == 4 || reasonType == 5 || reasonType == 7) {
        if (formValue.order_type == null || formValue.order_type == '') {
          this._snackbarService.error(this.translate.instant('SELECT_THE_ORDER_TYPE'));
          return
        }
      }
      // return
      if (reasonType == 2 || reasonType == 3 || reasonType == 4 || reasonType == 5 || reasonType == 7) {
        if ((formValue.delivery == null || formValue.delivery == undefined || formValue.delivery == false) && (formValue.store == null || formValue.store == undefined || formValue.store == false)) {
          this._snackbarService.error(this.translate.instant('SELECT_THE_ROLE'));
          return
        }
      }
      else {
        if (reasonType == 1) {
          if (formValue.customer == null || formValue.customer == undefined) {
            this._snackbarService.error(this.translate.instant('SELECT_THE_ROLE'));
            return
          }
        }
        else {
          if (formValue.store == null || formValue.store == undefined || formValue.store == false) {
            this._snackbarService.error(this.translate.instant('SELECT_THE_ROLE'));
            return
          }
        }
      }

      data = {
        reason: formValue.reason,
        reason_type: formValue.reason_type,
        role_id: this.myRoles,
        is_active: formValue.is_active == true ? 1 : 0
      };
      if (this.reason_id) {
        data.reason_id = this.reason_id
      }
      if (formValue.reason_type == "8" || formValue.reason_type == "9" || formValue.reason_type == "6") {
        data.delivery_type = null

      } else {
        data.delivery_type = formValue.order_type?.toString();
      }
      // return;
      this.reasonMasterservice.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/reason-master`]);
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {

          this._snackbarService.error(error);
        },
        complete: () => {
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
