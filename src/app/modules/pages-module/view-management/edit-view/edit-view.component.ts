import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddViewComponent } from '../../model/add-view/add-view.component';
import { Subject, takeUntil } from 'rxjs';
import { SellerService } from 'src/app/services/seller.service';
import { CommonService } from 'src/app/services/common.service';
import { ChangeSequenceComponent } from '../../model/change-sequence/change-sequence.component';
import { UserRoles } from 'src/app/enums/user-roles';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { AppComponent } from 'src/app/app.component';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from 'src/app/services/custom/spinner.service';
import { cloneDeep } from "lodash";

@Component({
  selector: 'app-edit-view',
  templateUrl: './edit-view.component.html',
  styleUrls: ['./edit-view.component.scss']
})
export class EditViewComponent implements OnInit, OnDestroy {
  seller_list: any;
  private destroy$ = new Subject();
  selectedSeller: any;
  store_list: any = [];
  adminDetails = JSON.parse(localStorage.getItem("loginUser"));
  view_details_data: any = [];
  userlist: { label: any; value: number; }[];
  isstoremanager: any;
  roleid: number = 1;
  platform_details: any = [];
  users: any;
  roles: { label: string; value: number; }[];
  userRolesEnum = UserRoles;
  selectedUser: any = [];
  selectedRole: any = [];
  firstIndexValue: any;
  validateQuery: any;
  main: any;
  View_id: any;
  view_form: UntypedFormGroup;
  showApiUrl: boolean = false;
  card_details: any = [];
  get_card_data: any;
  check_status: any = 0;
  view_listing_name: any = [];
  is_duplicate: any = localStorage.getItem("isDuplicateView");
  link_check_status: any = 0;
  constructor(
    public formbuilder: UntypedFormBuilder,
    private modalService: NgbModal,
    private sellerService: SellerService,
    public commonService: CommonService,
    private toastr: ToastrService,
    public translate: TranslateService,
    private router: Router,
    private cryptoService: CryptoService,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    private spinner: SpinnerService,

  ) {

    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/view-management/edit") > -1) {
      this.View_id = this.cryptoService.decryptIdValue(
        "View_management_id" +
        this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.View_id == undefined) {
        this.router.navigate(["/view-management"]);
      }
    }
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    if (this.View_id && !this.is_duplicate) {
      this.getData();
    } else {
      this.duplicateView();
    }

