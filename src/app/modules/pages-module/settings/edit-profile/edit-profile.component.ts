import {
  ChangeDetectorRef,
  ViewChild,
  Component,
  OnInit,
  ElementRef,
  NgZone,
  AfterViewInit,
} from "@angular/core";
import { AppComponent } from "src/app/app.component";
import { SettingsService } from "src/app/services/settings.service";
import { TranslateService } from "@ngx-translate/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { crop_rectangleComponent } from "../../model/crop-rectangle/crop-rectangle.component";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-edit-profile",
  templateUrl: "./edit-profile.component.html",
  styleUrls: ["./edit-profile.component.scss"],
})
export class EditProfileComponent implements OnInit, AfterViewInit {
  main: any = { LoggedUserInfo: {} };
  ph_numbr = /^\+?\d{10}$/;
  public formGroup: UntypedFormGroup;
  myCroppedImageShow: any;
  cropped_store_logo: any;
  isCroppedImage = false;
  myCroppedImage: string;
  languageList: any = [];
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @ViewChild('cursor') cursor;
  croppedImages: any;
  cropFiles: any;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  constructor(
    private router: Router,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private SettingsService: SettingsService,
    private formBuilder: UntypedFormBuilder,
    private modalService: NgbModal,
    private el: ElementRef,
    private _snackbarService: ToastrService,
    private _helpService: BannerService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadform();
    this.getLanguageList();
    this.getDetails();
    this.getHelpDetails();
  }

  loadform() {
    this.formGroup = this.formBuilder.group({
      user_picture: new UntypedFormControl("assets/icons/no_image.svg"),
      name: new UntypedFormControl(null, [Validators.required]),
      phone: new UntypedFormControl(null, [Validators.required]),
      email: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(
            "[a-zA-Z0-9.-_--]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}"
          ),
        ]),
      ],
      language: new UntypedFormControl(null),
      user_id: new UntypedFormControl(this.main.LoggedUserInfo.user_id),
    });
  }
  //language
  async getLanguageList() {
    var data = {};
    await this.SettingsService.getLanguageList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var default_language = this.generalSetting.language_codes.split(',')

          default_language.forEach(lan => {
            response.data.forEach((item) => {
              if (lan == item.language_code) {
                this.languageList.push(item);
              }
            });
          });
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => { },
    });
  }
  
  /** Get language by change language from dropdown */
  changeLanguage(item) {
    this.formGroup.controls["language"].setValue(item);
  }
  /** Get profile details using service */
  //getrecord
  async getDetails() {
    let data = {
      user_id: this.main.LoggedUserInfo.user_id,
    };
    this.SettingsService.getProfileDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.formGroup.controls["name"].setValue(response.data.name);
          this.formGroup.controls["phone"].setValue(response.data.phone);
          this.formGroup.controls["email"].setValue(response.data.email);
          this.formGroup.controls["user_picture"].setValue(
            response.data.user_picture
          );
          this.formGroup.controls["language"].setValue(
            response.data.language_name
          );
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => { },
    });
  }
  /** Open crop_rectangleComponent modal */
  // image
  openUpdateUserProfPicModal() {
    const modalRef = this.modalService.open(crop_rectangleComponent,{
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.myCroppedImageShow;
    modalRef.componentInstance.imageChangedEvent = this.myCroppedImage
    modalRef.componentInstance.imageChangedEvent = this.croppedImages
    modalRef.componentInstance.cropFiles = this.cropFiles

    modalRef.componentInstance.newseller =
      this.cropped_store_logo == undefined
        ? this.formGroup.value.user_picture
        : this.cropped_store_logo;

    modalRef.componentInstance.isCroppedImage = this.isCroppedImage;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.editProfilePic(receivedEntry);
    });
  }
  /** Edit profile image */
  editProfilePic(item) {
    if (item.crop_image_file != undefined) {
      this.isCroppedImage = true;
      this.cropFiles = item.cropFiles
      this.croppedImages = item.croppedImages
      this.cropped_store_logo = item.crop_image;
      this.formGroup.controls["user_picture"].setValue(item.crop_image_file);
      this.myCroppedImage = item.full_image;
    }
    this.cdr.detectChanges();
  }

  removeLogoImage() {
    this.formGroup.value.user_picture = "assets/icons/no_image.svg";
    this.isCroppedImage = false;
    this.myCroppedImage = "";
  }
  /** Submit edited profile data. */
  //for sumbit
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      let formData = new FormData();
      formData.append("user_id", this.main.LoggedUserInfo.user_id);
      formData.append("name", this.formGroup.value.name);
      formData.append("phone", this.formGroup.value.phone);
      formData.append("email", this.formGroup.value.email);
      if (this.formGroup.value.language.language_id) {
        formData.append(
          "language_id",
          this.formGroup.value.language.language_id
        );
      } else {
        formData.append("language_id", this.main.LoggedUserInfo.language_id);
      }
      localStorage.setItem(
        "select_lan",
        this.formGroup.value.language.language_code
      );
      if (this.isCroppedImage) {
        formData.append("user_picture", this.formGroup.value.user_picture);
      } else {
        formData.append("user_picture", this.main.LoggedUserInfo.user_picture);
      }

      var data = formData;
      this.SettingsService.addEditProfile(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/edit-profile`]);
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

  ngAfterViewInit(): void {
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id,
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '132'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '132'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '132'
    }
    if (this.main.LoggedUserInfo.role_id == 8) {
      data.module_key = '136'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }
}
