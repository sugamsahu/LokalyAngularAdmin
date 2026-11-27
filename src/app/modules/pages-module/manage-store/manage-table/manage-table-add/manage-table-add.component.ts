import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ManageStoreService } from "src/app/services/manage-store.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-manage-table-add",
  templateUrl: "./manage-table-add.component.html",
  styleUrls: ["./manage-table-add.component.scss"],
})
export class ManagetableAddComponent implements OnInit, AfterViewInit {
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  manageType = { table_no: "" };
  Unit_form: any;
  main: any;
  table_id: any = 0;
  customer_User_Id: any = 0;
  @ViewChild('cursor') cursor
  public formGroup: UntypedFormGroup;
  store_id: any;
  session = this.appComponent.sessionConfig();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private manageStoreService: ManageStoreService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private cryptoService: CryptoService,
    private toastr: ToastrService
  ) {
    translate.addLangs(["it", "en", "de"]);
    translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    if (location.href.indexOf("/manage-table/edit") > -1) {
      this.table_id = this.cryptoService.decryptIdValue(
        "manage_table" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.table_id == undefined) {
        this.router.navigate(["/manage-table"]);
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
    this.formGroup = this.formBuilder.group({
      capacity: new UntypedFormControl(null, [Validators.required]),
      description: [""],
      is_active: ["1"],
      is_delete: [0],
      store_id: this.seller_details.store_id,
      store_table_id: [0],
      table_no: new UntypedFormControl(null, [Validators.required]),
      user_id: this.main.LoggedUserInfo.user_id,
    });
    if (this.table_id) {
      this.getById();
    }
    this.cdr.detectChanges();
  }

  keyPressNumbers(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode < 48 || charCode > 57) && (charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  /** Submit for add/edit data of manage table */
  onSubmit() {
    if (!this.formGroup.valid) {
      return;
    }
    var data = {
      capacity: (this.formGroup.value.capacity).toString(),
      description: this.formGroup.value.description,
      is_active: Number(this.formGroup.value.is_active),
      is_delete: this.formGroup.value.is_delete,
      store_id: this.formGroup.value.store_id,
      table_no: this.formGroup.value.table_no,
      user_id: this.formGroup.value.user_id,
      store_table_id: this.table_id,
    }
    this.manageStoreService
      .manageStoreTables(data)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/managetable`]);
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

  /** Get manage table data by id using service. */
  getById() {
    var data = {
      store_table_id: this.table_id,
      store_id: this.seller_details.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
    };
    this.manageStoreService.tableGetById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.manageType = response.data;
          this.formGroup.setValue({
            user_id: this.main.LoggedUserInfo.user_id,
            table_no: response.data.table_no,
            capacity: response.data.capacity,
            description: response.data.description,
            store_id: response.data.store_id,
            store_table_id: response.data.store_table_id,
            is_active: response.data.is_active == 1 ? true : false,
            is_delete: 0,
          });
          if (
            this.formGroup.value.table_no == "" ||
            this.formGroup.value.table_no == null
          ) {
            this.toastr.error(
              this.translate.instant("PLEASE_ENTER_TABLE_NUMBER")
            );
            return;
          }
          if (
            this.formGroup.value.capacity == "" ||
            this.formGroup.value.capacity == null
          ) {
            this.toastr.error(this.translate.instant("PLEASE_ENTER_CAPACITY"));
            return;
          }
          if (this.formGroup.value.store_table_id) {
            response.data.store_table_id = this.formGroup.value.store_table_id;
          }
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
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
