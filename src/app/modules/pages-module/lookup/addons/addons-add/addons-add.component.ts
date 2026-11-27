import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";

import { AddonsService } from "src/app/services/lookup/addons.service";
@Component({
  selector: "app-addons-add",
  templateUrl: "./addons-add.component.html",
  styleUrls: ["./addons-add.component.scss"],
})
export class AddonsAddComponent implements OnInit, AfterViewInit {
  addonId: any = 0;
  main: any = { LoggedUserInfo: {} };
  package_form: any;
  public formGroup: UntypedFormGroup;
  @ViewChild('cursor') cursor
  newAddons: {
    addon_price_id: any;
    sub_category_id: any;
    sub_addon_name: any;
  };
  temp: any = [];
  sub_category_id: any = 0;
  subnameItem = [];
  counter = 0;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private AddonsService: AddonsService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private toastr: ToastrService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/addons/edit") > -1) {
      this.addonId = this.cryptoService.decryptIdValue(
        "lookup_addon_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.addonId == undefined) {
        this.router.navigate(["/addons"]);
      }
    }
  }

  ngOnInit(): void {
    this.subnameItem = [];
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.newAddons = {
      addon_price_id: 0,
      sub_category_id: this.counter + 0,
      sub_addon_name: null,
    };

    this.loadForm();

    if (this.addonId) {
      this.getAddonsDetails();
    }
    this.cdr.detectChanges();
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      addon_name: [null, Validators.required],
      description: [null],
      sub_addon_name: [this.newAddons.sub_addon_name],
      sub_category_id: [this.newAddons.sub_category_id],
      addon_price_id: [this.newAddons.addon_price_id],
    });
  }

  getAddonsDetails() {
    var data = {
      addon_id: this.addonId,
    };

    this.AddonsService.getAddonsList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var counter = 0;
          response.data[0].addons_prices.forEach((element) => {
            var data = {
              addon_price_id: element.addon_price_id,
              sub_addon_name: element.sub_addon_name,
              is_used: element.is_used == 1 ? true : false,
              sub_category_id: ++counter,
            };
            this.subnameItem.push(data);
          });
          this.formGroup.setValue({
            addon_name: response.data[0].addon_name,
            description: response.data[0].description,
            sub_addon_name: this.newAddons.sub_addon_name,
            addon_price_id: this.newAddons.addon_price_id,
            sub_category_id: this.newAddons.sub_category_id,
          });
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {
      },
    });
  }

  addsubname() {
    if (this.sub_category_id == 0) {
      this.newAddons = {
        addon_price_id: null,
        sub_category_id: null,
        sub_addon_name: null,
      };
      this.newAddons.addon_price_id = 0;
      this.newAddons.sub_category_id = ++this.counter;
      this.newAddons.sub_addon_name = this.formGroup.value.sub_addon_name;
      var duplicateflag = false;
      this.subnameItem.forEach((element) => {
        if (((element.sub_addon_name).toLowerCase()).replace(/\s/g, '') == ((this.formGroup.value.sub_addon_name).toLowerCase()).replace(/\s/g, '')) {
          duplicateflag = true;
        }
      });
      if (duplicateflag == false) {
        this.subnameItem.push(this.newAddons);
      } else {
        this.toastr.error(this.translate.instant("SUB_ADDON_ALREADY_SELECTED"));
      }
    }
    if (this.sub_category_id != 0) {
      var duplicateflag = false;
      this.subnameItem.forEach((element) => {
        if (((element.sub_addon_name).toLowerCase()).replace(/\s/g, '') == ((this.formGroup.value.sub_addon_name).toLowerCase()).replace(/\s/g, '')) {
          duplicateflag = true;
        }
        if (element.sub_category_id == this.sub_category_id) {
          element.sub_addon_name = this.formGroup.value.sub_addon_name;
        }
      });
      if (duplicateflag) {
        this.toastr.error(this.translate.instant("SUB_ADDON_ALREADY_SELECTED"));
      }
      this.sub_category_id = 0;
    }
    this.formGroup.controls["sub_addon_name"].setValue(null);
  }

  editSubname(addon) {
    this.formGroup.controls["sub_addon_name"].setValue(addon.sub_addon_name);
    this.formGroup.value.sub_addon_name = addon.sub_addon_name;
    this.formGroup.value.addon_price_id = addon.addon_price_id;
    this.formGroup.value.sub_category_id = addon.sub_category_id;
    this.sub_category_id = addon.sub_category_id;
  }

  removeSubname(subaddon) {
    if (subaddon != undefined) {
      this.subnameItem.splice($.inArray(subaddon, this.subnameItem), 1);
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

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  cancelClick() {
    history.back();
  }

  /** Submit edited/new addon add data  */
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
      if (this.subnameItem.length == 0) {
        this.toastr.error(this.translate.instant("SUB_ADDON_CANNOT_BLANK"));
        return
      }
      let data = {};
      if (this.addonId) {
        data = {
          addon_name: this.formGroup.value.addon_name,
          description: this.formGroup.value.description,
          addon_prices: JSON.stringify(this.subnameItem),
          user_id: this.main.LoggedUserInfo.user_id,
          addon_id: this.addonId,
        };
      } else {
        data = {
          user_id: this.main.LoggedUserInfo.user_id,
          addon_name: this.formGroup.value.addon_name,
          description: this.formGroup.value.description,
          addon_prices: JSON.stringify(this.subnameItem),
        };
      }
      this.AddonsService.manageAddons(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/addons`]);
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
}
