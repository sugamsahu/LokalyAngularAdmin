import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from 'src/app/app.component';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { CuisinesService } from 'src/app/services/lookup/cuisines.service';

@Component({
  selector: 'app-cuisines-add',
  templateUrl: './cuisines-add.component.html',
  styleUrls: ['./cuisines-add.component.scss']
})
export class CuisinesAddComponent implements OnInit, AfterViewInit {

  cuisine_id: any;
  main;
  file: any = null;
  @ViewChild('cursor') cursor

  public formGroup: UntypedFormGroup;

  constructor(
    private router: Router,
    public translate: TranslateService,
    private appComponent: AppComponent,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private cuisinesService: CuisinesService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/cuisines/edit") > -1) {
      this.cuisine_id = this.cryptoService.decryptIdValue(
        "lookup_cuisines_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.cuisine_id == undefined) {
        this.router.navigate(["/cuisines"]);
      }
    }
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    if (this.cuisine_id) {
      this.getData();
    }
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      cuisine_name: ["", Validators.required],
      cuisine_description: [""],
      cuisine_image: ["assets/icons/no_image.svg"],
    });
  }
  /** Get cuisine data by cuisineId */
  getData() {

    let data = {
      cuisine_id: this.cuisine_id,
    };
    this.cuisinesService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.formGroup.setValue({
            cuisine_name: response.data.cuisine_name,
            cuisine_description: response.data.description,
            cuisine_image: response.data.cuisine_image
          });
          this.file = response.data.cuisine_image
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
  /** Submit edited/new cuisines data */
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


      let formData = new FormData()

      formData.append("user_id", this.main.LoggedUserInfo.user_id)
      formData.append("cuisine_name", this.formGroup.value.cuisine_name)
      formData.append("description", this.formGroup.value.cuisine_description)

      if (this.file != null || this.file != undefined) {
        formData.append("cuisine_image", this.file)
      } else {
        this.toastr.error(this.translate.instant('PLEASE_SELECT_CUISINE_IMAGE'));
        return
      }

      if (this.cuisine_id) {
        formData.append("cuisine_id", this.cuisine_id)
      }

      this.cuisinesService.add(formData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/cuisines`]);
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

  triggerSelectFile(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onFileChange(event: any): any {

    this.file = event.target.files[0];

    if (this.file.name.indexOf('.') > -1) {
      var extension = this.file.name.split(".").pop().toLowerCase();
    } else {
      var extension = this.file.name.split('/').pop().toLowerCase();
    }
    if ($.inArray(extension, ['png', 'PNG', 'jpg', 'jpeg']) == -1) {
      this.toastr.error(this.translate.instant('PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_LOGO'));
      this.file = ''
      return;
    } else if (this.file.size / 1024 >= 2048) {
      this.toastr.error(this.translate.instant('IMAGE_SIZE_SHOULD_BE_LESS_THAN_2_MB'));
      this.file = ''
      return false;
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.file);

    reader.onload = (event: any) => {
      this.formGroup.controls['cuisine_image'].setValue(event.target.result)
      this.cdr.detectChanges();
    }
  }

  removeImage() {
    this.formGroup.controls['cuisine_image'].setValue("assets/icons/no_image.svg")
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
}
