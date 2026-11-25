import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "src/app/services/common.service";
@Component({
  selector: "app-item-details",
  templateUrl: "./item-details.component.html",
  styleUrls: ["./item-details.component.scss"],
})
export class ItemDetailsComponent implements OnInit {
  @Input() viewItem: any;
  @Input() newItem: any;
  @Input() varientItem: any;
  @Input() show_price_same_font;
  @Input() is_pos: any = false;
  @Input() is_display_item_type;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_item_details: any;
  counter = 0;
  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.style_obj_item_details = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    if (this.is_pos) {
      $(
        "<style>.card-body {  padding: 0.75rem !important; padding-top: 0.2rem !important; padding-bottom: 0rem !important}</style>"
      ).appendTo("body");
      $(
        "<style>.mat-tab-body.mat-tab-body-active{ z-index: 0 !important;}</style>"
      ).appendTo("body");
      $(
        "<style>.mat-tab-header{ z-index: 0 !important;}</style>"
      ).appendTo("body");
    }
  }

  OpenImageInNewTab(element) {
    window.open(element.image, "_blank");
  }
}
