import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { AuditLogReportService } from "src/app/services/report/audit-log-report.service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { CommunicationLogDetailComponent } from "../../model/communication-log-details/communication-log-details.component";
import { CommunicationService } from "src/app/services/communication.service";
import { CustomerService } from "src/app/services/customer.service";
import { ToastrService } from "ngx-toastr";

@Component({
    selector: 'app-communication-log-report',
    templateUrl: './communication-log-report.component.html',
    styleUrls: ['./communication-log-report.component.scss'],
})

export class CommunicationLogReportComponent implements OnInit {
    main: any;
    page: number = 1;
    count: number = 0;
    tableSize: number = environment.tableSize;
    auditLogForm: FormGroup;
    generalSetting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
    sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
    deliveryboy_label: string = this.generalSetting.deliveryboy_label;
    store_label: string = this.generalSetting.store_label;
    communicationTypeList: any = [
        { value: 'All', label: "All" },
        { value: '1', label: "Email" },
        { value: '2', label: "SMS" },
        { value: '3', label: "Notification" }
    ];
    show_customer_details_to_store: boolean =
        this.generalSetting.show_customer_details_to_store == "1" ? true : false;
    global_currency: string = this.generalSetting.currency_symbol;
    dinein_module = this.generalSetting.dinein_module;
    orderStatusList: any = [];
    auditLogTableList: any = [];
    tempOrderDuringStatus: any = [];
    communicationLogList: any = [];
    sentToList: any = [];
    relatedToList: any = [];
    sortKey: string;
    maxDatefrom: Date = new Date();
    maxDateto: Date = new Date();
    PlatformSetting: any;
    business_model: any;
    isReporsShow: any;
    dienIn: any;
    pos: any;
    helpDetails: any;
    language_id = localStorage.getItem("select_lan_id") || "1";
    isOrderBy: boolean = true;
    category_list: any = [];
    is_super_admin: boolean;
    moment: any = moment();
    store_ids: any;
    allSellerIds: any;
    role_Id: any;

    constructor(
        private formBuilder: FormBuilder,
        private appComponent: AppComponent,
        private translate: TranslateService,
        private customerService: CustomerService,
        private auditLogReportService: AuditLogReportService,
        private toastr: ToastrService,
        private _helpService: BannerService,
        private modalService: NgbModal,
        private spinner: SpinnerService,
        private communicationService: CommunicationService,
        private _snackbarService: ToastrService,
    ) {
        this.main = this.appComponent.main;
        this.translate.addLangs(["it", "en", "de"]);
        this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    }

    ngOnInit(): void {
        this.is_super_admin = false;
        if (
            this.main.LoggedUserInfo.role_id == 6 ||
            this.main.LoggedUserInfo.role_id == 1
        ) {
            this.is_super_admin = true;
        }
        this.loadForm();
        this.getCategoryList();
        this.sellerList();
    }

    loadForm() {
        this.auditLogForm = this.formBuilder.group({
            communication_type: new FormControl('All'),
            category: new FormControl('All'),
            send_to: new FormControl('All'),
            related_to: new FormControl('All'),
            fromDate: new FormControl(new Date()),
            toDate: new FormControl(new Date()),
            search: new FormControl(""),
        });
        this.auditLogForm.get("fromDate").valueChanges.subscribe((val) => {
            this.getDate(val);
        });
        this.auditLogForm.get("toDate").valueChanges.subscribe((val) => {
            this.getToDate(val);
        });
        this.translate
            .get([
                "ALL",
                "ORDER_PENDING",
                "ORDER_ACCEPTED",
                "ORDER_READY_FOR_PICKUP",
                "ORDER_OUT_FOR_DELIVERY",
                "PROCESSING",
                "READY_FOR_BILLING",
                "ORDER_DELIVERED",
                "ORDER_REJECTED",
                "ORDER_UNDELIVEREDED",
            ])
            .subscribe((translations) => {
                this.orderStatusList = [
                    { label: translations.ALL, value: 0 },
                    { label: translations.ORDER_PENDING, value: 1 },
                    { label: translations.ORDER_ACCEPTED, value: 2 },
                    { label: translations.ORDER_READY_FOR_PICKUP, value: 3 },
                    { label: translations.ORDER_OUT_FOR_DELIVERY, value: 4 },
                    { label: translations.PROCESSING, value: 9 },
                    { label: translations.READY_FOR_BILLING, value: 10 },
                    { label: translations.ORDER_DELIVERED, value: 5 },
                    { label: translations.ORDER_REJECTED, value: 6 },
                    { label: translations.ORDER_UNDELIVEREDED, value: 7 },
                ];
                if (this.dienIn == 0) {
                    this.orderStatusList = this.orderStatusList.filter((x) => x.value != 9 && x.value != 10)
                    var Ids = [1, 2];
                    this.auditLogForm.controls.order_status.setValue(Ids);
                }
                if (this.pos == 0) {
                    this.orderStatusList = this.orderStatusList.filter((x) => x.value != 11)
                }
            });
    }

