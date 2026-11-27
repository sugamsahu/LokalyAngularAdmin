import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
@Component({
  selector: "app-activity-log-details",
  templateUrl: "./activity-log-details.component.html",
  styleUrls: ["./activity-log-details.component.scss"],
})
export class ActivitylogDetailsComponent implements OnInit {
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  @Input() details: any;
  @Input() timedetails: any;
  @Input() linkdetail: any;
  @Input() sessionConfig: any;
  @Input() LoggedUserInfo: any;
  @Input() Crypto: any;

  public formGroup: UntypedFormGroup;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  license: any;
  global_timezone: any;
  remove_link: any;
  isKhataUser = false;
  sen_config: any;
  user_info: any;
  crypto_key: any;
  style_obj_activity_log: any;
  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    private router: Router
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.license = this.details;
    this.global_timezone = this.timedetails;
    this.remove_link = this.linkdetail;
    this.sen_config = this.sessionConfig;
    this.user_info = this.LoggedUserInfo;
    this.crypto_key = this.Crypto;
    this.style_obj_activity_log = {
      "--css_button_business_default": this.general_setting.css_button_business_default,
      "--css_button_business_font": this.general_setting.css_button_business_font
    }
  }

  /** Edit activity log details using id */
  editSeller(sellerid, storeID) {
    this.sen_config.encryptIdValue(
      sellerid.toString(),
      "storeManage_sellerid" + this.user_info.toString(),
      this.crypto_key
    );
    this.sen_config.encryptIdValue(
      storeID.toString(),
      "storeManage_storeID" + this.user_info.toString(),
      this.crypto_key
    );
    this.router.navigate(["/sellers/edit/", sellerid]);
    this.closeURLmodel();
  }

  closeURLmodel() {
    this.activeModal.dismiss();
  }
}