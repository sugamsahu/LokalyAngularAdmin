import {
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnInit,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

import { SpinnerService } from "src/app/services/custom/spinner.service";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "src/app/services/common.service";
import Swal from "sweetalert2";
import { StoreService } from "src/app/services/store.service";
import { Router } from "@angular/router";
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-store-link",
  templateUrl: "./store-link.component.html",
  styleUrls: ["./store-link.component.scss"],
})
export class StoreLinkComponent implements OnInit {
  @Input() roleId: any;
  public formGroup: FormGroup;
  isActiveCode;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  webadmin_url = this.generalSetting.webadmin_url;
  storeUniqCode: any;
  Role_id: any;
  style_obj_store_link: any;
  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    public CommonService: CommonService,
    private StoreService: StoreService,
    private spinner: SpinnerService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private router: Router,
    private clipboardService: ClipboardService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_store_link = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    if (this.roleId) {
      this.Role_id = this.roleId;
    }
    this.loadForm();
    this.getStorelink();
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      UrL: [""],
    });
  }

  //get link
  getStorelink() {
    var data: any = {};
    if (this.Role_id == 6 || this.Role_id == 1) {
      var sellerDetailForUniqLink = JSON.parse(localStorage.getItem('UniqLinkSellerDetails'));
      data.store_id = sellerDetailForUniqLink.store_id;
      if (sellerDetailForUniqLink.store_id > 0) {
        this.GetStoreUniqCode(data);
      }
      else {
        var objdata = {}
        this.GetPlatformUniqCode(objdata);
      }
    }
    else {
      data.store_id = this.sellerDetails.store_id;
      this.GetStoreUniqCode(data);
    }
  }

  async GetStoreUniqCode(data) {
    await this.StoreService.getStoreUniqCode(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (this.Role_id == 6 || this.Role_id == 1) {
            var sellerDetailForUniqLink = JSON.parse(localStorage.getItem('UniqLinkSellerDetails'));
            if (sellerDetailForUniqLink.store_id > 0) {
              this.storeUniqCode = response.data.store_code;
              this.isActiveCode = response.data.is_store_link_active;
            } else {
              this.storeUniqCode = response.data.platform_code;
              this.isActiveCode = response.data.is_platform_link_active;
            }
          } else {
            this.storeUniqCode = response.data.store_code;
            this.isActiveCode = response.data.is_store_link_active;
          }
          this.GenerateLink();
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }

  async GetPlatformUniqCode(objdata) {
    await this.StoreService.getPlatformUniqCode(objdata).subscribe({
      next: (response: any) => {
        if (response.status == 1) {

          if (this.Role_id == 6 || this.Role_id == 1) {
            var sellerDetailForUniqLink = JSON.parse(localStorage.getItem('UniqLinkSellerDetails'));
            if (sellerDetailForUniqLink.store_id > 0) {
              this.storeUniqCode = response.data.store_code;
              this.isActiveCode = response.data.is_store_link_active;
            } else {
              this.storeUniqCode = response.data.platform_code;
              this.isActiveCode = response.data.is_platform_link_active;
            }
          } else {
            this.storeUniqCode = response.data.store_code;
            this.isActiveCode = response.data.is_store_link_active;
          }
          this.GenerateLink();
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }

  //manage link
  async ManageStoreOrderLink(url, isActive) {
    var data = {
      is_store_link_active: isActive,
      store_link: url,
      store_id: null,
      platform_link: null,
      is_platform_link_active: null,
    };
    if (this.Role_id == 6 || this.Role_id == 1) {
      var sellerDetailForUniqLink = JSON.parse(localStorage.getItem('UniqLinkSellerDetails'));
      if (sellerDetailForUniqLink.store_id > 0) {
        data.store_id = sellerDetailForUniqLink.store_id;
      } else {
        var objdata = {
          platform_link: url,
          is_platform_link_active: isActive,
        };

        await this.StoreService.managePlatformOrderLink(objdata).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              // this.closeURLmodel();
              if (this.get_new_url) {
                this.getStorelink();
              } else {
                this.closeURLmodel();
              }
              this.cdr.detectChanges();
            }
          },
          error: (error) => {
          },
          complete: () => {
          },
        });
      }
    } else {
      data.store_id = this.sellerDetails.store_id;
    }

    await this.StoreService.manageStoreOrderLink(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          // this.closeURLmodel();
          if (this.get_new_url) {
            this.getStorelink();
          } else {
            this.closeURLmodel();
          }
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }

  //create link
  GenerateLink() {
    var webAdmin_URL = this.webadmin_url;
    // var UrL = webAdmin_URL + "#/ordertracking?storeid=" + this.storeUniqCode;
    var UrL = webAdmin_URL + "/ordertracking?storeid=" + this.storeUniqCode;

    this.formGroup.controls["UrL"].setValue(UrL);

    if (this.get_new_url) {
      this.clipboardService.copyFromContent(UrL);
      this.toastr.success(this.translate.instant("URL_COPIED_TO_CLIPBOARD"));
      this.closeURLmodel();
    }
  }

  get_new_url: boolean = false;
  //copy link
  copyURL(isActive) {
    let elementText: any = $("#UrL").val();
    if (isActive) {
      this.clipboardService.copyFromContent(elementText);
      this.toastr.success(this.translate.instant("URL_COPIED_TO_CLIPBOARD"));
    } else {
      this.get_new_url = true;
    }
    if (this.isActiveCode == "0") {
      this.ManageStoreOrderLink(elementText, 1);
    }
  }

  //delete link
  deleteStoreURL() {
    Swal.fire({
      title: this.translate.instant(
        "ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_LINK"
      ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.Confirm();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // console.log("cancelled");
      }
    });
  }
  Confirm() {
    let elementText = $("#UrL").val();
    this.router.navigate(["/dashboard"]);

    this.ManageStoreOrderLink(elementText, 0);
  }

  closeURLmodel() {
    this.activeModal.dismiss();
  }
  //sumbit
  onSubmit() { }
}
