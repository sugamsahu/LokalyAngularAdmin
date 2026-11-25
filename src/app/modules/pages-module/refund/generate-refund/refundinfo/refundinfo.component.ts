import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-refundinfo',
  templateUrl: './refundinfo.component.html',
  styleUrls: ['./refundinfo.component.scss']
})
export class RefundinfoComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_refund_info: any;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_refund_info = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }
  /** Refund info file download */
  FileDownload(url: any) {
    if (url != undefined) {
      var fileName = url.substr(url.lastIndexOf('/') + 1);
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onprogress = function (event) {
        if (event.lengthComputable) {
          var percentComplete = (event.loaded / event.total) * 100;
        }
      };

      xhr.onload = function (event) {
        if (this.status == 200) {
          var aelement = document.createElement("a");
          document.body.appendChild(aelement);
          var url = window.URL.createObjectURL(this.response);
          aelement.href = url;
          aelement.download = fileName;
          aelement.click();
          document.body.removeChild(aelement);
        }
      };

      xhr.send();
    }

  }
}
