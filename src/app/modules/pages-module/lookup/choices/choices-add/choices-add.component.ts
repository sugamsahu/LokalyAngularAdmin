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
import { ChoicesService } from "src/app/services/lookup/choices.service";

@Component({
  selector: "app-payment-method-add",
  templateUrl: "./choices-add.component.html",
  styleUrls: ["./choices-add.component.scss"],
})
export class ChoicesAddComponent implements OnInit, AfterViewInit {
  choiceId: any = 0;
  main: any = { LoggedUserInfo: {} };
  package_form: any;
  public formGroup: UntypedFormGroup;
  @ViewChild('cursor') cursor
  newChoices: {
    choice_price_id: any;
    sub_category_id: any;
    sub_choice_name: any;
  };
  temp: any = [];
  sub_category_id: any = 0;
  subnameItem = [];
  counter = 0;
  
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ChoicesService: ChoicesService,
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
    if (location.href.indexOf("/choices/edit") > -1) {
      this.choiceId = this.cryptoService.decryptIdValue(
        "lookup_choice_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.choiceId == undefined) {
        this.router.navigate(["/choices"]);
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
    this.newChoices = {
      choice_price_id: 0,
      sub_category_id: this.counter + 0,
      sub_choice_name: null,
    };
    this.loadForm();
    if (this.choiceId) {
      this.getChoicesDetails();
    }
    this.cdr.detectChanges();
  }

  addsubname() {
    if (this.sub_category_id == 0) {
      this.newChoices = {
        choice_price_id: null,
        sub_category_id: null,
        sub_choice_name: null,
      };

      this.newChoices.choice_price_id = 0;
      this.newChoices.sub_category_id = ++this.counter;
      this.newChoices.sub_choice_name = this.formGroup.value.sub_choice_name;
      var duplicateflag = false;
      this.subnameItem.forEach((element) => {
        if (((element.sub_choice_name).toLowerCase()).replace(/\s/g, '') == ((this.formGroup.value.sub_choice_name).toLowerCase()).replace(/\s/g, '')) {
          duplicateflag = true;
        }
      });
      if (duplicateflag == false) {
        this.subnameItem.push(this.newChoices);
      } else {
        this.toastr.error(
          this.translate.instant("SUB_CHOICE_ALREADY_SELECTED")
        );
      }
    }

    if (this.sub_category_id != 0) {
      var duplicateflag = false;
      this.subnameItem.forEach((element) => {
        if (((element.sub_choice_name).toLowerCase()).replace(/\s/g, '') == ((this.formGroup.value.sub_choice_name).toLowerCase()).replace(/\s/g, '')) {
          duplicateflag = true;
        }
        if (element.sub_category_id == this.sub_category_id) {
          element.sub_choice_name = this.formGroup.value.sub_choice_name;
        }
      });
      if (duplicateflag) {
        this.toastr.error(
          this.translate.instant("SUB_CHOICE_ALREADY_SELECTED")
        );
      }
      this.sub_category_id = 0;
    }
    this.formGroup.controls["sub_choice_name"].setValue(null);
  }

  editSubname(choice) {
    this.formGroup.controls["sub_choice_name"].setValue(choice.sub_choice_name);
    this.formGroup.value.sub_choice_name = choice.sub_choice_name;
    this.formGroup.value.choice_price_id = choice.choice_price_id;
    this.formGroup.value.sub_category_id = choice.sub_category_id;
    this.sub_category_id = choice.sub_category_id;
  }

  removeSubname(subchoice) {
    if (subchoice != undefined) {
      this.subnameItem.splice($.inArray(subchoice, this.subnameItem), 1);
    }
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      choice_name: [null, Validators.required],
      description: [null],
      sub_choice_name: [this.newChoices.sub_choice_name],
      sub_category_id: [this.newChoices.sub_category_id],
      choice_price_id: [this.newChoices.choice_price_id],
    });
  }
  /** Submit edited/new added addon choice add data. */
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
        this.toastr.error(this.translate.instant("SUB_CHOICE_CANNOT_BLANK"));
        return
      }
      let data = {};
      if (this.choiceId) {
        data = {
          choice_name: this.formGroup.value.choice_name,
          description: this.formGroup.value.description,
          choice_prices: JSON.stringify(this.subnameItem),
          user_id: this.main.LoggedUserInfo.user_id,
          choice_id: this.choiceId,
        };
      } else {
        data = {
          user_id: this.main.LoggedUserInfo.user_id,
          choice_name: this.formGroup.value.choice_name,
          description: this.formGroup.value.description,
          choice_prices: JSON.stringify(this.subnameItem),
        };
      }

      this.ChoicesService.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/choices`]);
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

  getChoicesDetails() {
    var data = {
      choice_id: this.choiceId,
    };

    this.ChoicesService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var counter = 0;
          response.data[0].choice_prices.forEach((element) => {
            var data = {
              choice_price_id: element.choice_price_id,
              sub_choice_name: element.sub_choice_name,
              is_used: element.is_used == 1 ? true : false,
              sub_category_id: ++counter,
            };

            this.subnameItem.push(data);
          });
          this.formGroup.setValue({
            choice_name: response.data[0].choice_name,
            description: response.data[0].description,
            sub_choice_name: this.newChoices.sub_choice_name,
            choice_price_id: this.newChoices.choice_price_id,
            sub_category_id: this.newChoices.sub_category_id,
          });
        }
      },
      error: (error) => { },
      complete: () => {

      },
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
}
