import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-add-attribute",
  templateUrl: "./add-attribute.component.html",
  styleUrls: ["./add-attribute.component.scss"],
})
export class AddAttributeModelComponent implements OnInit {
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  closeResult = '';
  style_obj_add_attribute:any;
  constructor(
    public modal: NgbActiveModal,
    public translate: TranslateService,
  ) { 
    this.translate.addLangs(["it","en","de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan")||'en');    
  }

  ngOnInit(): void {
    this.style_obj_add_attribute = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }
}