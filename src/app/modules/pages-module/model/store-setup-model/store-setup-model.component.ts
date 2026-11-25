import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { BannerService } from "src/app/services/configuration/banner.service";
@Component({
  selector: "app-store-setup-model",
  templateUrl: "./store-setup-model.component.html",
  styleUrls: ["./store-setup-model.component.scss"],
})
export class StoreSetupModelComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  User = JSON.parse(localStorage.getItem("LoginUserDetails"));
  language_id = localStorage.getItem("select_lan_id") || "1";
  store_label = this.generalSetting.store_label;
  khata_label = this.generalSetting.khata_label;
  deliveryboy_label = this.generalSetting.deliveryboy_label;
  platform_name = this.generalSetting.platform_name;
  @Input() storeSetupDetails:any;
  style_obj_help_info_model:any;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    public bannerService:BannerService
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
}
