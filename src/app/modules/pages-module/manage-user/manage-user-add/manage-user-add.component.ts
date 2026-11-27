import {
  ChangeDetectorRef,
  ViewChild,
  Component,
  OnInit,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { crop_rectangleComponent } from "../../model/crop-rectangle/crop-rectangle.component";
import { CommonService } from "src/app/services/common.service";
import { ManageUserService } from "src/app/services/manage-user.service";
import { UsersService } from "src/app/services/users.service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-manage-user-add",
  templateUrl: "./manage-user-add.component.html",
  styleUrls: ["./manage-user-add.component.scss"],
})
export class ManageUserAddComponent implements OnInit, AfterViewInit {
  main: any;
  public formGroup: UntypedFormGroup;
  my_cropped_image_show: any;
  cropped_store_logo: any;
  isCroppedImage = false;
  myCroppedImage: string;
  isSuperAdmin: boolean;
  delivery_model: any;
  isShowDeliveryBoy: boolean;
  page: number = 1;
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  business_model = this.platform_setting.business_model;
  @ViewChild("search")
  public searchElementRef: ElementRef;
  ph_numbr = /^\+?\d{10}$/;
  deliveryboy_label = this.general_setting.deliveryboy_label;
  driver_module = this.general_setting.driver_module;
  store_label = this.general_setting.store_label;
  pos = this.general_setting.pos_module;
  dinein_module = this.general_setting.dinein_module;
  picker = this.general_setting.picker_module;
  isDeliveryModelPlatForm: any;
  pos_allowed: any;
  userlist: any = [];
  isstoremanager: any;
  roleid: any;
  storeList: any = [];
  cropFiles: any;
  croppedImages: any;
  @ViewChild('cursor') cursor;
  mainStoreList: any;
  ChangeManager(item) {
    this.formGroup.controls["selectedstoremanager"].setValue(item);
    this.isstoremanager = item;
    if (this.isstoremanager == 1) {
      this.roleid = 5;
    } else if (this.isstoremanager == 2) {
      this.roleid = 3;
    } else {
      if (this.isstoremanager == 3) {
        this.roleid = 7;
      }
      if (this.isstoremanager == 4) {
        this.roleid = 8;
      }
      if (this.isstoremanager == 5) {
        this.storeList = []
        this.mainStoreList.forEach(element => {
          if (element.iseatery) {
            this.storeList.push(element)
          }
        });
        this.roleid = 9;
      }
      if (this.isstoremanager == 6) {
        this.storeList = []
        this.mainStoreList.forEach(element => {
          if (element.iseatery) {
            this.storeList.push(element)
          }
        });
        this.roleid = 10;
      }
    }
  }

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private UsersService: UsersService,
    private appComponent: AppComponent,
    private ManageUserService: ManageUserService,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private modalService: NgbModal,
    public commonService: CommonService,
    private spinner: SpinnerService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.platform_setting =
      this.platform_setting == null
        ? this.main.platform_setting
        : this.platform_setting;
    this.delivery_model = this.platform_setting.delivery_model;
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());

    this.isSuperAdmin = false;
    this.isShowDeliveryBoy = false;

    if (this.delivery_model == 2 || this.delivery_model == 4) {
      if (
        this.main.LoggedUserInfo.role_id == 6 ||
        this.main.LoggedUserInfo.role_id == 1
      ) {
        this.isSuperAdmin = true;
      }

      if (this.isSuperAdmin == true) {
        this.isShowDeliveryBoy =
          this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
            ? true
            : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
              ? true
              : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
                ? true
                : false;
        if (this.isShowDeliveryBoy == false) {
          this.router.navigate([`/dashboard`]);
        }
      }
    }
    this.main.LoggedUserStoreInfo = JSON.parse(
      session.getSessionLoginUserStore()
    );
    this.isDeliveryModelPlatForm = this.delivery_model != 1 ? false : true;
    this.condition();
    this.loadform();
    this.GetStoreList();
    this.cdr.detectChanges();
  }
  /** Condition for display manage user */
  condition() {

    if (this.main.LoggedUserInfo.role_id == this.main.UserRole.Seller) {
      this.userlist = [
        { label: this.store_label + " Manager", value: 1 },
        { label: this.deliveryboy_label, value: 2 },
        { label: "POS", value: 3 },
        { label: "Picker", value: 4 },
        { label: "Captain", value: 5 },
        { label: "Kitchen", value: 6 },
      ];
      if (this.isDeliveryModelPlatForm == false) {
        this.userlist = [
          { label: this.store_label + " Manager", value: 1 },
          { label: "POS", value: 3 },
          { label: "Picker", value: 4 },
          { label: "Captain", value: 5 },
          { label: "Kitchen", value: 6 },
        ];
      }
    } else if (
      this.main.LoggedUserInfo.role_id == this.main.UserRole.Admin ||
      this.main.LoggedUserInfo.role_id == this.main.UserRole.SuperAdmin
    ) {
      this.userlist = [{ label: this.deliveryboy_label, value: 2 }];
    } else {
      this.userlist = [
        { label: this.deliveryboy_label, value: 2 },
        { label: "POS", value: 3 },
        { label: "Picker", value: 4 },
        { label: "Captain", value: 5 },
        { label: "Kitchen", value: 6 },
      ];
      if (this.isDeliveryModelPlatForm == false) {
        this.userlist = [
          { label: "POS", value: 3 },
          { label: "Picker", value: 4 },
          { label: "Captain", value: 5 },
          { label: "Kitchen", value: 6 },
        ];
      }
    }
    if (this.pos == 0 || this.seller_details?.pos_allowed == 0) {
      this.userlist = this.userlist.filter((x) => x.value !== 3);
    }
    if (this.picker == 0) {
      this.userlist = this.userlist.filter((x) => x.value !== 4);
    }
    if (this.dinein_module == 0 || this.seller_details?.dine_in_allowed == 0) {
      this.userlist = this.userlist.filter((x) => x.value !== 5);
      this.userlist = this.userlist.filter((x) => x.value !== 6);
    }

    if (this.driver_module == 0) {
      this.userlist = this.userlist.filter(x => x.value !== 2);
    }

    if (this.main.LoggedUserStoreInfo) {
      if (this.main.LoggedUserStoreInfo.pos != 1) {
        this.userlist = this.userlist.filter((x) => x.value !== 3);
      }
      if (this.main.LoggedUserStoreInfo.picker != 1) {
        this.userlist = this.userlist.filter((x) => x.value !== 4);
      }
      if (this.main.LoggedUserStoreInfo.dine_in != 1) {
        this.userlist = this.userlist.filter((x) => x.value !== 5);
        this.userlist = this.userlist.filter((x) => x.value !== 6);
      }
      if (this.main.LoggedUserStoreInfo.iseatery != 1) {
        this.userlist = this.userlist.filter((x) => x.value !== 5);
        this.userlist = this.userlist.filter((x) => x.value !== 6);
      }
    }
    this.isstoremanager = this.userlist[0].value;
    if (this.isstoremanager == 1) {
      this.roleid = 5;
    } else if (this.isstoremanager == 2) {
      this.roleid = 3;
    } else {
      if (this.isstoremanager == 3) {
        this.roleid = 7;
      }
      if (this.isstoremanager == 4) {
        this.roleid = 8;
      }
      if (this.isstoremanager == 5) {
        this.roleid = 9;
      }
      if (this.isstoremanager == 6) {
        this.roleid = 10;
      }
    }
    if (this.main.LoggedUserStoreInfo.is_searchable == '0') {
      this.userlist = this.userlist.filter((x) => x.value !== 2);
    }
  }

  loadform() {
    this.formGroup = this.formBuilder.group({
      selectedstoremanager: this.userlist[0].value,
      name: new UntypedFormControl(null, [Validators.required]),
      phone: new UntypedFormControl(null, [Validators.required]),
      selectedstore: new UntypedFormControl(null, [Validators.required]),
      user_picture: new UntypedFormControl("assets/icons/no_image.svg"),
    });
    this.isstoremanager = this.userlist[0].value;
    if (this.isstoremanager == 1) {
      this.roleid = 5;
    } else if (this.isstoremanager == 2) {
      this.roleid = 3;
    } else {
      if (this.isstoremanager == 3) {
        this.roleid = 7;
      }
      if (this.isstoremanager == 4) {
        this.roleid = 8;
      }
      if (this.isstoremanager == 5) {
        this.roleid = 9;
      }
      if (this.isstoremanager == 6) {
        this.roleid = 10;
      }
    }
  }

  //get storelist
  async GetStoreList() {
    this.spinner.show();
    var data = {
      user_id: this.main.LoggedUserInfo.user_id,
    };
    await this.UsersService.getUserStoreRoles(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          var stores = [];
          response.data.forEach((item) => {
            if (item.role_id == 2 || item.khata_user == 0) {
              stores.push(item);
            }
          });
          this.storeList = [{ label: "All", name: "All", value: 0 }];
          stores.forEach((item) => {
            var data = {
              label: item.store_name + "(" + item.name + ")",
              name: item.store_name,
              value: item.store_id,
            };
            this.storeList.push(data);
          });

          this.storeList = this.storeList.sort((a, b) => a.name.localeCompare(b.name));
          this.mainStoreList = this.storeList
          if (this.isSuperAdmin == false) {
            this.formGroup.controls["selectedstore"].setValue([
              this.main.LoggedUserStoreInfo.store_id
            ]);
          }
        }
      },
      error: () => { },
      complete: () => { },
    });
  }

  onStoreSelect(data) {
    if (
      this.formGroup.value.selectedstore[0] !=
      this.main.LoggedUserStoreInfo.store_id
    ) {
      if (this.isSuperAdmin == false) {
        this.formGroup.controls["selectedstore"].setValue([
          this.main.LoggedUserStoreInfo.store_id,
        ]);
      }
    }

    if (data[data.length - 1] == 0) {
      var temp = [];
      this.formGroup.controls["selectedstore"].setValue("");
      this.storeList.forEach((element) => {
        if (element.value != 0) {
          temp.push(element.value);
        }
      });
      this.formGroup.controls["selectedstore"].setValue(temp);
    }
  }

  //image
  openUpdateUserProfPicModal() {
    const modalRef = this.modalService.open(crop_rectangleComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.my_cropped_image_show;
    modalRef.componentInstance.imageChangedEvent = this.myCroppedImage
    modalRef.componentInstance.imageChangedEvent = this.croppedImages
    modalRef.componentInstance.cropFiles = this.cropFiles
    modalRef.componentInstance.newseller = this.cropped_store_logo == undefined ?
      this.formGroup.value.store_logo : this.cropped_store_logo;
    modalRef.componentInstance.isCroppedImage = this.isCroppedImage;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.editProfilePic(receivedEntry);
    });
  }

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
  /** Submit method for add/edit data of manage user  */
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    }
    else {
      let formData = new FormData();
      formData.append("user_id", this.main.LoggedUserInfo.user_id);
      formData.append("role_id", this.roleid);
      formData.append(
        "store_id",
        this.formGroup.value.selectedstore.toString()
      );

      formData.append("phone", this.formGroup.value.phone);
      formData.append("name", this.formGroup.value.name);
      if (this.isCroppedImage) {
        formData.append("user_picture", this.formGroup.value.user_picture);
      } else {
        formData.append("user_picture", "");
      }
      var data = formData;
      this.ManageUserService.addpos(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/manage-user`]);
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

  validateDecimal(event) {
    var charCode = event.keyCode;
    if ((charCode < 48 || charCode > 57) && charCode != 46) {
      event.preventDefault();
    }
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }
}
