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
import { environment } from "src/environments/environment";
import { UntypedFormGroup } from "@angular/forms";
import { CommonService } from "src/app/services/common.service";
import { VERSION } from '@angular/core';
import * as diff from 'diff';
import * as Diff2html from 'diff2html';
import { DoCheck } from '@angular/core';
import { isEqual } from 'lodash';

@Component({
  selector: "app-audit-log-details",
  templateUrl: "./audit-log-details.component.html",
  styleUrls: ["./audit-log-details.component.scss"]
})

export class AuditLogDetailComponent implements OnInit {
  objectKeys = Object.keys;
  @Output() shareURL: EventEmitter<any> = new EventEmitter();
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  tableSize: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  @Input() audutLogDetails: any;
  isdetails = 1;
  no_data: boolean;
  activityLogslist: any[];
  @Input() session: any;
  viewOrder: any;
  closeResult: any;
  @Input() main: any;
  json1: any = { key1: 'value1', key2: 'value' };
  json2: any = { key1: 'value2', key2: 'updatedValue' };
  outputHtml:any;
  style_obj_order_details:any;
  
  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    public commonService: CommonService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  formGroup: UntypedFormGroup
  jsonString1:any;
  jsonString2:any;
  data:any = {};
  ngOnInit() {
    this.style_obj_order_details = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
        // Convert objects to JSON strings for comparison
        this.data.pre_data = JSON.parse(this.audutLogDetails.pre_data);
        this.data.post_data = JSON.parse(this.audutLogDetails.post_data);
        this.jsonString1 = JSON.stringify(JSON.parse(this.audutLogDetails.pre_data), null, 2);
        this.jsonString2 = JSON.stringify(JSON.parse(this.audutLogDetails.post_data), null, 2);
    this.getDiff();
    this.cdr.detectChanges();
  }
  areObjectsEqual: boolean;
  getDiff() {
    this.areObjectsEqual = isEqual(this.data.pre_data, this.data.post_data);
    const targetElement = document.getElementById('test');
    const configuration = {
      drawFileList: false,
      matching: 'lines',
    };

    const diffText = diff.createTwoFilesPatch(
      'file',
      'file',
      this.jsonString1,
      this.jsonString2
    );


    let outputHtml = Diff2html.html(diffText, {
      drawFileList: false,
      matching: 'words',
      outputFormat: 'side-by-side',
    });

    this.outputHtml = outputHtml;
  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.generalSetting.date_format_web.split(' ')[0];
  }

  DateFormateFromServerSide() {
    return this.generalSetting.date_format_web;
  }


}
