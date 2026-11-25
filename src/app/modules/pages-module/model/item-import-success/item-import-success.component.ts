import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-item-import-success',
  templateUrl: './item-import-success.component.html',
  styleUrls: ['./item-import-success.component.scss']
})
export class itemImportSuccessModelComponent implements OnInit {
  @Input() TotalUploadItems: any;
  @Input() SuccessUploadItems: any;
  @Input() FailedUploadItems: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_item_import_success:any;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_item_import_success = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

  GoToItemMaster = function () {
    localStorage.setItem('importSuccessURL', 'true')
    this.activeModal.dismiss('Cross click')
    this.router.navigate(["/items/Best Seller"]);
}

viewItemsNotimported  () {
  this.activeModal.dismiss('Cross click')
}

}


