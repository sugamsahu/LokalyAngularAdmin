import {
  Component,
  OnInit,
  Output,
  ChangeDetectorRef,
  EventEmitter,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
@Component({
  selector: "app-renew-license",
  templateUrl: "./renew-license.component.html",
  styleUrls: ["./renew-license.component.scss"],
})
export class renew_licenseComponent implements OnInit {
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  public users: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.generalSetting.store_label;
  LicenseInfo: any;
  style_obj_renew_license: any;

  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit() {
    this.style_obj_renew_license = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.cdr.detectChanges();
  }

}
