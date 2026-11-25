import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";

import { ItemService } from "src/app/services/item.service";

@Component({
  selector: "app-add-addons",
  templateUrl: "./add-addons.component.html",
  styleUrls: ["./add-addons.component.scss"],
})
export class AddAddonsModelComponent implements OnInit {
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));

  @Input() masterAddOnList: any;
  @Output() addOnPriceList: EventEmitter<any> = new EventEmitter();
  closeResult = '';
  selectedAddOn: any;
  selectedAddOnPriceList: any = [];
  style_obj_add_addons: any;
  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    public translate: TranslateService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_add_addons = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

  saveMasterAddOn() {
    if (this.selectedAddOn == undefined) {
      this.toastr.error(this.translate.instant('PLEASE_SELECT_ADDON'));
      return;
    }

    var existaddon = this.selectedAddOnPriceList.filter((ad: any) => ad.addon_id == this.selectedAddOn);

    if (existaddon.length > 0) {
      this.toastr.error(this.translate.instant('ADDON_ALREADY_SELECTED'));
      return;
    }

    var addons = this.masterAddOnList.filter((ad: any) => ad.addon_id == this.selectedAddOn);
    this.addOnPriceList.emit(addons);
    this.selectedAddOn = undefined;
    this.modal.close();
  }

  changeAddOn(item: any) {
    this.selectedAddOn = item;
  }

}
