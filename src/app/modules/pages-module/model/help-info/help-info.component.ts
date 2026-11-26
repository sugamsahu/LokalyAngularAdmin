import { Component, OnInit, Input } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { BannerService } from "src/app/services/configuration/banner.service";
import { trustCleanHtml } from "src/app/utils/safe-html";
@Component({
  selector: "app-help-info",
  templateUrl: "./help-info.component.html",
  styleUrls: ["./help-info.component.scss"],
})
export class HelpInfoModelComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  User = JSON.parse(localStorage.getItem("LoginUserDetails"));
  language_id = localStorage.getItem("select_lan_id") || "1";
  store_label = this.generalSetting.store_label;
  khata_label = this.generalSetting.khata_label;
  deliveryboy_label = this.generalSetting.deliveryboy_label;
  platform_name = this.generalSetting.platform_name;
  @Input() selected: any;
  @Input() helpDetails:any;
  style_obj_help_info_model:any;
  sanitizeHtml(value: string): SafeHtml {
    return trustCleanHtml(this.sanitizer, value); // scripts and event handlers removed
  }
  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    public bannerService:BannerService,
    private sanitizer: DomSanitizer
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }
  
  ngOnInit(): void {
    this.style_obj_help_info_model = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

  downloadNow(){
    window.open(this.helpDetails?.attachment, "_blank");
  }
  getSanitizedHtml() {
    return this.sanitizeHtml(this.helpDetails.module_value);
  }
}
