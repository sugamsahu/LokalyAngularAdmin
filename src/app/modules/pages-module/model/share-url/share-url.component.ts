import {
  Component,
  OnInit,
  Output,
  ChangeDetectorRef,
  EventEmitter,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-share-url",
  templateUrl: "./share-url.component.html",
  styleUrls: ["./share-url.component.scss"],
})
export class shareURLComponent implements OnInit {
  @Output() shareURL: EventEmitter<any> = new EventEmitter();
  public users: any;
  public UrL: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.generalSetting.store_label;
  LicenseInfo: any;
  whatsappURL: any;
  facebookURL: string;
  skypeURL: string;
  pinterestURL: string;
  linkedinURL: string;
  email: string;
  Sharer: any;
  twitterURL: any;
  style_obj_share_url: any;

  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private toastr: ToastrService,
    private clipboardService: ClipboardService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit() {
    this.style_obj_share_url = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.twitterURL = 'http://twitter.com/share?text=text goes here&url=' + this.UrL + 'Url&hashtags=hashtag;',
      this.facebookURL = 'https://www.facebook.com/sharer/sharer.php?u=' + this.UrL + '&amp;src=sdkpreparse',
      this.pinterestURL = 'https://in.pinterest.com/pin/create/button/?url=' + this.UrL,
      this.linkedinURL = 'https://www.linkedin.com/sharing/share-offsite/?url=' + this.UrL,
      this.skypeURL = 'https://web.skype.com/share?url=' + this.UrL,
    this.email = 'mailto:?body=' + this.UrL

    this.cdr.detectChanges();
    if (this.Sharer !== undefined) {
      this.Sharer.init();
    }
  }

  copyURL(url) {
    this.clipboardService.copyFromContent(url);
    this.toastr.success(this.translate.instant("URL_COPIED_TO_CLIPBOARD"));
  }
}
