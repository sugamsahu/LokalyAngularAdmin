import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { HelpInfoModelComponent } from '../help-info/help-info.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.scss']
})
export class AddNoteComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @Input() item;
  note: any;
  @Output() Note: EventEmitter<any> = new EventEmitter();
  style_obj_add_note: any;
  @Input() for_url;
  url: any;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  category_tag_name: any
  constructor(public activeModal: NgbActiveModal,
    public translate: TranslateService, private modalService: NgbModal, private _helpService: BannerService, private toastr: ToastrService) { }

  ngOnInit(): void {
    if (this.for_url) {
      this.getHelpDetails();
    }
    // $(
    //   "<style>.modal-dialog { max-width: 500px ;}</style>"
    // ).appendTo("body");
    if (!this.for_url) {
      this.note = this.item.item_remark
    }
    this.style_obj_add_note = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.category_tag_name= JSON.parse(localStorage.getItem("loginUserStore")).category_tag_name.split(",")
  }
  
  /** Sending data using event emitter */
  submitNote() {
    if (!this.for_url) {
      this.Note.emit(this.note);
      this.activeModal.dismiss();
    } else {
      const pattern = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

      if (pattern.test(this.url)) {
        this.Note.emit(this.url);
        this.activeModal.dismiss();
      } else {
        this.toastr.error(this.translate.instant('PLEASE_UPLOAD_A_VALID_URL'));
        return;
      }
    }
  }

  clear() {
    if (!this.for_url) {
      this.note = null;
    } else {
      this.url = null;
    }
  }

  AddNote(item) {
    if (this.note == null || !this.note) {
      this.note = item
    } else {
      this.note = this.note + ", " + item
    }
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    data.module_key = '144'

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_details = response.data;
        }
      },
      error: (error) => {
      },
      complete: () => { },
    });
  }
}
