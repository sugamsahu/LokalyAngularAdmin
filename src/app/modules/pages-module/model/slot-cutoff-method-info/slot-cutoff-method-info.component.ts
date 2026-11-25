import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";


@Component({
  selector: "app-slot-cutoff-method-info",
  templateUrl: "./slot-cutoff-method-info.component.html",
  styleUrls: ["./slot-cutoff-method-info.component.scss"],
})
export class SlotCutoffMethodinfoModelComponent implements OnInit {
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  closeResult = '';
  style_obj_slot_cutoff_method_info: any;
  constructor(
    public modal: NgbActiveModal,
    public translate: TranslateService,
  ) { 
    this.translate.addLangs(["it","en","de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan")||'en');
  }

  ngOnInit(): void {
    this.style_obj_slot_cutoff_method_info = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    }
  }
