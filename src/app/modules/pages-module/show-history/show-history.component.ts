import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { VoiceSearchComponent } from "../model/voice-search/voice-search.component";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "src/app/services/common.service";
import { environment } from "src/environments/environment";
import { BannerService } from "src/app/services/configuration/banner.service";
import { AppComponent } from "src/app/app.component";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { MapsAPILoader } from "@agm/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { event } from "jquery";
import { UserRoles } from "src/app/enums/user-roles";
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from "rxjs";

@Component({
  selector: "app-show-history",
  templateUrl: "./show-history.component.html",
  styleUrls: ["./show-history.component.scss"],
})
export class ShowHistoryComponent implements OnInit {
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  search = "";
  helpDetails: any;
  page: any;
  no_data = true;
  view_list: any = [];
  question: any
  view_count: any;
  count: number = 0;
  customerList = [];
  myControl = new FormControl("");
  options: string[] = [];
  gridDataPage: any = [];
  fullScreenDisplay: boolean = true;
  searchExpanded: boolean = false;
  is_open_sidebar: boolean = false;
  noData: boolean = false;
  chr_lnth: any = 13;
  selecteditemsqty: any;
  tableSize = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  language_id = localStorage.getItem("select_lan_id") || "1";
  is_duplicate_view: any = false;
  // main: any;
  showDropdown: boolean = true;
  loginUserId: any;
  main: any = { LoggedUserInfo: {} };
  accActiveId = 1;
  geocoder: any;
  map: any;
  latitude: any = parseFloat(this.generalSetting.default_location_lat);
  longitude: any = parseFloat(this.generalSetting.default_location_long);
  use_google_map = parseInt(this.generalSetting.use_google_map);
  zoom: number;
  private geoCoder;
  showHistory_form: FormGroup;
  searchHistoryQuestion: any;
  commonHistoryQuestion : any;
  store_id: any;
  all_card_details: any = [];
  colums_to_view: any = [];
  filteredData: any[] = [];
  showGrid: boolean = false;
  check: boolean;
  invalidInput: boolean = false;
  erroMessage: string = '';
  public lokaly_form: FormGroup;
  userRoleEnum = UserRoles;
  filteredOptions: string[] = [];
  showHistoryRecord: any = {};
  showCommandRecordError: any;
  arrow_open: boolean = false;

