import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from 'ngx-toastr';

declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-voice-search',
  templateUrl: './voice-search.component.html',
  styleUrls: ['./voice-search.component.scss']
})
export class VoiceSearchComponent implements OnInit {
  @ViewChild("searchKey") hiddenSearchHandler;
  @ViewChild("gSearch") formSearch;
  @Input() isVoiceSearch
  @Output() Voice: EventEmitter<any> = new EventEmitter();
  voiceNotAllow: boolean;
  search: any;
  voiceSearchstr: any;
  constructor(public activeModal: NgbActiveModal, 
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.voiceSearch();
  }

  voiceSearch() {
      let that = this;
      that.isVoiceSearch = true;
      that.voiceNotAllow = false;
      if ("webkitSpeechRecognition" in window) {
        const vSearch = new webkitSpeechRecognition();
        vSearch.continuous = false;
        vSearch.interimresults = false;
        vSearch.lang = "en-US";
        vSearch.start();
        vSearch.onresult = function (e) {
          that.search = e.results[0][0].transcript;
          that.voiceSearchstr = e.results[0][0].transcript;
          setTimeout(() => {
            that.Voice.emit(that.search);
            vSearch.stop();
            that.activeModal.dismiss();
          }, 2000)
          that.cdr.detectChanges();
        };
  
        vSearch.onerror = function (e) {
          if (e?.error == "no-speech") {
            that.toastr.error(e?.error);
            that.isVoiceSearch = false;
            that.activeModal.dismiss();
          }
          if (e?.error == "not-allowed") {
            that.toastr.error("Your microphone is blocked. Click the camera blocked icon <img width='5%' src='assets/icons/mute.png'> in your browser's address bar")
            that.voiceNotAllow = true;
            setTimeout(() => {
              that.isVoiceSearch = false
              that.activeModal.dismiss();
            }, 5000)
          }
          vSearch.stop();
          that.cdr.detectChanges();
        };
      } else {
      }
  }
}
