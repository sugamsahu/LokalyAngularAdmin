import {
  Component,
  OnInit,
  Output,
  ChangeDetectorRef,
  EventEmitter,
  Input,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { CustomerService } from "src/app/services/customer.service";
import { environment } from "src/environments/environment";
import { UntypedFormGroup } from "@angular/forms";
import { CommonService } from "src/app/services/common.service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-campaign-log",
  templateUrl: "./campaign-log.component.html",
  styleUrls: ["./campaign-log.component.scss"],
})
export class campaignLogComponent implements OnInit {
  @Output() shareURL: EventEmitter<any> = new EventEmitter();
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  
  tableSize: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  @Input() campaigId: any;
  @Input() user_id: any;
  logList = []
  no_data: boolean;
  page: number = 1;


  constructor(
    public activeModal: NgbActiveModal,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public spinner:SpinnerService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }
  formGroup: UntypedFormGroup
  ngOnInit() {
    this.page = 1;
    this.getCampaignLog()
    this.cdr.detectChanges();
  }
  /** Get customer details */
  getCampaignLog() {
    var data = {
      campaign_id : this.campaigId
    }
    
    this.customerService.getCampaignLog(data).subscribe({
      next: (response: any) => {

        if (response.status == 1) {
          this.logList = response.data;
          this.no_data = false;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.logList = [];
        }
      },
      error: (error) => {
        // handle error

      },
      complete: () => {
        ;
      },
    });
  }

  DownloadLog(log:any){
    this.spinner.show()
    var data = {
      campaign_log_id: log.campaign_log_id,
      is_export:1,
      user_id: this.user_id
    }
    this.customerService.campaignLogDownload(data).subscribe({
      next: (response: any) => {
        this.spinner.hide()
        if (response.status == 1) {
          this.toastr.success(response.message);
          this.no_data = false;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
        }
      },
      error: (error) => {
        this.spinner.hide()
      },
      complete: () => {
        this.spinner.hide()
      },
    });
  }
}
