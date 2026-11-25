import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { OwlOptions } from 'ngx-owl-carousel-o';
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: 'app-view-multiple-image',
  templateUrl: './view-multiple-image.component.html',
  styleUrls: ['./view-multiple-image.component.scss']
})
export class ViewMultipleImageComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @Input() images;
  @Input() item_name;
  style_obj_view_multiple_image: any;
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
    responsive: {
      0: {
        items: 1
      },
    },
    nav: true
  }

  constructor(public modal: NgbActiveModal, private translate: TranslateService, public sanitizer: DomSanitizer,) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.images.forEach((img) => {
      if (img.type == 3) {
        img.image = this.sanitizer.bypassSecurityTrustResourceUrl(img.image);
      }
    });
    this.style_obj_view_multiple_image = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    // $(
    //   "<style>.owl-theme .owl-nav [class*=owl-]{  background: #e6d39e !important;}</style>"
    // ).appendTo("body");
  }

}
