import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";


@Component({
  selector: "app-add-choice",
  templateUrl: "./add-choice.component.html",
  styleUrls: ["./add-choice.component.scss"],
})
export class AddChoiceModelComponent implements OnInit {
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @Output() choicePriceList: EventEmitter<any> = new EventEmitter();
  closeResult = '';
  selectedChoice: any;
  style_obj_add_choice:any;

  @Input() masterChoiceList: any;
  @Input() selectedChoicePriceList: any;

  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    public translate: TranslateService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_add_choice = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

  changeChoice(item: any) {
    this.selectedChoice = item;
  }

  saveMasterChoice() {
    if (this.selectedChoice == undefined) {
      this.toastr.error(this.translate.instant('PLEASE_SELECT_CHOICE'));
      return;
    }
    if (this.selectedChoicePriceList.length > 0) {
      var existchoice = this.selectedChoicePriceList.filter((ch: any) => {
        return ch.choice_id == this.selectedChoice;
      });
      if (existchoice.length > 0) {
        this.toastr.error(this.translate.instant('CHOICE_ALREADY_SELECTED'));
        return;
      }
    }

    var choices = this.masterChoiceList.filter((ch: any) => {
      return ch.choice_id == this.selectedChoice;
    });
    this.choicePriceList.emit(choices);
    this.selectedChoice = undefined;
    this.modal.close();
  }
}
