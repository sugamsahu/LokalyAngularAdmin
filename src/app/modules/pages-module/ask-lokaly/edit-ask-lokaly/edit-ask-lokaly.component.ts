import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { Router } from "@angular/router";
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from "ngx-toastr";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: "app-edit-ask-lokaly",
  templateUrl: "./edit-ask-lokaly.component.html",
  styleUrls: ["./edit-ask-lokaly.component.scss"],
})
export class EditAskLokalyComponent implements OnInit {
  public lokaly_form: FormGroup;
  keywords = ['Customer', 'Store', 'Item', 'Order'];
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @Output() view_table_details: EventEmitter<any> = new EventEmitter();
  @Input() view_card_data: any;
  check_status: any = 0;
  @Input() specific_to_value: any;
  @Input() filter_type_value: any;
  main: any;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  lokaly_id: any;
  showStoreButton: boolean = false;
  showEditQueryButton: boolean = false;
  validateQuery: any;
  form: FormGroup;
  @ViewChild("cursor") cursor;
  lokaly_column: any;

  constructor(
    public formbuilder: FormBuilder,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private cryptoService: CryptoService,
    private router: Router,
    public commonService: CommonService,
    private toastr: ToastrService,
    private spinner: SpinnerService,
    private el: ElementRef,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    if (location.href.indexOf("/ask-lokaly/edit") > -1) {
      this.lokaly_id = this.cryptoService.decryptIdValue(
        "askLokalyId" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.lokaly_id == undefined) {
        this.router.navigate(["/ask-lokaly"]);
      }
    }
  }

  cancelClick() {
    history.back();
  }

  ngOnInit(): void {
    //  this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin || !this.generalSetting.visualization_module) {
      this.router.navigate(['/dashboard']);
    }
    if (!this.generalSetting.visualization_module) {
      this.router.navigate(['/dashboard']);
    }
    if (this.generalSetting.business_model != 1 && this.main.LoggedUserInfo.role_id == 1) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    // this.getHelpDetails();
    if (!this.generalSetting.visualization_module) {
      this.router.navigate(['/dashboard']);
    }
    if (this.lokaly_id) {
      this.getData();
    }
    
