import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ManageStoreService } from 'src/app/services/manage-store.service';
import * as moment from 'moment';
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-store-holidays-add',
  templateUrl: './store-holidays-add.component.html',
  styleUrls: ['./store-holidays-add.component.scss']
})
export class StoreholidaysAddComponent implements OnInit, AfterViewInit {

  holiday_details = JSON.parse(localStorage.getItem("loginUserStore"));
  main: any;
  seller_holiday_id: any = 0;
  public formGroup: UntypedFormGroup;
  iseatery = this.holiday_details.iseatery;
  minDate: any = new Date();
  session = this.appComponent.sessionConfig();
  editData: any;
  customer_User_Id: any = 0;
  @ViewChild('cursor') cursor
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private manageStoreService: ManageStoreService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private cryptoService: CryptoService,
    private toastr: ToastrService,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;

    if (location.href.indexOf("/storeholidays/edit") > -1) {
      this.seller_holiday_id = this.cryptoService.decryptIdValue(
        "seller_holiday_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.seller_holiday_id == undefined) {
        this.router.navigate(["/storeholidays"]);
      }
    }

  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    if (this.seller_holiday_id > 0) {
      this.getbyid();
    }

    this.loadForm();
    if (this.seller_holiday_id == 0) {
      this.formGroup.get("from_date").valueChanges.subscribe((val) => {
        this.FromDateValidation(val);
      });

      this.formGroup.get("to_date").valueChanges.subscribe((val) => {
        this.ToDateValidation(val);
      });
    }
    this.cdr.detectChanges();
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      holiday_name: new UntypedFormControl(null),
      from_date: new UntypedFormControl(new Date()),
      to_date: new UntypedFormControl(new Date()),
      delivery: new UntypedFormControl(true),
      express_delivery: new UntypedFormControl(true),
      pickup: new UntypedFormControl(true),
    });
  }

  minToDate: any = new Date();
  FromDateValidation(Fromdate) {
    this.minToDate = Fromdate;
    if (Fromdate > this.formGroup.value.to_date) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
  }

  ToDateValidation(Todate) {
    if (this.formGroup.value.from_date > Todate) {
      this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      return;
    }
  }
  /** Method for submit add/edit data of store holidays */
  onSubmit() {

    if (!this.formGroup.valid) {
      Object.keys(this.formGroup.controls).forEach(field => {
        const control = this.formGroup.get(field);
        control.markAsTouched({ onlySelf: true });
      });

      if (this.formGroup.value.from_date > this.formGroup.value.to_date) {
        this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
      }
      return;
    } else {
      if (this.formGroup.value.from_date > this.formGroup.value.to_date) {
        this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
        return;
      }
      if (!this.formGroup.get('delivery').value && !this.formGroup.get('express_delivery').value && !this.formGroup.get('pickup').value) {
        this.toastr.error(this.translate.instant('SELECT_ATLEAST_ONE_DELIVERY_MODE'));
        return;
      }
      let formData = new FormData();
      if (this.seller_holiday_id > 0 || this.seller_holiday_id) {
        formData.append("seller_holiday_id", this.seller_holiday_id);
      }
      formData.append(
        "user_id",
        this.main.LoggedUserInfo.user_id
      );

      formData.append(
        "store_id",
        this.holiday_details.store_id
      );

      formData.append(
        "holiday_name",
        this.formGroup.value.holiday_name
      );

      formData.append(
        "from_date",
        moment(this.formGroup.value.from_date).format(
          this.main.DateFormate.split(" ")[0]
        )
      );

      formData.append(
        "to_date",
        moment(this.formGroup.value.to_date).format(
          this.main.DateFormate.split(" ")[0]
        )
      );


      formData.append(
        "delivery",
        this.formGroup.value.delivery == true ? "1" : "0"
      );

      formData.append(
        "express_delivery",
        this.formGroup.value.express_delivery == true ? "1" : "0"
      );

      formData.append(
        "pickup",
        this.formGroup.value.pickup == true ? "1" : "0"
      );

      if (this.holiday_details.seller_holiday_id) {
        formData.append(
          "seller_holiday_id",
          this.holiday_details.seller_holiday_id
        );
      }
      var data = formData;
      this.manageStoreService.saveStoreHoliday(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/storeholidays`]);
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

  /** Get data by id using service */
  //edit by id
  getbyid() {
    var data = {
      store_id: this.holiday_details.store_id,
    };

    this.manageStoreService.getStoreHolidayList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach(element => {
            if (element.seller_holiday_id == this.seller_holiday_id) {
              this.editData = element;
              if (new Date(moment(element.from_date, this.main.DateFormate.split(' ').toString()).toDate()) > new Date()) {
                this.minDate = new Date()
              }
              else {
                this.minDate = new Date(moment(element.from_date, this.main.DateFormate.split(' ').toString()).toDate());
              }

              this.formGroup.controls["holiday_name"].setValue(element.holiday_name);
              this.formGroup.controls['from_date'].setValue(new Date(moment(element.from_date, this.main.DateFormate.split(' ').toString()).toDate()));
              this.formGroup.controls['to_date'].setValue(new Date(moment(element.to_date, this.main.DateFormate.split(' ').toString()).toDate()))
              this.formGroup.controls["delivery"].setValue(element.delivery == 1 ? true : false);
              this.formGroup.controls["express_delivery"].setValue(element.express_delivery == 1 ? true : false);
              this.formGroup.controls["pickup"].setValue(element.pickup == 1 ? true : false);
            }
          });
        }
      },
      error: (error) => {
        // handle error

      },
      complete: () => {
        ;
        this.formGroup.get("from_date").valueChanges.subscribe((val) => {
          this.FromDateValidation(val);
        });

        this.formGroup.get("to_date").valueChanges.subscribe((val) => {
          this.ToDateValidation(val);
        });
      },
    });
  }

  clearStartDate() {
    this.formGroup.controls['from_date'].setValue(null);
  }
  clearToDate() {
    this.formGroup.controls['to_date'].setValue(null);
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