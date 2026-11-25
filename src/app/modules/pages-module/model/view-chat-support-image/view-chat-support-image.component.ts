import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { OwlOptions } from 'ngx-owl-carousel-o';
@Component({
  selector: 'app-view-chat-support-image',
  templateUrl: './view-chat-support-image.component.html',
  styleUrls: ['./view-chat-support-image.component.scss']
})
export class ViewChatSupportImageComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @Input() images:any;
  @Input() item_name:any;
  style_obj_view_chat_support_image: any;

  constructor(public modal: NgbActiveModal, private translate: TranslateService) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_view_chat_support_image = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    console.log(this.images);
    // $(
    //   "<style>.owl-theme .owl-nav [class*=owl-]{  background: #e6d39e !important;}</style>"
    // ).appendTo("body");
  }

}