    this.validate('edit');
  }

  loadForm() {
    this.lokaly_form = this.formbuilder.group({
      // question: new FormControl("", Validators.required),
      question: new FormControl('', [Validators.required, this.customValidator(this.keywords)]),
      specific_to: new FormControl('1', Validators.required),
      view_query: new FormControl("", Validators.required),
      is_active: new FormControl(true, Validators.required),

    });
  }

  //for one id getdata
  getData() {
    let data = {
      question_id: this.lokaly_id,
    };
    console.log("data", data)
    this.commonService.editListAskLokaly(this.lokaly_id).subscribe({
      next: (response: any) => {
        console.log("response", response)
        if (response.status == true) {
          this.lokaly_form.setValue({
            question: response.data.questions,
            view_query: response.data.query,
            specific_to: response.data.role_type,
            is_active: response.data.active
          });
          if (this.lokaly_id) {
            if (response.data.query) {
              this.validate('edit');
            } else {
              this.check_status = 0
            }
          }
        }
      },
      error: (error) => {
      },
    });
  }

  controlHasError(validation, controlName): boolean {
    const control = this.lokaly_form.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  handleFilterTypeChange(event) {
    this.specific_to_value = parseInt(event.target.value);
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  //  customValidator(keywords: string[]): ValidatorFn {
  //   return (control: AbstractControl): { [key: string]: any } | null => {
  //     const question = control.value;
  //     const containsKeyword = keywords.some(keyword =>
  //       question.toLowerCase().includes(keyword.toLowerCase())
  //     );
  //     console.log("question",question)
  //     return containsKeyword ? null : { missingKeyword: true };
  //   };
  // }

  customValidator(keywords: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
  // customValidator(keywords: string[]): ValidatorFn {
  //   return (control: AbstractControl): { [key: string]: any } | null => {
      const question = control.value;
      const containsKeyword = keywords.some(keyword =>
        question.toLowerCase().includes(keyword.toLowerCase())
      );
      // If question does not contain any keyword, return the validation error
      return containsKeyword ? null : { missingKeyword: true };
    };
  }
  

  containsAnyKeyword(question: string, keywords: string[]): boolean {
    return keywords.some(keyword =>
      question.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  
  // save() {    
  //   if (!this.lokaly_form.valid) {
  //     let mandatoryErrorShown = false;
  //     const controls = this.lokaly_form.controls;

  //     Object.keys(controls).forEach((controlName, i) => {
  //       controls[controlName].markAsTouched();
  //       if (controls[controlName].invalid && !mandatoryErrorShown && controlName !== 'question') {
  //         this.toastr.error(this.translate.instant("MANDATORY_FIELDS_BEFORE_SAVING"));
  //         mandatoryErrorShown = true;
  //         this.scrollToFirstInvalidControl();
  //         const invalidControl = this.el.nativeElement.querySelector(
  //           '[formcontrolname="' + controlName + '"]'
  //         );
  //         if (invalidControl) {
  //           invalidControl.focus();
  //         }
  //       }
  //     });
  //     if (!this.lokaly_form.get('question').touched && 
  //         this.lokaly_form.get('question').invalid && 
  //         this.lokaly_form.hasError('missingKeyword', 'question')) {
  //       this.toastr.error("Please ensure the question contains at least one of the keywords: Customer, Store, Item, Order.");
  //       const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="question"]');
  //       if (invalidControl) {
  //         invalidControl.focus();
  //       }
  //       return;
  //     }
  //     return;
  save() {
    if (!this.lokaly_form.valid) {
        let mandatoryErrorShown = false;
        const controls = this.lokaly_form.controls;

        Object.keys(controls).forEach((controlName, i) => {
            controls[controlName].markAsTouched();
            if (controls[controlName].invalid && !mandatoryErrorShown && controlName !== 'question') {
                this.toastr.error(this.translate.instant("MANDATORY_FIELDS_BEFORE_SAVING"));
                mandatoryErrorShown = true;
                this.scrollToFirstInvalidControl();
                const invalidControl = this.el.nativeElement.querySelector(
                    '[formcontrolname="' + controlName + '"]'
                );
                if (invalidControl) {
                    invalidControl.focus();
                }
            }
        });

        // Check if the question field is touched and if it doesn't include any of the required keywords
        if (this.lokaly_form.get('question').touched && !this.lokaly_form.get('question').hasError('required')) {
            const questionValue = this.lokaly_form.get('question').value.toLowerCase(); // Convert to lowercase for case-insensitive comparison
            const keywords = ["customer", "store", "item", "order"];
            const missingKeywords = keywords.filter(keyword => !questionValue.includes(keyword));
            if (missingKeywords.length === keywords.length) {
                const errorMessage = `Please ensure the question contains at least one of the keywords: ${keywords.join(', ')}.`;
                this.toastr.error(errorMessage);
                const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="question"]');
                if (invalidControl) {
                    invalidControl.focus();
                }
                return;
            }
        }     
    }else{
      if(this.check_status == 1){
      var fd = new FormData();
      fd.append("questions", this.lokaly_form.value.question);
      fd.append("query", this.lokaly_form.value.view_query);
      fd.append("role_type", this.lokaly_form.value.specific_to);
      fd.append("active", this.lokaly_form.value.is_active == true ? '1' : '0');
      fd.append("columns_to_view" , this.lokaly_column)
      if (this.lokaly_id) {
        this.commonService.editAskLokaly(fd, this.lokaly_id).subscribe({
          next: (response: any) => {
            if (response.status == true) {
              this.spinner.hide();
              this.toastr.success(response.response);
              this.router.navigate([`/ask-lokaly`]);
              return;
            }
            else {
              this.spinner.hide();
              this.toastr.error(response.response);
              return;
            }
          }
        });
      } else {
        this.commonService.addAskLokaly(fd).subscribe({
          next: (response: any) => {
            if (response.status == true) {
              this.spinner.hide();
              this.toastr.success(response.response);
              this.router.navigate([`/ask-lokaly`]);
  
              return;
            }
            else {
              this.spinner.hide();
              this.toastr.error(response.response);
              return;
            }
          }
        });
      }
    }else{
      this.toastr.error(this.translate.instant("VALIDATE_THE_QUERY"));
    }
    }
    
  }
validateQury(){
// Check for custom keyword validation error
if (this.lokaly_form.hasError('missingKeyword', 'question')) {
  this.toastr.error("Please ensure the question contains at least one of the keywords: Customer, Store, Item, Order.");
  const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="question"]');
  if (invalidControl) {
      invalidControl.focus();
  }
}
}

  storeQuery() {
    const textarea = document.querySelector('textarea[name="view_query"]') as HTMLTextAreaElement;
    const val = this.lokaly_form.value.view_query;
    const storeId = " {{store_id}}";
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const newValue = val.slice(0, startPos) + storeId + val.slice(endPos);
    this.lokaly_form.controls['view_query'].patchValue(newValue);
    textarea.focus();
    textarea.setSelectionRange(startPos + storeId.length, startPos + storeId.length);
  }

  EditQuery() {
    this.check_status = 0;
  }

  toggleStoreButton(value: string) {
    this.showStoreButton = (value === '2');
  }

  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  onEnter(event: KeyboardEvent): void {
    event.preventDefault();
    if (!this.lokaly_form.valid) {
      const controls = this.lokaly_form.controls;
      Object.keys(controls).forEach((controlName, i) => {
        if (i == 0) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + controlName + '"]'
          );
          invalidControl.focus();
        }
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    }
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement =
      this.el.nativeElement.querySelector("form .ng-invalid");
    window.scroll({
      top: this.getTopOffset(firstInvalidControl),
      left: 0,
      behavior: "smooth",
    });
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id,
    };
    if (
      this.main.LoggedUserInfo.role_id == 1 ||
      this.main.LoggedUserInfo.role_id == 6 ||
      this.main.LoggedUserInfo.role_id == 2
    ) {
      data.module_key = '148'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

  validate(label?: any) {
    var data: any = {
      query: this.lokaly_form.value.view_query
    }
    this.commonService.checkValidation(data).subscribe({
      next: (response: any) => {
        this.check_status = response.status
        this.lokaly_column = response.data;
        console.log(" this.lokaly_column", this.lokaly_column)
        if (response.status == 1) {
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

  
  askLokalySubmit() {
    if (!this.lokaly_form.valid) {
      this.toastr.error(this.translate.instant("MANDATORY_FIELDS_BEFORE_SAVING"));
      const controls = this.lokaly_form.controls;
      Object.keys(controls).forEach((controlName, i) => {
        if (i == 0) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + controlName + '"]'
          );
          invalidControl.focus();
        }
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
      // Check for custom keyword validation error
      if (this.lokaly_form.hasError('missingKeyword', 'question')) {
        this.toastr.error(this.translate.instant("The question must contain at least one of the keywords: Customer, Store, Item, Order."));
        const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="question"]');
        if (invalidControl) {
          invalidControl.focus();
        }
      }
      return;
    } else {
      var fd = new FormData();
      fd.append("questions", this.lokaly_form.value.question);
      fd.append("query", this.lokaly_form.value.view_query);
      fd.append("role_type", this.lokaly_form.value.specific_to);
      fd.append("active", this.lokaly_form.value.is_active == true ? '1' : '0');
      fd.append("columns_to_view", this.lokaly_column)
      if (this.lokaly_id) {
        this.commonService.editAskLokaly(fd, this.lokaly_id).subscribe({
          next: (response: any) => {
            if (response.status == true) {
              this.spinner.hide();
              this.toastr.success(response.response);
              this.router.navigate([`/ask-lokaly`]);
              return;
            }
            else {
              this.spinner.hide();
              this.toastr.error(response.response);
              return;
            }
          }
        });
      } else {
        this.commonService.addAskLokaly(fd).subscribe({
          next: (response: any) => {
            if (response.status == true) {
              this.spinner.hide();
              this.toastr.success(response.response);
              this.router.navigate([`/ask-lokaly`]);
              return;
            }
            else {
              this.spinner.hide();
              this.toastr.error(response.response);
              return;
            }
          }
        });
      }
    }
  }
}