  constructor(
    private modalService: NgbModal,
    public commonService: CommonService,
    public translate: TranslateService,
    private _helpService: BannerService,
    private appComponent: AppComponent,
    private mapsAPILoader: MapsAPILoader,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private toastr: ToastrService,
    public formbuilder: FormBuilder,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    if (!this.generalSetting.visualization_module) {
      this.router.navigate(['/dashboard']);
    }
    this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin;
    console.log(" this.main.LoggedUserInfo.role_id ", this.main.LoggedUserInfo.role_id)
    // var superAdmin =this.main.LoggedUserInfo.role_id == 6 ? true : false
    // if (!superAdmin || !this.generalSetting.visualization_module) {
    //   this.router.navigate(['/dashboard']);
    // }
    this.getHelpDetails();
    this.loginUserId = this.main.LoggedUserInfo.user_id;
    console.log("this.loginUserId", this.loginUserId);
    console.log("store id ngon init 108", this.main.LoggedUserStoreInfo.store_id);
    this.store_id = this.main.LoggedUserStoreInfo.store_id ? this.main.LoggedUserStoreInfo.store_id : ''


    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          console.log("this.search ", this.search)
          this.GetViewList();
        })
      )
      .subscribe();
    this.searchHistory();
  }


  controlHasError(validation, controlName): boolean {
    const control = this.lokaly_form.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  clearSearch() {
    console.log("87", this.search);
    if (this.search !== '') {
      this.question = this.search;
      console.log("this.question", this.question);
      this.showGrid = true;
      this.GetViewList();
    }
  }


  searchAndUpdate(): void {
    if (this.search !== '') {
      console.log("searchAndUpdate", this.search);
      this.question = this.search;
      console.log("this.question 140", this.question);
      this.GetViewList();
    }
  }

  public voiceSearch() {
    const modalRef = this.modalService.open(VoiceSearchComponent, {
      size: "md",
      centered: true,
      animation: true,
    });

    modalRef.componentInstance.isVoiceSearch = true;
    modalRef.componentInstance.Voice.subscribe((voice) => {
      if (voice) {
        console.log("voice", voice);
        this.gridDataPage = [];
        this.search = voice;
        console.log("this.search", this.search);

        // Check if the input element exists before setting its value
        const inputElement = document.getElementById("searchevt") as HTMLInputElement;
        if (inputElement) {
          inputElement.value = voice;
          this.GetViewList();
        }
      }
    });

  }


  historyDisplayed: boolean = false;

  // Method to toggle the display of history
  toggleHistoryDisplay(): void {
    this.historyDisplayed = !this.historyDisplayed;
  }

 
  //change screen size
  // fullscreenView() {
  //   this.fullScreenDisplay = this.fullScreenDisplay == true ? false : true;
  //   if (this.is_open_sidebar && !this.fullScreenDisplay) {
  //     this.chr_lnth = 15;
  //   } else {
  //     this.chr_lnth = 13;
  //   }
  // }
  fullscreenView() {
    // Toggle the fullscreenDisplay value
    this.fullScreenDisplay = !this.fullScreenDisplay;
    // Adjust the chr_lnth based on the sidebar and fullscreenDisplay status
    if (this.is_open_sidebar && !this.fullScreenDisplay) {
        this.chr_lnth = 15;
    } else {
        this.chr_lnth = 13;
    }
}

  searchHistory() {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    console.log("121 this.loginUserId", this.loginUserId)

    let data = {
      created_by_id: this.loginUserId,
      page: 1,
      size: 5,
      search_string: '',
      sort_by: 'created_on',
      sort_direction: 'desc',
      query_status: '',
      store_id: this.store_id
    }
    this.commonService.searchHistoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == true) {
          this.searchHistoryQuestion = response.data.items;
          // this.showGrid=true;
          console.log("this.searchHistoryQuestion", this.searchHistoryQuestion);
        } else {
          if (response.status == false) {
            if (response) {
              this.showHistoryRecord = response;
              this.showGrid=false;
              console.log("Error Message: ", this.showHistoryRecord);
              this.cdr.detectChanges();
            } else {
              console.log("Unexpected response format: ", response);
            }
          }
        }
      },
    });
  }

  triggerSearch(question: string): void {
    this.search = question;
    this.searchAndUpdate();
    // this.searchbox.nativeElement.value =  this.search;
    // this.search = this.searchbox.nativeElement.value;

    // this.searchInput.nativeElement.dispatchEvent(new Event('search'));
  }



  commonAskQuestion() {
    this.commonService.commonAskedQuestion(this.main.LoggedUserInfo.role_id).subscribe({
      next: (response: any) => {
        if (response.status == true) {
          console.log("response commonAskQuestion", response)
          this.commonHistoryQuestion = response.data;
          console.log("this.commonHistoryQuestion", this.commonHistoryQuestion);
          
          // Assign the questions to the question variable
        //  this.question = response.data.map((item: any) => item.questions);
        }
        else {
          if (response.status === false) {
            if (response) {
              this.showCommandRecordError = response;
              console.log("Error Message:showCommandRecordError ", this.showCommandRecordError);
              this.cdr.detectChanges();
            } else {
              console.log("Unexpected response format: ", response);
            }
          }
        }
      }
    });
  }

  isValidInput(): boolean {
    return this.search && (this.search.includes('Customer') || this.search.includes('Store') || this.search.includes('Item') || this.search.includes('Order'));
  }






  containsAnyKeyword(question: string, keywords: string[]): boolean {
    if (!question) return false;
    const lowerCaseQuestion = question.toLowerCase(); // Convert question to lowercase
    return keywords.some(keyword =>
      lowerCaseQuestion.includes(keyword)
    );
  }


  GetViewList() {
    const keywords = ['store', 'item', 'customer', 'order'];
    if (!this.containsAnyKeyword(this.question, keywords)) {
      console.log("4277", this.question)
      this.toastr.error("Please ensure the question contains at least one of the keywords: Customer, Store, Item, Order.");
      this.showGrid = false;
      return;
    } else {
      this.noData = true;
      var search = "";
      if (this.search != "" && this.search != undefined && this.search != null) {
        search = this.search;
      }
      var fd = new FormData();
      fd.append("question", this.question.trim());
      if (!this.store_id) {
        fd.append("store_id", this.store_id);
      } else {
        fd.append("store_id", '');
      }
      this.commonService.GetHistoryList(fd, this.loginUserId).subscribe({
        next: (response: any) => {
          if (response.status == true) {
            this.all_card_details = response.data;
            // this.erroMessage = ''
            this.showGrid = true;
            this.erroMessage = ''
            if (this.all_card_details.column_to_view) {
              this.colums_to_view = this.all_card_details.column_to_view.split(",")
            }
            let ask_data: any = []
            this.all_card_details.items.cardDatas = []
            this.all_card_details.items.forEach((element: any) => {
              let columns_data = Object.values(element);
              // console.log(columns_data);
              ask_data.push(columns_data);
              this.all_card_details.items.cardDatas.push(columns_data);
              // console.log("columns_data", columns_data)

            });
            console.log("this.all_card_details", this.all_card_details);
            // this.all_card_details.items.cardDatas.push(ask_data);
            this.searchHistory();
          } else {
            if (response.status === false) {
              this.showGrid = false;
              console.log("  this.showGrid ",this.showGrid)
              if (response.data && response.data.message) {
                this.erroMessage = response.data.message;
                console.log("Error Message: ", this.erroMessage);
                this.searchHistory();
                this.cdr.detectChanges();
              } else {
                console.log("Unexpected response format: ", response);
              }
            }
          }

        },
        error: (error: any) => {
          console.error("Error fetching data:", error);
        }
      })
    }
  }

  onSearchChange(searchValue: string): void {
    this.filteredOptions = this._filter(searchValue);
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.question.filter(option => option.toLowerCase().includes(filterValue));
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
      data.module_key = "148";
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


  getEvnt(data) {
    this.accActiveId = data.panelId;
    // this.searchHistory();

    if (this.accActiveId == 1) {
      this.searchHistory();
    } else {
      this.commonAskQuestion();
    }
  }


  text() {
    if (!this.arrow_open) {
      this.searchHistory();
    }
    this.arrow_open = true;
    // this.commonAskQuestion();
  }
}