    async getCategoryList() {
        const data = {};

        await this.communicationService.getModuleCategoryTypeList(data).subscribe({
            next: (response: any) => {
                if (response.status == 1) {
                    this.category_list = response.data;
                }
            },
            error: (error) => {
                this._snackbarService.error(error);
            }
        });
    }

    customerList(): void {
        this.spinner.show();
        let data: any = {};
        if (!this.is_super_admin) {
            data = {
                seller_id: this.store_ids,
            };
        }
        this.customerService.getSendToList(data).subscribe({
            next: (response: any) => {
                if (response.status == 1) {
                    this.sentToList = response.data;
                    this.count = response.count;
                    this.auditLogForm.patchValue({
                        send_to: 'All'
                    });
                } else {
                    this.toastr.error(response.message);
                    this.count = 0;
                    this.sentToList = [];
                }
            },
            error: (error) => {
                // handle error
            },
            complete: () => {
                this.getCommunicationLogReport();
            },
        });
    }

    sellerList(): void {
        this.spinner.show();
        let data: any = {};
        if (!this.is_super_admin) {
            data = {
                user_id: this.main.LoggedUserInfo.user_id,
                sort_field: 'store_name',
                sort_type: 1,
                is_communication_log: 1
            };
        } else {
            data = {
                market_type: 2,
                sort_field: 'store_name',
                sort_type: 1,
                is_communication_log: 1
            };
        }
        this.customerService.getStoreSellerList(data, this.is_super_admin)
            .subscribe({
                next: (response: any) => {
                    if (response.status == 1) {
                        this.relatedToList = response.data;
                        this.count = response.count;
                        this.auditLogForm.patchValue({
                            related_to: 'All'
                        });
                        let storeIds: any = [];
                        if (response.data.length > 0) {
                            response.data.forEach((element: any) => {
                                storeIds.push(element.store_id)
                            });
                            this.store_ids = storeIds.toString();
                        }
                    } else {
                        this.toastr.error(response.message);
                        this.count = 0;
                        this.relatedToList = [];
                    }
                },
                error: (error) => {
                    // handle error
                },
                complete: () => {
                    this.customerList();
                },
            });
    }

    /** Get item wise order from-date using form */
    getDate(date) {
        let date1: any = moment(date).format('ddd MMM DD YYYY');
        let date2: any = moment(this.auditLogForm.value.toDate).format('ddd MMM DD YYYY');
        this.compareDates(date1, date2)
    }

    /** Get item wise order to-date using form */
    getToDate(todate) {
        let date1: any = moment(this.auditLogForm.value.fromDate).format('ddd MMM DD YYYY');
        let date2: any = moment(todate).format('ddd MMM DD YYYY');
        this.compareDates(date1, date2)
    }

    actionChange() {
        this.page = 1;
    }

    changesendTo(event: any) {
        this.allSellerIds = [];
        let seller_ids: any = [];
        this.role_Id = ''
        this.sentToList.forEach((element: any) => {
            if (element.user_id == event) {
                seller_ids.push(element.seller_id)
                this.role_Id = element.role_id
            }
        });
        this.allSellerIds = seller_ids.toString();
    }

    getCommunicationLogReport() {
        this.page = 1;
        let date1: any = moment(this.auditLogForm.value.fromDate).format('ddd MMM DD YYYY');
        let date2: any = moment(this.auditLogForm.value.toDate).format('ddd MMM DD YYYY');
        if (this.compareDates(date1, date2)) {
            this.getCommunicationLogList(this.page);
        }
    }

    compareDates(fromDate: any, toDate: any) {
        let date1 = moment(fromDate, "ddd MMM DD YYYY");
        let date2 = moment(toDate, "ddd MMM DD YYYY");
        // Compare the dates
        if (date1.isBefore(date2)) {
            return true;
        } else if (date1.isAfter(date2)) {
            this.toastr.error(this.translate.instant('TO_DATE_MUST_BE_GREATER_THAN_FROM_DATE'));
            return false;
        } else {
            return true;
        }
    }

    clearCommunicationReport() {
        this.loadForm();
        this.getCategoryList();
        this.sellerList();

    }

    dateFormateFromServerSideOnlyDateReturn() {
        return this.main.DateFormate.split(" ")[0];
    }

    getTableList() {
        var data: any = {};

        this.auditLogReportService.auditLogTableList(data).subscribe({
            next: (response: any) => {
                if (response.status == 1) {
                    this.auditLogTableList = response.data;
                } else {
                    this.toastr.error(this.translate.instant(response.message));
                }
            },
            complete() {
            },
        });
    }

