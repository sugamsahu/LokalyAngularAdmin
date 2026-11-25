import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-sequence',
  templateUrl: './change-sequence.component.html',
  styleUrls: ['./change-sequence.component.scss']
})
export class ChangeSequenceComponent implements OnInit {
  @Input() viewManagementList: any;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();

  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_rearrange_page_management: any;

  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,

  ) { }

  ngOnInit(): void {
    this.style_obj_rearrange_page_management = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font,
      "--css_button_business_alternative": this.generalSetting.css_button_business_alternative
    }
  }

  editCategoryOrder() {
    this.passEntry.emit(this.viewManagementList);
    this.toastr.success(("View Card Details updated successfully"));
    this.modal.close();

  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.viewManagementList,
      event.previousIndex,
      event.currentIndex
    );
  }

  returnSeq(index) {
    if (index != this.viewManagementList.length - 1) {
      if (this.viewManagementList[index + 1].column_span == 2) {
        if (index != 0) {
          if (this.viewManagementList[index - 1].column_span == 2) {
            return true;
          } else if (index >= 2) {
            if (this.viewManagementList[index - 1].column_span == 1 && this.viewManagementList[index - 2].column_span == 1) {
              return true
            }
          }
        } else {
          return true;
        }
      }
    } else {
      return true;
    }
  }

}
