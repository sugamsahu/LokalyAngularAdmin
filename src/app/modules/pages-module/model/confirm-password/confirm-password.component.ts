import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-confirm-password',
  templateUrl: './confirm-password.component.html',
  styleUrls: ['./confirm-password.component.scss']
})
export class ConfirmPasswordComponent implements OnInit {
  @Output() passEntry: EventEmitter<any> = new EventEmitter();// send output data to other component
  main: any = { LoggedUserInfo: {} };
  @Input() communication: any
  passwordSubmit: UntypedFormGroup
  userData = JSON.parse(localStorage.getItem('loginUser'));
  @ViewChild('cursor') cursor: ElementRef;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_confirm_password: any;


  constructor(
    public translate: TranslateService,
    public activeModal: NgbActiveModal,
    private formBuilder: UntypedFormBuilder,
    private toastr: ToastrService,
    private el: ElementRef,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    $('#password').focus()
    // $(
    //   "<style>.modal-dialog { max-width: 500px ;}</style>"
    // ).appendTo("body");
    this.style_obj_confirm_password = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.passwordSubmit = this.formBuilder.group({
      password: new UntypedFormControl('')
    })
  }

  ConfirmPassword() {
    if (this.communication && this.passwordSubmit.value.password != 'awer12124^723*') {
      this.toastr.error('Invalid password')
      return
    }
    var data = {
      pas: this.passwordSubmit.value.password,
      model: this.activeModal
    }
    this.passEntry.emit(data);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cursor.nativeElement.focus();
    }, 100);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.passwordSubmit.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }
}
