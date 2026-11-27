import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { HelpInfoModelComponent } from '../help-info/help-info.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { ColumnsToViewSequenceComponent } from '../columns-to-view-sequence/columns-to-view-sequence.component';

@Component({
  selector: 'app-add-view',
  templateUrl: './add-view.component.html',
  styleUrls: ['./add-view.component.scss']
})
export class AddViewComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_add_view: any;
  view_card_details: any = []
  @Input() view_card_data: any;
  @Input() view_relation_key: any;
  @Input() view_card_listing_name: any;
  @Input() specific_to_value: any;
  @Input() filter_type_value: any;
  @Output() view_table_details: EventEmitter<any> = new EventEmitter();
  validateQuery: any;
  firstIndexValue: any;
  view_list: any;
  view_count: any;
  bgColor: string = '#FFFFFF';
  max_length: any = 20;
  check_status: any = 0;
  @ViewChild('cursor') cursor: ElementRef;
  is_duplicate: any = localStorage.getItem("isDuplicateView");
  card_type_display: any = [
    { label: "Grid", value: 1 },
    { label: "Transposed Grid", value: 2 },
    { label: "Pie", value: 3 },
    { label: "Donut", value: 4 }
  ]
  helpDetails: any;
  main: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  pie_color: any = [
    { label: "Random", value: 1 },
    { label: "Red", value: 2 },
    { label: "Blue", value: 3 },
    { label: "Green", value: 4 }
  ];
  display_chart_type: any = [
    { label: "Mouse Hover", value: 1 },
    { label: "Guideline", value: 2 },
    { label: "None", value: 3 }
  ];
  chart_legend: any = [
    { label: "Bottom", value: 1 },
    { label: "Top", value: 2 },
    { label: "Left", value: 3 },
    { label: "Right", value: 4 },
    { label: "None", value: 5 }
  ];

  constructor(
    public modal: NgbActiveModal,
    public formbuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    public activeModal: NgbActiveModal,
    public commonService: CommonService,
    private toastr: ToastrService,
    public translate: TranslateService,
    private modalService: NgbModal,
    private _helpService: BannerService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }
  public add_view_form: UntypedFormGroup;
  ngOnInit() {
    this.style_obj_add_view = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.loadForm();
    this.GetViewList();
    if (this.view_card_data) {
      this.GetCardData()
      this.check_status = 1
      this.Validate('edit');
    }
    this.getHelpDetails();
  }

  loadForm() {
    this.add_view_form = this.formbuilder.group({
      card_name: new UntypedFormControl(null, Validators.required),
      search: new UntypedFormControl('2'),
      column_span: new UntypedFormControl('1', Validators.required),
      paging: new UntypedFormControl('1'),
      filter_query: new UntypedFormControl('1'),
      paging_limit: new UntypedFormControl('10', [Validators.required, Validators.max(this.max_length)]),
      query_text: new UntypedFormControl(null, Validators.required),
      bg_color: new UntypedFormControl('#D9D9D9'),
      relation_key: new UntypedFormControl(this.view_relation_key, Validators.required),
      font_color: new UntypedFormControl('#000000'),
      columns_view: new UntypedFormControl(null, Validators.required),
      chart_label: new UntypedFormControl(null, Validators.required),
      chart_value: new UntypedFormControl(null, Validators.required),
      pallete: new UntypedFormControl(null, Validators.required),
      view_dimension: new UntypedFormControl('1'),
      display_type: new UntypedFormControl(null, Validators.required),
      legend_position: new UntypedFormControl(null, Validators.required),
      chart_display1: new UntypedFormControl(false),
      chart_display2: new UntypedFormControl(false),
      chart_display3: new UntypedFormControl(false),
      link_view: new UntypedFormControl(null, Validators.required),
      link_control: new UntypedFormControl('1'),
      link_id: new UntypedFormControl(null, Validators.required),
      view_type: new UntypedFormControl(this.card_type_display[0].value)
    })
  }

  GetCardData() {
    console.log(this.view_card_data.chart_display);


    this.add_view_form.patchValue({
      card_name: this.view_card_data.card_name,
      search: this.view_card_data.search.toString(),
      column_span: this.view_card_data.column_span.toString(),
      paging: this.view_card_data.paging.toString(),
      filter_query: this.view_card_data.filter_query,
      paging_limit: this.view_card_data.paging_limit,
      query_text: this.view_card_data.query,
      bg_color: this.view_card_data.bg_color,
      relation_key: this.view_card_data.relation_key,
      font_color: this.view_card_data.font_color,
      columns_view: this.view_card_data.coloumns_to_view,
      link_view: this.view_card_data.link_view,
      link_control: this.view_card_data.link,
      link_id: this.view_card_data.link_id,
      view_type: this.view_card_data.view_type,
      chart_label: this.view_card_data.chart_label,
      chart_value: this.view_card_data.chart_value,
      pallete: this.view_card_data.pallete,
      view_dimension: this.view_card_data.view_dimension ? this.view_card_data.view_dimension.toString() : null,
      display_type: this.view_card_data.display_type,
      legend_position: this.view_card_data.legend_position,
    })

    if (this.view_card_data.chart_display) {
      this.add_view_form.patchValue({
        chart_display1: this.view_card_data.chart_display.Label == 1 ? true : false,
        chart_display2: this.view_card_data.chart_display.ValueTotal == 1 ? true : false,
        chart_display3: this.view_card_data.chart_display.Value == 1 ? true : false
      })
    }
    this.view_table_details.emit(this.add_view_form);
    if (this.view_card_data?.coloumns_to_view) {
      var validselected = this.view_card_data.coloumns_to_view.split(",")
      this.add_view_form.get('columns_view').patchValue(validselected);
      console.log(this.add_view_form.value.columns_view);

    }
  }

  GetViewList() {
    var data = {
      allow_linking: 1,
      specific_to: this.specific_to_value
    };

    this.commonService.getViewManageList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.view_list = response.data;
          this.view_count = response.count;
          this.view_list = this.view_list.filter((x: any) => x.master_view_id != this.view_card_listing_name)
          if (this.view_list.length > 0 && !this.view_card_data) {
            this.add_view_form.get('link_view')?.setValue(this.view_list[0].master_view_id);
          } else {
            var link_view_data = this.view_list.filter((x: any) => x.master_view_id == this.view_card_data.link_view)
            if (link_view_data) {
              this.add_view_form.get('link_view').setValue(link_view_data[0]?.master_view_id ? link_view_data[0].master_view_id : "")
            }
          }
        }
      }
    })
  }

  colorCodeChange(value, label) {
    this.add_view_form.controls[label].setValue(value.target.value);
    this.cdr.detectChanges();
  }

  Validate(label?: any) {
    var data: any = {
      query: this.add_view_form.value.query_text
    }
    this.commonService.checkValidation(data).subscribe({
      next: (response: any) => {
        this.check_status = response.status;
        if (response.status == 1) {
          this.validateQuery = response.data.split(",");
          if (this.validateQuery.length > 0) {
            if (!label) {
              this.add_view_form.get('columns_view').patchValue(this.validateQuery);
              if (this.add_view_form.value.view_type == 3 || this.add_view_form.value.view_type == 4) {
                this.add_view_form.get('chart_label').patchValue(null);
                this.add_view_form.get('chart_value').patchValue(null);
              }
            }
          }
          if (!label) {
            this.toastr.success(response.message);
          }
        } else {
          if (!label) {
            this.toastr.error(response.message);
          }
        }
      }
    });
  }

  EditQuery() {
    this.check_status = 0;
  }

  cancelClick() {
    this.view_table_details.emit(this.view_card_data);
    this.activeModal.dismiss();
  }

  changeSequence() {
    const modalRef = this.modalService.open(ColumnsToViewSequenceComponent, {
      size: "lg-600",
      backdrop: 'static',
    });
    modalRef.componentInstance.sequence_columns_to_view = this.add_view_form.value.columns_view;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      if (receivedEntry) {
        this.add_view_form.value.columns_view = receivedEntry;
        this.add_view_form.get('columns_view').patchValue(this.add_view_form.value.columns_view);
        this.cdr.detectChanges();
      }
    });
  }

  searchString() {
    const textarea = document.querySelector('textarea[name="query_text"]') as HTMLTextAreaElement;
    const val = this.add_view_form.value.query_text;
    const searchStr = " %{{Search_String}}%";
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const newValue = val.slice(0, startPos) + searchStr + val.slice(endPos);
    this.add_view_form.controls['query_text'].patchValue(newValue);
    textarea.focus();
    textarea.setSelectionRange(startPos + searchStr.length, startPos + searchStr.length);
  }

  storeQuery() {
    const textarea = document.querySelector('textarea[name="query_text"]') as HTMLTextAreaElement;
    const val = this.add_view_form.value.query_text;
    const storeId = " {{store_id}}";
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const newValue = val.slice(0, startPos) + storeId + val.slice(endPos);
    this.add_view_form.controls['query_text'].patchValue(newValue);
    textarea.focus();
    textarea.setSelectionRange(startPos + storeId.length, startPos + storeId.length);
  }

  relationKeyQuery() {
    const textarea = document.querySelector('textarea[name="query_text"]') as HTMLTextAreaElement;
    const val = this.add_view_form.value.query_text;
    const relationKey = " {{relation_key}}";
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const newValue = val.slice(0, startPos) + relationKey + val.slice(endPos);
    this.add_view_form.controls['query_text'].patchValue(newValue);
    textarea.focus();
    textarea.setSelectionRange(startPos + relationKey.length, startPos + relationKey.length);
  }

  pagingType() {
    if (this.add_view_form.value.paging == 2) {
      this.add_view_form.controls['paging_limit'].clearValidators();
      this.add_view_form.updateValueAndValidity();
      this.add_view_form.controls['paging_limit'].setValue("")
    } else {
      this.add_view_form.controls['paging_limit'].setValidators([Validators.required, Validators.max(this.max_length)]);
      this.add_view_form.updateValueAndValidity();
    }
  }

  linkValidate() {
    if (this.add_view_form.value.link_control == 2) {
      this.add_view_form.controls['link_id'].clearValidators();
      this.add_view_form.controls['link_view'].clearValidators();
      this.add_view_form.updateValueAndValidity();
      this.add_view_form.controls['link_id'].setValue("")
      this.add_view_form.controls['link_view'].setValue("")
    } else {
      this.add_view_form.controls['link_id'].setValidators([Validators.required]);
      this.add_view_form.controls['link_view'].setValidators([Validators.required]);
      this.add_view_form.updateValueAndValidity();
    }
  }

  displayTypeChnage() {
    if (this.add_view_form.value.display_type == 2) {
      this.add_view_form.controls['legend_position'].clearValidators();
      this.add_view_form.updateValueAndValidity();
      this.add_view_form.controls['legend_position'].setValue("None");
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.add_view_form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    console.log(invalid);
    return invalid;
  }


  Submit() {
    this.findInvalidControls();

    if (this.add_view_form.value.paging == 2) {
      this.add_view_form.controls['paging_limit'].clearValidators();
      this.add_view_form.updateValueAndValidity();
      this.add_view_form.controls['paging_limit'].setValue("")
    }
    if (this.add_view_form.value.link_control == 2) {
      this.add_view_form.controls['link_id'].clearValidators();
      this.add_view_form.controls['link_view'].clearValidators();
      this.add_view_form.updateValueAndValidity();
      this.add_view_form.controls['link_id'].setValue("")
      this.add_view_form.controls['link_view'].setValue("")
    }

    if (this.add_view_form.value.view_type == 1) {
      this.add_view_form.controls['chart_label'].clearValidators();
      this.add_view_form.controls['chart_value'].clearValidators();
      this.add_view_form.controls['pallete'].clearValidators();
      this.add_view_form.controls['display_type'].clearValidators();
      this.add_view_form.controls['legend_position'].clearValidators();
      this.add_view_form.updateValueAndValidity();
      this.add_view_form.controls['chart_label'].setValue(null);
      this.add_view_form.controls['chart_value'].setValue(null);
      this.add_view_form.controls['pallete'].setValue(null);
      this.add_view_form.controls['display_type'].setValue(null);
      this.add_view_form.controls['legend_position'].setValue(null);
    }

    if (this.add_view_form.value.view_type == 2) {
      this.add_view_form.controls['paging_limit'].clearValidators();
      this.add_view_form.controls['chart_label'].clearValidators();
      this.add_view_form.controls['chart_value'].clearValidators();
      this.add_view_form.controls['pallete'].clearValidators();
      this.add_view_form.controls['display_type'].clearValidators();
      this.add_view_form.controls['legend_position'].clearValidators();
      this.add_view_form.updateValueAndValidity();
      this.add_view_form.controls['paging_limit'].setValue("");
      this.add_view_form.controls['search'].setValue("2");
      this.add_view_form.controls['paging'].setValue("2");
      this.add_view_form.controls['chart_label'].setValue(null);
      this.add_view_form.controls['chart_value'].setValue(null);
      this.add_view_form.controls['pallete'].setValue(null);
      this.add_view_form.controls['display_type'].setValue(null);
      this.add_view_form.controls['legend_position'].setValue(null);
    }

    if (this.filter_type_value == 3 || this.filter_type_value == 1) {
      this.check_status = 1;
      this.add_view_form.controls['relation_key'].clearValidators();
      this.add_view_form.updateValueAndValidity();
      this.add_view_form.controls['relation_key'].setValue(null);
    }

    if (this.add_view_form.value.view_type == 3 || this.add_view_form.value.view_type == 4) {
      this.add_view_form.controls['paging_limit'].clearValidators();
      this.add_view_form.controls['link_id'].clearValidators();
      this.add_view_form.controls['link_view'].clearValidators();
      this.add_view_form.updateValueAndValidity();
      this.add_view_form.controls['paging_limit'].setValue("");
      this.add_view_form.controls['search'].setValue("2");
      this.add_view_form.controls['paging'].setValue("2");
      this.add_view_form.controls['link_control'].setValue("2");
      this.add_view_form.controls['link_id'].setValue("");
      this.add_view_form.controls['link_view'].setValue("");
      if (this.add_view_form.value.chart_label == this.add_view_form.value.chart_value) {
        this.toastr.error("Label and value should be different from other.")
        return;
      }
    }

    if (this.add_view_form.value.display_type == 2) {
      this.add_view_form.controls['legend_position'].clearValidators();
      this.add_view_form.updateValueAndValidity();
    }

    if (this.add_view_form.value.display_type == 3) {
      this.add_view_form.controls['chart_display1'].setValue(null);
      this.add_view_form.controls['chart_display2'].setValue(null);
      this.add_view_form.controls['chart_display3'].setValue(null);
    }
    if(this.add_view_form.value.display_type == 1 || this.add_view_form.value.display_type == 2){
      if(!this.add_view_form.value.chart_display1 && !this.add_view_form.value.chart_display2 && !this.add_view_form.value.chart_display3){
        this.toastr.error(this.translate.instant("MANDATORY_FIELDS_BEFORE_SAVING"));
        return;
      }
    }

    if (!this.add_view_form.valid) {
      this.toastr.error(this.translate.instant("MANDATORY_FIELDS_BEFORE_SAVING"));
    } else {
      if (this.check_status == 1) {
        var obj: any = {
          card_name: this.add_view_form.value.card_name,
          column_span: this.add_view_form.value.column_span,
          filter_query: this.add_view_form.value.filter_query,
          query: this.add_view_form.value.query_text,
          relation_key: this.add_view_form.value.relation_key,
          coloumns_to_view: this.add_view_form.value.columns_view.toString(),
          search: this.add_view_form.value.search,
          paging: this.add_view_form.value.paging,
          paging_limit: this.add_view_form.value.paging_limit,
          bg_color: this.add_view_form.value.bg_color,
          font_color: this.add_view_form.value.font_color,
          link: this.add_view_form.value.link_control,
          link_id: this.add_view_form.value.link_id ? this.add_view_form.value.link_id.trim() : '',
          link_view: this.add_view_form.value.link_view ? this.add_view_form.value.link_view : '',
          view_type: this.add_view_form.value.view_type,
          chart_label: this.add_view_form.value.chart_label,
          chart_value: this.add_view_form.value.chart_value ? this.add_view_form.value.chart_value.trim() : null,
          pallete: this.add_view_form.value.pallete,
          view_dimension: this.add_view_form.value.view_dimension,
          display_type: this.add_view_form.value.display_type,
          legend_position: this.add_view_form.value.legend_position,
          // chart_display: this.add_view_form.value.chart_display
        }

        obj.chart_display = {
          Label: this.add_view_form.value.chart_display1 == true ? '1' : '0',
          ValueTotal: this.add_view_form.value.chart_display2 == true ? '1' : '0',
          Value: this.add_view_form.value.chart_display3 == true ? '1' : '0'
        }

        if (this.view_card_data && !this.is_duplicate) {
          obj.master_view_detail_id = this.view_card_data?.master_view_detail_id
        }
        console.log(obj);


        this.view_table_details.emit(obj);
        this.activeModal.dismiss();
        this.toastr.success(this.translate.instant("CARD_SUBMITED_SUCCESSFULLY"));
      } else {
        this.toastr.error(this.translate.instant("VALIDATE_THE_QUERY"));
      }
    }
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.generalSetting.LoggedUserInfo.role_id == 1 || this.generalSetting.LoggedUserInfo.role_id == 6 || this.generalSetting.LoggedUserInfo.role_id == 2) {
      data.module_key = '149'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => {
      },
      complete: () => { },
    });
  }


  controlHasError(validation, controlName): boolean {
    const control = this.add_view_form.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }
  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

}
