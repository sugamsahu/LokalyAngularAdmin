import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-business-hours-info",
  templateUrl: "./business-hours-info.component.html",
  styleUrls: ["./business-hours-info.component.scss"],
})
export class BusinessHoursInfoComponent implements OnInit {
  @Input() StoreLabel: any;
  store_label: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_business_hours_info:any;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService
  ) {
    this.translate.addLangs(["it","en","de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan")||'en');
  }

  ngOnInit(): void {
    this.style_obj_business_hours_info = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.store_label = this.StoreLabel;
  }
}
