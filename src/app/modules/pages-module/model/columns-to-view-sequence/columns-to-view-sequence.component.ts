import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-columns-to-view-sequence',
  templateUrl: './columns-to-view-sequence.component.html',
  styleUrls: ['./columns-to-view-sequence.component.scss']
})
export class ColumnsToViewSequenceComponent implements OnInit {
  @Input() sequence_columns_to_view:any;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_rearrange_columns_to_view:any;

  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {    
    this.style_obj_rearrange_columns_to_view = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font,
      "--css_button_business_alternative": this.generalSetting.css_button_business_alternative
    }
  }

  editCategoryOrder() {
    this.passEntry.emit(this.sequence_columns_to_view);
    this.toastr.success(("Columns to view Sequence updated successfully"));
    this.modal.close();
  }


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.sequence_columns_to_view,
      event.previousIndex,
      event.currentIndex
    );
  }

}
