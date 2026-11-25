import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {

  @Output() displayOnlyOnceIfOpened: EventEmitter<any> = new EventEmitter();
  payload:any
  constructor(public modal: NgbActiveModal) { }

  ngOnInit(): void {
    $('<style>.modal-content{ background-color: '+ 'transparent' +' !important; border: '+ 'none' +' !important; box-shadow: '+'none'+' !important; }</style>').appendTo('body');
    this.playSound();
  }

  audio = new Audio();

  playSound() {
    this.audio.src = '../../../../../assets/img/goes-without-saying-608.mp3'
    this.audio.load();
    this.audio.play();
  }

  stopSound() {
    this.audio.pause();
  }

  modalClicked(){
    this.modal.dismiss();
  }

  ngOnDestroy(): void {
    $('<style>.modal-content{ background-color: '+
     '#fff' +' !important; border: '+
      '1px solid rgba(0,0,0,.2)' +
      ' !important; box-shadow: '+
      '0 15px 35px rgb(50 50 93 / 20%), 0 5px 15px rgb(0 0 0 / 17%)'+
      ' !important; }</style>'
    ).appendTo('body');
    this.displayOnlyOnceIfOpened.emit(0);
    this.stopSound();
  }
}