    getCommunicationLogList(page) {
        this.spinner.show();
        this.page = page;
        let data: any = {
            communication_type: this.auditLogForm.value.communication_type == 'All' ? '' : this.auditLogForm.value.communication_type,
            send_to_category: this.auditLogForm.value.category == 'All' ? '' : this.auditLogForm.value.category,
            from_date: moment(new Date(this.auditLogForm.value.fromDate)).format(this.dateFormateFromServerSideOnlyDateReturn()),
            to_date: moment(new Date(this.auditLogForm.value.toDate)).format(this.dateFormateFromServerSideOnlyDateReturn()),
            send_to: this.auditLogForm.value.send_to == 'All' ? '' : this.auditLogForm.value.send_to,
            related_to: this.auditLogForm.value.related_to == 'All' ? '' : this.auditLogForm.value.related_to,
            user_id: this.main.LoggedUserInfo.user_id,
            page: this.page,
            search_query: this.auditLogForm.value.search,
            sort_field: this.sortKey,
            sort_type: this.isOrderBy ? 1 : 2,
            role_Id: this.role_Id
        };
        if (!this.is_super_admin && this.auditLogForm.value.related_to == 'All' && this.auditLogForm.value.send_to == 'All') {
            data.store_id = this.store_ids
        } else if (!this.is_super_admin && this.auditLogForm.value.related_to == 'All' && this.auditLogForm.value.send_to != 'All') {
            data.store_id = this.allSellerIds
        }
        else if (!this.is_super_admin && this.auditLogForm.value.related_to != 'All') {
            data.store_id = this.auditLogForm.value.related_to.toString()
        }

        this.communicationService.getCommunicationLogReport(data).subscribe({
            next: (response: any) => {
                if (response.status == 1) {
                    this.communicationLogList = response.data;
                    this.count = response.count;
                } else {
                    this.communicationLogList = [];
                    this.count = 0;
                    this.toastr.error(this.translate.instant(response.message));
                }
            },
            complete() {
            },
        });
    }

    sortAPISide(columnName) {
        this.sortKey = columnName;
        this.isOrderBy = !this.isOrderBy;
        this.getCommunicationLogList(this.page);
    }

    exportDataValidation() {
        if (this.count > 200000) {
            this.toastr.error(this.translate.instant("RECORDS_DOWNLOAD_SHOULD_LESS_THAN_EQUAL_200000"));
        } else {
            this.exportData();
        }
    }

    /** Export item wise order report using service  */
    exportData() {
        this.spinner.show();
        var data: any = {
            communication_type: this.auditLogForm.value.communication_type == 'All' ? '' : this.auditLogForm.value.communication_type,
            send_to_category: this.auditLogForm.value.category == 'All' ? '' : this.auditLogForm.value.category,
            from_date: moment(new Date(this.auditLogForm.value.fromDate)).format(this.dateFormateFromServerSideOnlyDateReturn()),
            to_date: moment(new Date(this.auditLogForm.value.toDate)).format(this.dateFormateFromServerSideOnlyDateReturn()),
            send_to: this.auditLogForm.value.send_to == 'All' ? '' : this.auditLogForm.value.send_to,
            related_to: this.auditLogForm.value.related_to == 'All' ? '' : this.auditLogForm.value.related_to,
            user_id: this.main.LoggedUserInfo.user_id,
            search_query: this.auditLogForm.value.search,
            is_export: 1,
            sort_field: this.sortKey,
            sort_type: this.isOrderBy ? 1 : 2,
            seller_id: this.store_ids
        };

        this.communicationService.getCommunicationLogReport(data).subscribe({
            next: (response: any) => {
                if (response.status == 1) {
                    this.toastr.success(this.translate.instant(response.message));
                } else {
                    this.toastr.error(this.translate.instant(response.message))
                }
            },
            error: () => { },
            complete: () => { }
        })
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
        if (this.main.LoggedUserInfo.role_id == 1) {
            data.module_key = '142'
        }
        if (this.main.LoggedUserInfo.role_id == 6) {
            data.module_key = '142'
        }
        if (this.main.LoggedUserInfo.role_id == 2) {
            data.module_key = '142'
        }
        this._helpService.getHelpById(data).subscribe({
            next: (response: any) => {
                if (response.status == 1) {
                    this.helpDetails = response.data;
                }
            },
            error: () => {
                // handle error
            },
            complete: () => {
                this.spinner.show();
                setTimeout(() => this.spinner.show(), 1000);
            },
        });
    }

    openDetailModel(item: any) {
        const modalRef = this.modalService.open(CommunicationLogDetailComponent, {
            size: "xl",
            centered: true
        });
        modalRef.componentInstance.main = this.main;
        modalRef.componentInstance.communicationLogDetails = item;
    }
}