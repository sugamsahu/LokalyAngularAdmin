import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-repeat-combo-items",
  templateUrl: "./repeat-combo-items.component.html",
  styleUrls: ["./repeat-combo-items.component.scss"],
})
export class RepeatComboItemsComponent implements OnInit {
  @Input() last_used_addon_choice: any;
  @Output() comboInstance: EventEmitter<any> = new EventEmitter();
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_repeat_combo_items: any;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.style_obj_repeat_combo_items = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

  addNewCombo() {
    this.comboInstance.emit(1);
    this.activeModal.dismiss();
  }

  repeatCombo(last_used_addon_choice) {
    this.comboInstance.emit(last_used_addon_choice);
    this.activeModal.dismiss();
  }
}
