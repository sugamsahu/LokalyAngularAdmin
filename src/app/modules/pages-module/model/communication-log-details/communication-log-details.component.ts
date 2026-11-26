import {
  Component,
  OnInit,
  Output,
  ChangeDetectorRef,
  EventEmitter,
  Input,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "src/app/services/common.service";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { trustCleanHtml } from "src/app/utils/safe-html";


@Component({
  selector: "app-communication-log-details",
  templateUrl: "./communication-log-details.component.html",
  styleUrls: ["./communication-log-details.component.scss"]
})

export class CommunicationLogDetailComponent implements OnInit {
  @Output() shareURL: EventEmitter<any> = new EventEmitter();
  @Input() communicationLogDetails: any;
  @Input() session: any;
  @Input() main: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  no_data: boolean;
  activityLogslist: any[];
  style_obj_order_details:any;
  screen_width:any;

  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    public commonService: CommonService,
    private sanitizer: DomSanitizer
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit() {
    this.style_obj_order_details = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.screen_width = window.innerWidth;
    this.cdr.detectChanges();
  }

  sanitizeHtml(value: string): SafeHtml {
    return trustCleanHtml(this.sanitizer, value); // scripts and event handlers removed
  }

  getSanitizedHtml(value:any) {
    return this.sanitizeHtml(value);
  }

}
