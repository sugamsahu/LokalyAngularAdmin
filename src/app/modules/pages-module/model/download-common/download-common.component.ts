import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CommonConfigurationService } from 'src/app/services/configuration/common-configuration.service';

import { SpinnerService } from 'src/app/services/custom/spinner.service';

@Component({
  selector: 'app-download-common',
  templateUrl: './download-common.component.html',
  styleUrls: ['./download-common.component.scss']
})
export class DownloadCommonComponent implements OnInit {

  @Input() main: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_download_common:any;


  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    private commonConfigurationServices: CommonConfigurationService,
    private spinner: SpinnerService,
    private toastr: ToastrService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_download_common = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

  async downloadConfig(type:any){
    this.spinner.show()
    var data = {
      type:type
    }
    await this.commonConfigurationServices.downloadGlobalSetting(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          setTimeout(() => {
          this.spinner.show()
        }, 500);
          setTimeout(() => {
            window.open(response.data.zipFileUrl)
          this.spinner.hide()
          }, 5000);
          console.log(response)
          this.toastr.success(response.message)
          this.spinner.show()
        }else{
          this.spinner.hide()
          this.toastr.error(response.message)
        }
      },
      error: (error) => { 
        this.spinner.hide()
      },
      complete: () => { 
        console.log("completed")
      },
    });
  }

}