    this.getSellerList();
    this.condition();
    this.getUser()
  }

  loadForm() {
    this.view_form = this.formbuilder.group({
      view_name: new UntypedFormControl(null, Validators.required),
      filter_name: new UntypedFormControl(null, Validators.required),
      specific_to: new UntypedFormControl('1', Validators.required),
      filter_type: new UntypedFormControl('2', Validators.required),
      filter_query: new UntypedFormControl('1'),
      api_url: new UntypedFormControl(null),
      view_query: new UntypedFormControl(null, Validators.required),
      display_key: new UntypedFormControl(null, Validators.required),
      filter_key: new UntypedFormControl(null, Validators.required),
      publish_to: new UntypedFormControl(1),
      user_name: new UntypedFormControl(null),
      publish_all: new UntypedFormControl('0'),
      selectedSeller: new UntypedFormControl(null),
      searchText: new UntypedFormControl(null),
      is_active: new UntypedFormControl(true),
      allow_linking: new UntypedFormControl(false),
      // link_query: new FormControl(null, Validators.required)
    })
  }
  getData() {
    let data = {
      master_view_id: Number(this.View_id),
    };
    this.commonService.getViewManageList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.check_status = 1
          // if (response.data.link_query) {
          //   this.link_check_status = 1
          // }
          this.selectedUser = [];
          this.view_form.setValue({
            view_name: this.is_duplicate ? null : response.data.view_name,
            filter_name: response.data.filter_name,
            specific_to: response.data.specific_to.toString(),
            filter_type: response.data.filter_type.toString(),
            filter_query: response.data.filter_query,
            view_query: response.data.query,
            filter_key: response.data.filter_key,
            api_url: response.data.api_url,
            publish_to: 1,
            user_name: null,
            publish_all: "0",
            selectedSeller: null,
            display_key: response.data.display_key,
            searchText: null,
            is_active: response.data.is_active == 1 ? true : false,
            allow_linking: response.data.allow_linking == 1 ? true : false,
            // link_query: response.data.link_query
          });
          this.view_details_data = response.data.master_view_card_details;
          this.view_listing_name = response.data;
          if (this.View_id) {
            if (response.data.query) {
              this.Validate('edit');
            } else {
              this.check_status = 0
            }
            // if (response.data.link_query) {
            //   this.linkValidate('edit');
            // } else {
            //   this.link_check_status = 0
            // }

          }

          response.data.master_view_access.forEach(element => {
            if (element.role_id == 1) { //Super Admin
              var data: any = {
              }
              this.commonService.checkSuperAdmin(data).subscribe({
                next: (response: any) => {
                  if (response.status == 1) {
                    var data = {
                      master_view_id: element.master_view_id,
                      role_id: element.role_id,
                      user_id: null,
                      store_id: null,
                      allow_all_store: 0,
                      user_name: null,
                      user_phone: response.data.user_phone,
                      store_name: null,
                      role_name: response.data.lo_master_role_role_name
                    }
                    this.selectedUser.push(data)
                  }
                }
              });
            }
            if (element.role_id != 1 && element.allow_all_store == 0) {
              var name = null
              var roleName = null
              if (element.role_id == 2) { // Store Admin
                name = "All Store Admin";
                roleName = "Store Admin"
              }
              if (element.role_id == 7) { // Pos
                name = "All POS";
                roleName = "POS"
              }
              if (element.role_id == 5) { // Store Manager
                name = "All Store Manager";
                roleName = "Store Manager"
              }
              if (element.role_id == 8) { // Picker
                name = "All Picker";
                roleName = "Picker"
              }
              var data1 = {
                master_view_id: element.master_view_id,
                role_id: element.role_id,
                user_id: null,
                store_id: null,
                allow_all_store: 0,
                user_name: name,
                user_phone: null,
                store_name: null,
                role_name: roleName
              }
              this.selectedUser.push(data1)
            }
            if (element.role_id != 1 && element.allow_all_store == 1) {
              var roleName = null
              if (element.role_id == 2) { roleName = "Store Admin" }
              if (element.role_id == 7) { roleName = "POS" }
              if (element.role_id == 5) { roleName = "Store Manager" }
              if (element.role_id == 8) { roleName = "Picker" }
              var data2 = {
                master_view_id: element.master_view_id,
                role_id: element.role_id,
                user_id: element.stores.user_id,
                store_id: element.stores.seller_id,
                allow_all_store: 1,
                user_name: element.stores.user_name,
                user_phone: element.stores.user_phone,
                store_name: element.stores.user_stores_store_name,
                role_name: roleName
              }
              this.selectedUser.push(data2)
            }
          });
          this.condition();
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {
      },
    })
  }


  duplicateView() {
    var data = {
      master_view_id: Number(this.View_id)
    };

    this.commonService.duplicateViewData(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.check_status = 1;
          // if (response.data.link_query) {
          //   this.link_check_status = 1;
          // }
          this.selectedUser = [];
          this.view_form.setValue({
            view_name: null,
            filter_name: response.data.data.filter_name,
            specific_to: response.data.data.specific_to.toString(),
            filter_type: response.data.data.filter_type.toString(),
            filter_query: response.data.data.filter_query,
            view_query: response.data.data.query,
            filter_key: response.data.data.filter_key,
            api_url: response.data.data.api_url,
            publish_to: 1,
            user_name: null,
            publish_all: "0",
            selectedSeller: null,
            display_key: response.data.data.display_key,
            searchText: null,
            is_active: response.data.data.is_active == 1 ? true : false,
            allow_linking: response.data.data.allow_linking == 1 ? true : false,
            // link_query: response.data.data.link_query
          });
          this.view_details_data = response.data.data.master_view_card_details;
          this.view_listing_name = response.data.data;
          // if (this.View_id) {
          //   this.Validate('edit');
          // }

          response.data.data.master_view_access.forEach(element => {
            if (element.role_id == 1) { //Super Admin
              var data: any = {
              }
              this.commonService.checkSuperAdmin(data).subscribe({
                next: (response: any) => {
                  if (response.status == 1) {
                    var data = {
                      // master_view_id: element.master_view_id,
                      role_id: element.role_id,
                      user_id: null,
                      store_id: null,
                      allow_all_store: 0,
                      user_name: null,
                      user_phone: response.data.user_phone,
                      store_name: null,
                      role_name: response.data.lo_master_role_role_name
                    }
                    this.selectedUser.push(data)
                  }
                }
              });
            }
            if (element.role_id != 1 && element.allow_all_store == 0) {
              var name = null
              var roleName = null
              if (element.role_id == 2) { // Store Admin
                name = "All Store Admin";
                roleName = "Store Admin"
              }
              if (element.role_id == 7) { // Pos
                name = "All POS";
                roleName = "POS"
              }
              if (element.role_id == 5) { // Store Manager
                name = "All Store Manager";
                roleName = "Store Manager"
              }
              if (element.role_id == 8) { // Picker
                name = "All Picker";
                roleName = "Picker"
              }
              var data1 = {
                // master_view_id: element.master_view_id,
                role_id: element.role_id,
                user_id: null,
                store_id: null,
                allow_all_store: 0,
                user_name: name,
                user_phone: null,
                store_name: null,
                role_name: roleName
              }
              this.selectedUser.push(data1)
            }
            if (element.role_id != 1 && element.allow_all_store == 1) {
              var roleName = null
              if (element.role_id == 2) { roleName = "Store Admin" }
              if (element.role_id == 7) { roleName = "POS" }
              if (element.role_id == 5) { roleName = "Store Manager" }
              if (element.role_id == 8) { roleName = "Picker" }
              var data2 = {
                // master_view_id: element.master_view_id,
                role_id: element.role_id,
                user_id: element.stores.user_id,
                store_id: element.stores.seller_id,
                allow_all_store: 1,
                user_name: element.stores.user_name,
                user_phone: element.stores.user_phone,
                store_name: element.stores.user_stores_store_name,
                role_name: roleName
              }
              this.selectedUser.push(data2)
            }
          });
          this.condition();
        }
      }
    })


  }

  toggleControls(event: any) {
    const selectedValue = event.target.value;
    this.showApiUrl = selectedValue === '2';
  }

  addCustomer() {
    if ((this.view_form.value.view_name && this.view_form.value.filter_name && this.view_form.value.view_query && this.view_form.value.display_key && this.view_form.value.filter_key) || (this.view_form.value.filter_type == 3 || this.view_form.value.filter_type == 1)) {
      const modalRef = this.modalService.open(AddViewComponent, {
        size: "xl",
        centered: true,
        backdrop: 'static',
      });
      modalRef.componentInstance.view_relation_key = this.view_form.value.filter_key;
      modalRef.componentInstance.specific_to_value = this.view_form.value.specific_to;
      modalRef.componentInstance.filter_type_value = this.view_form.value.filter_type;
      modalRef.componentInstance.view_card_listing_name = this.view_listing_name.master_view_id;
      modalRef.componentInstance.view_table_details.subscribe((receivedEntry) => {
        if (receivedEntry) {
          receivedEntry.display_id = this.view_details_data.length + 1;
          this.view_details_data.push(receivedEntry);
        }
      });
    }
    else {
      if (!this.view_form.value.view_name) {
        this.toastr.error(this.translate.instant("PLEASE_ENTER_VIEW_NAME"));
        return;
      }
      if (!this.view_form.value.filter_name) {
        this.toastr.error(this.translate.instant("PLEASE_ENTER_FILTER_NAME"));
        return;
      }
      if (this.view_form.value.filter_type != 3 || this.view_form.value.filter_type != 1) {
        if (!this.view_form.value.view_query) {
          this.toastr.error(this.translate.instant("PLEASE_ENTER_SQL_QUERY"));
          return;
        }
      }
    }

  }

  editCardDetails(card, index) {
    const modalRef = this.modalService.open(AddViewComponent, {
      size: "xl",
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.view_card_data = cloneDeep(card);
    modalRef.componentInstance.view_relation_key = cloneDeep(this.view_form.value.filter_key);
    modalRef.componentInstance.specific_to_value = this.view_form.value.specific_to;
    modalRef.componentInstance.filter_type_value = this.view_form.value.filter_type;
    modalRef.componentInstance.view_card_listing_name = cloneDeep(this.view_listing_name.master_view_id);
    modalRef.componentInstance.view_table_details.subscribe((receivedEntry) => {
      if (!receivedEntry.status) {
        receivedEntry.display_id = card.display_id;
        if (receivedEntry) {
          this.view_details_data[index] = receivedEntry;
        }
      }
      this.cdr.detectChanges();
    });
  }

  cancelClick() {
    history.back();
  }

  changeSequence() {
    const modalRef = this.modalService.open(ChangeSequenceComponent, {
      size: "lg-600",
      backdrop: 'static',
    });
    modalRef.componentInstance.viewManagementList = this.view_details_data;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      if (receivedEntry) {
        receivedEntry.forEach((element, index) => {
          element.display_id = index + 1
        });
        this.view_details_data = receivedEntry;
        this.cdr.detectChanges();
      }
    });
  }
  condition() {
    if (this.view_form.value.specific_to == 2) {
      this.roles = [
        { label: "Super Admin", value: 1 },
        { label: "Store Admin", value: 2 },
        { label: "Store Manager", value: 3 },
        { label: "POS", value: 4 },
        { label: "Picker", value: 5 },
      ];
    } else {
      this.roles = [
        { label: "Super Admin", value: 1 },
      ];
      // this.view_form.get('publish_to')?.setValue(this.roles[0].label);
    }
  }

  ChangeManager(item: any) {
    this.view_form.value.publish_to = item;
    this.isstoremanager = item;
    if (this.isstoremanager == 1) {
      this.roleid = 1;
    }
    if (this.isstoremanager == 2) {
      this.roleid = 2;
    }
    if (this.isstoremanager == 3) {
      this.roleid = 5;
    }
    if (this.isstoremanager == 4) {
      this.roleid = 7;
    }
    if (this.isstoremanager == 5) {
      this.roleid = 8;
    }
    this.getSellerList();
    this.view_form.controls['publish_all'].patchValue('0');
    this.view_form.controls['user_name'].patchValue(null);
    this.view_form.controls['selectedSeller'].patchValue(null);
    this.view_form.updateValueAndValidity();

  }

  Validate(label?: any) {
    var data: any = {
      query: this.view_form.value.view_query
    }
    this.commonService.checkValidation(data).subscribe({
      next: (response: any) => {
        this.check_status = response.status
        if (response.status == 1) {
          this.validateQuery = response.data.split(", ");
          if (this.validateQuery.length > 0) {
            this.firstIndexValue = this.validateQuery[0];
            if (!label) {
              this.view_form.get('display_key')?.setValue(this.firstIndexValue);
              this.view_form.get('filter_key')?.setValue(this.firstIndexValue);
            } else {
              var temp: any = this.validateQuery.filter((x: any) => x == this.view_listing_name.filter_key)[0]
              this.view_form.get('filter_key')?.setValue(temp);
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

  changeFilterType() {
    this.check_status = 0;
    this.view_form.controls['view_query'].setValue(null);
    this.view_form.controls['display_key'].setValue(null);
    this.view_form.controls['filter_key'].setValue(null);
  }

  // change event of check box linking
  // displayLinkQuery() {
  //   if (this.view_form.value.allow_linking) {
  //     this.link_check_status = 0;
  //     this.view_form.controls['link_query'].setValue(null);
  //   }
  // }

  // linkValidate(label?: any) {
  //   var data: any = {
  //     query: this.view_form.value.link_query
  //   }
  //   this.commonService.checkValidation(data).subscribe({
  //     next: (response: any) => {
  //       this.link_check_status = response.status
  //       if (response.status == 1) {
  //         if (!label) {
  //           this.toastr.success(response.message);
  //         }
  //       } else {
  //         if (!label) {
  //           this.toastr.error(response.message);
  //         }
  //       }
  //     }
  //   });
  // }

  editLinkQuery() {
    this.link_check_status = 0;
  }

  storeQuery() {
    const textarea = document.querySelector('textarea[name="view_query"]') as HTMLTextAreaElement;
    const val = this.view_form.value.view_query;
    const storeId = " {{store_id}}";
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const newValue = val.slice(0, startPos) + storeId + val.slice(endPos);
    this.view_form.controls['view_query'].patchValue(newValue);
    textarea.focus();
    textarea.setSelectionRange(startPos + storeId.length, startPos + storeId.length);
  }

  searchString() {
    const textarea = document.querySelector('textarea[name="view_query"]') as HTMLTextAreaElement;
    const val = this.view_form.value.view_query;
    const searchStr = " %{{Search_String}}%";
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const newValue = val.slice(0, startPos) + searchStr + val.slice(endPos);
    this.view_form.controls['view_query'].patchValue(newValue);
    textarea.focus();
    textarea.setSelectionRange(startPos + searchStr.length, startPos + searchStr.length);
  }


  prepareData() {
    const findSuperAdmin = this.selectedUser.find(res => res.role_id == 1);
    const findStoreAdmin = this.selectedUser.find(res => res.role_id == 2);
    const findStoreManager = this.selectedUser.find(res => res.role_id == 5);
    const findPos = this.selectedUser.find(res => res.role_id == 7);
    const findPicker = this.selectedUser.find(res => res.role_id == 8);

    if (findSuperAdmin) {
      var data = {
        role_id: findSuperAdmin.role_id,
        allow_all_store: findSuperAdmin.allow_all_store
      }
      this.selectedRole.unshift(data)
    }
    if (findStoreAdmin) {
      var data1: any = {
        role_id: findStoreAdmin.role_id,
        allow_all_store: findStoreAdmin.allow_all_store
      }
      if (findStoreAdmin.allow_all_store == 1) {
        const modifyArray = this.selectedUser.filter(responce => responce.role_id == findStoreAdmin.role_id).reduce((accumulator, currentValue) => {
          accumulator.push({ store_id: currentValue.store_id, user_id: currentValue.user_id });
          return accumulator;
        }, []);
        data1.stores = modifyArray
      }
      this.selectedRole.unshift(data1)
    }
    if (findStoreManager) {
      var data1: any = {
        role_id: findStoreManager.role_id,
        allow_all_store: findStoreManager.allow_all_store
      }
      if (findStoreManager.allow_all_store == 1) {
        const modifyArray = this.selectedUser.filter(responce => responce.role_id == findStoreManager.role_id).reduce((accumulator, currentValue) => {
          accumulator.push({ store_id: currentValue.store_id, user_id: currentValue.user_id });
          return accumulator;
        }, []);
        data1.stores = modifyArray
      }
      this.selectedRole.unshift(data1)
    }
    if (findPos) {
      var data1: any = {
        role_id: findPos.role_id,
        allow_all_store: findPos.allow_all_store
      }
      if (findPos.allow_all_store == 1) {
        const modifyArray = this.selectedUser.filter(responce => responce.role_id == findPos.role_id).reduce((accumulator, currentValue) => {
          accumulator.push({ store_id: currentValue.store_id, user_id: currentValue.user_id });
          return accumulator;
        }, []);
        data1.stores = modifyArray
      }
      this.selectedRole.unshift(data1)
    }
    if (findPicker) {
      var data1: any = {
        role_id: findPicker.role_id,
        allow_all_store: findPicker.allow_all_store
      }
      if (findPicker.allow_all_store == 1) {
        const modifyArray = this.selectedUser.filter(responce => responce.role_id == findPicker.role_id).reduce((accumulator, currentValue) => {
          accumulator.push({ store_id: currentValue.store_id, user_id: currentValue.user_id });
          return accumulator;
        }, []);
        data1.stores = modifyArray
      }
      this.selectedRole.unshift(data1)
    }
  }

  Save() {
    var super_admin: any = [];
    if (this.view_form.value.specific_to == 1) {
      super_admin = this.selectedUser.filter((user) => user.role_id == 1);
      if (super_admin.length != this.selectedUser.length) {
        this.toastr.error("Platform level view cannot be shared with Store users. Please remove the store users (Store Admin, Store Manager, POS, Picker) from published users list.");
        return;
      }
    }
    if (this.view_form.value.filter_type == 3 || this.view_form.value.filter_type == 1) {
      this.check_status = 1
      this.view_form.controls['view_query'].clearValidators();
      this.view_form.controls['display_key'].clearValidators();
      this.view_form.controls['filter_key'].clearValidators();
      this.view_form.updateValueAndValidity();
      this.view_form.controls['view_query'].setValue(null);
      this.view_form.controls['display_key'].setValue(null);
      this.view_form.controls['filter_key'].setValue(null);
    }

    if(this.view_form.value.filter_type == 3){
      this.view_form.controls['filter_name'].clearValidators();
      this.view_form.updateValueAndValidity();
      this.view_form.controls['filter_name'].setValue(null);
    }
    
    if (!this.view_form.valid) {
      this.toastr.error(this.translate.instant("MANDATORY_FIELDS_BEFORE_SAVING"));
    } else {
      this.spinner.show();
      if (this.check_status == 1) {
        this.prepareData()
        var data: any = {
          view_name: this.view_form.value.view_name,
          filter_name: this.view_form.value.filter_name,
          specific_to: this.view_form.value.specific_to,
          filter_type: this.view_form.value.filter_type,
          filter_query: this.view_form.value.filter_query,
          query: this.view_form.value.view_query,
          filter_key: this.view_form.value.filter_key,
          api_url: this.view_form.value.api_url,
          master_view_card_details: this.view_details_data,
          roles: this.selectedRole,
          user_id: this.adminDetails.user_id,
          display_key: this.view_form.value.display_key,
          master_view_id: (!this.View_id || this.is_duplicate) ? null : Number(this.View_id),
          is_active: this.view_form.value.is_active,
          allow_linking: this.view_form.value.allow_linking == true ? '1' : '0',
          // link_query: this.link_check_status == 1 ? this.view_form.value.link_query : null
        }

        // if(this.link_check_status == 1){
        //   data.allow_linking = this.view_form.value.allow_linking == true ? '1' : '0';
        //   data.link_query = this.view_form.value.link_query ? this.view_form.value.link_query : null
        // }
        this.commonService.addViewManagement(data).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.spinner.hide();
              this.toastr.success(response.message);
              if (this.main.LoggedUserInfo.role_id == 6) {
                this.router.navigate([`/view-management`]);
              } else {
                this.router.navigate([`/all-view`]);
              }
              return;
            }
            else {
              this.spinner.hide();
              this.toastr.error(response.message);
              return;
            }
          }
        });
      } else {
        this.spinner.hide();
        if (this.view_form.value.filter_type != 3 || this.view_form.value.filter_type != 1) {
          this.toastr.error(this.translate.instant("VALIDATE_THE_QUERY"));
        }
      }
    }
  }

  addPlatform() {
    if (this.roleid == this.userRolesEnum.Admin) {
      var is_super_admin: any = this.selectedUser.filter((role) => role.role_id == 1)[0];
      if (is_super_admin) {
        this.toastr.error(this.translate.instant("USER_ALREADY_ADDED"));
        return;
      } else {
        var data: any = {
        }
        this.commonService.checkSuperAdmin(data).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              var data = {
                role_id: this.roleid,
                user_id: null,
                store_id: null,
                allow_all_store: 0,
                user_name: null,
                user_phone: response.data.user_phone,
                store_name: null,
                role_name: "Super Admin",
              }
              this.selectedUser.unshift(data);
            }
          }
        });
      }
    }

    if (this.roleid != this.userRolesEnum.Admin && this.view_form.controls['publish_all'].value == '0') {
      var findArray = this.selectedUser.find(c => c.role_id == this.roleid && c.allow_all_store == 0);
      if (findArray) {
        this.toastr.error(this.translate.instant("USER_ALREADY_ADDED"));
        return
      }
      var findArray1 = this.selectedUser.find(c => c.role_id == this.roleid && c.allow_all_store == 1);
      if (findArray1) {
        this.selectedUser = this.selectedUser.filter(res => res.role_id !== this.roleid);
      }
      var name = null
      var roleName = null
      if (this.roleid == 2) { name = "All Store Admin"; roleName = "Store Admin" }
      if (this.roleid == 7) { name = "All POS"; roleName = "POS" }
      if (this.roleid == 5) { name = "All Store Manager"; roleName = "Store Manager" }
      if (this.roleid == 8) { name = "All Picker"; roleName = "Picker" }
      var data1 = {
        role_id: this.roleid,
        user_id: null,
        store_id: null,
        allow_all_store: 0,
        user_name: name,
        user_phone: null,
        store_name: null,
        role_name: roleName,
      }
      this.selectedUser.unshift(data1);
    }

    if (this.roleid != this.userRolesEnum.Admin && this.view_form.controls['publish_all'].value == '1') {
      if (this.view_form.controls['user_name'].value == null && this.view_form.controls['user_name'].value == undefined) {
        this.toastr.error(this.translate.instant("ADDING_SELECTED_USER"));
        return
      }
      var findArray = this.selectedUser.find(c => c.role_id == this.roleid && c.allow_all_store == 0);
      if (findArray) {
        this.toastr.error(this.translate.instant("ALL_USER_ROLE_ALREADY_SELECTED"))
        return
      }
      var filterArray = this.users.filter(x => x.user_id == this.view_form.controls['user_name'].value);
      var checkDuplicate = this.selectedUser.find(c => c.role_id == this.roleid && c.allow_all_store == 1 && c.user_id == filterArray[0].user_id && c.store_id == filterArray[0].seller_id);
      if (checkDuplicate) {
        this.toastr.error(this.translate.instant("USER_ALREADY_ADDED"));
        return
      }
      var roleName = null
      if (this.roleid == 2) { roleName = "Store Admin" }
      if (this.roleid == 7) { roleName = "POS" }
      if (this.roleid == 5) { roleName = "Store Manager" }
      if (this.roleid == 8) { roleName = "Picker" }
      var data2 = {
        role_id: this.roleid,
        user_id: filterArray[0].user_id,
        store_id: filterArray[0].seller_id,
        allow_all_store: 1,
        user_name: filterArray[0].user_name,
        user_phone: filterArray[0].user_phone,
        store_name: filterArray[0].user_stores_store_name,
        role_name: roleName
      }
      this.selectedUser.unshift(data2);
    }
  }

  deleteUser(item: any, i: any) {
    this.selectedUser.splice(i, 1);
  }

  deleteCard(index: any) {
    this.view_details_data.splice(index, 1)
  }

  getSellerList() {
    let data: any = {
      is_verified: 2,
      khata_user: 0,
      market_type: 2
    };

    this.sellerService.getSellerList(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.seller_list = response.data;
          this.store_list = this.seller_list.filter((store: any) => store.store_name != '')
          this.store_list.sort((a, b) => a.store_name.localeCompare(b.store_name))
        }


        if (this.store_list.length > 0) {
          this.view_form.get('selectedSeller')?.setValue(this.store_list[0].store_id);
        }
      },
      error: (error) => {
      },
      complete: () => {
        //
      },
    });
  }
  getUser() {
    this.view_form.controls['user_name'].reset();
    let data = {
      store_id: this.view_form.value.selectedSeller,
      role_id: this.roleid

    }
    this.commonService.getUserList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.users = response.data;
          this.users.sort((a, b) => a.user_name.localeCompare(b.user_name))
          if (this.users.length > 0) {
            this.view_form.get('user_name')?.setValue(this.users[0].user_id);
          }
        }
      }
    });
  }

  controlHasError(validation, controlName): boolean {
    const control = this.view_form.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
