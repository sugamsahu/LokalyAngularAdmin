import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
} from "@angular/forms";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ManageStoreService } from 'src/app/services/manage-store.service';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CropBannerImageComponent } from "../../../model/crop-banner-image/crop-banner-image.component";
import { CookieService } from "ngx-cookie-service";
import { ToastrService } from "ngx-toastr";


@Component({
  selector: 'app-banner-setting-add',
  templateUrl: './banner-setting-add.component.html',
  styleUrls: ['./banner-setting-add.component.scss']
})
export class BannerSettingAddComponent implements OnInit, AfterViewInit {
  seller_details = JSON.parse(localStorage.getItem('loginUserStore'));
  manageType = { table_no: "" };
  Unit_form: any;
  main: any
  bannerid: any = 0;
  public formGroup: FormGroup;
  store_id: any;
  display_id: any = 0;
  my_cropped_image_show: any;
  cropped_item_image: any;
  is_cropped_image = false;
  myCroppedImage: string;
  customer_user_pic: boolean;
  banner: {};
  store_banner_id: any;
  bannerList: any = [];
  croppedImages: any;
  cropFiles: any;
  @ViewChild('cursor') cursor;
  session = this.appComponent.sessionConfig();
  customer_User_Id: any = 0;
  editdetails: any;
  id: any;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private manageStoreService: ManageStoreService,
    private appComponent: AppComponent,
    private cookieService: CookieService,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private modalService: NgbModal,
    private cryptoService: CryptoService,
    private toastr: ToastrService
  ) {
    translate.addLangs(["it", "en", "de"]);
    translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    if (location.href.indexOf("/storebanner/edit") > -1) {
      this.bannerid = this.cryptoService.decryptIdValue(
        "banner-setting" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.bannerid == undefined) {
        this.router.navigate(["/storebanner"]);
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
      store_banner_id: new FormControl(null),
      store_id: this.seller_details.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
      picture: new FormControl('assets/icons/no_image.svg'),
      display_id: new FormControl(0),
    });
    this.getStoreBanners()
    if (this.bannerid) {
      this.getbyid();
    }
    this.cdr.detectChanges();
  }

  getStoreBanners(): void {
    var data = {
      page: 0,
      store_id: this.seller_details.store_id,
    };
    this.manageStoreService.getStoreBanners(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.bannerList = response.data;
          if (!this.bannerid) {
            this.bannerList.forEach(banner => {
              if (banner.display_id > this.formGroup.value.display_id) {
                this.formGroup.controls['display_id'].setValue(banner.display_id)
              }
            });
            this.formGroup.controls['display_id'].setValue(this.formGroup.value.display_id + 1)
          }
        } else {
          this.toastr.error(response.message);
          this.bannerList = [];
        }
      },
      error: (error) => {
      },
      complete: () => {
        ;
      },
    });
  }
  /** Submit method for add/edit data of banner setting */


  /** Get store banner by id using service */
  getbyid() {
    var data = {
      store_id: this.seller_details.store_id
    };
    this.manageStoreService.getStoreBanners(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach(element => {
            if (element.store_banner_id == this.bannerid) {
              this.editdetails = element;
            }
          });
          this.formGroup.controls["picture"].setValue(this.editdetails?.banner);
          this.formGroup.controls["store_banner_id"].setValue(this.editdetails?.store_banner_id);
          this.formGroup.controls["store_id"].setValue(this.editdetails?.store_id);
          this.formGroup.controls["display_id"].setValue(this.editdetails?.display_id);
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }

  changeseq() {
    this.display_id = jQuery("input[name=displaysq]").val();
  }

  /** Open CropBannerImageComponent modal */
  openUpdateUserProfPicModal() {
    const modalRef = this.modalService.open(CropBannerImageComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.my_cropped_image_show;
    modalRef.componentInstance.imageChangedEvent = this.myCroppedImage
    modalRef.componentInstance.imageChangedEvent = this.croppedImages
    modalRef.componentInstance.cropFiles = this.cropFiles
    modalRef.componentInstance.customer_user_pic = true;
    modalRef.componentInstance.newseller =
      this.cropped_item_image == undefined
        ? this.formGroup.value.picture
        : this.cropped_item_image;
    modalRef.componentInstance.isCroppedImage = this.is_cropped_image;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.editProfilePic(receivedEntry);
    });
  }

  editProfilePic(item) {
    if (item.crop_image_file != undefined) {
      this.is_cropped_image = true;
      this.cropFiles = item.cropFiles
      this.croppedImages = item.croppedImages
      this.cropped_item_image = item.crop_image;
      this.formGroup.controls["picture"].setValue(item.crop_image_file);
      this.myCroppedImage = item.full_image;
    }
    this.cdr.detectChanges();
  }

  removeLogoImage() {
    this.formGroup.value.user_picture = "assets/icons/no_image.svg";
    this.is_cropped_image = false;
    this.myCroppedImage = "";
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

  onSubmit() {
    var ismatch = false;
    if (this.bannerid == undefined) {
      for (var i = 0; i < this.bannerList.length; i++) {
        if (this.bannerList[i].display_id == this.formGroup.value.display_id) {
          ismatch = true;
          break;
        }
      }
    }
    else {
      for (var i = 0; i < this.bannerList.length; i++) {
        if (this.bannerList[i].display_id == this.formGroup.value.display_id && this.bannerList[i].store_banner_id != this.bannerid) {
          ismatch = true;
          break;
        }
      }
    }
    if (ismatch) {
      this.toastr.error(this.translate.instant("DISPLAY_SEQUENCE_SHOULD_BE_UNIQ"));
      return;
    }
    if (!this.formGroup.valid) {
      return;
    } else {
      if (this.bannerid) {
        var fd = new FormData();
        fd.append("user_id", this.main.LoggedUserInfo.user_id);
        fd.append("store_id", this.seller_details.store_id);
        fd.append('store_banner_id', this.bannerid);
        if (this.is_cropped_image) {
          fd.append("banner", this.formGroup.value.picture);
        }
        else {
          fd.append("banner", this.editdetails.banner);
        }
        this.display_id = this.formGroup.value.display_id;
        fd.append("display_id", this.display_id);
        if (this.formGroup.value.picture == undefined || this.formGroup.value.picture == '' || this.formGroup.value.picture == 'assets/icons/no_image.svg') {
          this.toastr.error(this.translate.instant("PLEASE_SELECT_BANNER_IMAGE"));
          return;
        }
        if (this.display_id == undefined || this.display_id == '' || this.display_id == '0') {
          this.toastr.error(this.translate.instant("PLEASE_ENTER_DISPLAY_SEQUENCE"));
          return;
        }
      }
      else {
        var fd = new FormData();
        fd.append("user_id", this.main.LoggedUserInfo.user_id);
        fd.append("store_id", this.seller_details.store_id);
        if (this.is_cropped_image) {
          fd.append("banner", this.formGroup.value.picture);
        }
        this.display_id = this.formGroup.value.display_id;
        fd.append("display_id", this.display_id);
        if (this.formGroup.value.picture == undefined || this.formGroup.value.picture == '' || this.formGroup.value.picture == 'assets/icons/no_image.svg') {
          this.toastr.error(this.translate.instant("PLEASE_SELECT_BANNER_IMAGE"));
          return;
        }
        if (this.display_id == undefined || this.display_id == '' || this.display_id == '0') {
          this.toastr.error(this.translate.instant("PLEASE_ENTER_DISPLAY_SEQUENCE"));
          return;
        }
      }
      this.manageStoreService.addEditStoreBanner(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/storebanner`]);
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
}
